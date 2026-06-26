import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How BPPVCoach works" },
      {
        name: "description",
        content:
          "How BPPVCoach uses phone motion sensors to guide a previously prescribed Epley maneuver.",
      },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <PageShell title="How it works" back={{ to: "/", label: "Home" }}>
      <ol className="space-y-5">
        {[
          {
            t: "Confirm it’s safe for you today",
            d: "Quick checklist for red-flag symptoms and contraindications. If anything is flagged, the session stops and we direct you to professional care.",
          },
          {
            t: "Select the affected ear",
            d: "Pick the side your clinician previously identified. BPPVCoach does not determine which canal is affected.",
          },
          {
            t: "Secure your phone",
            d: "Use a soft headband or supported mount to hold the phone flat against your forehead. Don’t hold it in your hand during the maneuver.",
          },
          {
            t: "Calibrate",
            d: "Sit upright, face forward, and tap calibrate. This sets your neutral position.",
          },
          {
            t: "Follow the guided steps",
            d: "Each position shows an illustration, a short instruction, and a large alignment indicator. Green means you’re in range. Hold until the timer finishes.",
          },
          {
            t: "Record symptoms",
            d: "After the session, rate your symptoms. Results are stored locally on your device.",
          },
        ].map((s, i) => (
          <li key={s.t} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground font-semibold">
                {i + 1}
              </div>
              <div className="min-w-0">
                <div className="text-base font-semibold">{s.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-warning/40 bg-warning/10 p-5 text-sm">
        <div className="font-semibold">Not a clinical device</div>
        <p className="mt-1 text-muted-foreground">
          BPPVCoach provides positioning feedback only and does not claim
          clinical-grade accuracy. It does not diagnose vertigo, determine which
          canal is affected, or treat any condition.
        </p>
      </div>

      <div className="mt-8">
        <Link
          to="/session"
          className="inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-6 text-base font-medium text-primary-foreground"
        >
          Start a guided session
        </Link>
      </div>
    </PageShell>
  );
}
