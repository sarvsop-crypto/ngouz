const ORIGIN = 'http://api.ngo.uz';
const ALLOWED_ORIGINS = [
  'https://ngo.uz',
  'https://www.ngo.uz',
  'https://ngouz.pages.dev',
  'https://ngo-demo.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000',
];
// Pages preview URLs follow `<deployment-id>.<project>.pages.dev`.
// Allow them so branch/PR deploys of either Pages project can use the
// proxy without re-deploying it. Anchored to the literal suffix to
// reject `…ngouz.pages.dev.attacker.com`.
const ALLOWED_HOST_SUFFIXES = [
  '.ngouz.pages.dev',
  '.ngo-demo.pages.dev',
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  let host;
  try {
    const u = new URL(origin);
    if (u.protocol !== 'https:') return false;
    host = u.host;
  } catch {
    return false;
  }
  for (const suffix of ALLOWED_HOST_SUFFIXES) {
    if (host.endsWith(suffix) && host.length > suffix.length) return true;
  }
  return false;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return corsResponse(origin, 204);
    }

    // /healthz returns OK without touching the upstream so external
    // monitors can check the worker without consuming PHP backend.
    if (url.pathname === '/healthz') {
      const headers = new Headers({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Proxied-By': 'ngo-api-proxy',
      });
      setCors(headers, origin);
      appendVary(headers, 'Origin');
      return new Response(
        JSON.stringify({ ok: true, worker: 'ngo-api-proxy', upstream: ORIGIN }),
        { status: 200, headers },
      );
    }

    // /v1/news.rss: RSS 2.0 feed built from /v1/public/news. Fetches
    // up to 50 latest items from upstream, wraps them in <item> tags
    // with title/link/description/pubDate/guid. 5-minute edge cache so
    // popular feed readers don't hammer the PHP backend.
    if (url.pathname === '/v1/news.rss' && (request.method === 'GET' || request.method === 'HEAD')) {
      try {
        const upstreamRes = await fetch(ORIGIN + '/v1/public/news?limit=50', {
          headers: { 'Host': 'api.ngo.uz' },
        });
        if (!upstreamRes.ok) {
          return new Response('upstream_failed', { status: 502 });
        }
        const data = await upstreamRes.json();
        const items = (data && data.items) ? data.items : [];
        const xml = buildRss(items);
        const headers = new Headers({
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'X-Proxied-By': 'ngo-api-proxy',
        });
        return new Response(xml, { status: 200, headers });
      } catch (e) {
        return new Response('error', { status: 500 });
      }
    }

    // /v1/errlog: lightweight reporting endpoint for both client JS
    // errors and CSP violations. Accepts JSON beacons (errlog.js),
    // application/csp-report bodies (CSP report-uri), and
    // application/reports+json (Reporting API). 8 KB cap, no upstream
    // forward, 204 response. console.log emits one structured line per
    // request for `wrangler tail`.
    if (url.pathname === '/v1/errlog' && request.method === 'POST') {
      const headers = new Headers({
        'Cache-Control': 'no-store',
        'X-Proxied-By': 'ngo-api-proxy',
      });
      setCors(headers, origin);
      appendVary(headers, 'Origin');
      try {
        const raw = await request.text();
        if (raw.length > 8192) {
          return new Response(JSON.stringify({ error: 'payload_too_large' }), {
            status: 413,
            headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' },
          });
        }
        const ct = (request.headers.get('Content-Type') || '').toLowerCase();
        let payload = null;
        try { payload = JSON.parse(raw); } catch { payload = { raw }; }
        let kind = 'errlog';
        if (ct.includes('csp-report')) kind = 'csp-report';
        else if (ct.includes('reports+json')) kind = 'report-api';
        else if (payload && payload['csp-report']) kind = 'csp-report';
        const ip = request.headers.get('CF-Connecting-IP') || '';
        const country = request.headers.get('CF-IPCountry') || '';
        const ua = request.headers.get('User-Agent') || '';
        console.log(JSON.stringify({
          kind,
          ts: new Date().toISOString(),
          origin,
          ip,
          country,
          ua,
          payload,
        }));
      } catch (e) {
        // Swallow — error reporting itself must not error.
      }
      return new Response(null, { status: 204, headers });
    }

    // Only /v1/* paths are valid frontend traffic. Reject anything else
    // before forwarding so the worker isn't an open relay to upstream.
    if (!url.pathname.startsWith('/v1/') && url.pathname !== '/v1') {
      const headers = new Headers({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Proxied-By': 'ngo-api-proxy',
      });
      setCors(headers, origin);
      appendVary(headers, 'Origin');
      return new Response(
        JSON.stringify({ error: 'not_found', path: url.pathname }),
        { status: 404, headers },
      );
    }

    const targetUrl = ORIGIN + url.pathname + url.search;

    const headers = new Headers(request.headers);
    headers.set('Host', 'api.ngo.uz');
    headers.delete('Origin');
    headers.delete('CF-Connecting-IP');
    headers.delete('CF-RAY');

    const resp = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });

    const responseHeaders = new Headers(resp.headers);
    setCors(responseHeaders, origin);
    responseHeaders.set('X-Proxied-By', 'ngo-api-proxy');
    appendVary(responseHeaders, 'Origin');

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: responseHeaders,
    });
  },
};

