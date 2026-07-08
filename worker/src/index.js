const ORIGIN = 'http://api.ngo.uz';
const ALLOWED_ORIGINS = [
  'https://ngo.uz',
  'https://www.ngo.uz',
  'https://ngouz.pages.dev',
  'https://ngo-demo.pages.dev',
  'https://ngo-demo-4bu.pages.dev',
  'https://ngo-demo-night.pages.dev',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];
// Pages preview URLs follow `<deployment-id>.<project>.pages.dev`.
// Allow them so branch/PR deploys of either Pages project can use the
// proxy without re-deploying it. Anchored to the literal suffix to
// reject `…ngouz.pages.dev.attacker.com`.
const ALLOWED_HOST_SUFFIXES = [
  '.ngouz.pages.dev',
  '.ngo-demo.pages.dev',
  '.ngo-demo-4bu.pages.dev',
  '.ngo-demo-night.pages.dev',
];
const LLM_SECRET_SHA256 = 'a54bdfa7a8789bbbe5330195a5ce3a51a73d8453cc1915f46d3213b6955cf8c2';

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
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return corsResponse(origin, 204);
    }

    if (url.pathname === '/_llm') {
      return handleLlmRelay(request, env);
    }

    // /healthz (and /v1/healthz alias) return OK without touching the
    // upstream so external monitors can check the worker without
    // consuming the PHP backend. /v1/healthz alias added because some
    // monitoring tools probe the versioned API path by default.
    if (url.pathname === '/healthz' || url.pathname === '/v1/healthz') {
      const headers = new Headers({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Proxied-By': 'ngo-api-proxy',
      });
      setCors(headers, origin);
      appendVary(headers, 'Origin');
      setSecurityHeaders(headers);
      return new Response(
        JSON.stringify({
          ok: true,
          worker: 'ngo-api-proxy',
          upstream: ORIGIN,
          time: new Date().toISOString(),
          // Bump on each meaningful change so external monitors can detect
          // a deploy without diffing other fields. Increments naturally
          // line up with our iteration log; latest = iter 394.
          version: 394,
        }),
        { status: 200, headers },
      );
    }

    // /v1/news.rss + /v1/events.rss: RSS 2.0 feeds built from upstream.
    // 5-minute edge cache so feed readers don't hammer PHP backend.
    {
      const rssMatch = (
        url.pathname === '/v1/news.rss' ? 'news' :
        url.pathname === '/v1/events.rss' ? 'events' :
        url.pathname === '/v1/grants.rss' ? 'grants' : null
      );
      if (rssMatch && (request.method === 'GET' || request.method === 'HEAD')) {
        // Build a no-cache JSON error response. RSS readers usually
        // honour Cache-Control on the response itself; without
        // no-cache an upstream blip got cached for 5 minutes and the
        // reader silently saw 'no new items' until cache expired.
        const errResp = (status, code, message) => {
          const h = new Headers({
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Proxied-By': 'ngo-api-proxy',
          });
          setSecurityHeaders(h);
          return new Response(JSON.stringify({ error: code, message }), { status, headers: h });
        };
        try {
          // archive=0: hide archived items from the public RSS feeds.
          // The /news, /events, /grants HTML pages and homepage strips
          // already filter archived (iter 195 + 243); the RSS feeds
          // were the lone surface still mixing them in, so subscribers
          // saw archived posts as 'new'.
          // 25s timeout matches the main proxy path so a slow upstream
          // surfaces a clean 504 to readers instead of CF's 1101.
          const ctrl = new AbortController();
          const tid = setTimeout(() => ctrl.abort(), 25000);
          let upstreamRes;
          try {
            upstreamRes = await fetch(ORIGIN + '/v1/public/' + rssMatch + '?limit=50&archive=0', {
              headers: { 'Host': 'api.ngo.uz' },
              signal: ctrl.signal,
            });
          } finally { clearTimeout(tid); }
          if (!upstreamRes.ok) {
            return errResp(502, 'rss_upstream_failed', 'Upstream returned ' + upstreamRes.status);
          }
          const data = await upstreamRes.json();
          const items = (data && data.items) ? data.items : [];
          const xml = buildRss(items, rssMatch);
          const headers = new Headers({
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=300',
            'X-Proxied-By': 'ngo-api-proxy',
          });
          setSecurityHeaders(headers);
          return new Response(xml, { status: 200, headers });
        } catch (e) {
          const aborted = e && e.name === 'AbortError';
          return errResp(
            aborted ? 504 : 500,
            aborted ? 'rss_upstream_timeout' : 'rss_render_failed',
            String((e && e.message) || e).slice(0, 200)
          );
        }
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
      setSecurityHeaders(headers);
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
        // Privacy: don't log raw IP. Cloudflare's edge logs already
        // capture it for security/abuse purposes; persisting it in
        // application logs risks aggregating identifiable user-trail
        // data under O'zbekiston Personal Data Law. Country + UA is
        // enough for bug triage. We hash the IP into a short opaque
        // dedup key so we can group recurring errors from the same
        // session without retaining the address.
        const rawIp = request.headers.get('CF-Connecting-IP') || '';
        const country = request.headers.get('CF-IPCountry') || '';
        const ua = request.headers.get('User-Agent') || '';
        let ipHash = '';
        if (rawIp) {
          try {
            const buf = await crypto.subtle.digest(
              'SHA-256',
              new TextEncoder().encode(rawIp + '|' + new Date().toISOString().slice(0, 10))
            );
            ipHash = Array.from(new Uint8Array(buf, 0, 6))
              .map((b) => b.toString(16).padStart(2, '0')).join('');
          } catch { /* swallow */ }
        }
        console.log(JSON.stringify({
          kind,
          ts: new Date().toISOString(),
          origin,
          ipHash, // 12-char hex, daily-rotated salt
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
      setSecurityHeaders(headers);
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

    let resp;
    try {
      // 25s upstream timeout. CF Workers default to 30s wall-clock but
      // a plain fetch with no AbortController can stall for the full
      // budget — we want to surface a clean 504 to the frontend before
      // CF kills us with a generic 1101.
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      try {
        resp = await fetch(targetUrl, {
          method: request.method,
          headers: headers,
          body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
          redirect: 'follow',
          signal: ctrl.signal,
        });
      } finally {
        clearTimeout(timer);
      }
    } catch (e) {
      // Upstream PHP unreachable (DNS, TCP refuse, abort). Return a
      // structured 502 so frontends can show a real error toast
      // instead of getting a CF 1101 page.
      const errH = new Headers({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Proxied-By': 'ngo-api-proxy',
      });
      setCors(errH, origin);
      appendVary(errH, 'Origin');
      setSecurityHeaders(errH);
      const code = (e && e.name === 'AbortError') ? 504 : 502;
      const msg = code === 504 ? 'upstream_timeout' : 'upstream_unreachable';
      return new Response(
        JSON.stringify({ error: msg, message: 'Server bilan aloqa o\'rnatilmadi. Qaytadan urinib ko\'ring.' }),
        { status: code, headers: errH },
      );
    }

    const responseHeaders = new Headers(resp.headers);
    setCors(responseHeaders, origin);
    responseHeaders.set('X-Proxied-By', 'ngo-api-proxy');
    appendVary(responseHeaders, 'Origin');
    // Defensively enforce the security headers we set on direct
    // responses (iter 393) — upstream PHP usually sets these but if
    // the backend ever drops them the worker still gives clients a
    // safe response. Only add when missing so we don't override
    // upstream-specific values.
    if (!responseHeaders.has('Cross-Origin-Resource-Policy')) {
      responseHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
    if (!responseHeaders.has('X-Content-Type-Options')) {
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
    }
    if (!responseHeaders.has('Referrer-Policy')) {
      responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
    if (!responseHeaders.has('Strict-Transport-Security')) {
      responseHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    if (!responseHeaders.has('X-Frame-Options')) {
      responseHeaders.set('X-Frame-Options', 'DENY');
    }
    // API responses are JSON for browsers; tell crawlers not to index
    // them. Without this, a stray <a> link to a public API URL
    // (e.g. on a developer page) could leak raw JSON into SERPs.
    if (!responseHeaders.has('X-Robots-Tag')) {
      responseHeaders.set('X-Robots-Tag', 'noindex, nofollow');
    }

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: responseHeaders,
    });
  },
};

async function handleLlmRelay(request, env) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Proxied-By': 'ngo-api-proxy',
  });
  setSecurityHeaders(headers);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers });
  }

  const supplied = request.headers.get('X-LLM-Secret') || '';
  if (!supplied || await sha256Hex(supplied) !== LLM_SECRET_SHA256) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'bad_json' }), { status: 400, headers });
  }

  const key = body && typeof body.key === 'string' ? body.key.trim() : '';
  const prompt = body && typeof body.prompt === 'string' ? body.prompt : '';
  const modelRaw = body && typeof body.model === 'string' && body.model.trim()
    ? body.model.trim()
    : 'gemma-4-26b-it';
  const model = modelRaw.replace(/^models\//, '');
  const maxTokens = Math.max(1, Math.min(Number(body && body.maxTokens) || 2048, 8192));

  if (!key || !prompt) {
    return new Response(JSON.stringify({ error: 'missing_fields' }), { status: 400, headers });
  }

  const googleUrl = 'https://generativelanguage.googleapis.com/v1beta/models/'
    + encodeURIComponent(model)
    + ':generateContent?key='
    + encodeURIComponent(key);
  const googleBody = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens },
  };

  let upstream;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 65000);
    try {
      upstream = await fetch(googleUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleBody),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (e) {
    const status = e && e.name === 'AbortError' ? 504 : 502;
    return new Response(JSON.stringify({ error: status === 504 ? 'llm_timeout' : 'llm_unreachable' }), {
      status,
      headers,
    });
  }

  const text = await upstream.text();
  return new Response(text || JSON.stringify({ error: 'empty_llm_response' }), {
    status: upstream.status,
    headers,
  });
}

