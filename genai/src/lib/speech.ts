let enabled = true;

export function setVoiceEnabled(v: boolean) {
  enabled = v;
  if (!v && typeof window !== "undefined") {
    window.speechSynthesis?.cancel();
  }
}

export function isVoiceEnabled() {
  return enabled;
}

export function speak(text: string) {
  if (!enabled) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
