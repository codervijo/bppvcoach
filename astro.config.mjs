// astro.config.mjs
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { unreviewedUrls } from './src/lib/guides.mjs';

const SITE = 'https://bppvcoach.com';
const excluded = new Set(unreviewedUrls(SITE));

export default defineConfig({
  site: SITE,
  // trailingSlash: 'always' — directory format serves /<page>/ and
  // @astrojs/sitemap lists /<page>/, so a page's <link rel="canonical">
  // MUST also end in a slash. A canonical of /<page> (no slash) 308-redirects
  // to /<page>/ — Google then can't settle on a canonical and the page comes
  // back "URL is unknown to Google". Make it explicit so every page's
  // canonical matches its served URL. Enforced by CHECK_161.
  trailingSlash: 'always',
  // @astrojs/react renders the ported React islands; @tailwindcss/vite is the
  // Tailwind v4 toolchain the source uses (styles.css does `@import "tailwindcss"`).
  // Unreviewed guides render noindex and stay out of the sitemap (src/lib/guides.mjs).
  integrations: [sitemap({ filter: (page) => !excluded.has(page) }), react()],
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Mirror the source's `@/*` -> `src/*` path alias so ported imports resolve.
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  },
});
