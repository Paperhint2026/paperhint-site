/* GET /api/console  (Bearer grant from _auth.js) → { summary, sessions }
 *
 * One row per visit rather than per event: the log is a flat stream, but the
 * thing worth reading is a person — where they were, what they asked in what
 * order, and whether they left a way to reach them.
 */

import { read, logging } from './_log.js';
import { bearer, whoIs, configured } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!configured()) return json(res, 503, { error: 'CONSOLE_SECRET is not set.' });

  const who = whoIs(bearer(req));
  if (!who) return json(res, 401, { error: 'Sign in again.' });

  if (!logging()) {
    return json(res, 200, {
      who, sessions: [], summary: empty(),
      notice: 'Nothing is being stored yet — set KV_REST_API_URL and KV_REST_API_TOKEN in Vercel and the log starts filling.',
    });
  }

  let rows;
  try { rows = (await read(500)) || []; }
  catch (e) { return json(res, 502, { error: 'Could not read the log: ' + (e && e.message) }); }

  const sessions = group(rows);
  return json(res, 200, { who, sessions, summary: summarise(sessions, rows) });
}

/* The log is newest-first; a visit reads forwards. */
export function group(rows) {
  const byId = new Map();
  const chron = rows.slice().reverse();

  for (const r of chron) {
    if (!r || r.raw) continue;
    /* No sid (an older row, or the contact page) still belongs to somebody —
       key it by network and day so it doesn't shatter into singletons. */
    const key = r.sid || 'ip:' + (r.ip || 'unknown') + ':' + String(r.at || '').slice(0, 10);
    let s = byId.get(key);
    if (!s) {
      s = {
        id: key, anon: !r.sid, started: r.at, last: r.at,
        ip: r.ip || null, city: r.city || null, region: r.region || null,
        country: r.country || null, ua: r.ua || null,
        name: null, email: null, school: null, role: null, enquiry: null,
        questions: 0, callback: false, pages: [], models: [], events: [],
      };
      byId.set(key, s);
    }

    s.last = r.at || s.last;
    if (r.ip && !s.ip) s.ip = r.ip;
    if (r.city && !s.city) s.city = r.city;
    if (r.region && !s.region) s.region = r.region;
    if (r.country && !s.country) s.country = r.country;
    if (r.ua && !s.ua) s.ua = r.ua;
    if (r.page && s.pages.indexOf(r.page) < 0) s.pages.push(r.page);
    if (r.model && s.models.indexOf(r.model) < 0) s.models.push(r.model);

    if (r.kind === 'question') {
      s.questions++;
      s.events.push({ at: r.at, kind: 'question', text: r.text, reply: r.reply, model: r.model });
    } else {
      /* A callback or a contact-form enquiry — this is who they are. */
      s.callback = true;
      s.name = r.name || s.name; s.email = r.email || s.email;
      s.school = r.school || s.school; s.role = r.role || s.role;
      s.enquiry = r.enquiry || s.enquiry;
      s.events.push({
        at: r.at, kind: r.kind || 'callback', text: r.text || '',
        name: r.name, email: r.email, school: r.school, role: r.role,
        enquiry: r.enquiry, via: r.via, reasons: r.reasons, transcript: r.transcript,
      });
    }
  }

  /* Newest visit first, and a visit that left contact details ranks above one
     that only browsed on the same day. */
  return [...byId.values()].sort((a, b) => String(b.last).localeCompare(String(a.last)));
}

export function summarise(sessions, rows) {
  const now = Date.now();
  const since = h => sessions.filter(s => now - Date.parse(s.last) < h * 36e5).length;
  const asked = sessions.reduce((n, s) => n + s.questions, 0);
  const places = {};
  for (const s of sessions) {
    const p = [s.city, s.country].filter(Boolean).join(', ') || 'unknown';
    places[p] = (places[p] || 0) + 1;
  }
  return {
    sessions: sessions.length,
    day: since(24), week: since(24 * 7),
    questions: asked,
    callbacks: sessions.filter(s => s.callback).length,
    withEmail: sessions.filter(s => s.email).length,
    rows: rows.length,
    places: Object.entries(places).sort((a, b) => b[1] - a[1]).slice(0, 6),
  };
}

function empty() {
  return { sessions: 0, day: 0, week: 0, questions: 0, callbacks: 0, withEmail: 0, rows: 0, places: [] };
}

function json(res, code, obj) { res.status(code).setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(obj)); }
