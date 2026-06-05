// Self-hosted contact map (Leaflet + OpenStreetMap tiles).
//
// Replaces the previous Yandex map-widget iframe, which intermittently served
// a captcha/blank from Yandex's side (referrer/region anti-bot) and made the
// map "disappear" even though our markup + CSP were correct. Leaflet renders
// from tile *images* under the existing CSP (img-src https:, script/style from
// unpkg) with no third-party iframe that can be blocked — so it can't vanish
// due to an external service.
(function () {
  var LAT = 41.312565;
  var LNG = 69.240568;

  function init() {
    var el = document.getElementById('contact-map-canvas');
    if (!el || !window.L || el.dataset.ready) return;
    el.dataset.ready = '1';
    var map = L.map(el, { scrollWheelZoom: false }).setView([LAT, LNG], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    L.marker([LAT, LNG]).addTo(map).bindPopup("O'zNNTMA");
    // Re-measure once layout settles (the container starts at 320px via CSS).
    setTimeout(function () { map.invalidateSize(); }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
