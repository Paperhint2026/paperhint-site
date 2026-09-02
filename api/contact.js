/* Paperhint — contact form endpoint (Vercel serverless, Node runtime).
 *
 * Receives the contact form as JSON, sends two emails through Resend:
 *   1. a notification to the founders (reply-to = the enquirer)
 *   2. a type-specific acknowledgement to the enquirer
 *
 * Env (Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY   required — https://resend.com/api-keys
 *   CONTACT_TO       founders' inbox(es), comma-separated   default hello@paperhint.com
 *   CONTACT_FROM     verified sender                        default Paperhint <hello@paperhint.com>
 *   CONTACT_WHATSAPP founders' WhatsApp number (digits)     optional, shown in the acknowledgement
 *
 * Until paperhint.com is verified in Resend, set CONTACT_FROM to
 * "Paperhint <onboarding@resend.dev>" — Resend then only delivers to the
 * account owner's address, which is fine for testing.
 */

const RESEND_URL = 'https://api.resend.com/emails';
const MIN_FORM_SECONDS = 2.5;           /* faster than this is a bot */
const MAX = { name: 120, email: 200, phone: 40, school: 160, message: 4000 };

const TYPES = {
  demo:        { label: 'Book a demo',  tag: 'Demo' },
  pilot:       { label: 'Join the pilot', tag: 'Pilot' },
  pricing:     { label: 'Pricing',      tag: 'Pricing' },
  partnership: { label: 'Partnership',  tag: 'Partnership' },
  support:     { label: 'Support',      tag: 'Support' }
};

/* ---------------- request handling ---------------- */

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'POST only' });

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch (e) { return json(res, 400, { ok: false, error: 'Bad JSON' }); }

  /* honeypot: real people never see this field. Answer success so the
     bot learns nothing, send nothing. */
  if (body.website) return json(res, 200, { ok: true, skipped: true });

  /* time-on-form: the page stamps when the form rendered */
  const rendered = Number(body._t);
  if (rendered && (Date.now() - rendered) / 1000 < MIN_FORM_SECONDS) {
    return json(res, 200, { ok: true, skipped: true });
  }

  const data = clean(body);
  const problems = validate(data);
  if (problems.length) return json(res, 400, { ok: false, error: problems.join(' ') });

  const key = process.env.RESEND_API_KEY;
  if (!key) return json(res, 503, { ok: false, error: 'Email is not configured yet.' });

  const from = process.env.CONTACT_FROM || 'Paperhint <hello@paperhint.com>';
  const to = (process.env.CONTACT_TO || 'hello@paperhint.com').split(',').map(s => s.trim()).filter(Boolean);
  const whatsapp = (process.env.CONTACT_WHATSAPP || '').replace(/\D/g, '');

  const notify = founderEmail(data, { from, to });
  const ack = acknowledgement(data, { from, whatsapp });

  try {
    /* the founder notification is the one that must not be lost — send it
       first and fail loudly; the acknowledgement is best-effort */
    await send(key, notify);
    let acked = false;
    try { await send(key, ack); acked = true; } catch (e) { console.error('ack failed', e.message); }
    return json(res, 200, { ok: true, acked });
  } catch (e) {
    console.error('notify failed', e.message);
    return json(res, 502, { ok: false, error: 'We couldn’t send that just now.' });
  }
};

async function send(key, msg) {
  const r = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(msg)
  });
  if (!r.ok) throw new Error('Resend ' + r.status + ' ' + (await r.text()).slice(0, 300));
  return r.json();
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function json(res, code, obj) { res.status(code).setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(obj)); }

/* ---------------- data ---------------- */

function clean(b) {
  const s = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
  const type = TYPES[b.etype] ? b.etype : 'demo';
  return {
    type,
    typeLabel: TYPES[type].label,
    tag: TYPES[type].tag,
    name: s(b.name, MAX.name),
    role: s(b.role, 60),
    email: s(b.email, MAX.email).toLowerCase(),
    phone: s(b.phone, MAX.phone),
    school: s(b.school, MAX.school),
    size: s(b.size, 40),
    message: s(b.message, MAX.message),
    reasons: Array.isArray(b.reasons) ? b.reasons.map(r => s(r, 80)).filter(Boolean).slice(0, 6) : [],
    page: s(b.page, 200),
    source: s(b.source, 40) || 'contact-form'
  };
}

function validate(d) {
  const p = [];
  if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) p.push('Please enter a valid email.');
  if (d.source === 'contact-form') {
    if (!d.name) p.push('Please tell us your name.');
    if (!d.school) p.push('Please tell us your school.');
  }
  return p;
}

/* ---------------- emails ---------------- */

