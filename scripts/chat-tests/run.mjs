/* Posts every case at the live endpoint, scores the replies, prints them all.
   node scripts/chat-tests/run.mjs [label]   -> scripts/chat-tests/results-<label>.json */
import { writeFileSync } from 'node:fs';
import { CASES } from './cases.mjs';
import { score } from './score.mjs';

const ENDPOINT = process.env.CHAT_ENDPOINT || 'https://www.paperhint.com/api/chat';
const label = process.argv[2] || 'run';
/* --only z5,a2,m1 runs a subset, in suite order so threads still chain */
const onlyArg = process.argv.find(a => a.startsWith('--only='));
const only = onlyArg ? new Set(onlyArg.slice(7).split(',')) : null;
const SUITE = only ? CASES.filter(c => only.has(c.id)) : CASES;
const sleep = ms => new Promise(g => setTimeout(g, ms));
const threads = {};


const results = [];
for (const c of SUITE) {
  const history = c.thread ? (threads[c.thread] || []) : [];
  const body = { question: c.q, history: history.slice(-8), context: c.context || '', sid: 'test-' + label + '-' + (c.thread || c.id), page: '/' };
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 30000);
  let reply = '', status = 0, error = null, chips = [], link = null;
  try {
    const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal });
    status = res.status;
    const j = await res.json().catch(() => ({}));
    reply = j.reply || ''; error = j.error || null; chips = j.chips || []; link = j.link || null;
  } catch (e) { error = String(e && e.message); }
  clearTimeout(timer);
  if (c.thread && reply) threads[c.thread] = history.concat({ role: 'user', content: c.q }, { role: 'assistant', content: reply });
  const s = reply ? score(c, reply, { chips, link, asked: history.filter(h => h.role === 'user').map(h => h.content).concat(c.q) })
                  : { fails: ['no reply: ' + (error || status)], warns: [], sentences: 0, words: 0 };
  results.push({ ...c, recall: c.recall ? String(c.recall) : undefined, status, reply, chips, link, error, ...s });
  const tag = s.fails.length ? 'FAIL' : (s.warns.length ? 'warn' : ' ok ');
  console.log(`\n[${c.id} ${c.kind}] ${tag}  ${c.q}`);
  console.log('   → ' + reply.replace(/\s+/g, ' ').slice(0, 420) + (reply.length > 420 ? '…' : ''));
  if (s.fails.length) console.log('   ✗ ' + s.fails.join(' | '));
  if (chips.length) console.log('   chips: ' + chips.map(c => '[' + c + ']').join(' '));
  if (link) console.log('   link:  ' + link.href + ' [' + link.label + ']');
  if (s.warns.length) console.log('   ~ ' + s.warns.join(' | '));
  await sleep(500);
}
const fails = results.filter(r => r.fails.length).length, warns = results.filter(r => !r.fails.length && r.warns.length).length;
const clean = results.length - fails - warns;
console.log(`\n=== ${label}: ${results.length} cases — ${clean} clean, ${warns} with warnings, ${fails} failing ===`);
writeFileSync(new URL(`./results-${label}.json`, import.meta.url), JSON.stringify(results, null, 1));
