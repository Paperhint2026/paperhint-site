# Content still needed

Generated from `src/data/roles.js` — the same data the pages render, so
this list cannot drift from what is actually on them. Regenerate with:

    npm run content-todo

Every page below is live and linked. What is missing is copy, not
plumbing. Anything marked DRAFT in `src/data/roles.js` is mine and is
meant to be replaced by the application narrative.

## /product

Content source: `docs/feature-list.md` (approved) — 14 features in 3 groups

- [ ] Headline, standfirst and closing line
- [ ] A screenshot per feature group
- [ ] Whether the copilot is one product or two (teacher and office)

## /teachers

Narrative source: `api/chat-content.js` → `STORIES.teacher` (approved)

- [ ] Headline and standfirst
- [ ] Closing line
- [ ] A product screenshot per beat
- [ ] A quote from a real teacher, for this page

## /schools

Narrative source: `api/chat-content.js` → `STORIES.admin` (approved)
Second movement: `STORIES.principal` (approved), framed as the case for the school

- [ ] Headline and standfirst
- [ ] Closing line
- [ ] A screenshot of the allotment board and the admin portal
- [ ] A quote from a real school office or principal, for this page

## /students  — reads thin in public

Narrative source: **none yet** — scene and beats are built from `docs/feature-list.md` and stand in

- [ ] The whole narrative — scene, turn and beats
- [ ] Headline and standfirst
- [ ] What a student actually sees on their record
- [ ] Whether students get their own login
- [ ] A quote from a real student, for this page

## /parents

Narrative source: `api/chat-content.js` → `STORIES.parent` (approved)

- [ ] Headline and standfirst
- [ ] Closing line
- [ ] An example of what a parent actually receives
- [ ] A quote from a real parent, for this page

## Not a role page

- [ ] Real teacher testimonials, to replace the placeholder deck on the home page
- [ ] Real product screenshots, to replace the mock app in the spec tabs
- [ ] og-cover.png, the social image referenced at `assets/img/og-cover.png`

## How the notes work

A page waiting on its narrative shows a quiet **More on this soon** pill in
public. The full per-page list of what is missing renders only on preview
deploys and locally, so a visiting school is never told it is reading a
draft. Set `thin: false` in `src/data/roles.js` when a page is finished, and
delete its `needs` entries as they land.
