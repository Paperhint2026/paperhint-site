/* Paperhint — Ask Paperhint chat endpoint (Vercel serverless, Node).
 *
 * POST { question, history?: [{role, content}] } -> { reply }
 *
 * Env (Vercel → Settings → Environment Variables, Production ticked):
 *   OPENAI_API_KEY  or  GEMINI_API_KEY   one of them, required
 *   CHAT_MODEL      optional — the model on your account (gpt-4o-mini / gemini-2.0-flash by default)
 *   CHAT_PROVIDER   optional — force 'openai' or 'gemini' when both keys are set
 */

import { SYSTEM } from './chat-prompt.js';

/* Provider-agnostic on purpose: set whichever key you have and it picks
 * the right API. No SDK dependency — both are one fetch call. */
const MAX_QUESTION = 400;
const MAX_TURNS = 8;

function provider() {
  const forced = (process.env.CHAT_PROVIDER || '').toLowerCase();
  if (forced === 'openai' || forced === 'gemini') return forced;
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  return null;
}

/* Defaults are a starting point — set CHAT_MODEL to whatever your account
 * actually has; model names move faster than this file will. */
const DEFAULT_MODEL = { openai: 'gpt-4o-mini', gemini: 'gemini-2.0-flash' };

async function ask(kind, system, messages) {
  const model = process.env.CHAT_MODEL || DEFAULT_MODEL[kind];

  if (kind === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        max_completion_tokens: 700,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    });
    if (!r.ok) throw providerError(r.status, await r.text());
    const j = await r.json();
    return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || '').trim();
  }

  /* Gemini: system goes in systemInstruction, and the assistant role is 'model' */
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
              encodeURIComponent(model) + ':generateContent';
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' },
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
  const parts = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
  return (parts || []).map(p => p.text || '').join('').trim();
}

function providerError(status, body) {
  const e = new Error('provider ' + status + ' ' + String(body).slice(0, 300));
  e.status = status;
  return e;
}

/* ---------------- what the assistant knows and how it behaves ---------------- */

/* the instructions live next door in chat-prompt.js */

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

  if (!provider()) return json(res, 503, { error: 'The assistant isn’t switched on yet.' });

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { return json(res, 400, { error: 'Bad JSON' }); }

  const question = String(body.question || '').trim().slice(0, MAX_QUESTION);
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

  const kind = provider();
  try {
    const reply = await ask(kind, SYSTEM, [...history, { role: 'user', content: question }]);
    if (!reply) return json(res, 502, { error: 'I didn’t catch that — try asking again.' });

    /* the questions schools actually ask are the cheapest product research there is */
    console.log(JSON.stringify({ at: new Date().toISOString(), provider: kind, q: question, chars: reply.length }));

    return json(res, 200, { reply });
  } catch (e) {
    if (e.status === 429) return json(res, 429, { error: 'Busy just now — try again in a moment.' });
    if (e.status === 401 || e.status === 403) {
      console.error('chat auth', e.message);
      return json(res, 503, { error: 'The assistant isn’t switched on yet.' });
    }
    console.error('chat failed', e && e.message);
    return json(res, 502, { error: 'That didn’t go through. Try again, or write to support@paperhint.com.' });
  }
}

function json(res, code, obj) {
  res.status(code).setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(obj));
}
