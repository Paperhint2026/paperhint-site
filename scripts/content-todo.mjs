/* Regenerates docs/content-todo.md from src/data/roles.js.
 *
 * The list is generated rather than kept by hand so it cannot drift from what
 * the pages actually render: delete a `needs` entry in the data and it leaves
 * this document too.
 *
 *   npm run content-todo
 */
import { writeFileSync } from 'node:fs';
import { ROLES, ORDER } from '../src/data/roles.js';

const out = [];
const say = (...l) => out.push(...l);

say('# Content still needed', '');
say('Generated from `src/data/roles.js` — the same data the pages render, so');
say('this list cannot drift from what is actually on them. Regenerate with:', '');
say('    npm run content-todo', '');
say('Every page below is live and linked. What is missing is copy, not');
say('plumbing. Anything marked DRAFT in `src/data/roles.js` is mine and is');
say('meant to be replaced by the application narrative.', '');

for (const key of ORDER) {
  const r = ROLES[key];
  say('## /' + key + (r.thin ? '  — reads thin in public' : ''), '');
  say('Narrative source: ' + (r.story
    ? '`api/chat-content.js` → `STORIES.' + r.story + '` (approved)'
    : '**none yet** — scene and beats are built from `docs/feature-list.md` and stand in'));
  if (r.second) say('Second movement: `STORIES.principal` (approved), framed as the case for the school');
  say('');
  for (const n of r.needs || []) say('- [ ] ' + n);
  say('');
}

say('## Not a role page', '');
say('- [ ] Real teacher testimonials, to replace the placeholder deck on the home page');
say('- [ ] Real product screenshots, to replace the mock app in the spec tabs');
say('- [ ] og-cover.png, the social image referenced at `assets/img/og-cover.png`', '');

say('## How the notes work', '');
say('A page waiting on its narrative shows a quiet **More on this soon** pill in');
say('public. The full per-page list of what is missing renders only on preview');
say('deploys and locally, so a visiting school is never told it is reading a');
say('draft. Set `thin: false` in `src/data/roles.js` when a page is finished, and');
say('delete its `needs` entries as they land.', '');

writeFileSync(new URL('../docs/content-todo.md', import.meta.url), out.join('\n'));
console.log('docs/content-todo.md — ' + out.length + ' lines from ' + ORDER.length + ' pages');
