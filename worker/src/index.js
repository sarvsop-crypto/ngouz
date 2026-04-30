const ORIGIN = 'http://api.ngo.uz';
const ALLOWED_ORIGINS = [
  'https://ngo.uz',
  'https://www.ngo.uz',
  'https://ngouz.pages.dev',
  'https://ngo-demo.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000',
];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return corsResponse(origin, 204);
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

  if (ALLOWED_ORIGINS.includes(origin)) {
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
