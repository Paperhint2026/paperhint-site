/* A durable, viewable enquiry log.
 *
 * Writes go to a Redis list over the REST API — Vercel KV, Upstash, or
 * anything that speaks the same shape. Set these in Vercel and it starts
 * recording; leave them unset and the site works exactly as before, with
 * entries going to the runtime logs only.
 *
 *   KV_REST_API_URL     https://xxx.upstash.io
 *   KV_REST_API_TOKEN   the write token
 *
 * Read it at /api/enquiries?token=… (ENQUIRY_TOKEN).
 */

import { forward } from './_events.js';

const URL_ = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOK_ = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const LIST = 'paperhint:enquiries';
const KEEP = 500;

export function logging() { return Boolean(URL_() && TOK_()); }

/* Which storage keys this deployment can actually see. Vercel injects
   different names depending on which database you pick, and one of the
   choices injects only a redis:// connection string, which this REST client
   cannot use — worth saying out loud rather than showing an empty table. */
export function storageKeys() {
  const rest = ['KV_REST_API_URL', 'KV_REST_API_TOKEN',
                'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'];
  const seen = {};
  for (const k of rest) seen[k] = Boolean(process.env[k]);
  const other = Object.keys(process.env)
    .filter(k => !rest.includes(k) && /redis|^kv_|upstash/i.test(k))
    .slice(0, 12);
  return { seen, other };
}

/* Where the request came from. Vercel resolves this at the edge, so there's
   nothing to look up. The IP is truncated to its network before it's stored —
   enough to tell two schools apart, not enough to be a home address. */
export function whereFrom(req) {
  const h = req.headers || {};
  const raw = String(h['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = raw.includes(':')
    ? raw.split(':').slice(0, 4).join(':') + '::'        /* IPv6 /64 */
    : raw.split('.').slice(0, 3).concat('0').join('.');  /* IPv4 /24 */
  return {
    ip: ip || null,
    city: h['x-vercel-ip-city'] ? decodeURIComponent(h['x-vercel-ip-city']) : null,
    region: h['x-vercel-ip-country-region'] || null,
    country: h['x-vercel-ip-country'] || null,
    ua: String(h['user-agent'] || '').slice(0, 160) || null,
  };
}

/* Never let logging break a reply — every failure is swallowed and printed. */
export async function record(entry) {
  const row = { at: new Date().toISOString(), ...entry };
  console.log('ENQUIRY ' + JSON.stringify(row));
  /* analytics is downstream of the record, never in front of it */
  forward(row).catch(() => {});
  if (!logging()) return false;
  try {
    const base = URL_().replace(/\/$/, '');
    const auth = { Authorization: 'Bearer ' + TOK_(), 'Content-Type': 'application/json' };
    await fetch(base + '/lpush/' + LIST, { method: 'POST', headers: auth, body: JSON.stringify(JSON.stringify(row)) });
    await fetch(base + '/ltrim/' + LIST + '/0/' + (KEEP - 1), { method: 'POST', headers: auth });
    return true;
  } catch (e) {
    console.error('enquiry log write failed', e && e.message);
    return false;
  }
}

export async function read(limit = 200) {
  if (!logging()) return null;
  const base = URL_().replace(/\/$/, '');
  const r = await fetch(base + '/lrange/' + LIST + '/0/' + (limit - 1), {
    headers: { Authorization: 'Bearer ' + TOK_() },
  });
  if (!r.ok) throw new Error('read ' + r.status);
  const j = await r.json();
  return (j.result || []).map(s => { try { return JSON.parse(s); } catch { return { raw: s }; } });
}
