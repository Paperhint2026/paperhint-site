/* POST /api/bug — a fault the browser found.
 *
 * Written by public pages, so it assumes nothing it receives is true: every
 * field is clamped, the kind is checked against a list, and one address can
 * only file so many. Errors go into the same log as enquiries so the console
 * shows them side by side — a broken page and a lost enquiry are the same
 * problem seen from two ends.
 */

import { recordNow } from './_log.js';

const KINDS = ['error', 'rejection', 'asset', 'noted'];
const WINDOW_MS = 60 * 60 * 1000;
const PER_WINDOW = Number(process.env.BUG_RATE_LIMIT || 60);
const hits = new Map();

function overLimit(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some(t => now - t < WINDOW_MS)) hits.delete(k);
  return list.length > PER_WINDOW;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  /* a reporter must never see an error page — 204 whatever happens */
  if (req.method !== 'POST') return res.status(204).end();

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { return res.status(204).end(); }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (overLimit(ip)) return res.status(204).end();

  const s = (v, n) => (v == null ? null : String(v).slice(0, n) || null);
  const n = v => (Number.isFinite(Number(v)) ? Number(v) : null);

  const fault = {
    kind: 'bug',
    fault: KINDS.includes(body.kind) ? body.kind : 'error',
    message: s(body.message, 400) || 'unknown fault',
    page: s(body.page, 200),
    file: s(body.file, 200),
    line: n(body.line),
    column: n(body.column),
    stack: s(body.stack, 1200),
    viewport: s(body.viewport, 20),
    sid: s(body.sid, 40),
  };

  /* whereFrom is imported lazily so a malformed request costs nothing */
  const { whereFrom } = await import('./_log.js');
  await recordNow({ ...fault, ...whereFrom(req) });

  return res.status(204).end();
}
