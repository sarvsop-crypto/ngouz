/**
 * admin-boot.js — runs on every admin-*.html page. Enforces auth, exposes logout.
 * Requires api-client.js to be loaded BEFORE this file.
 */
(function () {
  if (!window.NgoApi) {
    console.error('admin-boot: NgoApi not loaded');
    return;
  }

  NgoApi.requireAuth({ minRole: 'regional_admin', loginPage: 'admin-login.html' })
    .then(function (user) {
      window.__CURRENT_USER__ = user;
      var slot = document.querySelector('[data-user-name]');
      if (slot) slot.textContent = user.full_name || user.email;
      var role = document.querySelector('[data-user-role]');
      if (role) role.textContent = user.role;
    })
    .catch(function () { /* requireAuth already handled redirect */ });

  window.addEventListener('click', function (ev) {
    var el = ev.target.closest && ev.target.closest('[data-action="logout"]');
    if (!el) return;
    ev.preventDefault();
    NgoApi.logout().then(function () { location.replace('admin-login.html'); });
  });
})();
