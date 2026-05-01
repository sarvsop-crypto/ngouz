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
    // Resolve current page to its bare slug (no .html suffix) since CF
    // Pages serves clean URLs and iter 67 stripped .html from internal
    // hrefs. Empty pathname (root /) → "index".
    var currentSlug = (location.pathname.split('/').pop() || 'index').toLowerCase();
    if (currentSlug.endsWith('.html')) currentSlug = currentSlug.slice(0, -5);
    if (!currentSlug) currentSlug = 'index';
    document.querySelectorAll('header.site-header a[href]').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      // Skip absolute URLs, mailto, tel, hash-only, javascript:, language switchers
      if (!href || href.charAt(0) === '#' || href.indexOf(':') !== -1) return;
      var hrefSlug = href.split('/').pop().split('?')[0].split('#')[0];
      if (hrefSlug.endsWith('.html')) hrefSlug = hrefSlug.slice(0, -5);
      if (!hrefSlug) hrefSlug = 'index';
      if (hrefSlug === currentSlug) {
        a.setAttribute('aria-current', 'page');
        // If the active link sits inside a dropdown, also mark the
        // parent .nav-item so CSS can keep the trigger visually
        // highlighted while the user is on the subpage. Without this,
        // navigating to /our-team gives no signal in the top nav that
        // you're in the "Assotsiatsiya haqida" section.
        var parentItem = a.closest('.nav-item.has-dropdown');
        if (parentItem) parentItem.classList.add('is-section-active');
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
