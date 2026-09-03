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
import { isKnownPath } from './site-map.js';
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
      const raw = await callOne(cand, system, messages);
      /* chips last, then the link — either order in the output is fine */
      const afterChips = splitChips(raw);
      const afterLink = splitLink(afterChips.body);
      const chipsAgain = splitChips(afterLink.body);
      const chips = afterChips.chips.length ? afterChips.chips : chipsAgain.chips;
      const reply = scrub(chipsAgain.body);
      if (reply) return { reply, chips, link: afterLink.link, used: cand, tried };
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
   cannot forget it. Three different treatments, because the mistakes differ.

   Support-desk filler ("just let me know", "I'm here to help") is a whole
   clause that says nothing, always the closing offer, never the answer — so
   the sentence carrying it is dropped. A reply is never left empty.

   The banned marketing words (streamline, leverage, seamless, empower) sit
   inside sentences that DO carry the answer. Dropping those sentences
   decapitated a reply in testing — "For your class 6 science, Paperhint
   streamlines…" vanished and the reply began "Plus, the register…". So the
   word is swapped for a plain one and the sentence keeps its meaning.

   Exclamation marks become full stops, in any language.

   And a bare refusal of eight words or fewer — "I can't share that." —
   gets one offer added, because a decline with nothing after it is the
   abruptness the founder heard. Short answers that are not refusals are
   left alone. */
const FILLER = /\b(feel free to ask|please feel free to|just let me know|let me know if|i'?m here for that|i'?m here to help|i'?m here as your assistant|i'?d be happy to|i can definitely assist|i'?m focused on|i focus on|happy to help|how can i assist)\b/i;
const OPENERS = /^(great question|certainly|absolutely|sure|that'?s great)[.,!]?\s*/i;
const WORDS = [
  [/\bstreamlining\b/gi, 'handling'], [/\bstreamlines\b/gi, 'handles'], [/\bstreamlined\b/gi, 'handled'], [/\bstreamline\b/gi, 'handle'],
  [/\bleveraging\b/gi, 'using'], [/\bleverages\b/gi, 'uses'], [/\bleverage\b/gi, 'use'],
  [/\bseamlessly\b/gi, 'without fuss'], [/\bseamless\b/gi, 'straightforward'],
  [/\bempowering\b/gi, 'helping'], [/\bempowers\b/gi, 'helps'], [/\bempower\b/gi, 'help'],
  [/\beffortlessly\b/gi, 'without fuss'], [/\beffortless\b/gi, 'easy'],
];
const OFFERS = [
  'Give me a class instead and I’ll show you the part that matters.',
  'Ask me about a chapter or the marking and I’ll show you what I’m for.',
  'Throw me something from your classroom and I’ll do that one properly.',
];

/* The model ends every reply with "CHIPS: a | b | c" — the questions the
   person would plausibly ask next, written from what it just said. The line
   is lifted off here and returned separately; it is never shown as text. */
function splitChips(text) {
  const t = String(text || '');
  /* On its own line, any case — the shape actually asked for. Or mid-line,
     but only when it is capitalised AND separated by pipes, so a sentence
     like "we ship chips: crisps" is left alone. */
  let m = t.match(/(?:^|\n)[ \t]*CHIPS[ \t]*:[ \t]*(.+?)[ \t]*$/i);
  if (!m) m = t.match(/\bCHIPS[ \t]*:[ \t]*([^\n]*\|[^\n]*)$/);
  if (!m) return { body: t, chips: [] };
  const chips = m[1].split('|')
    .map(c => c.replace(/^["'\s*_-]+|["'\s*_]+$/g, '').trim())
    .filter(c => c.length > 2 && c.length <= 56)
    .slice(0, 3);
  return { body: t.slice(0, m.index).trim(), chips };
}

/* "LINK: /product#copilot | The copilot" — one per reply, lifted off and
   checked against the site map. A path the map does not know is dropped
   silently: a 404 offered by the assistant is worse than no link. */
function splitLink(text) {
  const t = String(text || '');
  const m = t.match(/(?:^|\n)[ \t]*LINK[ \t]*:[ \t]*([^\n|]+?)(?:[ \t]*\|[ \t]*([^\n]+?))?[ \t]*$/i);
  if (!m) return { body: t, link: null };
  const href = m[1].trim();
  const body = t.slice(0, m.index).trim();
  if (!isKnownPath(href)) {
    console.warn('chat offered an unknown path', href);
    return { body, link: null };
  }
  const label = (m[2] || '').trim().replace(/^["'\s]+|["'\s]+$/g, '');
  return { body, link: { href, label: label.slice(0, 40) || 'Open the page' } };
}

function scrub(text) {
  let t = String(text || '').replace(/\?!+/g, '?').replace(/!+/g, '.');
  for (const [re, to] of WORDS) t = t.replace(re, to);
  const parts = t.split(/(?<=[.?])\s+/);
  const kept = parts.filter(p => !FILLER.test(p));
  let out = (kept.length ? kept : parts).join(' ')
    .replace(OPENERS, '')
    .replace(/^(plus|also|and|but|so),?\s+/i, '')      /* an orphan left by a drop */
    .replace(/\.\s*\./g, '.').trim();
  out = out.charAt(0).toUpperCase() + out.slice(1);
  /* only a bare refusal gets the offer — "You're welcome." is short and fine */
  const words = out.split(/\s+/).filter(Boolean).length;
  const refusal = /\b(can'?t|cannot|won'?t|not (mine|something|able)|outside my|under the bonnet|not my (call|desk))\b/i.test(out);
  if (refusal && words <= 8) out += ' ' + OFFERS[out.length % OFFERS.length];
  return out;
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
    const { reply, chips, link, used, tried } = await ask(system, [...history, { role: 'user', content: question }]);

    /* what schools ask is the cheapest product research there is; the model
       that answered (and anything skipped) is here for debugging */
    console.log(JSON.stringify({
      at: new Date().toISOString(), model: used.provider + '/' + used.model,
      fellBackPast: tried.length ? tried : undefined,
      prompt: 'v' + promptVersion, facts, chips: chips.length,
      chipsMissing: chips.length ? undefined : true, link: link ? link.href : undefined,
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

    return json(res, 200, { reply, chips, link });
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
