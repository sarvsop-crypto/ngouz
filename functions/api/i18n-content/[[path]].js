// Visual-admin i18n override layer.
//
// Static site copy lives in /js/i18n/{lang}.json (immutable, deployed). This
// endpoint stores per-language OVERRIDES keyed by the same dotted i18n key
// (e.g. "pages.mission.body", "footer.copyright"). js/i18n.js merges them over
// the base dict at load, so an edit sticks per language and survives DOM
// reordering — unlike the old positional data-va-block-id patches.
//
// Overrides are GLOBAL per language (an i18n key means the same thing on every
// page that uses it), not per page.

import { sanitizeHtml } from '../../_shared/sanitize-html.js';

const API_ME = 'https://ngo-api-proxy.sarvsop.workers.dev/v1/me';
const LANGS = ['uz', 'ru', 'en'];
const MAX_KEYS = 4000;
const MAX_VALUE = 40000;

export async function onRequestOptions() {
  return json({}, 204);
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const lang = normalizeLang(url.searchParams.get('lang'));
  const overrides = await readOverrides(env, lang);
  const sanitized = await sanitizeOverrides(overrides);
  return json({ lang, overrides: sanitized.values }, 200, { 'cache-control': 'no-store' });
}

export async function onRequestPost({ request, env }) {
  const user = await requireAdmin(request);
  if (!user.ok) return json({ error: user.error }, user.status);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const lang = normalizeLang(body.lang);
  const key = normalizeKey(body.key);
  if (!key) return json({ error: 'invalid_key' }, 400);
  if (body.value == null) return json({ error: 'missing_value' }, 400);
  const value = await sanitizeHtml(String(body.value).slice(0, MAX_VALUE));

  const overrides = await readOverrides(env, lang);
  if (!(key in overrides) && Object.keys(overrides).length >= MAX_KEYS) {
    return json({ error: 'override_limit' }, 409);
  }
  overrides[key] = value;
  await writeOverrides(env, lang, overrides);
  return json({ ok: true, lang, key }, 200);
}

export async function onRequestDelete({ request, env }) {
  const user = await requireAdmin(request);
  if (!user.ok) return json({ error: user.error }, user.status);
  const url = new URL(request.url);
  const lang = normalizeLang(url.searchParams.get('lang'));
  const key = normalizeKey(url.searchParams.get('key'));
  if (!key) return json({ error: 'missing_key' }, 400);
  const overrides = await readOverrides(env, lang);
  if (key in overrides) {
    delete overrides[key];
    await writeOverrides(env, lang, overrides);
  }
  return json({ ok: true, lang, key }, 200);
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

function normalizeLang(lang) {
  lang = String(lang || 'uz').toLowerCase().slice(0, 5);
  return LANGS.indexOf(lang) === -1 ? 'uz' : lang;
}

// i18n keys are dotted paths of word chars only (matches js/i18n.js lookup).
function normalizeKey(key) {
  key = String(key || '').trim().slice(0, 240);
  return /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/.test(key) ? key : '';
}

async function readOverrides(env, lang) {
  const raw = await env.RL_KV.get(key(lang));
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

async function writeOverrides(env, lang, overrides) {
  await env.RL_KV.put(key(lang), JSON.stringify(overrides));
}

function key(lang) {
  return 'i18n-content:' + lang;
}

async function sanitizeOverrides(overrides) {
  const values = {};
  await Promise.all(Object.entries(overrides).map(async ([key, value]) => {
    const original = String(value == null ? '' : value);
    const safe = original.includes('<') ? await sanitizeHtml(original) : original;
    values[key] = safe;
  }));
  return { values };
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
