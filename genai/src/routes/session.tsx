import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { AlignmentIndicator } from "@/components/AlignmentIndicator";
import { Button } from "@/components/ui/button";
import { evaluateAlignment, useSensors } from "@/lib/sensors";
import { getEpleyProtocol, type Ear } from "@/lib/maneuvers";
import { saveSession } from "@/lib/storage";
import { isVoiceEnabled, setVoiceEnabled, speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/session")({
  head: () => ({
    meta: [
      { title: "Guided session — BPPVCoach" },
      {
        name: "description",
        content:
          "Sensor-guided Epley positioning session for adults with a previously diagnosed posterior-canal BPPV episode.",
      },
    ],
  }),
  component: SessionPage,
});

type Phase =
  | "safety"
  | "ear"
  | "setup"
  | "calibrate"
  | "guided"
  | "completion"
  | "blocked";

const RED_FLAGS = [
  "New weakness, numbness, facial drooping, speech difficulty, fainting, severe headache, chest pain, or inability to walk",
  "Recent neck or spine injury",
  "Severe cervical arthritis",
  "Vascular disease affecting the neck",
  "Recent eye surgery",
  "Severe mobility limitations",
  "Vertigo that has never been evaluated by a clinician",
];

function SessionPage() {
  const [phase, setPhase] = useState<Phase>("safety");
  const [ear, setEar] = useState<Ear | null>(null);
  const [mock, setMock] = useState(false);
  const [manual, setManual] = useState(false);

  return (
    <PageShell title="Guided session" back={{ to: "/", label: "Exit" }}>
      {phase === "safety" && (
        <SafetyPhase
          onPass={() => setPhase("ear")}
          onBlock={() => setPhase("blocked")}
        />
      )}
      {phase === "blocked" && <Blocked />}
      {phase === "ear" && (
        <EarPhase
          onPick={(e) => {
            setEar(e);
            setPhase("setup");
          }}
        />
      )}
      {phase === "setup" && ear && (
        <SetupPhase
          onContinue={() => setPhase("calibrate")}
          mock={mock}
          setMock={setMock}
          manual={manual}
          setManual={setManual}
        />
      )}
      {phase === "calibrate" && ear && (
        <CalibratePhase
          mock={mock}
          manual={manual}
          onDone={() => setPhase("guided")}
        />
      )}
      {phase === "guided" && ear && (
        <GuidedPhase
          ear={ear}
          mock={mock}
          manual={manual}
          onComplete={() => setPhase("completion")}
        />
      )}
      {phase === "completion" && ear && <CompletionPhase ear={ear} />}
    </PageShell>
  );
}

/* ---------------- Safety ---------------- */

function SafetyPhase({
  onPass,
  onBlock,
}: {
  onPass: () => void;
  onBlock: () => void;
}) {
  const [confirmedDiagnosis, setConfirmedDiagnosis] = useState(false);
  const [flags, setFlags] = useState<boolean[]>(() => RED_FLAGS.map(() => false));

  const anyFlag = flags.some(Boolean);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5">
        <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Before you begin
        </div>
        <p className="mt-2 text-base leading-relaxed">
          BPPVCoach does not diagnose vertigo or replace a clinician. Use it only
          for a maneuver previously recommended for you.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-[var(--color-primary)]"
            checked={confirmedDiagnosis}
            onChange={(e) => setConfirmedDiagnosis(e.target.checked)}
          />
          <span className="text-base">
            I have been diagnosed by a qualified clinician with{" "}
            <strong>posterior-canal BPPV</strong> and advised to perform the
            Epley maneuver.
          </span>
        </label>
      </div>

      <div className="space-y-3">
        <div className="text-base font-semibold">
          Do any of these apply to you right now?
        </div>
        {RED_FLAGS.map((q, i) => (
          <label
            key={q}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-4 transition",
              flags[i] && "border-destructive bg-destructive/5"
            )}
          >
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[var(--color-destructive)]"
              checked={flags[i]}
              onChange={(e) =>
                setFlags((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))
              }
            />
            <span className="text-base leading-snug">{q}</span>
          </label>
        ))}
      </div>

      <div className="sticky bottom-4 flex gap-3">
        <Button
          size="lg"
          className="h-14 flex-1 rounded-2xl text-base"
          disabled={!confirmedDiagnosis}
          onClick={() => (anyFlag ? onBlock() : onPass())}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function Blocked() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
        <div className="text-lg font-semibold">Please seek medical evaluation</div>
        <p className="mt-2 text-sm leading-relaxed">
          Based on your answers, BPPVCoach is not the right tool for you right now.
          The symptoms or history you indicated should be evaluated by a
          qualified clinician before performing any positioning maneuver. If you
          have urgent symptoms such as weakness, speech difficulty, severe
          headache, or chest pain, contact emergency services.
        </p>
      </div>
      <Button asChild variant="outline" className="h-12 rounded-2xl">
        <Link to="/">Return home</Link>
      </Button>
    </div>
  );
}

