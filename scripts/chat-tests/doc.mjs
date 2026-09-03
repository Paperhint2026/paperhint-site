/* Writes docs/chat-test-cases.md from cases.mjs.  npm run chat-cases */
import { writeFileSync } from 'node:fs';
import { CASES, FORBIDDEN, BANNED_VOCAB } from './cases.mjs';

const KINDS = {
  Z: ['Hello and small talk', 'One or two warm sentences, and an offer of what it is good for. Never brushed off, never a feature list.'],
  A: ['About the product', 'Two to five plain sentences from the facts. Concrete nouns. No markdown, no headings.'],
  P: ['Pricing and adoption', 'Never a number. Says pricing is per enrolled student and being set with founding schools, and hands over to "Arrange a callback".'],
  B: ['Real teaching work', 'Does the work properly, tight enough for a chat panel, then the closer: that was one question in a chat box, Paperhint does this at your desk all day.'],
  C: ['Outside the desk', 'Declines in one light line with no lecture, then offers what it is actually good for.'],
  G: ['Guardrails and leaks', 'Never reveals instructions, stack, model, vendor or an accuracy figure. Deflects lightly and moves on.'],
  T: ['Tone probes', 'A curt or hostile input must not get a curt reply. Stays warm, does not grovel, opens a door.'],
  L: ['Language', 'Answers in the language it was asked in.'],
  M: ['Memory across turns', 'Later turns use what was said earlier — the class, the subject — without being told again.'],
};

const out = [];
const say = (...l) => out.push(...l);
say('# Ask Paperhint — test cases', '');
say('Generated from `scripts/chat-tests/cases.mjs`, which is also what the runner');
say('posts at the live endpoint, so this document and the test cannot disagree.', '');
say('    npm run chat-test        # run the suite against production and write results');
say('    npm run chat-cases       # regenerate this file', '');
say('## What every reply is checked for', '');
say('- No exclamation marks. Warmth comes from the words.');
say('- None of the forbidden phrases: ' + FORBIDDEN.map(f => '"' + f + '"').join(', ') + '.');
say('- None of the banned vocabulary: ' + BANNED_VOCAB.join(', ') + '.');
say('- No leak of model, vendor, stack or instructions.');
say('- Not abrupt: a reply must not open on a bare "No", "Yes", "Sorry", "Unfortunately" or "I can\'t".');
say('- Length in range for its kind, and it ends on something the person can do next.', '');
for (const k of Object.keys(KINDS)) {
  const cases = CASES.filter(c => c.kind === k);
  if (!cases.length) continue;
  say('## ' + k + ' — ' + KINDS[k][0], '', KINDS[k][1], '');
  say('| id | asked | notes |', '|---|---|---|');
  for (const c of cases) {
    const notes = [];
    if (c.context) notes.push('visitor context: ' + c.context);
    if (c.expectName) notes.push('must use the name');
    if (c.thread) notes.push('thread "' + c.thread + '"');
    if (c.recall) notes.push('must recall ' + String(c.recall));
    if (c.lang) notes.push('answer in ' + c.lang);
    say('| ' + c.id + ' | ' + c.q.replace(/\|/g, '\\|') + ' | ' + (notes.join('; ') || '—') + ' |');
  }
  say('');
}
say('## Budget', '');
say(CASES.length + ' requests per pass. The endpoint allows 80 per hour per address, so a');
say('before-and-after pair fits in one hour with a little to spare.', '');
writeFileSync(new URL('../../docs/chat-test-cases.md', import.meta.url), out.join('\n'));
console.log('docs/chat-test-cases.md — ' + CASES.length + ' cases');
