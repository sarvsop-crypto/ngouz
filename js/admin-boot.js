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
    regional_admin: 'Hududiy admin',
    portal_moderator: 'Portal moderatori',
    member_manager: 'A\'zolar boshqaruvchisi',
    member_user: 'A\'zo'
  };

  NgoApi.requireAuth({ minRole: 'regional_admin', loginPage: 'admin-login' })
    .then(function (user) {
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
    })
    .catch(function () { /* requireAuth already handled redirect */ });

  window.addEventListener('click', function (ev) {
    var el = ev.target.closest && ev.target.closest('[data-action="logout"]');
    if (!el) return;
    ev.preventDefault();
    // Optimistic: clear local state + navigate immediately. /auth/logout
    // still fires fire-and-forget so the backend session record gets
    // revoked, but the user doesn't wait up to 15 s on a slow network.
    try { localStorage.removeItem('ngo_api_token'); localStorage.removeItem('ngo_api_user'); } catch (e) {}
    NgoApi.logout().catch(function () {});
    location.replace('admin-login');
  });
})();
