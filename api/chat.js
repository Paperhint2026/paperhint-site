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

import { SYSTEM } from './chat-prompt.js';
import { candidates, KEYS, shouldFallOver } from './chat-models.js';
import { record } from './_log.js';

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
      const reply = await callOne(cand, system, messages);
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

function providerError(status, body) {
  const e = new Error('provider ' + status + ' ' + String(body).slice(0, 300));
  e.status = status;
  return e;
}

/* ---------------- rate limiting (per warm instance) ---------------- */
const hits = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 25;

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
    /* what the visit already knows about them, appended to the instructions
       rather than the conversation, so it reads as context and not as a turn */
    const system = context ? SYSTEM + '\n\n# About this visitor\n' + context : SYSTEM;
    const { reply, used, tried } = await ask(system, [...history, { role: 'user', content: question }]);

    /* what schools ask is the cheapest product research there is; the model
       that answered (and anything skipped) is here for debugging */
    console.log(JSON.stringify({
      at: new Date().toISOString(), model: used.provider + '/' + used.model,
      fellBackPast: tried.length ? tried : undefined,
      q: question, chars: reply.length,
    }));

    /* every question is product research; the log is best-effort */
    record({ kind: 'question', text: question, reply, page: body.page || '', model: used.provider + '/' + used.model })
      .catch(() => {});

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
