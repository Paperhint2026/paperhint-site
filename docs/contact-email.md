# Contact form → email

The contact form posts to `/api/contact` (a Vercel serverless function in
`api/contact.js`) which sends two emails through Resend. Front-end wiring
lives in `initContact()` in `public/assets/js/main.js`.

## What gets sent

| Trigger | To | Subject | Reply-to |
|---|---|---|---|
| Any valid submission | founders (`CONTACT_TO`) | `[Demo] Greenfield Public School — Priya Nair` | the enquirer |
| Any valid submission | the enquirer | We’ve received your enquiry — Paperhint | — |

Founder notification carries every field, the chips they picked, their
message verbatim, a `wa.me` link if they left a number, and a one-click
"Reply to Priya" button (mailto, subject pre-filled).

## The acknowledgement

One plain template for every enquiry type — deliberately not a
walkthrough. Subject **"We’ve received your enquiry — Paperhint"**; body:
*Thanks, {first name}. We’ve received your {demo / pricing / partnership
/ pilot} enquiry [for {school}]. A Paperhint representative will reach
out to you within one working day. There’s nothing you need to do until
then — if you have anything to add, just reply to this email.* Plus an
optional WhatsApp line when `CONTACT_WHATSAPP` is set. Support enquiries
say "your message" instead of "enquiry". Unknown/missing type falls back
to demo. The hero email capture lands on the contact page with `?email=`
and goes through the same form.

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
   - `CONTACT_TO` — the inbox that receives enquiries (default `support@paperhint.com`; must be a real mailbox at your mail provider)
   - `CONTACT_FROM` — `Paperhint <hello@paperhint.com>` once verified
   - `CONTACT_WHATSAPP` — founders' number, digits with country code (optional; adds a WhatsApp line to acknowledgements)
   - `EMAIL_ASSET_BASE` — where the emails load their images from (default `https://www.paperhint.com`; **must be the www host** — the apex 308-redirects and Gmail's image proxy won't follow it, which renders images broken); the star die-cut and the pre-rendered ribbon (`public/assets/img/email/ribbon-emerald.png`) ship with the site, so they resolve once it's deployed
4. Redeploy. Submit the form once from the live site and check both inboxes.

## Testing locally

`node scratch/mail/test.mjs` (see the session scratchpad) exercises every
branch with a fake Resend and renders each template to HTML. Or run
`vercel dev` with a `.env` holding the variables above.

---

# Ask Paperhint (the chat)

Three files, deliberately separate so each can be worked on alone:

| File | What it owns |
|---|---|
| `public/assets/js/ask-paperhint.js` | the whole widget — `<ask-paperhint>` custom element: markup, shadow-DOM styles, the four role stories, the callback capture, the canned fallback brain |
| `api/chat-prompt.js` | the assistant's instructions. Nothing else. Iterate the prompt here without touching transport. |
| `api/chat.js` | transport only — provider routing, rate limit, history trimming, errors |

**Using it:** `<ask-paperhint></ask-paperhint>`. Optional attributes:
`endpoint="/api/chat"` (omit and it answers from its own canned map),
`contact-endpoint="/api/contact"`. Or set `window.PaperhintChat.endpoint`
/ `window.PaperhintChat.adapter` at runtime.

It reads the page's design tokens through the shadow boundary and falls
back to its own, so it also works on a page that doesn't load
`style.css` — which is what makes it droppable into the product app.

**Env (Vercel, Production ticked):** one of `OPENAI_API_KEY` or
`GEMINI_API_KEY`, plus `CHAT_MODEL` (set it to a model your account has)
and optionally `CHAT_PROVIDER` to force one when both keys exist.
