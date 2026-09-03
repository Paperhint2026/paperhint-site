/* Where enquiry events go.
 *
 * Two backends, chosen by whichever variables exist. Neither needs a package:
 * Supabase over PostgREST and Upstash over its REST API are both one fetch.
 *
 *   Supabase (preferred — a real table you can query and keep)
 *     SUPABASE_URL                 https://xxxx.supabase.co
 *     SUPABASE_SERVICE_ROLE_KEY    server-only, never ships to a browser
 *
 *   Redis (rolling window of the most recent 500)
 *     KV_REST_API_URL / KV_REST_API_TOKEN
 *     or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *
 * With neither set, nothing is stored and every caller is told so plainly.
 */

const TABLE = 'enquiry_events';
const KEEP = 500;                      /* redis only; Supabase keeps everything */

const SB_URL = () => process.env.SUPABASE_URL;
const SB_KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY;
const RD_URL = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const RD_TOK = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export function backend() {
  if (SB_URL() && SB_KEY()) return 'supabase';
  if (RD_URL() && RD_TOK()) return 'redis';
  return null;
}

export function storing() { return Boolean(backend()); }

/* ---------------- supabase ---------------- */

function sbHeaders() {
  const key = SB_KEY();
  return {
    apikey: key,
    Authorization: 'Bearer ' + key,
    'Content-Type': 'application/json',
  };
}

/* A few columns are lifted out of the row so they can be indexed and queried
   in SQL; the whole row is kept in data so nothing is ever lost to a schema
   that has moved on. */
function sbRow(row) {
  return {
    at: row.at,
    kind: row.kind || 'question',
    sid: row.sid || null,
    email: row.email || null,
    page: row.page || null,
    city: row.city || null,
    country: row.country || null,
    data: row,
  };
}

async function sbWrite(row) {
  const r = await fetch(SB_URL().replace(/\/$/, '') + '/rest/v1/' + TABLE, {
    method: 'POST',
    headers: { ...sbHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify(sbRow(row)),
  });
  if (!r.ok) throw new Error('supabase ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return true;
}

async function sbList(limit) {
  const url = SB_URL().replace(/\/$/, '') + '/rest/v1/' + TABLE +
    '?select=data&order=at.desc&limit=' + limit;
  const r = await fetch(url, { headers: sbHeaders() });
  if (!r.ok) throw new Error('supabase ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const rows = await r.json();
  return rows.map(x => x.data).filter(Boolean);
}

/* ---------------- redis ---------------- */

const LIST = 'paperhint:enquiries';

async function rdWrite(row) {
  const base = RD_URL().replace(/\/$/, '');
  const auth = { Authorization: 'Bearer ' + RD_TOK(), 'Content-Type': 'application/json' };
  await fetch(base + '/lpush/' + LIST, { method: 'POST', headers: auth, body: JSON.stringify(JSON.stringify(row)) });
  await fetch(base + '/ltrim/' + LIST + '/0/' + (KEEP - 1), { method: 'POST', headers: auth });
  return true;
}

async function rdList(limit) {
  const base = RD_URL().replace(/\/$/, '');
  const r = await fetch(base + '/lrange/' + LIST + '/0/' + (limit - 1), {
    headers: { Authorization: 'Bearer ' + RD_TOK() },
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  const j = await r.json();
  return (j.result || []).map(s => { try { return JSON.parse(s); } catch { return { raw: s }; } });
}

/* ---------------- the interface the rest of the site uses ---------------- */

export async function write(row) {
  const b = backend();
  if (b === 'supabase') return sbWrite(row);
  if (b === 'redis') return rdWrite(row);
  return false;
}

export async function list(limit = 200) {
  const b = backend();
  if (b === 'supabase') return sbList(limit);
  if (b === 'redis') return rdList(limit);
  return null;
}

/* Names and booleans only, for the console's own "why is this empty" line. */
export function describe() {
  const names = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
                 'KV_REST_API_URL', 'KV_REST_API_TOKEN',
                 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'];
  const seen = {};
  for (const k of names) seen[k] = Boolean(process.env[k]);
  const other = Object.keys(process.env)
    .filter(k => !names.includes(k) && /supabase|redis|^kv_|upstash|postgres|^database_url$/i.test(k))
    .slice(0, 12);
  return { backend: backend(), seen, other };
}