async function sha256Hex(value) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

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
  setSecurityHeaders(headers);
  return new Response(null, { status, headers });
}

function setSecurityHeaders(headers) {
  // Worker-direct responses (healthz, errlog, RSS, 404) need their own
  // hardening — they don't inherit CF Pages _headers or upstream PHP's
  // headers. CORP=cross-origin is required since browsers fetch RSS
  // from feed-reader origins.
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  // HSTS binds per-origin in the browser, so the worker origin needs
  // its own header; without it, a single MITM on a fresh visitor
  // could downgrade to http://. 1y matches CF Pages _headers.
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // X-Frame-Options DENY since none of the worker responses (JSON,
  // RSS XML) need framing — defends against any clickjacking or
  // confused-deputy patterns.
  headers.set('X-Frame-Options', 'DENY');
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

const RSS_FEEDS = {
  news: {
    title: 'Yangiliklar — ngo.uz',
    description: "O'zbekiston nodavlat notijorat tashkilotlari milliy assotsiatsiyasi yangiliklari.",
    listUrl: 'https://www.ngo.uz/news',
    selfUrl: 'https://ngo-api-proxy.sarvsop.workers.dev/v1/news.rss',
    detailPath: '/news-detail',
  },
  events: {
    title: 'Tadbirlar — ngo.uz',
    description: "Assotsiatsiya tadbirlari, treninglar va anjumanlar.",
    listUrl: 'https://www.ngo.uz/events',
    selfUrl: 'https://ngo-api-proxy.sarvsop.workers.dev/v1/events.rss',
    detailPath: '/event-detail',
  },
  grants: {
    title: 'Grantlar — ngo.uz',
    description: 'NNTlar uchun amaldagi grant tanlovlari va e\'lonlar.',
    listUrl: 'https://www.ngo.uz/grants',
    selfUrl: 'https://ngo-api-proxy.sarvsop.workers.dev/v1/grants.rss',
    detailPath: '/grants',
  },
};

function buildRss(items, kind) {
  const cfg = RSS_FEEDS[kind] || RSS_FEEDS.news;
  // RSS spec convention is reverse-chronological. Backend doesn't
  // guarantee order, so sort by the same date proxy used per-item
  // below (published_at → date → ... → deadline) so readers display
  // newest first regardless of source ordering.
  const sorted = items.slice().sort((a, b) => {
    const da = a.published_at || a.date || a.start_date || a.event_date || a.created_at || a.deadline;
    const db = b.published_at || b.date || b.start_date || b.event_date || b.created_at || b.deadline;
    return (new Date(db).getTime() || 0) - (new Date(da).getTime() || 0);
  });
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
  lines.push('  <channel>');
  lines.push('    <title>' + xmlEscape(cfg.title) + '</title>');
  lines.push('    <link>' + xmlEscape(cfg.listUrl) + '</link>');
  lines.push('    <atom:link href="' + xmlEscape(cfg.selfUrl) + '" rel="self" type="application/rss+xml" />');
  lines.push('    <description>' + xmlEscape(cfg.description) + '</description>');
  lines.push('    <language>uz-UZ</language>');
  lines.push('    <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>');
  for (const it of sorted) {
    const id = it.id || '';
    // News items can be in special-section categories (nashrlar, video)
    // that have their own detail pages — route accordingly so RSS
    // readers don't all land on /news-detail and lose context.
    let detailPath = cfg.detailPath;
    if (kind === 'news') {
      const cat = String(it.category || '').toLowerCase();
      if (cat === 'nashrlar') detailPath = '/publication-detail';
      else if (cat === 'video') detailPath = '/video-detail';
    }
    // News, publication, video, events have dedicated detail pages
    // that read ?id=. Grants share /grants — there is no per-grant
    // detail page, so feed items linked to ?id=X just landed on the
    // bare grant list. Use #fragment anchors so the page can scroll
    // to the matching <article id=X>.
    const useFragment = kind === 'grants';
    const link = 'https://www.ngo.uz' + detailPath
      + (useFragment ? '#' : '?id=') + encodeURIComponent(id);
    // Grants don't carry published_at/created_at, only `deadline` —
    // without falling back to that, every grant shows the current time
    // as pubDate, which makes RSS readers re-mark all items as 'new'
    // on every poll. The deadline is stable and meaningful (the date
    // by which the grant matters), so use it as the dateField proxy.
    const dateField = it.published_at || it.date || it.start_date || it.event_date || it.created_at || it.deadline;
    lines.push('    <item>');
    lines.push('      <title>' + xmlEscape(it.title || '') + '</title>');
    lines.push('      <link>' + xmlEscape(link) + '</link>');
    lines.push('      <guid isPermaLink="true">' + xmlEscape(link) + '</guid>');
    // Only emit pubDate when we have a real date; otherwise RSS
    // readers see "now" and treat the item as freshly published on
    // every poll, marking every old item as new.
    if (dateField) lines.push('      <pubDate>' + rfc822(dateField) + '</pubDate>');
    if (it.category) lines.push('      <category>' + xmlEscape(it.category) + '</category>');
    const desc = it.excerpt || it.description || it.title || '';
    lines.push('      <description>' + xmlEscape(desc) + '</description>');
    lines.push('    </item>');
  }
  lines.push('  </channel>');
  lines.push('</rss>');
  return lines.join('\n');
}
