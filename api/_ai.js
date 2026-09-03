/* The assistant's instructions and facts, read from the database.
 *
 * Why the database: the voice and the facts change far more often than the
 * code does, and a prompt edit should not need a deploy. api/chat-prompt.js
 * stays in the repo as version 1 and as the fallback — if the table is empty
 * it seeds itself from the file, and if Supabase is unreachable the file is
 * used directly. The chat can never break because a row is missing.
 *
 *   ai_prompts    one row per version of the instructions; one active per key
 *   ai_knowledge  facts the assistant may draw on, pulled in by relevance
 */

import { SYSTEM as FILE_SYSTEM } from './chat-prompt.js';
import { sitemapText } from './site-map.js';

const KEY = 'chat_system';
const TTL_MS = 60 * 1000;          /* an edit lands within a minute */
const KNOWLEDGE_BUDGET = 2200;     /* chars of facts, so the prompt stays lean */
const ALWAYS = 9;                  /* weight at or above this is always included */

const SB_URL = () => process.env.SUPABASE_URL;
const SB_KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY;
const live = () => Boolean(SB_URL() && SB_KEY());

let cache = { at: 0, prompt: null, version: null, knowledge: null };

function headers() {
  const k = SB_KEY();
  return { apikey: k, Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' };
}

async function get(path) {
  const r = await fetch(SB_URL().replace(/\/$/, '') + '/rest/v1/' + path, { headers: headers() });
  if (!r.ok) throw new Error('supabase ' + r.status + ' ' + (await r.text()).slice(0, 160));
  return r.json();
}

/* First run on a fresh database: the file becomes version 1 and goes active,
   so there is always something to edit rather than an empty table. A race
   between two cold starts is harmless — the unique index lets one win. */
async function seed() {
  try {
    await fetch(SB_URL().replace(/\/$/, '') + '/rest/v1/ai_prompts', {
      method: 'POST',
      headers: { ...headers(), Prefer: 'return=minimal' },
      body: JSON.stringify({
        key: KEY, version: 1, body: FILE_SYSTEM, active: true,
        note: 'Seeded from api/chat-prompt.js on first run.',
      }),
    });
  } catch (e) { /* the fallback covers it */ }
}

async function refresh() {
  const rows = await get('ai_prompts?key=eq.' + KEY + '&active=is.true&select=body,version&limit=1');
  let prompt = rows[0]?.body || null;
  let version = rows[0]?.version || null;

  if (!prompt) { await seed(); prompt = FILE_SYSTEM; version = 1; }

  const knowledge = await get(
    'ai_knowledge?active=is.true&select=topic,content,tags,weight&order=weight.desc&limit=300'
  ).catch(() => []);

  cache = { at: Date.now(), prompt, version, knowledge };
}

/* Facts worth sending: the hard rules always, then whatever the question
   actually touches, highest weight first, until the budget runs out. Keyword
   overlap rather than embeddings — the corpus is small and this is honest
   about what it does. */
function pick(knowledge, question) {
  const q = String(question || '').toLowerCase();
  const scored = knowledge.map(row => {
    const tags = Array.isArray(row.tags) ? row.tags : [];
    const hits = tags.filter(t => t && q.includes(String(t).toLowerCase())).length +
                 (q.includes(String(row.topic || '').toLowerCase()) ? 1 : 0);
    return { row, hits, always: (row.weight || 0) >= ALWAYS };
  });

  const chosen = scored
    .filter(s => s.always || s.hits > 0)
    .sort((a, b) => (b.hits - a.hits) || ((b.row.weight || 0) - (a.row.weight || 0)));

  const out = [];
  let used = 0;
  for (const s of chosen) {
    const line = '- ' + s.row.topic + ': ' + s.row.content;
    if (used + line.length > KNOWLEDGE_BUDGET) break;
    out.push(line);
    used += line.length;
  }
  return out;
}

/* The instructions for one question. Falls back to the file on any failure,
   which is the difference between a wrong answer and no answer at all. */
export async function systemFor(question) {
  const withMap = t => t + '\n\n# The site you are on — the only paths you may link to\n' + sitemapText();
  if (!live()) return { system: withMap(FILE_SYSTEM), version: 'file', facts: 0 };

  try {
    if (Date.now() - cache.at > TTL_MS || !cache.prompt) await refresh();
  } catch (e) {
    console.error('prompt load failed, using the file', e && e.message);
    return { system: withMap(FILE_SYSTEM), version: 'file', facts: 0 };
  }

  const facts = pick(cache.knowledge || [], question);
  let system = facts.length
    ? cache.prompt + '\n\n# Facts you may use\nThese are current and approved. Prefer them over anything you recall.\n' + facts.join('\n')
    : cache.prompt;

  /* appended at request time rather than stored in the prompt row: the map is
     generated from the pages themselves, so it cannot go stale behind a
     prompt version */
  system += '\n\n# The site you are on — the only paths you may link to\n' + sitemapText();

  return { system, version: cache.version, facts: facts.length };
}

/* so the console can say which version answered */
export function promptState() {
  return {
    source: live() ? 'database' : 'file',
    version: cache.version,
    knowledgeRows: cache.knowledge ? cache.knowledge.length : null,
    cachedFor: cache.at ? Math.round((Date.now() - cache.at) / 1000) + 's' : null,
  };
}
