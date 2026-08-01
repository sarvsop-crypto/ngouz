/**
 * api-client.js — shared API client for admin + cabinet pages.
 * Browser sessions use a host-only HttpOnly cookie issued by api.ngo.uz.
 * The CSRF token and the visual-editor capability stay in memory only.
 *
 * Loaded by admin-*.html and cabinet/*.html before any page-specific JS.
 */

(function () {
  var API_BASE = 'https://api.ngo.uz/v1';
  var USER_KEY   = 'ngo_api_user';
  var LOGIN_PAGE = 'admin-login';
  var IDLE_TIMEOUT_MS = 30 * 60 * 1000;
  var ACTIVITY_KEY = 'ngo_api_last_activity';
  var csrfToken = '';
  var csrfBootstrap = null;
  var visualCapability = null;

  function clearSession() {
    csrfToken = '';
    visualCapability = null;
    try {
      localStorage.removeItem('ngo_api_token');
      sessionStorage.removeItem('ngo_api_token');
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem(ACTIVITY_KEY);
    } catch (e) {}
  }

  function getUser()  {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function setUser(u) {
    try {
      var s = JSON.stringify(u || null);
      sessionStorage.setItem(USER_KEY, s);
      localStorage.removeItem(USER_KEY);
    } catch (e) {}
  }

  var DEFAULT_TIMEOUT_MS = 15000;

  function request(method, path, body, opts) {
    opts = opts || {};
    var isAbsolute = /^https?:\/\//.test(path);
    var url = isAbsolute ? path : API_BASE + path;
    var headers = { 'Accept': 'application/json' };
    if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
    var safeMethod = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
    if (!safeMethod && !opts.noAuth && !csrfToken) {
      if (!csrfBootstrap) {
        csrfBootstrap = me().then(function () { return true; }).finally(function () { csrfBootstrap = null; });
      }
      return csrfBootstrap.then(function () { return request(method, path, body, opts); });
    }
    if (!safeMethod && !opts.noAuth && csrfToken) headers['X-CSRF-Token'] = csrfToken;

    var init = { method: method, headers: headers, credentials: 'include' };
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
          clearSession();
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

  function login(email, password) {
    return request('POST', '/auth/login', { email: email, password: password }, { noAuth: true, noRedirect: true })
      .then(function (res) {
        if (res && res.user && res.csrf) {
          csrfToken = res.csrf;
          setUser(res.user);
        }
        return res;
      });
  }

  function logout() {
    return request('POST', '/auth/logout', undefined, { keepalive: true }).then(function () {
      clearSession();
    });
  }

  function startIdleLogout(opts) {
    opts = opts || {};
    var timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : IDLE_TIMEOUT_MS;
    if (timeoutMs <= 0 || window.__NGO_IDLE_LOGOUT_STARTED__) return;
    window.__NGO_IDLE_LOGOUT_STARTED__ = true;

    var timer = null;
    var loginPage = opts.loginPage || (location.pathname.indexOf('/cabinet/') === 0 ? 'cabinet-login' : LOGIN_PAGE);

    function rememberActivity() {
      if (!getUser()) return;
      try { localStorage.setItem(ACTIVITY_KEY, String(Date.now())); } catch (e) {}
      arm();
    }

    function lastActivity() {
      try {
        var v = parseInt(localStorage.getItem(ACTIVITY_KEY) || '0', 10);
        return v > 0 ? v : Date.now();
      } catch (e) {
        return Date.now();
      }
    }

    function expire() {
      if (!getUser()) return;
      var next = encodeURIComponent(location.pathname + location.search);
      logout().then(function () {
        location.replace(loginPage + '?error=session_expired&next=' + next);
      }).catch(function () {
        timer = setTimeout(expire, 30000);
      });
    }

    function arm() {
      if (timer) clearTimeout(timer);
      if (!getUser()) return;
      var remaining = timeoutMs - (Date.now() - lastActivity());
      timer = setTimeout(remaining <= 0 ? expire : arm, Math.max(remaining, 1000));
    }

    ['click', 'keydown', 'mousemove', 'mousedown', 'touchstart', 'scroll', 'focus'].forEach(function (eventName) {
      window.addEventListener(eventName, rememberActivity, { passive: true, capture: true });
    });
    window.addEventListener('storage', function (ev) {
      if (ev.key === ACTIVITY_KEY || ev.key === USER_KEY) arm();
    });
    if (getUser()) rememberActivity();
  }

  function me() {
    return request('GET', '/me').then(function (res) {
      csrfToken = (res && res.csrf) || '';
      if (res && res.user) setUser(res.user);
      return res;
    });
  }

  function visualToken() {
    var now = Date.now();
    if (visualCapability && visualCapability.expiresAt - now > 15000) {
      return Promise.resolve(visualCapability.token);
    }
    return request('POST', '/auth/visual-token', {}).then(function (res) {
      visualCapability = {
        token: res.token,
        expiresAt: new Date(res.expires_at).getTime()
      };
      return visualCapability.token;
    });
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
    return me().then(function (res) {
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
    getUser  : getUser,
    clearSession: clearSession,
    visualToken: visualToken,
    requireAuth: requireAuth,
    startIdleLogout: startIdleLogout,
  };
})();
