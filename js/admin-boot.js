/**
 * admin-boot.js — runs on every admin-*.html page. Enforces auth, exposes logout.
 * Requires api-client.js to be loaded BEFORE this file.
 */
(function () {
  if (!window.NgoApi) {
    console.error('admin-boot: NgoApi not loaded');
    return;
  }

  // role code → Uzbek label, matched to the labels admin-cms uses.
  // Falls back to the raw code if upstream returns a role we don't know.
  var ROLE_LABELS = {
    super_admin: 'Bosh admin',
    leader: 'Rahbar',
    regional_admin: 'Hududiy admin',
    portal_moderator: 'Portal moderatori',
    member_manager: 'A\'zolar boshqaruvchisi',
    member_user: 'A\'zo',
    commission: 'Komissiya'
  };

  var authOpts = window.NGO_ADMIN_AUTH || {};
  if (!authOpts.minRole && !authOpts.allowedRoles) authOpts.minRole = 'regional_admin';
  authOpts.loginPage = authOpts.loginPage || 'admin-login';

  NgoApi.requireAuth(authOpts)
    .then(function (user) {
      if (NgoApi.startIdleLogout) NgoApi.startIdleLogout({ loginPage: authOpts.loginPage });
      window.__CURRENT_USER__ = user;
      var slot = document.querySelector('[data-user-name]');
      if (slot) slot.textContent = user.full_name || user.email;
      var role = document.querySelector('[data-user-role]');
      if (role) role.textContent = ROLE_LABELS[user.role] || user.role;
      // Avatar initial — pulled from the loaded user. Without this the
      // per-page hardcoded 'A' stays even after login as someone else.
      var avatar = document.querySelector('.main__profile-avatar');
      if (avatar && (user.full_name || user.email)) {
        avatar.textContent = String(user.full_name || user.email).charAt(0).toUpperCase();
      }
      document.querySelectorAll('.sidebar__nav-link[href]').forEach(function (link) {
        var href = (link.getAttribute('href') || '').replace(/^\//, '').replace(/\.html$/, '');
        if (href === 'admin-login') return;
        if (user.role === 'commission') {
          if (href !== 'admin-commission') link.remove();
          return;
        }
        if (href === 'admin-commission' && user.role !== 'super_admin') {
          link.remove();
        }
      });
    })
    .catch(function () { /* requireAuth already handled redirect */ });

  window.addEventListener('click', function (ev) {
    var el = ev.target.closest && ev.target.closest('[data-action="logout"]');
    if (!el) return;
    ev.preventDefault();
    // Optimistic: fire /auth/logout BEFORE clearing the local token, so
    // the in-flight POST still carries the Authorization header and the
    // backend can revoke the right session. Earlier order (clear-then-
    // POST) sent /auth/logout without auth, leaving zombie sessions on
    // the server. The local clear + navigate still happen immediately
    // so the user lands on the login page in ~50 ms.
    NgoApi.logout().catch(function () {});
    try {
      localStorage.removeItem('ngo_api_token'); localStorage.removeItem('ngo_api_user');
      sessionStorage.removeItem('ngo_api_token'); sessionStorage.removeItem('ngo_api_user');
    } catch (e) {}
    location.replace('admin-login');
  });
})();
