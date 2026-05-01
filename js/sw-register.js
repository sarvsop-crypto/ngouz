/**
 * sw-register.js — registers /sw.js on supported browsers.
 * Defer-loaded so it never blocks initial render. Failures are silent
 * (logged to console) and never break the page.
 */
(function () {
  if (!('serviceWorker' in navigator)) return;
  // Only register on the canonical origin to avoid registering from
  // local file://, dev previews under unrelated paths, etc.
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function (err) {
      try { console.warn('SW register failed:', err); } catch (e) {}
    });
  });
})();
