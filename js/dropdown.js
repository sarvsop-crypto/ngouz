/**
 * dropdown.js — click-toggle for .nav-item.has-dropdown parents +
 * aria-current marking on the active nav link.
 *
 * CSS already shows the dropdown on .nav-item:hover and .nav-item.is-open,
 * so this script just toggles is-open + aria-expanded on click. Hover
 * still works for mouse users; click works for keyboard + touch.
 *
 * - Click on parent: prevent default, toggle .is-open on the .nav-item,
 *   flip aria-expanded, close all other open dropdowns first.
 * - Click anywhere outside any open dropdown: close it.
 * - Escape: close any open dropdown.
 *
 * On load, also marks any nav <a> whose href matches the current page
 * with aria-current="page" so screen readers announce "current page"
 * when reading the nav.
 */
(function () {
  // Mark current page in the nav
  try {
    var currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (currentFile.indexOf('.html') === -1) currentFile = 'index.html';
    document.querySelectorAll('header.site-header a[href]').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      // Skip absolute URLs, mailto, tel, hash-only, javascript:, language switchers
      if (!href || href.charAt(0) === '#' || href.indexOf(':') !== -1) return;
      // Compare just the filename portion
      var hrefFile = href.split('/').pop();
      if (hrefFile === currentFile) {
        a.setAttribute('aria-current', 'page');
      }
    });
  } catch (e) { /* swallow */ }

  var triggers = document.querySelectorAll('.nav-item.has-dropdown > a[aria-haspopup]');
  if (!triggers.length) return;

  function closeAll(except) {
    document.querySelectorAll('.nav-item.has-dropdown.is-open').forEach(function (item) {
      if (item === except) return;
      item.classList.remove('is-open');
      var trig = item.querySelector('a[aria-haspopup]');
      if (trig) trig.setAttribute('aria-expanded', 'false');
    });
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (ev) {
      ev.preventDefault();
      var item = trigger.closest('.nav-item.has-dropdown');
      if (!item) return;
      var isOpen = item.classList.contains('is-open');
      closeAll(isOpen ? null : item);
      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });

  document.addEventListener('click', function (ev) {
    if (ev.target.closest('.nav-item.has-dropdown')) return;
    closeAll();
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeAll();
  });
})();
