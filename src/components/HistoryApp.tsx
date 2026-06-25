import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { clearSessions, loadSessions, type SessionRecord } from "@/lib/storage";

export function HistoryApp() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  return (
    <PageShell title="Session history" back={{ to: "/", label: "Home" }}>
      {sessions.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <div className="text-base font-medium">No sessions yet</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Your completed sessions will appear here.
          </p>
          <Button asChild className="mt-6 h-12 rounded-2xl">
            <a href="/session/">Start a session</a>
          </Button>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-muted-foreground">
                      {new Date(s.date).toLocaleString()}
                    </div>
                    <div className="mt-1 text-base font-semibold">
                      {s.ear === "right" ? "Right ear" : "Left ear"} Epley
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {s.stepsCompleted}/{s.totalSteps} steps •{" "}
                      {s.completed ? "Completed" : "Stopped early"}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-2xl font-bold tabular-nums">{s.alignmentScore}</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Positioning consistency
                    </div>
                  </div>
                </div>
                {(s.symptomsBefore != null || s.symptomsAfter != null || s.outcome) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {s.symptomsBefore != null && (
                      <span className="rounded-full bg-muted px-2 py-1">
                        Before: {s.symptomsBefore}/10
                      </span>
                    )}
                    {s.symptomsAfter != null && (
                      <span className="rounded-full bg-muted px-2 py-1">
                        After: {s.symptomsAfter}/10
                      </span>
                    )}
                    {s.outcome && (
                      <span className="rounded-full bg-muted px-2 py-1 capitalize">
                        Felt {s.outcome}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Clear all locally stored sessions?")) {
                  clearSessions();
                  setSessions([]);
                }
              }}
            >
              Clear history
            </Button>
          </div>
        </>
      )}

      <p className="mt-8 text-xs text-muted-foreground">
        Reminder: if symptoms persist, worsen, or differ from previously
        diagnosed episodes, contact your clinician.
      </p>
    </PageShell>
  );
}
