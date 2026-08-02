/**
 * sw.js — minimal service worker for ngo.uz public site.
 * - Precaches the offline fallback page on install.
 * - Cache-first for hashed/long-lived static assets (/js/, /css/, /img/, /favicon.*).
 * - Network-first for HTML navigation, with offline.html fallback.
 * - Pass-through (no caching) for API calls and external origins.
 *
 * Versioned cache name — bump CACHE_VERSION to invalidate on rollouts.
 */
const CACHE_VERSION = 'ngo-v521-admin-identity-picker';
const STATIC_CACHE = CACHE_VERSION + '-static';

const PRECACHE = [
  '/offline',
  '/favicon.svg',
  '/img/logo-oznntma.png',
];

self.addEventListener('install', (event) => {
  // cache.addAll() is atomic — a single 404 (e.g., /offline mid-deploy
  // or a renamed asset) discards the entire SW install, leaving users
  // stuck on the previous version with no precache refresh. Per-entry
  // cache.add() inside Promise.allSettled lets each precache target
  // succeed independently; a broken /offline never blocks /favicon.svg
  // from caching, and the SW activates regardless.
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.allSettled(PRECACHE.map((url) => cache.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
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
  if (/^\/js\/(api-client|admin-[a-z0-9-]+|visual-admin)\.js$/.test(url.pathname)
      || url.pathname === '/css/pacta-collaboration.page.css') return false;
  return /^\/(js|css|img|fonts)\//.test(url.pathname)
      || /^\/favicon\.(svg|ico)$/.test(url.pathname)
      || /^\/manifest\.webmanifest$/.test(url.pathname);
}

// Cache.put() rejects responses with .redirected = true. CF Pages
// 308-redirects every /foo.html → /foo, which broke HTML caching in
// iter 46. Rebuild a non-redirected Response from the body before
// putting in cache.
async function cachePut(cache, req, res) {
  if (!res || !res.ok) return;
  const cacheControl = (res.headers.get('Cache-Control') || '').toLowerCase();
  if (cacheControl.includes('no-store') || cacheControl.includes('private') || res.headers.has('Set-Cookie')) return;
  if (!res.redirected) {
    cache.put(req, res.clone()).catch(() => {});
    return;
  }
  try {
    const cloned = res.clone();
    const body = await cloned.blob();
    const fixed = new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
    cache.put(req, fixed).catch(() => {});
  } catch (e) { /* swallow */ }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Skip cross-origin requests entirely — let the browser handle them.
  if (url.origin !== self.location.origin) return;

  // Authenticated surfaces must never be stored in the public-site cache.
  if (/^\/admin(?:-|\/|$)/.test(url.pathname) || /^\/cabinet(?:\/|$)/.test(url.pathname)) return;

  // Cache-first for static assets.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          // Refresh in the background.
          fetch(req).then((res) => {
            if (res && res.ok) caches.open(STATIC_CACHE).then((c) => cachePut(c, req, res));
          }).catch(() => {});
          return cached;
        }
        return fetch(req).then((res) => {
          if (res && res.ok) caches.open(STATIC_CACHE).then((c) => cachePut(c, req, res));
          return res;
        });
      })
    );
    return;
  }

  // Network-first for HTML navigation; fall back to cache then /offline.
  if (req.mode === 'navigate' || (req.headers.get('Accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) caches.open(STATIC_CACHE).then((c) => cachePut(c, req, res));
        return res;
      }).catch(() =>
        caches.match(req).then((cached) => cached || caches.match('/offline'))
      )
    );
    return;
  }
});
