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

const URL_ = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOK_ = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const LIST = 'paperhint:enquiries';
const KEEP = 500;

export function logging() { return Boolean(URL_() && TOK_()); }

/* Never let logging break a reply — every failure is swallowed and printed. */
export async function record(entry) {
  const row = { at: new Date().toISOString(), ...entry };
  console.log('ENQUIRY ' + JSON.stringify(row));
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
