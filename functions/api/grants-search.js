// Cloudflare Pages Function: POST /api/grants-search
// Pipeline: Turnstile verify → rate limits (1000/day per IP, 2/sec global) →
// Gemma 4 router (Workers AI) → DuckDuckGo + page-fetch enrich → Gemma 4 synthesizer.

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

const GEMMA_MODEL = '@cf/google/gemma-4-26b-a4b-it';

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

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
    `- queries: exactly 3 complementary English search queries aimed at finding currently-OPEN grant calls with FUTURE deadlines for this sector. Use phrases like "grant call ${nowYear}", "application deadline", "open funding opportunity". Each query should target a different angle (e.g. donor-focused, sector-focused, region-focused).`,
    '',
    'Return ONLY the JSON object. No markdown, no commentary.',
    '',
    `User question: ${query}`,
  ].join('\n');

  let llm1;
  try { llm1 = await gemmaCall(env.AI, routerPrompt, 512); }
  catch (e) {
    const rateLimited = e && e.code === 'gemma_rate_limited';
    return json({
      error: rateLimited ? 'gemma_rate_limited' : 'llm1_call_failed',
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

  // --- 4. DuckDuckGo search → post-hoc whitelist filter → broad fallback ---
  const allRaw = await duckduckgoSearch(parsed.queries);
  const broadFiltered = allRaw.filter(r => !SPAM_DOMAINS.some(d => urlHostMatches(r.url, d)));
  const whitelisted = broadFiltered.filter(r => WHITELIST.some(d => urlHostMatches(r.url, d)));

  let chosen = whitelisted.slice(0, 8);
  if (chosen.length < 8) {
    const seen = new Set(chosen.map(r => r.url));
    for (const r of broadFiltered) {
      if (chosen.length >= 8) break;
      if (!seen.has(r.url)) { chosen.push(r); seen.add(r.url); }
    }
  }

  if (chosen.length === 0) {
    const noHits = {
      uz: 'Ushbu soha uchun ochiq grantlar topilmadi. So\'rovingizni kengroq ifodalab ko\'ring.',
      ru: 'Открытых грантов для этой сферы не найдено. Попробуйте сформулировать запрос шире.',
      en: 'No open grants found for this sector. Try phrasing your query more broadly.',
    };
    return json({ lang, answer: noHits[lang], grants: [] }, 200, H);
  }

  // Enrich with fetched page content (parallel, best-effort, 1500 chars each).
  const results = await Promise.all(chosen.map(async (r) => {
    const content = await fetchAndStrip(r.url, 1500).catch(() => '');
    return { url: r.url, title: r.title, content: content || r.snippet || '' };
  }));

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
    ...results.map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\nContent: ${(r.content || '').slice(0, 1500)}`),
    '',
    'Return ONLY JSON (no markdown) with shape:',
    '{',
    `  "answer": "2-3 sentence summary in ${langName}, directly addressing the user's ask",`,
    '  "grants": [',
    '    {',
    '      "name": "grant/call name",',
    '      "donor": "issuing organization",',
    `      "deadline": "YYYY-MM-DD if a specific future date is stated; otherwise empty string \\"\\"",`,
    '      "link": "URL",',
    `      "summary": "1-2 sentences in ${langName} about who this is for and what it funds",`,
    '      "source": "root domain only, e.g. un.org"',
    '    }',
    '  ]',
    '}',
    '',
    'Deadline rules — VERY IMPORTANT:',
    `- If the source clearly states a specific deadline AFTER ${todayISO}, output it as YYYY-MM-DD.`,
    '- If the source does NOT state a deadline, OR describes the program as "rolling", "ongoing", "open call", "year-round", set deadline to empty string "". Do NOT invent a date. Do NOT output "unknown". Still include the grant.',
    `- HARD SKIP (do not include): deadline is clearly stated and is on or before ${todayISO} — that grant has already closed.`,
    '',
    'If no real grants/funding opportunities are found in the results, return an empty grants array and say so in `answer`.',
  ].join('\n');

  let llm2;
  try { llm2 = await gemmaCall(env.AI, synthPrompt, 3072); }
  catch (e) {
    const rateLimited = e && e.code === 'gemma_rate_limited';
    return json({
      error: rateLimited ? 'gemma_rate_limited' : 'llm2_call_failed',
      message_uz: rateLimited ? 'AI vaqtincha band — bir necha soniyadan so\'ng qayta urinib ko\'ring.' : undefined,
      message_ru: rateLimited ? 'AI временно занят — попробуйте через несколько секунд.' : undefined,
      message_en: rateLimited ? 'AI is temporarily busy — try again in a few seconds.' : undefined,
      message: String(e && e.message || e),
    }, rateLimited ? 429 : 502, { ...H, 'retry-after': rateLimited ? '10' : undefined });
  }
  const synth = extractJson(llm2);
  if (!synth) return json({ error: 'llm2_parse_failed', raw: String(llm2).slice(0, 400) }, 500, H);

  // Defensive filter: drop grants whose deadline is a parseable PAST date.
  // Keep grants with no deadline, "rolling"/"ongoing"/etc., or future dates.
  if (Array.isArray(synth.grants)) {
    synth.grants = synth.grants.filter(g => !isExpired(g && g.deadline));
    if (synth.grants.length === 0) {
      const noHits = {
        uz: 'Ushbu soha uchun ochiq grantlar topilmadi. So\'rovingizni kengroq ifodalab ko\'ring.',
        ru: 'Открытых грантов для этой сферы не найдено. Попробуйте сформулировать запрос шире.',
        en: 'No open grants found for this sector. Try phrasing your query more broadly.',
      };
      synth.answer = noHits[lang] || noHits.uz;
    }
  }

  return json({ lang, ...synth }, 200, H);
}

function isExpired(dl) {
  if (!dl) return false;
  const s = String(dl).trim();
  if (!s) return false;
  const d = new Date(s);
  // Non-date strings like "rolling", "ongoing", "TBD" → not expired, keep.
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return d.getTime() <= today.getTime();
}

// ── helpers ─────────────────────────────────────────────────────────

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers });
}

function extractJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

async function gemmaCall(ai, prompt, maxOutputTokens) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await ai.run(GEMMA_MODEL, {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxOutputTokens,
        temperature: 0.2,
        // Gemma 4 enables a chain-of-thought mode by default that can consume
        // the entire token budget on hidden reasoning, leaving an empty final
        // message. Disable for our short JSON prompts.
        chat_template_kwargs: { enable_thinking: false },
      });
      const text = (
        resp?.choices?.[0]?.message?.content ||
        resp?.response ||
        resp?.result ||
        ''
      );
      if (!text) {
        // Surface the real shape so we can see what Workers AI actually returned.
        const debug = JSON.stringify(resp).slice(0, 400);
        throw new Error(`empty_response (got: ${debug})`);
      }
      return text;
    } catch (e) {
      const msg = String(e && e.message || e);
      // Workers AI rate-limit / capacity errors → backoff + retry, then surface as 429.
      if (/429|rate.?limit|capacity|busy|too many/i.test(msg)) {
        if (attempt === 2) {
          const err = new Error('Gemma rate limited. ' + msg.slice(0, 200));
          err.code = 'gemma_rate_limited';
          throw err;
        }
        await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
        continue;
      }
      throw new Error(`Gemma: ${msg.slice(0, 200)}`);
    }
  }
  throw new Error('gemma_exhausted');
}

async function duckduckgoSearch(queries) {
  const all = [];
  await Promise.all(queries.map(async (q) => {
    try {
      const resp = await fetch('https://html.duckduckgo.com/html/', {
        method: 'POST',
        headers: {
          'user-agent': BROWSER_UA,
          'accept': 'text/html,application/xhtml+xml',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: `q=${encodeURIComponent(q)}&kl=us-en`,
      });
      if (!resp.ok) return;
      const html = await resp.text();
      const parsed = parseDdgHtml(html);
      all.push(...parsed);
    } catch { /* swallow per-query errors; other query may still produce hits */ }
  }));
  // Dedupe by URL.
  const seen = new Set();
  return all.filter(r => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}

function parseDdgHtml(html) {
  const results = [];
  // Each result block on html.duckduckgo.com/html/ is wrapped in `<div class="result ...">`.
  // Inside: `<a class="result__a" href="<ddg-redirect>">title</a>` and
  // `<a class="result__snippet" ...>snippet</a>` (snippet may also be a div).
  const blocks = html.split(/<div\s+class="result\b/);
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    const titleMatch = b.match(/class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!titleMatch) continue;
    const realUrl = extractDdgRedirect(titleMatch[1]);
    if (!realUrl) continue;
    const title = stripTags(titleMatch[2]).trim();
    if (!title) continue;
    const snipMatch = b.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/(a|div)>/);
    const snippet = snipMatch ? stripTags(snipMatch[1]).trim() : '';
    results.push({ url: realUrl, title, snippet });
  }
  return results;
}

function extractDdgRedirect(href) {
  if (!href) return null;
  if (/^https?:\/\//i.test(href)) return href;
  // DDG redirect: //duckduckgo.com/l/?uddg=<encoded-real-url>&rut=...
  const m = href.match(/[?&]uddg=([^&]+)/);
  if (m) {
    try { return decodeURIComponent(m[1]); } catch { return null; }
  }
  return null;
}

function stripTags(s) {
  return String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ');
}

function urlHostMatches(url, domain) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const d = domain.toLowerCase();
    return host === d || host.endsWith('.' + d);
  } catch { return false; }
}

async function fetchAndStrip(url, maxChars) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const resp = await fetch(url, {
      headers: {
        'user-agent': BROWSER_UA,
        'accept': 'text/html,application/xhtml+xml',
        'accept-language': 'en-US,en;q=0.9',
      },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    if (!resp.ok) return '';
    const ct = resp.headers.get('content-type') || '';
    if (!/text\/html|application\/xhtml/i.test(ct)) return '';

    const chunks = [];
    let totalLen = 0;
    const limit = maxChars * 3;
    const rewriter = new HTMLRewriter()
      .on('script, style, noscript, nav, header, footer, aside, svg, iframe, form, button', {
        element(el) { el.remove(); },
      })
      .on('body', {
        text(t) {
          if (totalLen >= limit) return;
          const s = t.text.replace(/\s+/g, ' ');
          if (s.trim().length > 0) {
            chunks.push(s);
            totalLen += s.length;
          }
        },
      });
    await rewriter.transform(resp).text();
    return chunks.join(' ').replace(/\s+/g, ' ').trim().slice(0, maxChars);
  } catch {
    return '';
  } finally {
    clearTimeout(t);
  }
}
