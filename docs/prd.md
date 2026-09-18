---
project: bppvcoach.com
prd_version: 2
project_version: v1.A
status: live
owner: Vijo
last_updated: 2026-09-17
---

# bppvcoach.com — PRD

## 1. Problem

Recurring BPPV sufferers already self-administer the Epley maneuver from
YouTube/Reddit/Facebook, and home attempts fail on one thing static videos
can't help with: angle precision (hitting the 45°/90° reference positions).

## 2. Users

Recurring BPPV sufferers, between episodes, previously diagnosed by a
clinician (they know the term and their affected side from a prior PT/ENT
visit). Not the target: undiagnosed first-timers and people mid-attack —
routed in-product to a clinician. Audience size: not yet measured.

## 3. Goals & non-goals

**Goals:**
- Rank for low-authority, between-episode long-tail queries within 90 days.
- Become the bookmarked tool users return to when the next episode hits.
- Build an email list off a "save my profile" feature.

**Non-goals:**
- Diagnosis (which canal / which side) — routed to a clinician (Dix-Hallpike).
- Treatment-device positioning — stays an education + measurement aid, clear
  of Software-as-a-Medical-Device classification.
- The "vertigo cure" head term (Mayo/WebMD YMYL SERP).
- Monetization (telehealth referral, ENT/PT white-label) — deferred until
  traffic and an email list exist.

## 4. Versions

Two-level versioning convention (canonical: `sites/portfolio/AI_AGENTS.md`):

- `vN` = major capability tier; SemVer-MAJOR semantics.
- `vN.X` = phase letter within a tier; internal slicing.

| Version | Theme | Acceptance |
|---|---|---|
| v0 | scaffold | local builds, CF wrangler.jsonc + public/_headers in place, repo initialized |
| v1 | live angle-coaching tool + discovery | users can run a sensor-guided Epley session on their phone; pages indexed; long-tail content + profile/email capture ship |

## 5. Phases

Order of v1.B / v1.C is not yet decided (see § 6).

| Phase | Theme | Features | Status |
|---|---|---|---|
| **v0.A** | scaffolded | `portfolio new bootstrap` ran; standard files written; git initialized | ✅ |
| **v1.A** | tool live | TanStack Start → static Astro port; `/` landing, `/session` (sensor-guided Epley, per-ear protocol in `src/lib/maneuvers.ts`, voice prompts), `/history` (localStorage session records), `/how-it-works`, `/diagnostics` (sensor check); `@astrojs/sitemap`; `/sitemap.xml` fix (`cc777bf`); GSC property verified | ✅ |
| **v1.B** | long-tail content pages | static Astro pages for tool-as-answer queries ("how do I know I'm at 45 degrees for Epley", "how to know if the Epley worked", "BPPV keeps coming back"); diagnostic queries routed to a clinician | planned |
| **v1.C** | save my profile + email capture | persist side, PT-prescribed maneuver, angle reference; email capture for the between-episode list | planned |

## 6. Open questions

- *(append-only log; mark answered with date but never delete)*
- 2026-09-17 — v1.B (content) vs v1.C (profile/email) first? Open.
- 2026-09-17 — `/session` step copy is imperative ("Sit upright and turn your head…"). Does that square with the "never tells anyone to perform a maneuver" positioning in `AI_AGENTS.md`? Open.
- 2026-09-17 — Email capture needs a backend/provider; site is `output: 'static'` (see `src/lib/server-todo.md`). Which provider? Open.
- 2026-09-17 — `/history/` is "Discovered – currently not indexed" in GSC (inspection 2026-09-13). It's a per-user localStorage view — should it be `noindex` / dropped from the sitemap? Open.
