# Server-side code dropped during the TanStack Start → Astro port

The source (`genai/`) was a **TanStack Start** SSR app. Astro here is configured
for **static output** (`output: 'static'`), so the framework-specific server
runtime does not translate. The following were intentionally **not** ported.
Each is a `TODO:` for if/when this site needs a server runtime.

## SSR runtime / error wrappers (dropped — no static equivalent)

- `genai/src/server.ts` — Cloudflare/h3 `fetch` server entry that wraps SSR and
  renders a custom 500 page. **TODO:** only relevant if the site moves to SSR.
- `genai/src/start.ts` — `createStart()` + request middleware that catches
  server errors. **TODO:** no Astro equivalent under static output.
- `genai/src/lib/error-capture.ts`, `error-page.ts`,
  `lovable-error-reporting.ts` — SSR error capture + the Lovable error-overlay
  reporter. **TODO:** drop unless a server runtime is reintroduced.
- `genai/src/router.tsx`, `genai/src/routeTree.gen.ts`,
  `genai/src/routes/__root.tsx` — TanStack Router wiring. Replaced by Astro
  file-based routing + `src/layouts/Layout.astro`. The `<head>` meta / fonts
  from `__root.tsx` were preserved in `Layout.astro`.

## Route handler (replaced by an integration)

- `genai/src/routes/sitemap[.]xml.ts` — a TanStack `server.handlers.GET` that
  emitted `/sitemap.xml`. **Replaced** by the `@astrojs/sitemap` integration
  already wired in `astro.config.mjs` (it generates the sitemap at build time).
  The source listed these routes: `/`, `/how-it-works`, `/session`, `/history`
  — all of which now exist as static pages, so the integration covers them.

## Notes

- All operator-visible pages (`/`, `/how-it-works`, `/session`, `/history`,
  `/diagnostics`) are ported. The interactive screens (session, history,
  diagnostics) are mounted as React islands (`client:load` / `client:only`).
- No business logic was lost: motion sensors, the Epley protocol, local-storage
  session records, and speech synthesis all run client-side and were ported
  verbatim under `src/lib/`.
