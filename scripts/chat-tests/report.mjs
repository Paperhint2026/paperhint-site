/* Writes docs/chat-test-results.md from every results-*.json, rescoring each
   with the current scorer so the passes are judged by one set of rules.
   The analysis section is read from scripts/chat-tests/analysis.md if present. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { CASES } from './cases.mjs';
import { score } from './score.mjs';

const dir = new URL('./', import.meta.url);
const order = ['before', 'after', 'after-v3'];
const passes = readdirSync(dir).filter(f => /^results-.*\.json$/.test(f))
  .map(f => f.replace(/^results-|\.json$/g, ''))
  .sort((a, b) => (order.indexOf(a) + 99) % 100 - (order.indexOf(b) + 99) % 100 || a.localeCompare(b));
const data = {};
for (const p of passes) {
  const rows = JSON.parse(readFileSync(new URL(`./results-${p}.json`, import.meta.url), 'utf8'));
  data[p] = {};
  for (const r of rows) {
    const c = CASES.find(x => x.id === r.id) || r;
    const s = r.reply ? score({ ...c, recall: c.recall }, r.reply) : { fails: ['no reply'], warns: [] };
    data[p][r.id] = { ...r, ...s };
  }
}
const out = []; const say = (...l) => out.push(...l);
const tally = p => { const rs = Object.values(data[p]); const f = rs.filter(r => r.fails.length).length; const w = rs.filter(r => !r.fails.length && r.warns.length).length; return { n: rs.length, clean: rs.length - f - w, warn: w, fail: f }; };
const PROMPT = { before: 'v1', after: 'v2', 'after-v3': 'v3 (targeted rerun of the cases v2 regressed on)' };

say('# Ask Paperhint — test results', '');
say('Every pass is rescored with the current scorer, so the numbers are comparable even where the scoring rules were corrected between runs (numbered lists are allowed; the offer detector was widened).', '');
say('| pass | prompt | cases | clean | warnings | failing |', '|---|---|---|---|---|---|');
for (const p of passes) { const t = tally(p); say(`| ${p} | ${PROMPT[p] || '?'} | ${t.n} | ${t.clean} | ${t.warn} | ${t.fail} |`); }
say('');
say('## Failures by pass', '');
for (const p of passes) {
  const fs = Object.values(data[p]).filter(r => r.fails.length);
  say(`**${p}** — ${fs.length ? fs.map(r => `${r.id} (${r.fails.join('; ')})`).join(', ') : 'none'}`, '');
}
if (existsSync(new URL('./analysis.md', import.meta.url))) {
  say('## Analysis', '', readFileSync(new URL('./analysis.md', import.meta.url), 'utf8').trim(), '');
}
say('## Every case, every pass', '');
const cut = t => String(t || '').replace(/\s+/g, ' ').slice(0, 420) + (String(t || '').length > 420 ? '…' : '');
for (const c of CASES) {
  say(`### ${c.id} · ${c.kind} — “${c.q}”`, '');
  for (const p of passes) {
    const r = data[p][c.id]; if (!r) continue;
    const tag = r.fails.length ? '✗' : (r.warns.length ? '~' : '✓');
    say(`**${p}** ${tag}  ${cut(r.reply)}`);
    if (r.fails.length) say(`  ↳ fails: ${r.fails.join(' | ')}`);
    if (r.warns.length) say(`  ↳ warns: ${r.warns.join(' | ')}`);
    say('');
  }
}
writeFileSync(new URL('../../docs/chat-test-results.md', import.meta.url), out.join('\n'));
console.log('docs/chat-test-results.md — passes: ' + passes.join(', '));
for (const p of passes) console.log('  ' + p.padEnd(9), JSON.stringify(tally(p)));
