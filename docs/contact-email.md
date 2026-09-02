# Contact form → email

The contact form posts to `/api/contact` (a Vercel serverless function in
`api/contact.js`) which sends two emails through Resend. Front-end wiring
lives in `initContact()` in `public/assets/js/main.js`.

## What gets sent

| Trigger | To | Subject | Reply-to |
|---|---|---|---|
| Any valid submission | founders (`CONTACT_TO`) | `[Demo] Greenfield Public School — Priya Nair` | the enquirer |
| Any valid submission | the enquirer | scenario-specific (below) | — |

Founder notification carries every field, the chips they picked, their
message verbatim, a `wa.me` link if they left a number, and a one-click
"Reply to Priya" button (mailto, subject pre-filled).

## Scenarios (enquiry type → acknowledgement)

| `etype` | Subject | The three steps |
|---|---|---|
| `demo` | Your Paperhint demo — what happens next | read properly → we set up your class beforehand → demo runs on your paper (bring one exam's sheets, paper, marking scheme, register photo) |
| `pilot` | Your founding-school application — what happens next | read properly → demo on your own class → founding-school terms |
| `pricing` | Paperhint pricing — how we set it | per student, one licence → set together in the founding window → a call, not a quote |
| `partnership` | Partnering with Paperhint — next step | read by a founder → what partnering means (roadmap + custom modules) → a conversation |
| `support` | We've got your message — Paperhint support | same working day → "urgent" in the subject if blocking → nothing is lost meanwhile |

Unknown/missing type falls back to `demo`. The hero email capture lands
on the contact page with `?email=` and goes through the same form.

## Edge cases

| Case | Behaviour |
|---|---|
| Honeypot field `website` filled | 200 `{ok:true, skipped:true}` — nothing sent, bot learns nothing |
| Submitted < 2.5 s after the form rendered (`_t`) | same silent skip |
| Invalid email / missing name or school | 400 with a plain-English message shown under the button |
| `RESEND_API_KEY` not set | 503 "Email is not configured yet." + mailto fallback shown |
| Resend rejects the founder notification | 502; form stays filled, error + mailto fallback shown. Never a fake success. |
| Founder notification sent, acknowledgement fails | 200 `{ok:true, acked:false}` — success panel notes the email may not arrive |

## Setup (one-time)

1. **Resend account** → create an API key → Vercel env `RESEND_API_KEY`.
2. **Verify `paperhint.com` in Resend** (Domains → Add) and add the DNS
   records it gives you (SPF/TXT, DKIM CNAMEs, optional DMARC). Until
   verified, set `CONTACT_FROM="Paperhint <onboarding@resend.dev>"` —
   Resend will then only deliver to the account owner's inbox (fine for
   testing).
3. Vercel env vars:
   - `RESEND_API_KEY` — required
   - `CONTACT_TO` — founders' inbox(es), comma-separated (default `hello@paperhint.com`)
   - `CONTACT_FROM` — `Paperhint <hello@paperhint.com>` once verified
   - `CONTACT_WHATSAPP` — founders' number, digits with country code (optional; adds a WhatsApp line to acknowledgements)
4. Redeploy. Submit the form once from the live site and check both inboxes.

## Testing locally

`node scratch/mail/test.mjs` (see the session scratchpad) exercises every
branch with a fake Resend and renders each template to HTML. Or run
`vercel dev` with a `.env` holding the variables above.
