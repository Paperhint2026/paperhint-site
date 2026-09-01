import { defineConfig } from 'astro/config';

// Astro source lives at repo root; build output goes to ./site so Vercel keeps
// its existing publish directory. `build.format: 'file'` preserves the current
// `.html` URLs (about.html, pricing.html, contact.html) that are already
// indexed and referenced by the canonical tags on each page.
export default defineConfig({
  site: 'https://paperhint.com',
  outDir: './site',
  publicDir: './public',
  srcDir: './src',
  build: {
    format: 'directory',
    assets: '_astro',
  },
  trailingSlash: 'never',
  redirects: {
    '/capabilities': '/#capabilities',
  },
});
