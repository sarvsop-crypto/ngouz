/**
 * errlog.js — captures uncaught JS errors and unhandledrejection
 * events, batches up to 8 per page, and beacons them to
 * /v1/errlog on the API proxy. Designed to be a tiny no-dependency
 * include that never throws even when the page is broken.
 */
(function () {
  if (typeof window === 'undefined') return;

  var ENDPOINT = 'https://ngo-api-proxy.sarvsop.workers.dev/v1/errlog';
  var MAX_REPORTS = 8;
  var sent = 0;

  function send(rec) {
    if (sent >= MAX_REPORTS) return;
    sent += 1;
    try {
      rec.ts = new Date().toISOString();
      rec.url = location.href;
      rec.referrer = document.referrer || '';
      rec.viewport = window.innerWidth + 'x' + window.innerHeight;
      var body = JSON.stringify(rec);
      var blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob)) return;
      // Fallback for older browsers / when sendBeacon refuses
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
      }).catch(function () {});
    } catch (e) {
      // Reporting itself must not throw — drop silently.
    }
  }

  window.addEventListener('error', function (ev) {
    if (!ev) return;
    var msg = ev.message || (ev.error && ev.error.message) || 'error';
    var stack = (ev.error && ev.error.stack) ? String(ev.error.stack).slice(0, 2000) : '';
    send({
      kind: 'error',
      message: String(msg).slice(0, 500),
      source: String(ev.filename || '').slice(0, 300),
      lineno: ev.lineno || 0,
      colno: ev.colno || 0,
      stack: stack,
    });
  });

  window.addEventListener('unhandledrejection', function (ev) {
    if (!ev) return;
    var reason = ev.reason;
    var msg = (reason && reason.message) ? reason.message : String(reason || 'rejection');
    var stack = (reason && reason.stack) ? String(reason.stack).slice(0, 2000) : '';
    send({
      kind: 'unhandledrejection',
      message: String(msg).slice(0, 500),
      stack: stack,
    });
  });
})();
