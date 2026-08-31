# Paperhint — product website

Marketing site for **Paperhint**: complete school software (admin + teachers + students + parents).
This brief captures every decision made so far. Build into `site/`.

## Product spec (source of truth)
- Schools manage all resources & details for teachers/students A to Z: timetable creation, school calendar sync, full academics, digital library of class notes & books — everything digitised.
- Teachers: create question papers, prepare notes, build a knowledge base/library, use it to generate content & teaching strategy; map performance of their students.
- Students: performance calculated & shared; notes visibility.
- Parents: email trigger notifications for marks, homework, and general performance overviews shared by teachers.

## Pages
1. **index.html** — Home
   1. Hero banner (refs: retool.com, wisprflow.ai, amplemarket.com) with beautiful font pairing
   2. Interactive element tied to product spec + product screen (tabbed mock app: Timetable / Academics / Library / Question papers / Parent connect)
   3. Teacher testimonials as stacked rotating cards (PLACEHOLDER quotes — replace with real ones before launch)
   4. Product capabilities per role as "folders" — folder-tab cards for Admins / Teachers / Students / Parents; app image right, spec text left, gaussian-blurred gradient tint + noise behind
   5. Contact-us banner with enquiry types (links to contact.html?type=…)
   6. Footer (big ghost wordmark)
2. **pricing.html** — placeholder tiers in ₹: Starter / School (highlighted) / District, plus small FAQ
3. **contact.html** — enquiry-type selector (Book a demo / Pricing / Partnership / Support), form + "what happens next" steps; front-end only for now

## Design system
- Base: **ivory** `#FAF7F0` (soft `#F3EEE2`) · Accent: **emerald** `#0B8A5C` (dark-mode emerald `#31D492`)
- Dark theme: near-black forest `#0A0F0C`, surfaces `#121A15`, ivory text `#F2EEE3`
- Theme: light by default, toggle via `data-theme="dark"` on <html>; CSS custom properties already tokenised
- Fonts: **Fraunces** (display, opsz 72, soft) + **Inter** (body/UI) via Google Fonts
- Gradient map (Amplemarket-style): orange `#FF8A3D` + yellow `#FFD84D` + violet `#7C5CFF` + emerald mixed, blurred blobs + SVG noise grain overlay
- Hero animated gradient: **NEAT by FireCMS** (https://neat.firecms.co, `@firecms/neat` via CDN/esm) on a canvas, with the CSS blob gradient as no-JS fallback. Suggested colors: emerald #0B8A5C, yellow #FFD84D, orange #FF8A3D, violet #7C5CFF, ivory #FAF7F0; subtle speed, grainIntensity ~0.12.
- `site/assets/css/style.css` already contains the full design system + all component styles (nav pill, hero, spec tabs + mock app, testimonial deck, role folders, CTA banner, footer, pricing cards, contact form, responsive) — build the HTML against it.

## Image slots (Shrivathsan makes these in Midjourney, may animate)
Drop into `site/assets/img/…`; gradients are the stand-ins until then:
- `hero/` — optional hero backdrop or floating product still (NEAT canvas may be enough)
- `roles/admin.png|teacher.png|student.png|parent.png` — one visual per role folder card (right side, ~4:3)
- `testimonials/` — teacher avatar portraits (square)
- product screenshots for the interactive spec tabs once real app screens exist

## Decisions log
- Delivery: plain multi-page static files in this folder (no framework)
- Default theme: light (ivory); manual toggle; do NOT rely on localStorage in preview contexts (wrap in try/catch if persisting)
- Pricing: placeholder ₹ tiers, clearly swappable
- Testimonials: placeholder names/schools until real quotes provided

## Requirements tracker (founder asks → status)
- [x] Header: frosted glass, near-white, gradient tints + noise inside the bar
- [x] Header: silhouette morphs into the rosette logo shape at BOTH ends (mask caps)
- [x] Header: no drop shadow; caps bloom from inside the bar on load; no Home tab
- [x] Logo: bare rosette (no filled box), grow + spin on load, centred in the left cap
- [x] Hero: founder's Figma composition — band curve framing a 585px centered lockup
- [x] H1 "Run the *w*hole school / on one page" — 56px max, Geist Medium, lowercase serif-italic w only
- [x] Email capture pill + one quiet note line (Amplemarket lockup); prefills contact form
- [x] Band: ONE shape (founder's looping sketch), path drawn dynamically to the live hero box
- [x] Band: text rides the looping path as a seamless marquee (Wispr mechanic, 34px band / 18px text)
- [x] Band: colour is text-relative (currentColor from the display ink token)
- [x] Band: liquid mesh warp near the cursor (per-glyph dy/rotate/swell — no SVG filters; the
      feTurbulence/feDisplacement approach locked up and was replaced)
- [x] Fonts: Geist everywhere + Merriweather italic accents only (Amplemarket itself uses
      licensed Labil Grotesk — not adoptable; Geist confirmed by founder)
- [x] Ground: Amplemarket near-white (#FCFBF8), not Wispr beige; global film grain; theme-reactive
- [x] NEAT: founder's exact ribbon config, brand palette, scroll-reactive, dark rebuild
- [x] Stickers: founder's sheet cut into 23 transparent die-cuts (no heart, no animated strip)
- [x] Gravity: Matter.js layer, 10 die-cut characters, drag + flick, bottom-right lean
- [x] Gravity: scroll-down never lifts them; scroll-up = weighted nudge with velocity ceiling
- [x] Roles: Amplemarket "revenue heroes" folder — role tabs + shared panel, sticker per role
- [x] Scribble/highlight accents beside section headings (draw in on reveal)
- [x] Spec widget: fixed height, no reflow between tabs
- [x] SEO: canonical, OG/Twitter meta, JSON-LD, robots.txt, sitemap.xml, lazy stickers
- [x] Repo: github.com/Paperhint2026/paperhint-site (project at root, history kept)
- [x] Nav choreography: boots as spinning rosette then expands; folds to the centered
      rosette on scroll-down; opens on scroll-up or hover; mark stays emerald and
      re-spins on every fold
- [x] Mascots reduced: 3 on phones / 5 on desktop, +1 per extra ~1500px of page, cap 10;
      all art from the transparent sticker sheet (stickers-2.png) — old sheet deleted
- [x] Ask-Paperhint chat placeholder centered in the hero — swappable brain at
      window.PaperhintChat.adapter (canned answers now, AI endpoint later)
- [x] Section 2 rebuilt as Amplemarket-style folder-card grid (5 cards, kicker tabs,
      mini product visuals inside)
- [x] One responsive band system: dynamic loop on desktop, sweep BELOW the lockup on
      phones; old arc band deleted; ribbon viewBox has stroke headroom (no cropping)
- [x] Green frost tint falling from the top edge under the nav
- [ ] Real teacher testimonial quotes + detailed product reviews (founder preparing
      product documentation — testimonials rework waits on it)
- [ ] og-cover.png social image (referenced at assets/img/og-cover.png — needs the artwork)
- [ ] Name the theme + extract shareable theme.css token sheet for the product
- [ ] Amplemarket font-size structure audit across ALL sections (H1 done; verify H2/H3/body vs theirs)
- [ ] Real product screenshots to replace the mock app in the spec tabs
