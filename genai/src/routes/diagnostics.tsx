import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useSensors, detectSupport } from "@/lib/sensors";
import { useState } from "react";

export const Route = createFileRoute("/diagnostics")({
  head: () => ({
    meta: [
      { title: "Sensor diagnostics — Unspin" },
      { name: "description", content: "Developer view of raw sensor data and device capability." },
    ],
  }),
  component: Diagnostics,
});

function Row({ k, v }: { k: string; v: string | number | boolean }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono tabular-nums">{String(v)}</span>
    </div>
  );
}

function Diagnostics() {
  const [mock, setMock] = useState(false);
  const s = useSensors({ mock });
  const support = detectSupport();

  return (
    <PageShell title="Developer diagnostics" back={{ to: "/", label: "Home" }}>
      <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-2 text-sm font-semibold">Device support</div>
          <Row k="DeviceOrientationEvent" v={support.orientation} />
          <Row k="DeviceMotionEvent" v={support.motion} />
          <Row k="Permission required" v={support.needsPermission} />
          <Row k="Permission granted" v={String(s.permissionGranted)} />
          <Row k="Sample rate (Hz)" v={s.sampleRate} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => s.requestPermission()}>Request permission</Button>
          <Button variant="outline" onClick={() => s.calibrate()}>
            Calibrate
          </Button>
          <Button variant="outline" onClick={() => setMock((m) => !m)}>
            {mock ? "Disable" : "Enable"} mock mode
          </Button>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-2 text-sm font-semibold">Raw orientation</div>
          <Row k="pitch (β)" v={s.raw.pitch.toFixed(2)} />
          <Row k="roll (γ)" v={s.raw.roll.toFixed(2)} />
          <Row k="yaw (α)" v={s.raw.yaw.toFixed(2)} />
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-2 text-sm font-semibold">Smoothed</div>
          <Row k="pitch" v={s.smoothed.pitch.toFixed(2)} />
          <Row k="roll" v={s.smoothed.roll.toFixed(2)} />
          <Row k="yaw" v={s.smoothed.yaw.toFixed(2)} />
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-2 text-sm font-semibold">Calibration offsets</div>
          <Row k="pitch" v={s.calibration.pitch.toFixed(2)} />
          <Row k="roll" v={s.calibration.roll.toFixed(2)} />
          <Row k="yaw" v={s.calibration.yaw.toFixed(2)} />
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-2 text-sm font-semibold">Calibrated</div>
          <Row k="pitch" v={s.calibrated.pitch.toFixed(2)} />
          <Row k="roll" v={s.calibrated.roll.toFixed(2)} />
          <Row k="yaw" v={s.calibrated.yaw.toFixed(2)} />
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-2 text-sm font-semibold">Motion</div>
          <Row k="angular velocity (deg/s)" v={s.motion.angularVelocity.toFixed(2)} />
          <Row k="acceleration (m/s²)" v={s.motion.acceleration.toFixed(2)} />
        </div>
      </div>
    </PageShell>
  );
}
