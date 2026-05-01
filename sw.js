/**
 * sw.js — minimal service worker for ngo.uz public site.
 * - Precaches the offline fallback page on install.
 * - Cache-first for hashed/long-lived static assets (/js/, /css/, /img/, /favicon.*).
 * - Network-first for HTML navigation, with offline.html fallback.
 * - Pass-through (no caching) for API calls and external origins.
 *
 * Versioned cache name — bump CACHE_VERSION to invalidate on rollouts.
 */
const CACHE_VERSION = 'ngo-v2';
const STATIC_CACHE = CACHE_VERSION + '-static';

const PRECACHE = [
  '/offline',
  '/favicon.svg',
  '/img/logo-oznntma.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return /^\/(js|css|img|fonts)\//.test(url.pathname)
      || /^\/favicon\.(svg|ico)$/.test(url.pathname)
      || /^\/manifest\.webmanifest$/.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Skip cross-origin requests entirely — let the browser handle them.
  if (url.origin !== self.location.origin) return;

  // Cache-first for static assets.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          // Refresh in the background.
          fetch(req).then((res) => {
            if (res && res.ok) caches.open(STATIC_CACHE).then((c) => c.put(req, res));
          }).catch(() => {});
          return cached;
        }
        return fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // Network-first for HTML navigation; fall back to cache then offline.html.
  if (req.mode === 'navigate' || (req.headers.get('Accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() =>
        caches.match(req).then((cached) => cached || caches.match('/offline'))
      )
    );
    return;
  }
});
