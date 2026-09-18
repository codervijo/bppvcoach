# Prompt History — bppvcoach.com

<!-- Append new prompts at the bottom, newest last. Format:

## YYYY-MM-DD [optional title]
> <prompt text or short summary>

The dated H2 (`## YYYY-MM-DD`) is what `portfolio project check` parses
to surface "last AI prompt" per project. Keep entries append-only.
-->

## 2026-06-24 — scaffolded via portfolio new bootstrap

> Created project skeleton. Stack chosen, scaffolding written, git initialized.

## 2026-09-17 — v1.A docs catch-up: PRD, live data, growth review

> "whats next" → "yes do PRD and prompt updates" + "also update the site with anymore live data"

- Committed `pnpm-lock.yaml` (`7d6f387`).
- `docs/prd.md`: filled in problem/users/goals from `AI_AGENTS.md`; v1.A (tool live) ✅, v1.B (long-tail content) and v1.C (profile + email capture) planned, order open.
- `AI_AGENTS.md`: Live URL confirmed; post-deploy checklist ticked; added a live GSC state block from `sites/portfolio/data/`.
- `docs/growth.md`: late review of the 2026-06-24 entry; status → testing, re-review 2026-10-15.

## 2026-09-17 — v1.B long-tail content pages

> "do v1.B content pages first"

- Targets (from Google autocomplete; Ahrefs out of units): `epley maneuver angles`, `how do i know if the epley maneuver worked`, `bppv keeps coming back`.
- Added `/guides/` hub + 3 guides, `src/layouts/Guide.astro` (Article + BreadcrumbList + FAQPage JSON-LD), `src/lib/guides.mjs` registry, `noindex` prop + head slot on `Layout.astro`, sitemap filter in `astro.config.mjs`.
- Sources: StatPearls (Epley), Cleveland Clinic, AAO-HNS 2017 CPG, Dorigueto et al. (recurrence), Rhim & Kim 2024 (vitamin D). Unsourced claims marked `[VERIFY]`; all guides ship `noindex` until clinician-reviewed.
- `vitest.config.js` env `jsdom` → `node` (jsdom was never installed; suite was failing). Added `src/__tests__/guides.test.js`.
