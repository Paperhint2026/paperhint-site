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
