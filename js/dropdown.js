/**
 * dropdown.js — click-toggle for .nav-item.has-dropdown parents.
 *
 * CSS already shows the dropdown on .nav-item:hover and .nav-item.is-open,
 * so this script just toggles is-open + aria-expanded on click. Hover
 * still works for mouse users; click works for keyboard + touch.
 *
 * - Click on parent: prevent default, toggle .is-open on the .nav-item,
 *   flip aria-expanded, close all other open dropdowns first.
 * - Click anywhere outside any open dropdown: close it.
 * - Escape: close any open dropdown.
 */
(function () {
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