/* ---------------- Ear ---------------- */

function EarPhase({ onPick }: { onPick: (e: Ear) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-base font-semibold">Which side did your clinician identify?</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the side previously identified by your clinician. BPPVCoach does
          not determine which canal is affected.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(["left", "right"] as Ear[]).map((e) => (
          <button
            key={e}
            onClick={() => onPick(e)}
            className="flex h-40 flex-col items-center justify-center gap-2 rounded-3xl border-2 bg-card text-xl font-semibold transition hover:border-primary hover:bg-primary/5"
          >
            <span className="text-4xl">{e === "left" ? "👂↺" : "↻👂"}</span>
            <span className="capitalize">{e} ear</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Setup ---------------- */

function SetupPhase({
  onContinue,
  mock,
  setMock,
  manual,
  setManual,
}: {
  onContinue: () => void;
  mock: boolean;
  setMock: (v: boolean) => void;
  manual: boolean;
  setManual: (v: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <div className="text-base font-semibold">Secure your phone</div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Place the phone flat against your forehead using a soft elastic
          headband or supported mount. The screen should face up and away from
          your face, top edge toward the crown of your head.
        </p>
        <div className="mt-4 grid place-items-center rounded-2xl border-2 border-dashed bg-muted/40 p-6 text-6xl">
          🧑‍🦰📱
        </div>
        <div className="mt-4 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
          <strong>Do not</strong> hold the phone in your hand during the
          maneuver. Your hands should be free.
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="text-base font-semibold">Sensors</div>
        <p className="mt-1 text-sm text-muted-foreground">
          On the next screen you may be asked to grant access to motion
          sensors. If sensors aren’t available you can use manual mode with
          illustrations and timers.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant={manual ? "default" : "outline"}
            onClick={() => setManual(!manual)}
          >
            {manual ? "Manual mode on" : "Use manual mode"}
          </Button>
          <Button
            variant={mock ? "default" : "outline"}
            onClick={() => setMock(!mock)}
          >
            {mock ? "Mock sensors on" : "Mock sensors (desktop)"}
          </Button>
        </div>
      </div>

      <Button size="lg" className="h-14 w-full rounded-2xl text-base" onClick={onContinue}>
        Continue to calibration
      </Button>
    </div>
  );
}

/* ---------------- Calibrate ---------------- */

function CalibratePhase({
  mock,
  manual,
  onDone,
}: {
  mock: boolean;
  manual: boolean;
  onDone: () => void;
}) {
  const s = useSensors({ mock });
  const [requested, setRequested] = useState(false);
  const [steady, setSteady] = useState(0);

  useEffect(() => {
    if (manual) return;
    if (!s.support.needsPermission) setRequested(true);
  }, [s.support.needsPermission, manual]);

  useEffect(() => {
    if (manual) return;
    if (s.motion.angularVelocity < 8 && s.smoothed.available) {
      setSteady((v) => Math.min(v + 1, 30));
    } else {
      setSteady(0);
    }
  }, [s.motion.angularVelocity, s.smoothed.available, manual]);

  if (manual) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-base font-semibold">Manual mode</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Calibration isn’t needed in manual mode. You’ll be guided through
            each position with illustrations and timers.
          </p>
        </div>
        <Button size="lg" className="h-14 w-full rounded-2xl" onClick={onDone}>
          Start the maneuver
        </Button>
      </div>
    );
  }

  if (s.support.needsPermission && !requested) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-base font-semibold">Allow motion access</div>
          <p className="mt-1 text-sm text-muted-foreground">
            BPPVCoach needs access to your phone’s motion sensors to provide live
            positioning feedback. The data stays on your device.
          </p>
        </div>
        <Button
          size="lg"
          className="h-14 w-full rounded-2xl"
          onClick={async () => {
            const ok = await s.requestPermission();
            setRequested(true);
            if (!ok) {
              alert(
                "Motion access was not granted. You can continue in manual mode."
              );
            }
          }}
        >
          Grant access
        </Button>
      </div>
    );
  }

  if (!s.smoothed.available && requested) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
          <div className="text-base font-semibold">Sensors unavailable</div>
          <p className="mt-1 text-sm text-muted-foreground">
            We can’t read motion data on this device. Switch to manual mode to
            continue with illustrations and timers.
          </p>
        </div>
        <Button size="lg" className="h-14 w-full rounded-2xl" onClick={onDone}>
          Continue in manual mode
        </Button>
      </div>
    );
  }

  const ready = steady >= 12;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-base font-semibold">Sit upright, face forward, and remain still.</div>
        <p className="mt-1 text-sm text-muted-foreground">
          We’ll set this as your neutral position.
        </p>
      </div>
      <div className="flex justify-center">
        <div
          className={cn(
            "grid h-56 w-56 place-items-center rounded-full ring-8 transition-colors",
            ready ? "ring-success bg-success/15" : "ring-muted-foreground/30 bg-muted"
          )}
        >
          <div className="text-center">
            <div className="text-5xl">🧘</div>
            <div className="mt-2 text-sm font-medium uppercase tracking-wide">
              {ready ? "Steady" : "Hold still..."}
            </div>
          </div>
        </div>
      </div>
      <Button
        size="lg"
        disabled={!ready}
        className="h-14 w-full rounded-2xl text-base"
        onClick={() => {
          s.calibrate();
          onDone();
        }}
      >
        Calibrate
      </Button>
    </div>
  );
}

