// Guide registry — single source for the /guides/ hub, related links, and the
// sitemap filter in astro.config.mjs. `reviewed: false` means no clinician has
// signed off yet: the page renders `noindex` and is left out of the sitemap.
// Flip to true only after the reviewer placeholder on the page is filled and
// every [VERIFY] marker is resolved.

export const guides = [
  {
    path: "/guides/epley-maneuver-angles/",
    title: "Epley maneuver angles: how far to turn and tilt your head",
    blurb: "The 45°, head-hang, 90° and roll positions — and why they're hard to judge from inside your own head.",
    reviewed: false,
  },
  {
    path: "/guides/did-the-epley-maneuver-work/",
    title: "How do I know if the Epley maneuver worked?",
    blurb: "What success feels like, what leftover dizziness means, and when a failed attempt means see someone.",
    reviewed: false,
  },
  {
    path: "/guides/bppv-keeps-coming-back/",
    title: "Why BPPV keeps coming back",
    blurb: "How often it recurs, what's linked to recurrence, and how to be ready for the next episode.",
    reviewed: false,
  },
];

export const hubPath = "/guides/";

/** Absolute URLs that must stay out of the sitemap until reviewed. */
export function unreviewedUrls(site) {
  const out = guides.filter((g) => !g.reviewed).map((g) => `${site}${g.path}`);
  // The hub is thin until at least one guide is reviewed.
  if (guides.every((g) => !g.reviewed)) out.push(`${site}${hubPath}`);
  return out;
}
