/* A durable, viewable enquiry log.
 *
 * Where rows actually go is _store.js's problem: Supabase if its variables
 * are set, Upstash otherwise, nowhere at all if neither. This file's only job
 * is to make sure recording can never break a reply.
 *
 * Read it at /console, or as an event feed at /api/events.
 */

import { forward } from './_events.js';
import { write, list, storing, describe } from './_store.js';

export function logging() { return storing(); }
export function storageKeys() { const d = describe(); return { seen: d.seen, other: d.other }; }
export { describe as storageState };

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
  if (!storing()) return false;
  try {
    return await write(row);
  } catch (e) {
    console.error('enquiry log write failed', e && e.message);
    return false;
  }
}

export async function read(limit = 200) {
  return storing() ? list(limit) : null;
}
