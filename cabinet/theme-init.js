/* Pre-paint theme application (no flash of light for dark users). Mirrors
   lib/theme.ts; runs as a blocking same-origin script so CSP 'self' allows it
   without an inline-hash. The React app re-applies + binds the OS listener. */
(function () {
  try {
    var t = localStorage.getItem('ngouz_theme');
    var dark = t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch (e) { /* private mode / no storage */ }
})();
