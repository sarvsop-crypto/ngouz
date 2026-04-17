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
  var LOGIN_PAGE = 'admin-login.html';

  function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } }
  function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t || ''); } catch (e) {} }
  function clearToken() { try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) {} }

  function getUser()  { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (e) { return null; } }
  function setUser(u) { try { localStorage.setItem(USER_KEY, JSON.stringify(u || null)); } catch (e) {} }

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
    return fetch(url, init).then(function (r) {
      var ct = r.headers.get('content-type') || '';
      var parse = ct.indexOf('application/json') !== -1 ? r.json() : r.text();
      return parse.then(function (data) {
        if (r.status === 401 && opts.authRedirect) {
          clearToken();
          if (!/\/(admin-login|cabinet-login)\.html/.test(location.pathname)) {
            var next = encodeURIComponent(location.pathname + location.search);
            location.href = (opts.loginPage || LOGIN_PAGE) + '?next=' + next;
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
          location.replace('admin-login.html?error=forbidden');
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
