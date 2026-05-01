/**
 * api-client.js — shared API client for admin + cabinet pages.
 * Uses bearer token in localStorage so it works across ngo.uz / ngouz.pages.dev / admin.ngo.uz.
 *
 * Loaded by admin-*.html and cabinet/*.html before any page-specific JS.
 */

(function () {
  var API_BASE = 'https://ngo-api-proxy.sarvsop.workers.dev/v1';
  var TOKEN_KEY  = 'ngo_api_token';
  var USER_KEY   = 'ngo_api_user';
  var LOGIN_PAGE = 'admin-login';

  function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } }
  function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t || ''); } catch (e) {} }
  function clearToken() { try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) {} }

  function getUser()  { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (e) { return null; } }
  function setUser(u) { try { localStorage.setItem(USER_KEY, JSON.stringify(u || null)); } catch (e) {} }

  var DEFAULT_TIMEOUT_MS = 15000;

  function request(method, path, body, opts) {
    opts = opts || {};
    var url = path.indexOf('http') === 0 ? path : API_BASE + path;
    var headers = { 'Accept': 'application/json' };
    if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
    var t = getToken();
    if (t && !opts.noAuth) headers['Authorization'] = 'Bearer ' + t;

    var init = { method: method, headers: headers, credentials: 'omit' };
    if (body !== undefined && body !== null) {
      init.body = (body instanceof FormData) ? body : JSON.stringify(body);
    }

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
          // follow-up request silently 401s with no recovery path. The
          // caller (admin-cms etc.) gets a thrown error and shows a
          // toast, but the next page-load goes through admin-boot's
          // requireAuth which will redirect cleanly.
          clearToken();
          if (opts.authRedirect) {
            // Match both legacy /admin-login.html and clean /admin-login
            // (CF Pages serves both since iter 67 internal-link cleanup).
            // Without the optional \.html, a 401 fired while already on
            // /admin-login would re-redirect back to itself — infinite loop.
            if (!/\/(admin-login|cabinet-login)(\.html)?$/.test(location.pathname)) {
              var next = encodeURIComponent(location.pathname + location.search);
              // authRedirect=true only fires from requireAuth's /me check
              // — i.e. a previously valid token just stopped working.
              // Tag with error=session_expired so iter 152/153's login
              // banner can explain why the user got bounced.
              location.href = (opts.loginPage || LOGIN_PAGE) + '?error=session_expired&next=' + next;
            }
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
    return request('POST', '/auth/login', { email: email, password: password, client: 'mobile' }, { noAuth: true, noRedirect: true })
      .then(function (res) {
        if (res && res.token) {
          setToken(res.token);
          setUser(res.user);
        }
        return res;
      });
  }

  function logout() {
    return request('POST', '/auth/logout').catch(function () {}).then(function () {
      clearToken();
    });
  }

  function me() {
    return request('GET', '/me');
  }

  function requireAuth(opts) {
    opts = opts || {};
    if (!getToken()) {
      var next = encodeURIComponent(location.pathname + location.search);
      location.replace((opts.loginPage || LOGIN_PAGE) + '?next=' + next);
      return Promise.reject(new Error('no_token'));
    }
    return request('GET', '/me', undefined, { authRedirect: true, loginPage: opts.loginPage }).then(function (res) {
      setUser(res.user);
      if (opts.minRole) {
        var levels = { super_admin: 100, regional_admin: 60, portal_moderator: 40, member_manager: 20, member_user: 10 };
        if ((levels[res.user.role] || 0) < (levels[opts.minRole] || 0)) {
          location.replace('admin-login?error=forbidden');
          return Promise.reject(new Error('forbidden'));
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
