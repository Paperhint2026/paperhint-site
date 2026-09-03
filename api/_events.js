/* One shape for every enquiry event, named the way PostHog expects.
 *
 * The log stores what happened; this file decides what it is CALLED. Both the
 * pull feed (/api/events) and the live forwarder in _log.js map through here,
 * so an event name or property is defined once and can never drift between
 * what we read and what PostHog receives.
 *
 * Conventions, deliberately PostHog's own: snake_case event names, a
 * distinct_id per visit, $set for what we learn about the person.
 */

const NAMES = {
  question: 'chat_question_asked',
  callback: 'callback_requested',
  contact: 'contact_submitted',
};

export function eventName(kind) { return NAMES[kind] || 'enquiry_' + (kind || 'unknown'); }

/* A visit is the unit of identity until someone gives an email; then the
   email is the person and the visit is one of their sessions. */
export function distinctId(row) {
  return row.email || row.sid || ('net:' + (row.ip || 'unknown'));
}

export function toEvent(row) {
  if (!row || row.raw) return null;
  const kind = row.kind || 'question';
  const props = {
    /* where */
    city: row.city || undefined,
    region: row.region || undefined,
    country: row.country || undefined,
    ip_network: row.ip || undefined,
    $current_url: row.page ? 'https://paperhint.com' + row.page : undefined,
    page: row.page || undefined,
    user_agent: row.ua || undefined,
    /* which visit */
    session_id: row.sid || undefined,
  };

  if (kind === 'question') {
    props.question = row.text || '';
    props.question_chars = (row.text || '').length;
    props.reply_chars = (row.reply || '').length;
    props.answered_by = row.model || undefined;
  } else {
    props.enquiry_type = row.enquiry || undefined;
    props.school = row.school || undefined;
    props.role = row.role || undefined;
    props.via = row.via || undefined;
    props.reasons = row.reasons || undefined;
    props.has_message = Boolean(row.text);
    props.came_with_transcript = Boolean(row.transcript);
  }

  /* What we now know about the person, so PostHog can stitch a visit to a
     name once they ask for a callback. */
  const set = {};
  if (row.email) set.email = row.email;
  if (row.name) set.name = row.name;
  if (row.school) set.school = row.school;
  if (row.role) set.role = row.role;
  if (row.country) set.country = row.country;
  if (Object.keys(set).length) props.$set = set;

  return {
    event: eventName(kind),
    distinct_id: distinctId(row),
    timestamp: row.at || new Date().toISOString(),
    properties: prune(props),
  };
}

function prune(o) {
  for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k];
  return o;
}

/* Live forwarding. Set the two vars and events start arriving in PostHog as
   they happen; leave them unset and this is a no-op. Best-effort by design —
   analytics must never be able to fail a reply or an enquiry. */
export async function forward(row) {
  const key = process.env.POSTHOG_KEY;
  if (!key) return false;
  const host = (process.env.POSTHOG_HOST || 'https://app.posthog.com').replace(/\/$/, '');
  const ev = toEvent(row);
  if (!ev) return false;
  try {
    const r = await fetch(host + '/capture/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: key, ...ev }),
    });
    if (!r.ok) throw new Error('posthog ' + r.status);
    return true;
  } catch (e) {
    console.error('posthog forward failed', e && e.message);
    return false;
  }
}
