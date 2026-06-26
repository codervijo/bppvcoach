import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BPPVCoach — Guided positioning for your prescribed Epley maneuver" },
      {
        name: "description",
        content:
          "Sensor-guided head-positioning companion for adults previously diagnosed with posterior-canal BPPV. Educational only — not a diagnostic tool.",
      },
      { property: "og:title", content: "BPPVCoach — Guided Epley positioning" },
      {
        property: "og:description",
        content:
          "Real-time head positioning feedback for a previously prescribed Epley maneuver.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <PageShell>
      <section className="pt-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-accent/40 px-3 py-1 text-xs font-medium text-accent-foreground">
          <span className="h-2 w-2 rounded-full bg-info" aria-hidden /> Educational
          positioning assistant
        </div>
        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Real-time positioning guidance for your prescribed Epley maneuver.
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          Use your phone’s motion sensors to follow each head position more
          consistently. For adults who already know which ear is affected and
          have been advised by a qualified clinician to perform the Epley
          maneuver.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-14 rounded-2xl text-base">
            <Link to="/session">Start guided session</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 rounded-2xl text-base">
            <Link to="/how-it-works">Learn how it works</Link>
          </Button>
        </div>

        <p className="mt-6 rounded-2xl border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Important.</strong> BPPVCoach does
          not diagnose vertigo or replace a clinician. Use it only for a
          maneuver previously recommended for you. Stop and seek urgent care for
          new weakness, numbness, speech difficulty, fainting, severe headache,
          chest pain, or inability to walk.
        </p>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            t: "Calibrate",
            d: "Set your neutral head position before each session.",
          },
          {
            t: "Follow",
            d: "Color-coded feedback shows when you’re in target alignment.",
          },
          {
            t: "Record",
            d: "Track symptoms and positioning consistency locally on your device.",
          },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border bg-card p-5">
            <div className="text-base font-semibold">{c.t}</div>
            <div className="mt-1 text-sm text-muted-foreground">{c.d}</div>
          </div>
        ))}
      </section>

      <section className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link
          to="/history"
          className="rounded-full border px-4 py-2 text-muted-foreground hover:bg-accent"
        >
          Session history
        </Link>
        <Link
          to="/diagnostics"
          className="rounded-full border px-4 py-2 text-muted-foreground hover:bg-accent"
        >
          Developer diagnostics
        </Link>
      </section>
    </PageShell>
  );
}
