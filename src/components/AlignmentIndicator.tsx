import { cn } from "@/lib/utils";
import type { AlignmentState } from "@/lib/sensors";

interface Props {
  state: AlignmentState;
  pitchDelta: number;
  rollDelta: number;
  available: boolean;
}

const LABEL: Record<AlignmentState, string> = {
  green: "In position",
  yellow: "Almost — adjust slightly",
  red: "Move toward target",
  gray: "Sensor unavailable",
};

const RING: Record<AlignmentState, string> = {
  green: "ring-success bg-success/15 text-success",
  yellow: "ring-warning bg-warning/15 text-warning-foreground",
  red: "ring-destructive bg-destructive/15 text-destructive",
  gray: "ring-muted-foreground/40 bg-muted text-muted-foreground",
};

const ICON: Record<AlignmentState, string> = {
  green: "✓",
  yellow: "~",
  red: "✕",
  gray: "—",
};

export function AlignmentIndicator({ state, pitchDelta, rollDelta, available }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          "grid h-44 w-44 place-items-center rounded-full ring-8 transition-colors",
          RING[state]
        )}
        role="status"
        aria-live="polite"
        aria-label={LABEL[state]}
      >
        <div className="text-center">
          <div className="text-6xl font-bold leading-none">{ICON[state]}</div>
          <div className="mt-2 text-sm font-medium uppercase tracking-wide">
            {LABEL[state]}
          </div>
        </div>
      </div>
      {available && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Δ pitch {pitchDelta.toFixed(0)}°</span>
          <span>Δ roll {rollDelta.toFixed(0)}°</span>
        </div>
      )}
    </div>
  );
}
