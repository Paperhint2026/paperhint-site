# Paperhint — product site

Complete school software for admins, teachers, students and parents.
Plain static multi-page site: no framework, no build step.

## Layout

```
site/                 the deployable site (publish this directory)
  index.html          home
  pricing.html        pricing
  contact.html        contact / enquiry
  assets/css/         design system (single stylesheet, tokenised)
  assets/js/          main.js (behaviours) · gravity.js (sticker physics)
  assets/img/         logo, sticker die-cuts, image slots
CLAUDE.md             design brief and decisions log
```

## Run locally

```bash
python3 -m http.server 4180 --directory site
```

Then open http://localhost:4180.

## Deploying

The site is fully static — point any host at the `site/` directory.
On Vercel or Netlify set the publish/output directory to `site`.

## Notes

- Theme: light by default, `data-theme="dark"` on `<html>` toggles dark.
- Type: Geist (display + UI) with Merriweather italic accents only.
- Testimonial quotes are PLACEHOLDERS pending real teacher quotes.
