/**
 * admin-boot.js — runs on every admin-*.html page. Enforces auth, exposes logout.
 * Requires api-client.js to be loaded BEFORE this file.
 */
(function () {
  if (!window.NgoApi) {
    console.error('admin-boot: NgoApi not loaded');
    return;
  }
  if (!window.NgoAdminNavigation) {
    console.error('admin-boot: NgoAdminNavigation not loaded');
    return;
  }

  var readyResolve;
  var readyReject;
  window.NgoAdminReady = new Promise(function (resolve, reject) {
    readyResolve = resolve;
    readyReject = reject;
  });
  window.NgoAdminReady.catch(function () {});

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
  authOpts.allowedRoles = NgoAdminNavigation.allowedRoles();
  delete authOpts.minRole;
  authOpts.loginPage = authOpts.loginPage || '/admin-login';

  NgoApi.requireAuth(authOpts)
    .then(function (user) {
      if (NgoApi.startIdleLogout) NgoApi.startIdleLogout({ loginPage: authOpts.loginPage });
      window.__CURRENT_USER__ = user;
      NgoAdminNavigation.mount(user);
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
      readyResolve(user);
    })
    .catch(function (error) {
      readyReject(error);
      /* requireAuth already handled redirect */
    });

})();
