/* GET /api/events — the enquiry log as a flat event feed.
 *
 * Built to be read by something other than a person: PostHog, a warehouse
 * job, a notebook. Event names and properties come from _events.js, so this
 * feed and the live forwarder always agree.
 *
 * Auth, either:
 *   Authorization: Bearer <console grant>     a signed-in human
 *   Authorization: Bearer <FEED_TOKEN>        a machine
 *   ?token=<FEED_TOKEN>                       a machine that can't set headers
 *
 * Query:
 *   ?since=2026-09-01T00:00:00Z   only events after this instant
 *   ?limit=500                    default 500, max 500
 *   ?kind=question|callback       one type only
 *   ?format=ndjson                one JSON event per line
 */

import { read, logging } from './_log.js';
import { bearer, whoIs } from './_auth.js';
import { toEvent } from './_events.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const q = req.query || {};
  const tok = bearer(req) || String(q.token || '');
  const feed = process.env.FEED_TOKEN;
  const ok = (feed && tok && tok === feed) || Boolean(whoIs(tok));
  if (!ok) return json(res, 401, { error: 'Unauthorised.' });

  if (!logging()) return json(res, 200, { events: [], count: 0, storing: false });

  let rows;
  try { rows = (await read(500)) || []; }
  catch (e) { return json(res, 502, { error: 'Could not read the log: ' + (e && e.message) }); }

  const since = q.since ? Date.parse(String(q.since)) : NaN;
  const kind = q.kind ? String(q.kind) : '';
  const limit = Math.min(Number(q.limit) || 500, 500);

  /* Oldest first — a feed that is consumed with a cursor must move forwards. */
  let events = rows.slice().reverse()
    .filter(r => r && !r.raw)
    .filter(r => !kind || (r.kind || 'question') === kind)
    .filter(r => isNaN(since) || Date.parse(r.at) > since)
    .map(toEvent)
    .filter(Boolean)
    .slice(0, limit);

  if (String(q.format) === 'ndjson') {
    res.status(200).setHeader('Content-Type', 'application/x-ndjson');
    return res.end(events.map(e => JSON.stringify(e)).join('\n') + (events.length ? '\n' : ''));
  }

  return json(res, 200, {
    storing: true,
    count: events.length,
    /* hand back the cursor rather than making the caller work it out */
    cursor: events.length ? events[events.length - 1].timestamp : (q.since || null),
    events,
  });
}

function json(res, code, obj) { res.status(code).setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(obj)); }
