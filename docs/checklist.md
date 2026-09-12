# What's left on the website

*Checklist as of 6 September 2026. Built from the tracker's open items, the
DRAFT/needs lists in the page data, and the two audit docs — not from memory.
Grouped by who has to move: the first two groups are yours; the rest I can
take on your word.*

---

## A. Decisions only you can make

- [ ] **FIX THE APEX DOMAIN (this is why /about outranked /).** `https://paperhint.com`
      does not respond — its A records point away from Vercel — while every
      canonical, the sitemap and the JSON-LD named it. Site-side I have moved
      every signal to `www`, which serves. Your side, at the registrar/Vercel:
      add `paperhint.com` to the Vercel project, point its A record to Vercel
      (`76.76.21.21`), and set it to **redirect to www**. Until then the apex
      is a dead door and every link to it fails.
- [ ] **Google Search Console.** Verify the `https://www.paperhint.com`
      property, submit `https://www.paperhint.com/sitemap.xml`, and request
      indexing for `/` and `/tools`. It is the only way to see which URL
      Google actually chose as canonical — I can't see that from outside.

- [ ] **Parent-update channel.** `/pricing` says *"arrive by email"*, the brief
      says WhatsApp-style template, the site now shows a phone message from the
      school. One is current; tell me which and I align the other two.
- [ ] **/teachers headline.** *"Walk in ready, week in **h**and."* is my line,
      written to carry the house letter. Keep, or replace.
- [ ] **Console sign-in.** The grant I held now returns 401. If you rotated
      `CONSOLE_SECRET`, good — say so and I'll close this. If you didn't,
      request a fresh link and tell me whether it arrives.
- [ ] **Answer Round 1 of the Q&A** (in the thread) — the ones that unblock
      copy: #2 what makes a teacher lean in · #3 what a real week contains ·
      #4 is the reader the teacher or the principal · #5 which of the six
      "scattered" things are wrong · #8 how the rubric is set · #9 unreadable
      handwriting · #10 what the school supplies on day one · #11 the weakest
      of the ten · #13 data ownership · #14 week one · #15 a nameable pilot.
- [x] **Footer "Product" column** — now points at the ten tool pages (9 Sept).
- [ ] **Security work — go/no-go** on the three cheap fixes in section D.
- [ ] **Chat model.** `gpt-4o` first in `api/chat-models.js` if the voice
      still slips (cost call). Tamil replies are the known weak case.

## B. Content only you can supply

- [ ] **Real product screenshots** — *you said these come last.* Every tile
      panel is a composition I made; each swaps for a screenshot in one
      branch. Needed: one per essential (10), the copilot in use, the
      allotment board, the admin portal, the spec-tab mock app on the home.
- [ ] **Real quotes.** Every testimonial is a placeholder: a teacher (marking),
      a principal or office, and — if those pages return — a student and a
      parent. One nameable pilot school.
- [ ] **The application narrative** that replaces every `/* DRAFT */` line:
      h1 + standfirst + close on `/product`, `/teachers`, `/schools` (and the
      parked `/students`, `/parents` data).
- [ ] **Data & security facts** for the site's weakest section: who owns the
      data, where it lives, is anything used for training, what happens when
      a school leaves, deletion on request.
- [ ] **Week one.** A school says yes on Monday — who does setup, how long,
      what the office has to do. Same for migration of existing records.
- [ ] **An example of what a parent actually receives**, and **what a student
      sees on their record** — needed before either page comes back.
- [ ] **`og-cover.png`** social image (`assets/img/og-cover.png` is referenced
      and missing) — export the social kit's link-banner, or the gang-on-light.

## C. I can do now, on your word, no new facts needed

- [ ] **Give `/product` its own spine** — the loop (Plan → Teach → Prepare →
      Assess → See) with the period log as its hinge and the assistant as
      interface / capture / engine. Fixes the 80% duplication with the role
      pages; content already exists in `docs/modules.md`.
- [ ] **Fill `/schools` with buyer content** — rollout, migration, cost
      pointer, data, support, who else uses it. It's the page that has to
      close and the emptiest relative to that job. *(Needs B's data + week-one
      facts to be true; I can draft the shape now.)*
- [x] **Tool pages** — DONE 9 Sept: ten intent pages under `/tools/` (answer
      sheet grading, question papers, rubric, timetable, teaching notes,
      homework, attendance, copilot, school management, "best AI tools for
      schools") + a hub, each with FAQPage + SoftwareApplication schema, linked
      from the footer and the product tiles, in the sitemap. Rankings are
      Google's call; indexability and intent-match are ours and are in place.
- [ ] **Shared FAQ block** on product and role pages (MagicSchool has one on
      every page; ours is only on `/pricing`). Draftable from the brief.
- [ ] **Email templates** in `api/contact.js` — still on the old
      paperwork-first spine.
- [ ] **`/pitch` deck** — still on the old spine.
- [ ] **Chat regression scorers** — the live runner and the report rescore
      disagree (23 clean vs 0 clean on the same run). Reconcile before any
      number is quoted.
- [ ] **Compliance / data-handling page or section** — the shape now, the
      facts from B.

## D. Security — cheap, real, waiting on go

- [ ] **Security headers** in `vercel.json` — HSTS, CSP, `X-Frame-Options`,
      `Referrer-Policy`. Currently none set. ~15 lines.
- [ ] **Rate-limit `/api/console-login`** — today it can be hammered to flood
      your inbox with sign-in mails. Same pattern the chat already has.
- [ ] **Rate-limit `/api/contact`** — honeypot exists; volume limit doesn't.
- [ ] *(Later, paid)* Vercel Firewall / Attack Challenge Mode once traffic is
      real.

## E. After the first pilot exists

- [ ] **Instrument the four numbers** worth publishing: hours returned per
      teacher per week (theirs: 7–10) · sheets marked and the share the
      teacher changed · parents reached on the day · papers set per term.
- [ ] **Outcome / "why us" pages** — need evidence we don't have yet.
- [ ] **Bring `/students` and `/parents` back** only if they earn it (buyer or
      search demand). Data is kept; URLs 307 to `/product`.
- [ ] **Site copy into Supabase** (build-time or runtime fetch) once product
      branches exist — your call from 3 Sept.

## F. Housekeeping

- [ ] **Name the theme** + extract a shareable `theme.css` token sheet for
      the product.
- [ ] **Dependabot**: GitHub reports 10 vulnerabilities on the default branch
      (3 high). Audit and bump.
- [ ] **Rotate `CONSOLE_SECRET`** if not already done (I held a copy).
- [ ] Old `site/` working copy in the Personal project folder is stale —
      delete once you're sure nothing there is needed.

---

**Done this week, for the record:** repositioning across every visible
surface · section kit (tiles, drift, week, scope row) · all panels animated ·
Phase 2 as the honesty line, timetable shown, attendance restored · students
and parents parked · nav simplified · house letter in h1s · grey curl dividers
· prompt v12 aligned with the site · console tabs + filters · no native
popovers anywhere · 36-case regression filed.
