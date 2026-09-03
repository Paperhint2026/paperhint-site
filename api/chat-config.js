/* GET /api/chat-config — the chat panel's authored content.
 *
 * The role stories and the follow-up suggestions, from the database so the
 * copy can change without a deploy. api/chat-content.js is the fallback and
 * seeds the tables on first read, so a fresh database has something to edit
 * rather than nothing to serve.
 *
 * Public and cacheable: it is the same copy every visitor sees, and it holds
 * nothing that isn't already on the page.
 */

import { STORIES, FOLLOWUPS, FOLLOW_DEFAULT } from './chat-content.js';

const TTL = 300;                   /* CDN seconds; an edit lands within five minutes */
const SB_URL = () => process.env.SUPABASE_URL;
const SB_KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY;
const live = () => Boolean(SB_URL() && SB_KEY());

function headers() {
  const k = SB_KEY();
  return { apikey: k, Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' };
}

async function sb(path, init) {
  const r = await fetch(SB_URL().replace(/\/$/, '') + '/rest/v1/' + path, { headers: headers(), ...init });
  if (!r.ok) throw new Error('supabase ' + r.status + ' ' + (await r.text()).slice(0, 160));
  return init && init.method === 'POST' ? true : r.json();
}

/* The file's content becomes row one of each table. Conflicts are ignored:
   two cold starts racing is harmless, and a story someone has since edited
   must not be overwritten by the file. */
async function seed() {
  const stories = Object.entries(STORIES).map(([key, s], i) => ({
    key, chip: s.chip, ask: s.ask, intro: s.intro, lead: s.lead || null,
    bullets: s.bullets || [], close: s.close || null,
    weight: (Object.keys(STORIES).length - i) * 10,
  }));
  const followups = FOLLOWUPS.map(([re, list], i) => ({
    pattern: String(re).replace(/^\/|\/[a-z]*$/g, ''),
    suggestions: list, weight: (FOLLOWUPS.length - i) * 10,
  }));
  followups.push({ pattern: null, suggestions: FOLLOW_DEFAULT, weight: -10 });

  await sb('chat_stories?on_conflict=key',
    { method: 'POST', headers: { ...headers(), Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify(stories) }).catch(() => {});
  await sb('chat_followups',
    { method: 'POST', headers: { ...headers(), Prefer: 'return=minimal' },
      body: JSON.stringify(followups) }).catch(() => {});
}

/* The file's shape, whatever the source, so the widget never branches. */
function fromFile() {
  return {
    source: 'file',
    stories: Object.entries(STORIES).map(([key, s]) => ({ key, ...s })),
    followups: FOLLOWUPS.map(([re, list]) => ({ pattern: String(re).replace(/^\/|\/[a-z]*$/g, ''), suggestions: list })),
    fallback: FOLLOW_DEFAULT,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!live()) return json(res, 200, fromFile(), 60);

  try {
    let [stories, followups] = await Promise.all([
      sb('chat_stories?active=is.true&select=key,chip,ask,intro,lead,bullets,close&order=weight.desc'),
      sb('chat_followups?active=is.true&select=pattern,suggestions&order=weight.desc'),
    ]);

    if (!stories.length) { await seed(); return json(res, 200, fromFile(), 30); }

    const fallback = followups.find(f => !f.pattern);
    return json(res, 200, {
      source: 'database',
      stories,
      followups: followups.filter(f => f.pattern),
      fallback: fallback ? fallback.suggestions : FOLLOW_DEFAULT,
    }, TTL);
  } catch (e) {
    console.error('chat-config fell back to the file', e && e.message);
    return json(res, 200, fromFile(), 30);
  }
}

function json(res, code, obj, ttl) {
  res.status(code)
     .setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, s-maxage=' + ttl + ', stale-while-revalidate=600');
  return res.end(JSON.stringify(obj));
}