function founderEmail(d, o) {
  const subject = `[${d.tag}] ${d.school || d.email}${d.name ? ' — ' + d.name : ''}`;
  const wa = d.phone ? `https://wa.me/${d.phone.replace(/\D/g, '')}` : '';
  const rows = [
    ['Enquiry', d.typeLabel],
    ['Name', d.name || '—'],
    ['Role', d.role || '—'],
    ['School', d.school || '—'],
    ['Size', d.size || '—'],
    ['Email', `<a href="mailto:${esc(d.email)}" style="color:#0B8A5C">${esc(d.email)}</a>`],
    ['Phone / WhatsApp', d.phone ? `${esc(d.phone)}${wa ? ` &nbsp;·&nbsp; <a href="${wa}" style="color:#0B8A5C">Open in WhatsApp</a>` : ''}` : '—'],
    ['Source', `${esc(d.source)}${d.page ? ' · ' + esc(d.page) : ''}`]
  ];
  const chips = d.reasons.length
    ? `<p style="margin:18px 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#68766E">What they picked</p>` +
      d.reasons.map(r => `<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 12px;border:1px solid #E8E4D8;border-radius:999px;font-size:13px;color:#3D4F47">${esc(r)}</span>`).join('')
    : '';
  const msg = d.message
    ? `<p style="margin:18px 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#68766E">In their words</p>
       <div style="padding:14px 16px;background:#FFFFFF;border:1px solid #E8E4D8;border-radius:12px;font-size:15px;line-height:1.55;color:#14201A;white-space:pre-wrap">${esc(d.message)}</div>`
    : '';
  const html = shell({
    preheader: `${d.typeLabel} — ${d.school || d.email}`,
    kicker: 'New enquiry',
    title: `${esc(d.school || 'A school')} wants to talk`,
    body: table(rows) + chips + msg,
    cta: { href: `mailto:${d.email}?subject=${encodeURIComponent('Re: Paperhint — ' + d.typeLabel)}`, label: 'Reply to ' + (d.name ? d.name.split(' ')[0] : 'them') },
    foot: 'Sent by the contact form on paperhint.com. Reply to this email to answer them directly.'
  });
  const text = [
    `${d.typeLabel} — ${d.school || d.email}`, '',
    ...rows.map(([k, v]) => `${k}: ${strip(v)}`),
    d.reasons.length ? `\nPicked: ${d.reasons.join(' · ')}` : '',
    d.message ? `\nMessage:\n${d.message}` : ''
  ].join('\n');
  return { from: o.from, to: o.to, reply_to: d.email, subject, html, text };
}

/* the acknowledgement is deliberately plain: received, and a person
   will be in touch. Details are for the conversation, not the auto-reply. */
function acknowledgement(d, o) {
  const subject = 'We’ve received your enquiry — Paperhint';
  const what = d.type === 'support' ? 'message' : d.typeLabel.toLowerCase() + ' enquiry';
  const school = d.school ? ` for <b style="font-weight:600">${esc(d.school)}</b>` : '';
  const wa = o.whatsapp ? ` If it’s quicker, you can also reach us on <a href="https://wa.me/${o.whatsapp}" style="color:#0B8A5C">WhatsApp</a>.` : '';
  const html = shell({
    preheader: 'Received — a Paperhint representative will reach out shortly.',
    kicker: 'Received',
    title: `Thanks, ${first(d)}.`,
    body: `<p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#14201A">We’ve received your ${what}${school}.</p>
           <p style="margin:0;font-size:16px;line-height:1.6;color:#3D4F47">A Paperhint representative will reach out to you within one working day. There’s nothing you need to do until then — if you have anything to add, just reply to this email.${wa}</p>`,
    cta: null,
    foot: 'You’re getting this because you wrote to us at paperhint.com.'
  });
  const text = [
    `Thanks, ${d.name ? d.name.split(' ')[0] : 'there'}.`, '',
    `We’ve received your ${strip(what)}${d.school ? ' for ' + d.school : ''}.`,
    'A Paperhint representative will reach out to you within one working day. There’s nothing you need to do until then — if you have anything to add, just reply to this email.',
    o.whatsapp ? `WhatsApp: https://wa.me/${o.whatsapp}` : '',
    '', '— Paperhint · Teaching is the job. Paperwork isn’t.'
  ].filter(l => l !== null).join('\n');
  return { from: o.from, to: [d.email], subject, html, text };
}

/* ---------------- template shell ---------------- */

function shell(t) {
  const cta = t.cta
    ? `<a href="${t.cta.href}" style="display:inline-block;margin-top:22px;padding:12px 20px;background:#14201A;color:#FAF7F0;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px">${t.cta.label}</a>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${esc(t.preheader)}</title></head>
<body style="margin:0;padding:0;background:#FCFBF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif;color:#14201A">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(t.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FCFBF8">
<tr><td align="center" style="padding:36px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
  <tr><td style="padding:0 0 22px;font-size:20px;font-weight:600;letter-spacing:-.02em;color:#14201A">
    Paper<span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:500;color:#0B8A5C">h</span>int</td></tr>
  <tr><td style="background:#FFFFFF;border:1px solid #E8E4D8;border-radius:0 20px 20px 20px;padding:30px 30px 26px">
    <div style="font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:#0B8A5C;font-weight:600;margin-bottom:12px">
      <span style="display:inline-block;width:18px;height:2px;background:#0B8A5C;vertical-align:middle;margin-right:8px"></span>${esc(t.kicker)}</div>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;letter-spacing:-.03em;font-weight:600;color:#14201A">${t.title}</h1>
    ${t.body}
    ${cta}
  </td></tr>
  <tr><td style="padding:18px 6px 0;font-size:12px;line-height:1.5;color:#68766E">
    ${esc(t.foot)}<br>
    <span style="color:#14201A">Teaching is the job. Paperwork isn’t.</span> &nbsp;·&nbsp; <a href="https://paperhint.com" style="color:#68766E">paperhint.com</a>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function table(rows) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">` +
    rows.map(([k, v]) => `<tr>
      <td style="padding:9px 14px 9px 0;font-size:12.5px;color:#68766E;white-space:nowrap;vertical-align:top;border-bottom:1px solid #F0EDE4">${esc(k)}</td>
      <td style="padding:9px 0;font-size:15px;color:#14201A;vertical-align:top;border-bottom:1px solid #F0EDE4">${v}</td></tr>`).join('') +
    `</table>`;
}

function first(d) { return d.name ? esc(d.name.split(' ')[0]) : 'there'; }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function strip(h) { return String(h).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'); }

/* exported for previews/tests */
export { founderEmail, acknowledgement, TYPES };
