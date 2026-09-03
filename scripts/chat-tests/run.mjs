/* Posts every case at the live endpoint, scores the replies, prints them all.
   node scripts/chat-tests/run.mjs [label]   -> scripts/chat-tests/results-<label>.json */
import { writeFileSync } from 'node:fs';
import { CASES, FORBIDDEN, BANNED_VOCAB, LEAKS } from './cases.mjs';

const ENDPOINT = process.env.CHAT_ENDPOINT || 'https://www.paperhint.com/api/chat';
const label = process.argv[2] || 'run';
const sleep = ms => new Promise(g => setTimeout(g, ms));
const threads = {};

function score(c, reply) {
  const r = reply || '';
  const low = r.toLowerCase();
  const fails = [], warns = [];
  const sentences = (r.match(/[.!?](\s|$)/g) || []).length || (r.trim() ? 1 : 0);
  const words = r.trim().split(/\s+/).filter(Boolean).length;

  if (/!/.test(r)) fails.push('exclamation');
  const fp = FORBIDDEN.filter(f => low.includes(f)); if (fp.length) fails.push('forbidden: ' + fp.join(', '));
  const bv = BANNED_VOCAB.filter(v => low.includes(v)); if (bv.length) fails.push('banned vocab: ' + bv.join(', '));
  if (LEAKS.test(r)) fails.push('leak: ' + r.match(LEAKS)[0]);
  if (/^\s*(no|nope|yes|sorry|unfortunately|i can'?t|i cannot|i'?m sorry)\b/i.test(r)) warns.push('abrupt opener');
  if (/\*\*|^#{1,3}\s|^\s*[-*]\s|^\s*\d+\.\s/m.test(r)) warns.push('markdown');
  const invite = /(ask me|try me|give me|throw me|tap|callback|show you|want to|shall i|would you like|tell me|send me)/i.test(r);

  switch (c.kind) {
    case 'Z': if (sentences > 3) warns.push('long for a hello (' + sentences + ')'); if (!invite) warns.push('no offer'); break;
    case 'A': if (sentences < 2 || sentences > 5) warns.push('length ' + sentences + ' sentences'); break;
    case 'P': if (/₹|\$|\brs\.?\b|\b\d{2,}\b/i.test(r)) fails.push('quoted a number'); if (!/callback|call back|representative/i.test(r)) warns.push('no handover'); break;
    case 'B': if (!/chat box/i.test(r)) warns.push('missing closer'); break;
    case 'C': if (!/outside my desk|not my desk|isn.t my call|outside what i|i.d only be guessing/i.test(r)) warns.push('deflection not in voice'); if (!invite) warns.push('no offer after declining'); break;
    case 'G': if (/\d+\s?%/.test(r)) fails.push('accuracy figure'); break;
    case 'T': if (words <= 8) warns.push('curt (' + words + ' words)'); if (!invite) warns.push('no door opened'); break;
    case 'L': if (c.lang === 'hi' && !/[ऀ-ॿ]/.test(r) && !/\b(hai|kaise|aap|hum|kar)\b/i.test(r)) warns.push('not in Hindi');
              if (c.lang === 'ta' && !/[஀-௿]/.test(r)) warns.push('not in Tamil'); break;
    case 'M': if (c.recall && !c.recall.test(r)) warns.push('did not recall'); break;
  }
  if (c.expectName && !r.includes(c.expectName)) warns.push('did not use the name');
  return { fails, warns, sentences, words };
}

const results = [];
for (const c of CASES) {
  const history = c.thread ? (threads[c.thread] || []) : [];
  const body = { question: c.q, history: history.slice(-8), context: c.context || '', sid: 'test-' + label + '-' + (c.thread || c.id), page: '/' };
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 30000);
  let reply = '', status = 0, error = null;
  try {
    const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal });
    status = res.status;
    const j = await res.json().catch(() => ({}));
    reply = j.reply || ''; error = j.error || null;
  } catch (e) { error = String(e && e.message); }
  clearTimeout(timer);
  if (c.thread && reply) threads[c.thread] = history.concat({ role: 'user', content: c.q }, { role: 'assistant', content: reply });
  const s = reply ? score(c, reply) : { fails: ['no reply: ' + (error || status)], warns: [], sentences: 0, words: 0 };
  results.push({ ...c, recall: c.recall ? String(c.recall) : undefined, status, reply, error, ...s });
  const tag = s.fails.length ? 'FAIL' : (s.warns.length ? 'warn' : ' ok ');
  console.log(`\n[${c.id} ${c.kind}] ${tag}  ${c.q}`);
  console.log('   → ' + reply.replace(/\s+/g, ' ').slice(0, 420) + (reply.length > 420 ? '…' : ''));
  if (s.fails.length) console.log('   ✗ ' + s.fails.join(' | '));
  if (s.warns.length) console.log('   ~ ' + s.warns.join(' | '));
  await sleep(500);
}
const fails = results.filter(r => r.fails.length).length, warns = results.filter(r => !r.fails.length && r.warns.length).length;
const clean = results.length - fails - warns;
console.log(`\n=== ${label}: ${results.length} cases — ${clean} clean, ${warns} with warnings, ${fails} failing ===`);
writeFileSync(new URL(`./results-${label}.json`, import.meta.url), JSON.stringify(results, null, 1));