/* ---------------- Guided ---------------- */

interface StepStats {
  totalSamples: number;
  inRangeSamples: number;
  movementSum: number;
  movementCount: number;
  completed: boolean;
}

function GuidedPhase({
  ear,
  mock,
  manual,
  onComplete,
}: {
  ear: Ear;
  mock: boolean;
  manual: boolean;
  onComplete: () => void;
}) {
  const navigate = useNavigate();
  const steps = useMemo(() => getEpleyProtocol(ear), [ear]);
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(steps[0].holdSeconds);
  const [paused, setPaused] = useState(false);
  const [voice, setVoice] = useState(isVoiceEnabled());
  const [showDiag, setShowDiag] = useState(false);
  const s = useSensors({ mock });

  const statsRef = useRef<StepStats[]>(
    steps.map(() => ({
      totalSamples: 0,
      inRangeSamples: 0,
      movementSum: 0,
      movementCount: 0,
      completed: false,
    }))
  );

  const step = steps[idx];
  const evalRes = manual
    ? { state: "gray" as const, pitchDelta: 0, rollDelta: 0 }
    : evaluateAlignment(
        s.calibrated,
        step.targetPitch,
        step.targetRoll,
        step.pitchTolerance,
        step.rollTolerance
      );

  // Speak instruction at step change
  useEffect(() => {
    setRemaining(step.holdSeconds);
    speak(step.voicePrompt);
  }, [idx, step]);

  // Sample stats
  useEffect(() => {
    if (manual) return;
    const cur = statsRef.current[idx];
    cur.totalSamples += 1;
    if (evalRes.state === "green") cur.inRangeSamples += 1;
    cur.movementSum += s.motion.angularVelocity;
    cur.movementCount += 1;
  }, [s.smoothed.timestamp, idx, manual, evalRes.state, s.motion.angularVelocity]);

  // Timer: counts down only when (in target OR manual) AND not paused
  useEffect(() => {
    if (paused) return;
    const tickOk = manual || evalRes.state === "green";
    if (!tickOk) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 0.1) {
          window.clearInterval(id);
          return 0;
        }
        return Math.max(0, r - 0.1);
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [paused, manual, evalRes.state, idx]);

  useEffect(() => {
    if (remaining <= 0) {
      statsRef.current[idx].completed = true;
      if (idx + 1 < steps.length) {
        setIdx(idx + 1);
      } else {
        finalize(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  function finalize(completed: boolean) {
    const totalSteps = steps.length;
    const stepsCompleted = statsRef.current.filter((x) => x.completed).length;
    // Positioning consistency: weighted across completed-step in-range %, stability, completion
    const inRangePct =
      statsRef.current.reduce((acc, st) => {
        if (st.totalSamples === 0) return acc;
        return acc + st.inRangeSamples / st.totalSamples;
      }, 0) / totalSteps;
    const avgMovement =
      statsRef.current.reduce(
        (acc, st) => acc + (st.movementCount ? st.movementSum / st.movementCount : 0),
        0
      ) / totalSteps;
    const stability = Math.max(0, 1 - avgMovement / 90); // 90 deg/s = 0
    const completionPct = stepsCompleted / totalSteps;
    const score = manual
      ? Math.round(completionPct * 100)
      : Math.round(
          (inRangePct * 0.55 + stability * 0.2 + completionPct * 0.25) * 100
        );

    saveSession({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ear,
      completed,
      stepsCompleted,
      totalSteps,
      alignmentScore: Math.max(0, Math.min(100, score)),
    });
    onComplete();
  }

  const pct = ((idx + (1 - remaining / step.holdSeconds)) / steps.length) * 100;

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {idx + 1} of {steps.length}
          </span>
          <span className="capitalize">{ear} ear · Epley</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border bg-card p-5">
        <div className="grid place-items-center rounded-2xl bg-muted/40 py-6 text-6xl">
          {step.illustration}
        </div>
        <div className="mt-4 text-xl font-semibold leading-snug">{step.title}</div>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          {step.instruction}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-3xl border bg-card p-5">
        <AlignmentIndicator
          state={manual ? "gray" : evalRes.state}
          pitchDelta={evalRes.pitchDelta}
          rollDelta={evalRes.rollDelta}
          available={!manual && s.calibrated.available}
        />
        <div className="text-center">
          <div className="text-6xl font-bold tabular-nums">
            {Math.ceil(remaining)}
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            seconds {manual ? "remaining" : "in target"}
          </div>
        </div>
        {!manual && evalRes.state !== "green" && (
          <div className="text-xs text-muted-foreground">
            Timer pauses until you’re in position.
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          className="h-14 rounded-2xl"
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button
          variant="outline"
          className="h-14 rounded-2xl"
          onClick={() => {
            const next = !voice;
            setVoice(next);
            setVoiceEnabled(next);
          }}
        >
          {voice ? "Voice on" : "Voice off"}
        </Button>
        <Button
          variant="outline"
          className="h-14 rounded-2xl"
          onClick={() => {
            if (confirm("Stop this session?")) {
              finalize(false);
            }
          }}
        >
          Stop
        </Button>
      </div>

      <details
        className="rounded-2xl border bg-card p-4 text-sm"
        open={showDiag}
        onToggle={(e) => setShowDiag((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer text-muted-foreground">
          Detailed sensor readings
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
          <div>pitch (calib)</div>
          <div>{s.calibrated.pitch.toFixed(1)}°</div>
          <div>roll (calib)</div>
          <div>{s.calibrated.roll.toFixed(1)}°</div>
          <div>target pitch</div>
          <div>{step.targetPitch}°</div>
          <div>target roll</div>
          <div>{step.targetRoll}°</div>
          <div>ang. velocity</div>
          <div>{s.motion.angularVelocity.toFixed(1)} °/s</div>
          <div>sample rate</div>
          <div>{s.sampleRate} Hz</div>
        </div>
        <button
          onClick={() => navigate({ to: "/diagnostics" })}
          className="mt-3 text-xs text-primary underline"
        >
          Open full diagnostics
        </button>
      </details>
    </div>
  );
}

/* ---------------- Completion ---------------- */

function CompletionPhase({ ear }: { ear: Ear }) {
  const [before, setBefore] = useState<number>(5);
  const [after, setAfter] = useState<number>(3);
  const [outcome, setOutcome] = useState<"better" | "unchanged" | "worse">("better");
  const [saved, setSaved] = useState(false);

  function commit() {
    // Update the most recent session record with symptoms.
    try {
      const KEY = "bppvcoach.sessions.v1";
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (arr.length) {
        arr[0] = {
          ...arr[0],
          symptomsBefore: before,
          symptomsAfter: after,
          outcome,
        };
        localStorage.setItem(KEY, JSON.stringify(arr));
      }
    } catch {
      /* ignore */
    }
    setSaved(true);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <div className="text-base font-semibold">Session complete</div>
        <p className="mt-1 text-sm text-muted-foreground">
          {ear === "right" ? "Right" : "Left"} ear Epley positioning session
          finished. Sit upright for a few minutes before moving quickly.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <div>
          <div className="text-sm font-semibold">Dizziness before the session</div>
          <input
            type="range"
            min={0}
            max={10}
            value={before}
            onChange={(e) => setBefore(Number(e.target.value))}
            className="mt-2 w-full"
          />
          <div className="mt-1 text-xs text-muted-foreground">{before}/10</div>
        </div>
        <div>
          <div className="text-sm font-semibold">Dizziness right now</div>
          <input
            type="range"
            min={0}
            max={10}
            value={after}
            onChange={(e) => setAfter(Number(e.target.value))}
            className="mt-2 w-full"
          />
          <div className="mt-1 text-xs text-muted-foreground">{after}/10</div>
        </div>
        <div>
          <div className="text-sm font-semibold">How do you feel?</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["better", "unchanged", "worse"] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOutcome(o)}
                className={cn(
                  "h-12 rounded-2xl border capitalize",
                  outcome === o ? "border-primary bg-primary/10" : "bg-card"
                )}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!saved ? (
        <Button size="lg" className="h-14 w-full rounded-2xl" onClick={commit}>
          Save session
        </Button>
      ) : (
        <div className="rounded-2xl border border-success/40 bg-success/10 p-4 text-sm">
          Saved to this device.
        </div>
      )}

      <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
        If symptoms persist, worsen, or feel different from your previously
        diagnosed episodes, contact your clinician.
      </div>

      <div className="flex gap-3">
        <Button asChild variant="outline" className="h-12 flex-1 rounded-2xl">
          <Link to="/history">View history</Link>
        </Button>
        <Button asChild className="h-12 flex-1 rounded-2xl">
          <Link to="/">Done</Link>
        </Button>
      </div>
    </div>
  );
}
