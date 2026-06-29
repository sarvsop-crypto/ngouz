// Conservative offline shell for the NNTMA cabinet.
// - Hashed build assets (js/css/fonts/img): cache-first (immutable, so a new
//   deploy = new hashes = fetched fresh; old caches pruned on activate).
// - Navigations: network-first, falling back to a cached navigation when offline.
// - API + cross-origin (proxy, fonts) are never cached here (always live).
const CACHE = 'ngouz-shell-v1';
const ASSET_RE = /\.(?:js|css|woff2?|png|svg|webp|webmanifest|ico)$/;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // proxy/API/fonts stay live

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('__nav__', copy));
          return res;
        })
        .catch(() => caches.match('__nav__').then((m) => m || caches.match(req))),
    );
    return;
  }

  if (ASSET_RE.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) =>
        hit ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        }),
      ),
    );
  }
});
