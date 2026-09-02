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

/* one acknowledgement per scenario — each mirrors the contact page's
   "what happens next", in the site's voice */
const SCENARIOS = {
  demo: {
    subject: 'Your Paperhint demo — what happens next',
    kicker: 'Demo booked',
    title: (d) => `Thanks, ${first(d)}. We’ll set up ${d.school ? esc(d.school) : 'your school'} before we call.`,
    steps: [
      ['We read it properly', 'A founder reads your note today and replies within one working day — not a bot, not a sales team.'],
      ['We set up your class beforehand', 'Your class names, your subjects, one section — so the demo shows your school, not a sample one.'],
      ['The demo runs on your paper', 'Bring one class’s answer sheets from a real exam, its question paper and marking scheme, and a photo of the attendance register. We photograph the sheets live and mark them on your rubric in front of you.']
    ],
    ask: 'One thing to do now: dig out that exam. The demo is only as convincing as the paper you bring.'
  },
  pilot: {
    subject: 'Your founding-school application — what happens next',
    kicker: 'Founding school',
    title: (d) => `Thanks, ${first(d)}. Let’s see ${d.school ? esc(d.school) : 'your school'} running in Paperhint.`,
    steps: [
      ['We read it properly', 'A founder replies within one working day.'],
      ['A demo on your own class', 'We set up one of your classes beforehand and run a real exam of yours through Paperhint in front of you.'],
      ['Founding-school terms', 'Pricing per student, set together, in writing — with onboarding we do alongside you.']
    ],
    ask: 'Have one class’s answer sheets and question paper ready for the demo.'
  },
  pricing: {
    subject: 'Paperhint pricing — how we set it',
    kicker: 'Pricing',
    title: (d) => `Thanks, ${first(d)}. Here’s how pricing works right now.`,
    steps: [
      ['Per student, one licence', 'One price per enrolled student covers every account the school needs — admins, teachers, students and parent access.'],
      ['Set together, in the founding window', 'We’re pricing with our founding schools rather than publishing a rate card. It’s pro-rated to your academic year, and the founding rate stays yours.'],
      ['A call, not a quote', 'A founder will reply within one working day with two or three times to talk through your numbers — sections, students, exams per term.']
    ],
    ask: 'If you can, have your enrolment and section counts handy for that call.'
  },
  partnership: {
    subject: 'Partnering with Paperhint — next step',
    kicker: 'Partnership',
    title: (d) => `Thanks, ${first(d)}. A founder will pick this up personally.`,
    steps: [
      ['Read by a founder', 'Partnership notes don’t go through a queue. One of us reads it and replies within one working day.'],
      ['What partnering means here', 'Founding schools shape the product: your school’s way of working lands on the roadmap, and we build custom modules for how you actually run — bringing the applications you already use into one place.'],
      ['Then a conversation', 'We’ll suggest a time to talk it through properly.']
    ],
    ask: ''
  },
  support: {
    subject: 'We’ve got your message — Paperhint support',
    kicker: 'Support',
    title: (d) => `Thanks, ${first(d)}. We’re on it.`,
    steps: [
      ['Same working day', 'A founder reads every support note and replies within one working day — usually much faster.'],
      ['If it’s blocking a class', 'Reply to this email with “urgent” in the subject and we’ll jump on it.'],
      ['Meanwhile', 'Anything that’s already been marked, drafted or scanned is safe — nothing is lost while we look.']
    ],
    ask: ''
  }
};

function acknowledgement(d, o) {
  const sc = SCENARIOS[d.type] || SCENARIOS.demo;
  const steps = sc.steps.map(([h, p], i) =>
    `<tr><td style="padding:0 14px 0 0;vertical-align:top;width:28px">
       <div style="width:26px;height:26px;border-radius:999px;background:#E3F1EA;color:#0B8A5C;font:600 13px/26px Georgia,serif;text-align:center">${i + 1}</div></td>
     <td style="padding:0 0 16px;vertical-align:top">
       <div style="font-weight:600;font-size:15px;color:#14201A">${h}</div>
       <div style="font-size:14.5px;line-height:1.55;color:#3D4F47;margin-top:3px">${p}</div></td></tr>`).join('');
  const wa = o.whatsapp ? `<p style="margin:18px 0 0;font-size:14px;color:#3D4F47">Prefer WhatsApp? <a href="https://wa.me/${o.whatsapp}" style="color:#0B8A5C">Message us here</a>.</p>` : '';
  const html = shell({
    preheader: sc.subject,
    kicker: sc.kicker,
    title: sc.title(d),
    body: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px">${steps}</table>` +
          (sc.ask ? `<div style="margin-top:8px;padding:14px 16px;background:#FFF8E1;border-radius:12px;font-size:14.5px;line-height:1.5;color:#14201A">${sc.ask}</div>` : '') + wa,
    cta: null,
    foot: `You’re getting this because you wrote to us at paperhint.com. Just reply to this email to reach us.`
  });
  const text = [
    sc.subject, '',
    strip(sc.title(d)), '',
    ...sc.steps.map(([h, p], i) => `${i + 1}. ${h}\n   ${p}`),
    sc.ask ? `\n${sc.ask}` : '',
    o.whatsapp ? `\nWhatsApp: https://wa.me/${o.whatsapp}` : '',
    '\n— Paperhint · Teaching is the job. Paperwork isn’t.'
  ].join('\n');
  return { from: o.from, to: [d.email], reply_to: undefined, subject: sc.subject, html, text };
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
export { founderEmail, acknowledgement, SCENARIOS };
