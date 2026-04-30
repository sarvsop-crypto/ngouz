# ngo-api-proxy

Cloudflare Worker that fronts `http://api.ngo.uz` with CORS so the
static frontend (this repo) can call the PHP backend from a browser
without mixed-content errors.

## Why a worker

`api.ngo.uz` runs on hosting.st.uz mod_php and is reachable on plain
HTTP (its TLS cert is wrong/expired). Calling it directly from
`https://www.ngo.uz` triggers mixed-content blocking in the browser, so
all browser → API traffic goes through this worker, which terminates
TLS at Cloudflare and forwards to the upstream.

Deployed to: `https://ngo-api-proxy.sarvsop.workers.dev`

## CORS contract

- Allowed origins are hard-coded in `src/index.js` (`ALLOWED_ORIGINS`).
- For an allowed `Origin`: echoes it in `Access-Control-Allow-Origin`,
  sets `Allow-Credentials: true`, and adds `Vary: Origin` so the
  Cloudflare edge cache differentiates per-origin.
- For a non-browser request (no `Origin` header): no ACAO is set;
  `Vary: Origin` still set so cached responses don't leak across.
- For a disallowed `Origin`: ACAO omitted entirely (browser will fail
  the preflight honestly) — never lie about which origin is allowed.

## Deploy

```sh
npx wrangler deploy
```

No env vars or secrets — the worker is config-free; the upstream URL
and allowlist live in source.
