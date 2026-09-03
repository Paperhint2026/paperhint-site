/* Who may open the console.
 *
 * Access is a link mailed to a Paperhint address, never a password and never
 * a token pasted in a URL we handed out. The link carries a signed grant:
 * the address it was issued to plus an expiry, signed with CONSOLE_SECRET.
 * Nothing is stored, so nothing can leak from storage, and a grant cannot be
 * forged without the secret or used after it expires.
 *
 *   CONSOLE_SECRET    any long random string — the signing key
 *   CONSOLE_EMAILS    individual addresses that may sign in, comma-separated
 *                     default shrivathsan@paperhint.com
 *   CONSOLE_DOMAINS   whole domains that may sign in, comma-separated
 *                     default paperhint.com — so support@paperhint.com (a
 *                     group mailbox) and anyone on staff can get a link
 */

import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

const DAYS = 30;

export function configured() { return Boolean(process.env.CONSOLE_SECRET); }

/* Why the console won't open, in terms someone can act on. Names only, never
   a value: the usual causes are a variable saved to the wrong environment, a
   deployment older than the variable, or a typo in the key. This turns all
   three into one answer. */
export function diagnose() {
  const want = ['CONSOLE_SECRET', 'CONSOLE_EMAILS', 'CONSOLE_DOMAINS', 'RESEND_API_KEY',
                'KV_REST_API_URL', 'KV_REST_API_TOKEN',
                'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'];
  const seen = {};
  for (const k of want) seen[k] = Boolean(process.env[k]);
  /* a near miss is almost always the answer: CONSOLE_SECERT, a trailing space */
  const near = Object.keys(process.env)
    .filter(k => !want.includes(k) && /console|upstash|redis|^kv_/i.test(k))
    .slice(0, 12);
  return {
    keysVisibleToThisDeployment: seen,
    similarlyNamedKeys: near,
    deployment: process.env.VERCEL_GIT_COMMIT_SHA ?
      process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) : 'local',
    environment: process.env.VERCEL_ENV || 'unknown',
    hint: 'A variable added after this deployment was built is invisible to it. Redeploy.',
  };
}

/* A fresh secret every cold start would invalidate live links, so an unset
   CONSOLE_SECRET is a refusal, not a fallback. */
function secret() {
  const s = process.env.CONSOLE_SECRET;
  if (!s) throw new Error('CONSOLE_SECRET is not set');
  return s;
}

export function allowed() {
  return (process.env.CONSOLE_EMAILS || 'shrivathsan@paperhint.com')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

export function domains() {
  return (process.env.CONSOLE_DOMAINS || 'paperhint.com')
    .split(',').map(s => s.trim().toLowerCase().replace(/^@/, '')).filter(Boolean);
}

/* An address on the list, or any address AT an allowed domain.
   The domain test is exact equality on everything after the one and only
   "@" — never a suffix test, which "paperhint.com.attacker.net" would sail
   through, and never a split that a second "@" could confuse. */
export function mayEnter(email) {
  const e = String(email || '').trim().toLowerCase();
  const parts = e.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  if (allowed().includes(e)) return true;
  return domains().includes(parts[1]);
}

function sign(body) {
  return createHmac('sha256', secret()).update(body).digest('base64url');
}

export function mint(email, days = DAYS) {
  const body = Buffer.from(JSON.stringify({
    e: String(email).toLowerCase(),
    x: Date.now() + days * 864e5,
    n: randomBytes(6).toString('base64url'),
  })).toString('base64url');
  return body + '.' + sign(body);
}

/* Returns the address the grant was issued to, or null. Every failure looks
   the same to the caller — a bad signature, an expired grant and an address
   since removed from the list are all just "no". */
export function whoIs(token) {
  try {
    const [body, mac] = String(token || '').split('.');
    if (!body || !mac) return null;
    const want = Buffer.from(sign(body));
    const got = Buffer.from(mac);
    if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
    const claim = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!claim.x || Date.now() > claim.x) return null;
    if (!mayEnter(claim.e)) return null;
    return claim.e;
  } catch { return null; }
}

/* The grant travels in a header from the console's own script. */
export function bearer(req) {
  const h = String(req.headers?.authorization || '');
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
}
