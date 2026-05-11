// Internal AI passthrough for the PHP grants-search backend.
// PHP backend hits this with a shared bearer token to run a single Gemma 4
// inference via Workers AI with thinking disabled. Not for browser use —
// browser flow stays on /v1/public/grants-search (Turnstile + rate-limit + cache).

const MODEL = '@cf/google/gemma-4-26b-a4b-it';

export async function onRequestPost(ctx) {
  const { env, request } = ctx;

  const auth = request.headers.get('authorization') || '';
  const expected = 'Bearer ' + (env.INTERNAL_AI_TOKEN || '');
  if (!env.INTERNAL_AI_TOKEN || auth !== expected) {
    return json({ error: 'unauthorized' }, 401);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const prompt = typeof body.prompt === 'string' ? body.prompt : '';
  const maxTokens = Math.max(64, Math.min(8192, parseInt(body.maxTokens, 10) || 2048));
  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.2;
  if (!prompt) return json({ error: 'missing_prompt' }, 400);

  try {
    const resp = await env.AI.run(MODEL, {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
      // Disable Gemma 4 chain-of-thought so the entire budget goes to the
      // answer. Without this, Gemma 4 silently spends 300-450 tokens on
      // hidden reasoning before emitting any visible text.
      chat_template_kwargs: { enable_thinking: false },
    });
    const text =
      (resp && resp.choices && resp.choices[0] && resp.choices[0].message && resp.choices[0].message.content) ||
      (resp && resp.response) ||
      (resp && resp.result) ||
      '';
    if (!text) {
      return json({ error: 'empty_response', shape: JSON.stringify(resp).slice(0, 300) }, 502);
    }
    return json({ text }, 200);
  } catch (e) {
    return json({ error: 'ai_failed', message: String((e && e.message) || e).slice(0, 300) }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
