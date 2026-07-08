/**
 * api-client.js — shared API client for admin + cabinet pages.
 * Uses bearer token in localStorage (persistent) or sessionStorage
 * (tab-only) so it works across ngo.uz / ngouz.pages.dev / admin.ngo.uz.
 *
 * Loaded by admin-*.html and cabinet/*.html before any page-specific JS.
 */

(function () {
  var API_BASE = 'https://ngo-api-proxy.sarvsop.workers.dev/v1';
  var TOKEN_KEY  = 'ngo_api_token';
  var USER_KEY   = 'ngo_api_user';
  var LOGIN_PAGE = 'admin-login';

  // Read from localStorage first (persistent "Tizimda qolish"), then
  // sessionStorage (tab-only). Write to whichever the user picked at
  // login; default is localStorage to preserve the previous behavior
  // for callers that don't pass a persistent flag.
  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || ''; }
    catch (e) { return ''; }
  }
  // If `persistent` is omitted, infer from where the existing token
  // lives — keeps requireAuth()'s setUser(res.user) refresh from
  // accidentally upgrading a tab-only session to permanent.
  function setToken(t, persistent) {
    try {
      if (persistent === undefined) {
        persistent = !sessionStorage.getItem(TOKEN_KEY);
      }
      if (persistent === false) {
        sessionStorage.setItem(TOKEN_KEY, t || '');
        localStorage.removeItem(TOKEN_KEY);
      } else {
        localStorage.setItem(TOKEN_KEY, t || '');
        sessionStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {}
  }
  function clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY);
    } catch (e) {}
  }

  function getUser()  {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function setUser(u, persistent) {
    try {
      var s = JSON.stringify(u || null);
      if (persistent === undefined) {
        persistent = !sessionStorage.getItem(TOKEN_KEY);
      }
      if (persistent === false) {
        sessionStorage.setItem(USER_KEY, s);
        localStorage.removeItem(USER_KEY);
      } else {
        localStorage.setItem(USER_KEY, s);
        sessionStorage.removeItem(USER_KEY);
      }
    } catch (e) {}
  }

  var DEFAULT_TIMEOUT_MS = 15000;

  function request(method, path, body, opts) {
    opts = opts || {};
    var isAbsolute = /^https?:\/\//.test(path);
    var url = isAbsolute ? path : API_BASE + path;
    var headers = { 'Accept': 'application/json' };
    if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
    var t = getToken();
    if (t && !opts.noAuth) headers['Authorization'] = 'Bearer ' + t;

    var init = { method: method, headers: headers, credentials: 'omit' };
    if (body !== undefined && body !== null) {
      init.body = (body instanceof FormData) ? body : JSON.stringify(body);
    }
    // Survive navigation — caller passes opts.keepalive: true for
    // fire-and-forget requests like logout where the page redirects
    // before the response would normally land. Without keepalive, the
    // browser cancels the in-flight fetch on navigation and the
    // backend never sees the logout, leaving a zombie session.
    if (opts.keepalive) init.keepalive = true;

    // 15s default timeout — admin/cabinet are auth-walled and a slow
    // backend mustn't hang the user's only path back to login. Pass
    // opts.timeout = 0 to disable (e.g. uploads). AbortController
    // cancels the fetch; finally clears the timer so the slot doesn't
    // leak when the response arrives normally.
    var timeoutMs = (typeof opts.timeout === 'number') ? opts.timeout : DEFAULT_TIMEOUT_MS;
    var timer = null;
    if (timeoutMs > 0 && typeof AbortController === 'function') {
      var ctrl = new AbortController();
      timer = setTimeout(function () { ctrl.abort(); }, timeoutMs);
      init.signal = ctrl.signal;
    }

    var clearTimer = function () { if (timer) { clearTimeout(timer); timer = null; } };

    return fetch(url, init).then(function (r) {
      clearTimer();
      return r;
    }, function (err) {
      clearTimer();
      throw err;
    }).then(function (r) {
      var ct = r.headers.get('content-type') || '';
      var parse = ct.indexOf('application/json') !== -1 ? r.json() : r.text();
      return parse.then(function (data) {
        if (r.status === 401 && !opts.noAuth) {
          // Always clear an invalid token — keeping it means every
          // follow-up request silently 401s with no recovery path.
          clearToken();
          // Auto-redirect on 401 unless caller explicitly opts out
          // (opts.noRedirect) or we're already on a login page.
          // Previously this required opts.authRedirect: true and most
          // callers didn't pass it — they got 'Xatolik: HTTP 401'
          // toast with no recovery path until the next page-load.
          var isOnLoginPage = /\/(admin-login|cabinet-login)(\.html)?$/.test(location.pathname);
          if (!opts.noRedirect && !isOnLoginPage) {
            var next = encodeURIComponent(location.pathname + location.search);
            // Auto-pick login page from URL when caller didn't say.
            // /cabinet/* → cabinet-login, everything else → admin-login.
            var loginPage = opts.loginPage
              || (location.pathname.indexOf('/cabinet/') === 0 ? 'cabinet-login' : LOGIN_PAGE);
            location.href = loginPage + '?error=session_expired&next=' + next;
          }
        }
        if (!r.ok) {
          var err = new Error((data && data.message) || ('HTTP ' + r.status));
          err.status = r.status;
          err.code = data && data.error;
          err.payload = data;
          throw err;
        }
        return data;
      });
    });
  }

  function login(email, password, opts) {
    var persistent = !opts || opts.persistent !== false;
    return request('POST', '/auth/login', { email: email, password: password, client: 'mobile' }, { noAuth: true, noRedirect: true })
      .then(function (res) {
        if (res && res.token) {
          setToken(res.token, persistent);
          setUser(res.user, persistent);
        }
        return res;
      });
  }

  function logout() {
    return request('POST', '/auth/logout', undefined, { keepalive: true }).catch(function () {}).then(function () {
      clearToken();
    });
  }

  function me() {
    return request('GET', '/me');
  }

  function requireAuth(opts) {
    opts = opts || {};
    function roleHome(role) {
      if (role === 'commission') return 'admin-commission';
      if (role === 'leader') return 'admin-leader-signing';
      return 'admin-dashboard';
    }
    function redirectForbidden(user) {
      var target = opts.fallbackPage || roleHome(user && user.role);
      var here = location.pathname.split('/').pop().replace(/\.html$/, '') || 'admin-dashboard';
      if (target === here) target = 'admin-dashboard';
      location.replace(target);
      return Promise.reject(new Error('forbidden'));
    }
    if (!getToken()) {
      var next = encodeURIComponent(location.pathname + location.search);
      location.replace((opts.loginPage || LOGIN_PAGE) + '?next=' + next);
      return Promise.reject(new Error('no_token'));
    }
    return request('GET', '/me', undefined, { loginPage: opts.loginPage }).then(function (res) {
      setUser(res.user);
      if (opts.allowedRoles && opts.allowedRoles.length) {
        if (opts.allowedRoles.indexOf(res.user.role) === -1) {
          return redirectForbidden(res.user);
        }
      }
      if (opts.minRole) {
        var levels = { super_admin: 100, regional_admin: 60, leader: 55, portal_moderator: 40, member_manager: 20, member_user: 10, commission: 5 };
        if ((levels[res.user.role] || 0) < (levels[opts.minRole] || 0)) {
          return redirectForbidden(res.user);
        }
      }
      return res.user;
    });
  }

  window.NgoApi = {
    base     : API_BASE,
    get      : function (p, opts) { return request('GET',    p, undefined, opts); },
    post     : function (p, b, opts) { return request('POST',   p, b, opts); },
    put      : function (p, b, opts) { return request('PUT',    p, b, opts); },
    patch    : function (p, b, opts) { return request('PATCH',  p, b, opts); },
    del      : function (p, opts) { return request('DELETE', p, undefined, opts); },
    login    : login,
    logout   : logout,
    me       : me,
    getToken : getToken,
    getUser  : getUser,
    clearToken: clearToken,
    requireAuth: requireAuth,
  };
})();