function setCors(headers, origin) {
  // Only set CORS headers when an Origin was sent (browser request).
  // Non-browser requests (curl, server-side) don't need them and shouldn't
  // get the credentialed/* combo, which browsers reject anyway.
  if (!origin) return;

  if (isAllowedOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With');
    headers.set('Access-Control-Max-Age', '3600');
  }
  // For unknown origins, omit ACAO entirely so the browser fails the
  // preflight honestly instead of receiving a misleading allowlist entry.
}

function appendVary(headers, value) {
  const existing = headers.get('Vary');
  if (!existing) {
    headers.set('Vary', value);
    return;
  }
  const tokens = existing.split(',').map((s) => s.trim().toLowerCase());
  if (!tokens.includes(value.toLowerCase())) {
    headers.set('Vary', existing + ', ' + value);
  }
}

function corsResponse(origin, status) {
  const headers = new Headers();
  setCors(headers, origin);
  appendVary(headers, 'Origin');
  return new Response(null, { status, headers });
}

function xmlEscape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(date) {
  // Robust to missing / partial dates from upstream
  const d = date ? new Date(date) : new Date();
  if (isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

function buildRss(items) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
  lines.push('  <channel>');
  lines.push('    <title>Yangiliklar — ngo.uz</title>');
  lines.push('    <link>https://www.ngo.uz/news.html</link>');
  lines.push('    <atom:link href="https://ngo-api-proxy.sarvsop.workers.dev/v1/news.rss" rel="self" type="application/rss+xml" />');
  lines.push("    <description>O'zbekiston nodavlat notijorat tashkilotlari milliy assotsiatsiyasi yangiliklari.</description>");
  lines.push('    <language>uz-UZ</language>');
  lines.push('    <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>');
  for (const it of items) {
    const id = it.id || '';
    const link = 'https://www.ngo.uz/news-detail.html?id=' + encodeURIComponent(id);
    lines.push('    <item>');
    lines.push('      <title>' + xmlEscape(it.title || '') + '</title>');
    lines.push('      <link>' + xmlEscape(link) + '</link>');
    lines.push('      <guid isPermaLink="true">' + xmlEscape(link) + '</guid>');
    lines.push('      <pubDate>' + rfc822(it.published_at || it.date || it.created_at) + '</pubDate>');
    if (it.category) lines.push('      <category>' + xmlEscape(it.category) + '</category>');
    lines.push('      <description>' + xmlEscape(it.excerpt || it.title || '') + '</description>');
    lines.push('    </item>');
  }
  lines.push('  </channel>');
  lines.push('</rss>');
  return lines.join('\n');
}
