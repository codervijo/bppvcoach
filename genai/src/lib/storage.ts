import type { Ear } from "./maneuvers";

export interface SessionRecord {
  id: string;
  date: string; // ISO
  ear: Ear;
  completed: boolean;
  stepsCompleted: number;
  totalSteps: number;
  alignmentScore: number; // 0-100 "Positioning consistency"
  symptomsBefore?: number; // 0-10
  symptomsAfter?: number; // 0-10
  outcome?: "better" | "unchanged" | "worse";
}

const KEY = "unspin.sessions.v1";

export function loadSessions(): SessionRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

export function saveSession(rec: SessionRecord) {
  if (typeof localStorage === "undefined") return;
  const all = loadSessions();
  all.unshift(rec);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 100)));
}

export function clearSessions() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY);
}
