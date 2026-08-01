import { safeImage, safeLink, sanitizeHtml } from '../../_shared/sanitize-html.js';

const API_ME = 'https://ngo-api-proxy.sarvsop.workers.dev/v1/me';

export async function onRequestOptions() {
  return json({}, 204);
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const page = normalizePage(url.searchParams.get('page') || '/');
  const items = await readItems(env, page);
  const safeItems = await Promise.all(items.filter(isPublicItem).map(async (item) => publicItem(await sanitizePatch(item))));
  return json({ page, items: safeItems }, 200, { 'cache-control': 'no-store' });
}

export async function onRequestPost({ request, env }) {
  const user = await requireAdmin(request);
  if (!user.ok) return json({ error: user.error }, user.status);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const page = normalizePage(body.page || '/');
  const patch = await sanitizePatch(body.patch || {});
  if (!patch.id || !patch.action) return json({ error: 'invalid_patch' }, 400);
  const items = await readItems(env, page);
  const now = new Date().toISOString();
  patch.updated_at = now;
  patch.updated_by = user.email || user.name || 'admin';
  const next = items.filter((x) => x.id !== patch.id);
  next.push(patch);
  await writeItems(env, page, next);
  return json({ ok: true, page, item: patch }, 200);
}

export async function onRequestDelete({ request, env }) {
  const user = await requireAdmin(request);
  if (!user.ok) return json({ error: user.error }, user.status);
  const url = new URL(request.url);
  const page = normalizePage(url.searchParams.get('page') || '/');
  const id = String(url.searchParams.get('id') || '').slice(0, 240);
  if (!id) return json({ error: 'missing_id' }, 400);
  const items = await readItems(env, page);
  if (!items.some((x) => x.id === id)) return json({ error: 'not_found' }, 404);
  await writeItems(env, page, items.filter((x) => x.id !== id));
  return json({ ok: true, page, id }, 200);
}

async function requireAdmin(request) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization) return { ok: false, status: 401, error: 'missing_auth' };
  try {
    const res = await fetch(API_ME, { headers: { authorization, accept: 'application/json' } });
    if (!res.ok) return { ok: false, status: 401, error: 'invalid_auth' };
    const data = await res.json();
    const user = data.user || data;
    if (user.role !== 'super_admin') {
      return { ok: false, status: 403, error: 'forbidden' };
    }
    return { ok: true, ...user };
  } catch {
    return { ok: false, status: 502, error: 'auth_check_failed' };
  }
}

function normalizePage(page) {
  page = String(page || '/').split('#')[0].split('?')[0] || '/';
  if (!page.startsWith('/')) page = '/' + page;
  page = page.replace(/\/index(?:\.html)?$/, '/').replace(/\.html$/, '');
  return page || '/';
}

async function readItems(env, page) {
  const raw = await env.RL_KV.get(key(page));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeItems(env, page, items) {
  await env.RL_KV.put(key(page), JSON.stringify(items.slice(-500)));
}

function key(page) {
  return 'visual-content:' + page;
}

async function sanitizePatch(input) {
  const out = {
    id: String(input.id || '').slice(0, 240),
    action: String(input.action || '').slice(0, 24),
    kind: String(input.kind || '').slice(0, 24),
  };
  if (input.text != null) out.text = String(input.text).slice(0, 20000);
  if (input.html != null) out.html = await sanitizeHtml(String(input.html).slice(0, 40000));
  if (input.src != null) out.src = safeImage(input.src);
  if (input.href != null) out.href = safeLink(input.href);
  if (input.alt != null) out.alt = String(input.alt).slice(0, 500);
  if (input.targetId != null) out.targetId = String(input.targetId).slice(0, 240);
  if (input.position != null) out.position = String(input.position).slice(0, 24);
  return out;
}

function publicItem(input) {
  const out = {
    id: String(input.id || ''),
    action: String(input.action || ''),
    kind: String(input.kind || ''),
  };
  if (input.text != null) out.text = String(input.text);
  if (input.html != null) out.html = String(input.html);
  if (input.src != null) out.src = String(input.src);
  if (input.href != null) out.href = String(input.href);
  if (input.alt != null) out.alt = String(input.alt);
  if (input.targetId != null) out.targetId = String(input.targetId);
  if (input.position != null) out.position = String(input.position);
  return out;
}

function isPublicItem(input) {
  const html = String(input.html || '');
  return !html.includes('VA-TEST-MARKER');
}

function json(obj, status, extra) {
  return new Response(status === 204 ? null : JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
      'access-control-allow-headers': 'content-type, authorization',
      ...(extra || {}),
    },
  });
}
