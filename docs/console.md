# Enquiry console

Internal view of who asked what, from where, and how to reach them.
Lives at **/console** and is excluded from search engines.

## Getting in

Type a Paperhint address; a sign-in link arrives by mail. The link carries a
grant signed with `CONSOLE_SECRET` — the address it was issued to plus a
30-day expiry. Nothing is stored server-side, so there is no session table to
leak, and a grant cannot be forged without the secret. The page moves the
grant out of the URL into browser storage on first load, so it never sits in
history or in a screenshot.

An address that is not on the list gets the same reply and no mail. We never
confirm to a stranger whose address opens the console.

## What it shows

One row per **visit**, not per event: the person, where they were, how many
questions they asked, when they were last seen, and their network. Open a row
for the full exchange in order, with the callback details raised to the top
when they left any.

## What lives in the database

`docs/schema.sql` is the whole thing and is safe to re-run. Five tables:

| Table | Holds | Edited by |
|---|---|---|
| `enquiry_events` | every question, callback, contact enquiry and fault | written by the site |
| `ai_prompts` | the assistant's instructions, versioned, one active | you |
| `ai_knowledge` | facts the assistant may state, with tags and weights | you |
| `chat_stories` | the four role stories shown as chips | you |
| `chat_followups` | the suggested next questions under an answer | you |

Everything in the right-hand column can be changed in Supabase's table editor
and takes effect without a deploy: within a minute for the prompt and the
facts, within five for the panel's copy.

The repo holds the seed and the fallback for each: `api/chat-prompt.js` for
the instructions, `api/chat-content.js` for the stories and follow-ups. On a
fresh database the code seeds itself from those files. If Supabase is
unreachable the files are used directly, so a database problem cannot take the
chat down.

Three views for reading the log by hand: `questions_asked`, `callbacks` and
`faults`. They are `security_invoker`, which matters — a view without it runs
with its creator's rights and reads straight past RLS.

**Storage backends.** Supabase if its two variables are set, Upstash Redis
otherwise (a rolling 500 rows, not queryable), nothing at all if neither, and
the console says which. Neither needs a package: PostgREST and the Upstash
REST API are both one `fetch`.

**Checking it works.** `/api/console?selftest=1`, behind the sign-in, does one
real round trip — write, read back, clean up — and reports the upstream error
verbatim if it fails, plus which prompt version is live.

## Environment

| Variable | Needed for | Default |
|---|---|---|
| `CONSOLE_SECRET` | signing sign-in links | none — console refuses to work without it |
| `CONSOLE_EMAILS` | who may sign in, comma-separated | `shrivathsan@paperhint.com` |
| `SUPABASE_URL` | storing the log, prompts and panel copy | none — console shows an empty state |
| `SUPABASE_SERVICE_ROLE_KEY` | same. Server-only, never shipped to a browser | none |
| `KV_REST_API_URL` / `_TOKEN` | storing the log in Upstash instead | none |
| `RESEND_API_KEY` | sending the sign-in link | already set for the contact form |
| `FEED_TOKEN` | machine access to `/api/events` | none — feed then needs a human grant |
| `POSTHOG_KEY` | live forwarding to PostHog | none — forwarding is off |
| `POSTHOG_HOST` | PostHog region | `https://app.posthog.com` |

Generate a secret with:

    openssl rand -base64 48

## PostHog

Two ways in, both using the same event shapes from `api/_events.js`, so the
names can never drift between them.

**Live.** Set `POSTHOG_KEY` (and `POSTHOG_HOST` for the EU region). Every
question and callback is forwarded as it happens. Forwarding sits downstream
of the record and swallows its own failures — analytics can never break a
reply.

**Pull.** `GET /api/events` returns the log as a flat feed, oldest first.

    curl -H "Authorization: Bearer $FEED_TOKEN" \
      "https://www.paperhint.com/api/events?since=2026-09-01T00:00:00Z&format=ndjson"

Query: `since` (ISO instant), `limit` (max 500), `kind` (`question` or
`callback`), `format=ndjson`. A JSON response hands back a `cursor` — the
timestamp of the last event — to pass as the next `since`.

### Events

| Event | When | Key properties |
|---|---|---|
| `chat_question_asked` | someone asks the panel anything | `question`, `question_chars`, `reply_chars`, `answered_by`, `page`, `city`, `region`, `country`, `ip_network`, `session_id` |
| `callback_requested` | they ask to be called back | `enquiry_type`, `school`, `role`, `via`, `has_message`, `came_with_transcript`, plus the place fields |
| `contact_submitted` | the contact form | same as a callback |

`distinct_id` is the visit id until someone gives an email; then it is the
email, so PostHog stitches the visit to the person. `$set` carries name,
email, school, role and country as we learn them.

## Privacy

Addresses are truncated before they are stored — a /24 for IPv4, a /64 for
IPv6. Enough to tell two schools apart, not enough to be a home address.
Nothing is forwarded that is not already in the log, and reply text is
measured rather than copied into analytics.
