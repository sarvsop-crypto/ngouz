// Cloudflare Pages Function: POST /api/grants-search
// Pipeline: Turnstile verify → rate limits (3/day per IP, 2/sec global) →
// Gemini router → Tavily (whitelist + fallback) → Gemini synthesizer.

const WHITELIST = [
  'gov.uz', 'uzbekistan.un.org', 'nntma.uz', 'yeoj.uz', 'yoshlaragentligi.uz',
  'mineconomy.uz', 'minjust.uz', 'digital.uz',
  'un.org', 'undp.org', 'unicef.org', 'unwomen.org', 'unhcr.org', 'unesco.org', 'fao.org', 'who.int',
  'worldbank.org', 'adb.org',
  'ec.europa.eu', 'eu4sustainability.org',
  'usaid.gov', 'giz.de', 'jica.go.jp', 'koica.go.kr', 'sdc.admin.ch',
  'britishcouncil.org', 'osf.org', 'fundsforngos.org',
];

const SPAM_DOMAINS = ['pinterest.com', 'quora.com', 'reddit.com', 'medium.com'];

const MODEL = 'gemini-2.5-flash-lite';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}

export async function onRequestPost(ctx) {
  const H = { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' };
  try {
    return await handle(ctx, H);
  } catch (e) {
    return json({ error: 'unhandled', stage: e.stage || 'unknown', message: String(e && e.message || e), stack: String(e && e.stack || '').split('\n').slice(0, 5).join(' | ') }, 500, H);
  }
}

async function handle({ request, env }, H) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad_json' }, 400, H); }
  const query = (body && typeof body.query === 'string') ? body.query.trim() : '';
  const turnstileToken = (body && typeof body.turnstileToken === 'string') ? body.turnstileToken : '';
  if (!query || query.length < 3 || query.length > 500) return json({ error: 'invalid_query' }, 400, H);
  if (!turnstileToken) return json({ error: 'missing_turnstile' }, 400, H);

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';

  // --- 1. Turnstile ---
  const tsForm = new FormData();
  tsForm.append('secret', env.TURNSTILE_SECRET_KEY);
  tsForm.append('response', turnstileToken);
  tsForm.append('remoteip', ip);
  const tsResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: tsForm });
  const tsData = await tsResp.json();
  if (!tsData.success) return json({ error: 'turnstile_failed', codes: tsData['error-codes'] || [] }, 403, H);

  // --- 2. Rate limits ---
  // Per-IP daily cap — bumped temporarily for manager evaluation.
  const DAILY_LIMIT = 1000;
  const today = new Date().toISOString().slice(0, 10);
  const ipKey = `rl:ip:${ip}:${today}`;
  const ipCountStr = await env.RL_KV.get(ipKey);
  const ipCount = parseInt(ipCountStr || '0', 10);
  if (ipCount >= DAILY_LIMIT) {
    return json({
      error: 'ip_limit',
      message_uz: 'Bugun kunlik so\'rov limitingizga yetdingiz. Ertaga qayta urinib ko\'ring.',
      message_ru: 'Вы достигли дневного лимита запросов. Попробуйте завтра.',
      message_en: 'You have reached today\'s request limit. Please try again tomorrow.',
    }, 429, H);
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const globalKey = `rl:global:${nowSec}`;
  const globalCountStr = await env.RL_KV.get(globalKey);
  const globalCount = parseInt(globalCountStr || '0', 10);
  if (globalCount >= 2) {
    return json({
      error: 'global_limit',
      message_uz: 'Server band. 1 soniyadan so\'ng qayta urinib ko\'ring.',
      message_ru: 'Сервер занят. Повторите через секунду.',
      message_en: 'Server busy. Please retry in a second.',
    }, 429, { ...H, 'retry-after': '1' });
  }

  // Increment (Cloudflare KV requires expirationTtl >= 60s)
  await Promise.all([
    env.RL_KV.put(ipKey, String(ipCount + 1), { expirationTtl: 90000 }),
    env.RL_KV.put(globalKey, String(globalCount + 1), { expirationTtl: 60 }),
  ]);

  // --- 3. LLM #1: router / query extractor ---
  const nowYear = new Date().getUTCFullYear();
  const routerPrompt = [
    'You are a routing layer for a grant-search assistant used by Uzbek NGOs.',
    'Given the user\'s free-text question, produce JSON only.',
    'Fields:',
    '- lang: detected language code ("uz", "ru", or "en")',
    '- soha: short English label for the user\'s sector (e.g. "autism support", "beekeeping", "rural water")',
    '- keywords: 3-5 English search terms',
    `- queries: exactly 2 complementary English search queries aimed at finding currently-OPEN grant calls with FUTURE deadlines for this sector. Use phrases like "grant call ${nowYear}", "application deadline", "open funding opportunity".`,
    '',
    'Return ONLY the JSON object. No markdown, no commentary.',
    '',
    `User question: ${query}`,
  ].join('\n');

  let llm1;
  try { llm1 = await geminiCall(env.GEMINI_API_KEY, routerPrompt, 512); }
  catch (e) {
    const rateLimited = e && e.code === 'gemini_rate_limited';
    return json({
      error: rateLimited ? 'gemini_rate_limited' : 'llm1_call_failed',
      message_uz: rateLimited ? 'AI vaqtincha band — bir necha soniyadan so\'ng qayta urinib ko\'ring.' : undefined,
      message_ru: rateLimited ? 'AI временно занят — попробуйте через несколько секунд.' : undefined,
      message_en: rateLimited ? 'AI is temporarily busy — try again in a few seconds.' : undefined,
      message: String(e && e.message || e),
    }, rateLimited ? 429 : 502, { ...H, 'retry-after': rateLimited ? '10' : undefined });
  }
  const parsed = extractJson(llm1);
  if (!parsed || !Array.isArray(parsed.queries) || parsed.queries.length === 0) {
    return json({ error: 'llm1_parse_failed', raw: String(llm1).slice(0, 400) }, 500, H);
  }
  const lang = ['uz', 'ru', 'en'].includes(parsed.lang) ? parsed.lang : 'uz';

  // --- 4. Tavily search: whitelist first, broad fallback ---
  let results = await tavilySearch(env.TAVILY_API_KEY, parsed.queries, { include_domains: WHITELIST });
  if (results.length < 3) {
    const broad = await tavilySearch(env.TAVILY_API_KEY, parsed.queries, { exclude_domains: SPAM_DOMAINS });
    const seen = new Set(results.map(r => r.url));
    for (const r of broad) if (!seen.has(r.url)) { results.push(r); seen.add(r.url); }
  }
  results = results.slice(0, 10);

  if (results.length === 0) {
    const noHits = {
      uz: 'Ushbu soha uchun ochiq grantlar topilmadi. So\'rovingizni kengroq ifodalab ko\'ring.',
      ru: 'Открытых грантов для этой сферы не найдено. Попробуйте сформулировать запрос шире.',
      en: 'No open grants found for this sector. Try phrasing your query more broadly.',
    };
    return json({ lang, answer: noHits[lang], grants: [] }, 200, H);
  }

  // --- 5. LLM #2: synthesizer ---
  const todayISO = new Date().toISOString().slice(0, 10);
  const langName = { uz: 'Uzbek (O\'zbekcha)', ru: 'Russian (Русский)', en: 'English' }[lang];
  const synthPrompt = [
    `You are a grants researcher. Today is ${todayISO}.`,
    `The user asked: "${query}"`,
    `Their sector: ${parsed.soha}`,
    `Respond in: ${langName}.`,
    '',
    'Below are web search results from vetted donor / government sources. Include any item that looks like an open or ongoing grant / funding opportunity / active program. Skip news articles, archives, and clearly expired calls.',
    '',
    ...results.map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\nSnippet: ${(r.content || '').slice(0, 400)}`),
    '',
    'Return ONLY JSON (no markdown) with shape:',
    '{',
    `  "answer": "2-3 sentence summary in ${langName}, directly addressing the user's ask",`,
    '  "grants": [',
    '    {',
    '      "name": "grant/call name",',
    '      "donor": "issuing organization",',
    `      "deadline": "YYYY-MM-DD (a real date strictly AFTER ${todayISO})",`,
    '      "link": "URL",',
    `      "summary": "1-2 sentences in ${langName} about who this is for and what it funds",`,
    '      "source": "root domain only, e.g. un.org"',
    '    }',
    '  ]',
    '}',
    '',
    'STRICT deadline rule — include a grant ONLY when:',
    `- The source clearly states a specific deadline that is strictly AFTER ${todayISO}, and you output it as YYYY-MM-DD.`,
    '',
    'Hard skip (do not include) if any of these apply:',
    `- Deadline is before or on ${todayISO} (already passed).`,
    '- Deadline is not clearly stated in the source (do not guess, do not output "unknown").',
    '- Program is described only as "rolling", "ongoing", "open", or similar without a specific future date.',
    '',
    'If nothing in the results has a clearly-stated future deadline, return an empty grants array and say so in `answer`.',
  ].join('\n');

  let llm2;
  try { llm2 = await geminiCall(env.GEMINI_API_KEY, synthPrompt, 2048); }
  catch (e) {
    const rateLimited = e && e.code === 'gemini_rate_limited';
    return json({
      error: rateLimited ? 'gemini_rate_limited' : 'llm2_call_failed',
      message_uz: rateLimited ? 'AI vaqtincha band — bir necha soniyadan so\'ng qayta urinib ko\'ring.' : undefined,
      message_ru: rateLimited ? 'AI временно занят — попробуйте через несколько секунд.' : undefined,
      message_en: rateLimited ? 'AI is temporarily busy — try again in a few seconds.' : undefined,
      message: String(e && e.message || e),
    }, rateLimited ? 429 : 502, { ...H, 'retry-after': rateLimited ? '10' : undefined });
  }
  const synth = extractJson(llm2);
  if (!synth) return json({ error: 'llm2_parse_failed', raw: String(llm2).slice(0, 400) }, 500, H);

  // Defensive filter: keep ONLY grants with a parseable future date as deadline.
  // Drop unknown / rolling / non-date / past.
  if (Array.isArray(synth.grants)) {
    synth.grants = synth.grants.filter(g => hasFutureDeadline(g && g.deadline));
    if (synth.grants.length === 0) {
      const noHits = {
        uz: 'Hozirgi vaqtda aniq muddat bilan ochiq grantlar topilmadi. Keyinroq qayta urinib ko\'ring yoki so\'rovni kengroq yozing.',
        ru: 'На данный момент не найдено открытых грантов с указанным сроком. Попробуйте позже или сформулируйте запрос шире.',
        en: 'No currently open grants with a stated future deadline found. Try again later or broaden your query.',
      };
      synth.answer = noHits[lang] || noHits.uz;
    }
  }

  return json({ lang, ...synth }, 200, H);
}

function hasFutureDeadline(dl) {
  if (!dl) return false;
  const s = String(dl).trim();
  if (!s) return false;
  const d = new Date(s);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return d.getTime() > today.getTime();
}

// ── helpers ─────────────────────────────────────────────────────────

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers });
}

async function geminiCall(apiKey, prompt, maxOutputTokens) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens, responseMimeType: 'application/json' },
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    const resp = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
    const data = await resp.json().catch(() => ({}));
    if (resp.status === 429) {
      // Gemini free tier is 20 RPM; paid tier is much higher. Back off and retry.
      const retryAfter = Number(data?.error?.details?.find?.(d => d?.retryDelay)?.retryDelay?.replace?.('s', '')) || (2 * (attempt + 1));
      if (attempt === 2) {
        const err = new Error('Gemini rate limited (429). ' + (data?.error?.message || '').slice(0, 200));
        err.code = 'gemini_rate_limited';
        throw err;
      }
      await new Promise(r => setTimeout(r, Math.min(retryAfter, 4) * 1000));
      continue;
    }
    if (!resp.ok) {
      throw new Error(`Gemini ${resp.status}: ${(data?.error?.message || '').slice(0, 200)}`);
    }
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  throw new Error('gemini_exhausted');
}

async function tavilySearch(apiKey, queries, opts) {
  const all = [];
  await Promise.all(queries.map(async (q) => {
    const body = {
      api_key: apiKey,
      query: q,
      max_results: 5,
      search_depth: 'advanced',
    };
    if (opts.include_domains) body.include_domains = opts.include_domains;
    if (opts.exclude_domains) body.exclude_domains = opts.exclude_domains;
    const resp = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (Array.isArray(data?.results)) all.push(...data.results);
  }));
  const seen = new Set();
  return all.filter(r => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}

function extractJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}
