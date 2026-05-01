/**
 * search-overlay.js — wires the public-site search overlay open/close
 * behavior. Looks for #searchOverlay/#searchToggle/#searchClose in the
 * DOM and no-ops gracefully when absent.
 *
 * a11y:
 * - aria-hidden flipped on open/close
 * - Focus moves into the input on open (deferred slightly so the CSS
 *   transition has the input visible before focus lands).
 * - On close, focus returns to the element that opened the overlay
 *   (typically the search-toggle button) so keyboard users don't lose
 *   their place.
 * - Escape closes from anywhere; click outside the box closes too.
 */
(function () {
  var overlay = document.getElementById('searchOverlay');
  var toggle = document.getElementById('searchToggle');
  var close = document.getElementById('searchClose');
  var input = document.getElementById('searchInput');
  if (!overlay || !toggle) return;

  // Static markup didn't declare these — screen readers treated the
  // toggle as a plain button rather than a dialog opener.
  toggle.setAttribute('aria-haspopup', 'dialog');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', overlay.id);

  var lastFocused = null;

  function openSearch() {
    lastFocused = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    if (input) setTimeout(function () { input.focus(); }, 50);
  }
  function closeSearch() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    // Return focus to whatever opened the overlay, or fall back to the
    // toggle button. Wrapped in try/catch since the previous element
    // may have been removed from the DOM in the meantime.
    try {
      var target = (lastFocused && document.contains(lastFocused)) ? lastFocused : toggle;
      if (target && typeof target.focus === 'function') target.focus();
    } catch (e) { /* swallow */ }
    lastFocused = null;
  }

  // Focus-trap helper for Tab / Shift+Tab while open.
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),' +
                  'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function trapTab(e) {
    if (e.key !== 'Tab' || !overlay.classList.contains('open')) return;
    var focusables = overlay.querySelectorAll(FOCUSABLE);
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  toggle.addEventListener('click', openSearch);
  if (close) close.addEventListener('click', closeSearch);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeSearch();
    else if (e.key === 'Tab') trapTab(e);
  });
})();
