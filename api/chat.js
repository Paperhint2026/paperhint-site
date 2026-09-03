/* Paperhint — Ask Paperhint chat endpoint (Vercel serverless, Node).
 *
 * POST { question, history?: [{role, content}] } -> { reply }
 *
 * Env (Vercel → Settings → Environment Variables, Production ticked):
 *   OPENAI_API_KEY  and/or  GEMINI_API_KEY   at least one
 *
 * Which models get used, and the order they're tried in, is in
 * chat-models.js — not here and not in the environment.
 */

import { systemFor } from './_ai.js';
import { candidates, KEYS, shouldFallOver } from './chat-models.js';
import { recordNow, whereFrom } from './_log.js';

/* Provider-agnostic on purpose: the model chain lives in chat-models.js,
 * the keys live in the environment. No SDK — both APIs are one fetch. */
const MAX_QUESTION = 400;
const MAX_TURNS = 8;

async function callOne(cand, system, messages) {
  const key = KEYS[cand.provider]();

  if (cand.provider === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: cand.model,
        max_completion_tokens: 700,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    });
    if (!r.ok) throw providerError(r.status, await r.text());
    const j = await r.json();
    return (j.choices?.[0]?.message?.content || '').trim();
  }

  /* Gemini: system goes in systemInstruction, the assistant role is 'model' */
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
              encodeURIComponent(cand.model) + ':generateContent';
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 700 },
    }),
  });
  if (!r.ok) throw providerError(r.status, await r.text());
  const j = await r.json();
  return (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
}

/* Walk the chain until one answers. */
async function ask(system, messages) {
  const list = candidates();
  if (!list.length) { const e = new Error('no key'); e.noKey = true; throw e; }

  const tried = [];
  let last = null;
  for (const cand of list) {
    try {
      const reply = scrub(await callOne(cand, system, messages));
      if (reply) return { reply, used: cand, tried };
      tried.push(cand.provider + '/' + cand.model + ' → empty');
    } catch (e) {
      tried.push(cand.provider + '/' + cand.model + ' → ' + (e.status || 'err'));
      last = e;
      if (!shouldFallOver(e.status || 0)) throw e;   /* not survivable — stop */
    }
  }
  const e = last || new Error('every model failed');
  e.tried = tried;
  throw e;
}

/* The small model keeps reaching for support-desk filler however firmly the
 * prompt forbids it. The prompt is the real fix; this is the safety net —
 * a narrow set of exact phrases swapped for the house equivalent. */
/* What the model still gets wrong despite the prompt, fixed where a model
   cannot forget it.

   Filler: a sentence carrying a support-desk phrase is dropped whole —
   substituting mid-sentence used to leave "say the word what you need". They
   are always the closing offer, never the answer. The same treatment for the
   marketing words the founder banned outright (streamline, leverage,
   seamless, empower): a sentence built on one of those is a sentence that
   said nothing. A reply is never left empty.

   Exclamation marks: replaced with a full stop, in any language. The prompt
   forbids them and gpt-4o-mini reaches for them anyway when told to be warm. */
const TICS = /\b(feel free to ask|please feel free to|just let me know|let me know if|i'?m here for that|i'?m here to help|i'?m here as your assistant|i'?d be happy to|i can definitely assist|i'?m focused on|i focus on|happy to help|how can i assist|streamlin\w*|leverag\w*|seamless\w*|empower\w*)\b/i;
const OPENERS = /^(great question|certainly|absolutely|sure|that'?s great)[.,!]?\s*/i;

function scrub(text) {
  const calm = String(text || '').replace(/\?!+/g, '?').replace(/!+/g, '.');
  const parts = calm.split(/(?<=[.?])\s+/);
  const kept = parts.filter(s => !TICS.test(s));
  const out = (kept.length ? kept : parts).join(' ').replace(OPENERS, '').replace(/\.\s*\./g, '.').trim();
  return out.charAt(0).toUpperCase() + out.slice(1);
}

function providerError(status, body) {
  const e = new Error('provider ' + status + ' ' + String(body).slice(0, 300));
  e.status = status;
  return e;
}

/* ---------------- rate limiting (per warm instance) ---------------- */
/* Schools sit behind one public IP — a whole staff room shares it — so this
   is set to stop a bill being run up, not to ration a curious teacher. */
const hits = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = Number(process.env.CHAT_RATE_LIMIT || 80);

function overLimit(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some(t => now - t < WINDOW_MS)) hits.delete(k);
  return list.length > MAX_PER_WINDOW;
}

/* ---------------- handler ---------------- */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });

  if (!candidates().length) return json(res, 503, { error: 'The assistant isn’t switched on yet.' });

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { return json(res, 400, { error: 'Bad JSON' }); }

  const question = String(body.question || '').trim().slice(0, MAX_QUESTION);
  const context = String(body.context || '').trim().slice(0, 400);
  if (!question) return json(res, 400, { error: 'Ask me something.' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (overLimit(ip)) return json(res, 429, { error: 'That’s a lot of questions — give it a minute, or write to support@paperhint.com.' });

  /* only well-formed turns, newest few, alternating from the client */
  const history = Array.isArray(body.history)
    ? body.history
        .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-MAX_TURNS)
        .map(m => ({ role: m.role, content: m.content.slice(0, 1200) }))
    : [];

  try {
    /* Instructions come from the database so the voice can be changed without
       a deploy, with the repo's file as the fallback. What the visit knows
       about them is appended to the instructions rather than the conversation,
       so it reads as context and not as a turn. */
    const { system: base, version: promptVersion, facts } = await systemFor(question);
    const system = context ? base + '\n\n# About this visitor\n' + context : base;
    const { reply, used, tried } = await ask(system, [...history, { role: 'user', content: question }]);

    /* what schools ask is the cheapest product research there is; the model
       that answered (and anything skipped) is here for debugging */
    console.log(JSON.stringify({
      at: new Date().toISOString(), model: used.provider + '/' + used.model,
      fellBackPast: tried.length ? tried : undefined,
      prompt: 'v' + promptVersion, facts,
      q: question, chars: reply.length,
    }));

    /* every question is product research, so this is awaited: a response
       returned first would freeze the instance and lose the write */
    await recordNow({
      kind: 'question', sid: String(body.sid || '').slice(0, 40) || null,
      text: question, reply, page: String(body.page || '').slice(0, 200),
      model: used.provider + '/' + used.model,
      promptVersion, facts, ...whereFrom(req),
    });

    return json(res, 200, { reply });
  } catch (e) {
    if (e.noKey) return json(res, 503, { error: 'The assistant isn’t switched on yet.' });
    console.error('chat failed', e.tried || '', e && e.message);
    if (e.status === 429) return json(res, 429, { error: 'Busy just now — try again in a moment.' });
    return json(res, 502, { error: 'That didn’t go through. Try again, or write to support@paperhint.com.' });
  }
}

function json(res, code, obj) {
  res.status(code).setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(obj));
}
export const config = { maxDuration: 30 };
