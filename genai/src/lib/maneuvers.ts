// Epley maneuver protocol configuration.
// Therapists can edit these values without touching UI code.
// Angles are in degrees. Pitch: + = chin up (head tipped back),
// - = chin down. Roll: + = right ear down, - = left ear down.

export type Ear = "left" | "right";

export interface ManeuverStep {
  id: string;
  title: string;
  instruction: string;
  voicePrompt: string;
  illustration: string; // emoji or key, kept simple for MVP
  targetPitch: number;
  targetRoll: number;
  pitchTolerance: number;
  rollTolerance: number;
  holdSeconds: number;
  maxTransitionSpeed?: number; // deg/sec
}

const TOL_P = 12;
const TOL_R = 12;
const HOLD = 30; // standard Epley hold

function rightEarEpley(): ManeuverStep[] {
  return [
    {
      id: "sit-head-right",
      title: "Sit and turn head 45° right",
      instruction: "Sit upright on a bed. Turn your head 45 degrees to the right.",
      voicePrompt: "Sit upright and turn your head forty-five degrees to the right.",
      illustration: "🧍‍♀️↻",
      targetPitch: 0,
      targetRoll: 0,
      pitchTolerance: TOL_P,
      rollTolerance: 25,
      holdSeconds: 5,
    },
    {
      id: "lie-back-right",
      title: "Lie back, head still turned right",
      instruction: "Lie back slowly. Keep your head turned 45° right and slightly off the edge.",
      voicePrompt: "Lie back slowly. Keep your head turned to the right.",
      illustration: "🛌↻",
      targetPitch: -20,
      targetRoll: 25,
      pitchTolerance: TOL_P,
      rollTolerance: TOL_R,
      holdSeconds: HOLD,
    },
    {
      id: "turn-head-left-90",
      title: "Turn head 90° to the left",
      instruction: "Without lifting your head, rotate it 90° to the left so your left ear faces down.",
      voicePrompt: "Slowly rotate your head ninety degrees to the left.",
      illustration: "🛌↺",
      targetPitch: -20,
      targetRoll: -25,
      pitchTolerance: TOL_P,
      rollTolerance: TOL_R,
      holdSeconds: HOLD,
    },
    {
      id: "roll-onto-left-side",
      title: "Roll onto your left side",
      instruction: "Roll your body to the left so you are looking down at the floor.",
      voicePrompt: "Roll your body to the left and look down at the floor.",
      illustration: "↺🛌",
      targetPitch: -35,
      targetRoll: -60,
      pitchTolerance: 18,
      rollTolerance: 20,
      holdSeconds: HOLD,
    },
    {
      id: "sit-up-slowly",
      title: "Sit up slowly",
      instruction: "Slowly sit up. Keep movements gentle.",
      voicePrompt: "Slowly sit upright.",
      illustration: "🧍",
      targetPitch: 0,
      targetRoll: 0,
      pitchTolerance: 20,
      rollTolerance: 25,
      holdSeconds: 10,
    },
  ];
}

function leftEarEpley(): ManeuverStep[] {
  // Mirror of right ear Epley.
  return rightEarEpley().map((s) => ({
    ...s,
    targetRoll: -s.targetRoll,
    instruction: s.instruction
      .replace(/right/gi, "__L__")
      .replace(/left/gi, "right")
      .replace(/__L__/g, "left"),
    voicePrompt: s.voicePrompt
      .replace(/right/gi, "__L__")
      .replace(/left/gi, "right")
      .replace(/__L__/g, "left"),
    title: s.title
      .replace(/right/gi, "__L__")
      .replace(/left/gi, "right")
      .replace(/__L__/g, "left"),
    illustration: s.illustration === "🧍‍♀️↻" ? "🧍‍♀️↺" : s.illustration === "🛌↻" ? "🛌↺" : s.illustration === "🛌↺" ? "🛌↻" : s.illustration === "↺🛌" ? "↻🛌" : s.illustration,
  }));
}

export function getEpleyProtocol(ear: Ear): ManeuverStep[] {
  return ear === "right" ? rightEarEpley() : leftEarEpley();
}
