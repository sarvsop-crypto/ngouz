/**
 * search-overlay.js — wires the public-site search overlay open/close
 * behavior. Looks for #searchOverlay/#searchToggle/#searchClose in the
 * DOM and no-ops gracefully when absent. Was previously inlined on
 * 55+ HTML pages.
 */
(function () {
  var overlay = document.getElementById('searchOverlay');
  var toggle = document.getElementById('searchToggle');
  var close = document.getElementById('searchClose');
  var input = document.getElementById('searchInput');
  if (!overlay || !toggle) return;
  function openSearch() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    if (input) setTimeout(function () { input.focus(); }, 50);
  }
  function closeSearch() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  toggle.addEventListener('click', openSearch);
  if (close) close.addEventListener('click', closeSearch);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSearch(); });
})();
