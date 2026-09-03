/* POST { email } → mails a sign-in link, if that address may enter.
 *
 * The reply is identical either way. Telling a stranger whether an address
 * can open the console is telling them who to go after.
 */

import { configured, mayEnter, mint } from './_auth.js';

const SITE = (process.env.EMAIL_ASSET_BASE || 'https://www.paperhint.com').replace(/\/$/, '');
const SAME = { ok: true, sent: 'If that address can open the console, the link is on its way.' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });

  if (!configured()) return json(res, 503, { error: 'The console isn’t switched on yet — CONSOLE_SECRET is missing.' });

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { return json(res, 400, { error: 'Bad JSON' }); }

  const email = String(body.email || '').trim().toLowerCase().slice(0, 160);
  if (!email) return json(res, 400, { error: 'Which address?' });

  /* Not on the list: the same answer, and no mail. */
  if (!mayEnter(email)) { await pause(); return json(res, 200, SAME); }

  const key = process.env.RESEND_API_KEY;
  if (!key) return json(res, 503, { error: 'Mail isn’t configured — RESEND_API_KEY is missing.' });

  const link = SITE + '/console?k=' + encodeURIComponent(mint(email));
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'Paperhint <hello@paperhint.com>',
        to: [email],
        subject: 'Your Paperhint console link',
        text: 'Open the console:\n\n' + link + '\n\nThe link works for 30 days on this device. '
            + 'If you didn’t ask for it, ignore this — nobody can use it but you.',
        html: mail(link),
      }),
    });
    if (!r.ok) throw new Error('Resend ' + r.status + ' ' + (await r.text()).slice(0, 300));
  } catch (e) {
    console.error('console link failed', e && e.message);
    return json(res, 502, { error: 'The link didn’t send. Try again in a moment.' });
  }
  return json(res, 200, SAME);
}

/* A wrong address should cost the same time as a right one. */
function pause() { return new Promise(go => setTimeout(go, 350 + Math.random() * 250)); }

function mail(link) {
  return `<!doctype html><html><body style="margin:0;background:#FAF7F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #E2DED1;border-radius:16px">
<tr><td style="padding:28px 28px 8px">
<div style="font-size:19px;font-weight:600;color:#14201A;letter-spacing:-.01em">Paper<span style="color:#0B8A5C;font-style:italic;font-family:Georgia,serif">h</span>int</div>
</td></tr>
<tr><td style="padding:8px 28px 4px;font-size:16px;line-height:1.5;color:#14201A">Here's your way in.</td></tr>
<tr><td style="padding:4px 28px 20px;font-size:14px;line-height:1.6;color:#3D4F47">
This link opens the enquiry console and works for 30 days. It's tied to your address, so it's no use to anyone else.
</td></tr>
<tr><td style="padding:0 28px 24px">
<a href="${link}" style="display:inline-block;background:#0B8A5C;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px">Open the console</a>
</td></tr>
<tr><td style="padding:0 28px 26px;font-size:12px;line-height:1.6;color:#68766E;border-top:1px solid #F0EDE4;padding-top:16px">
Didn't ask for this? Nothing has happened — ignore it and the link expires on its own.
</td></tr>
</table></td></tr></table></body></html>`;
}

function json(res, code, obj) { res.status(code).setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(obj)); }
