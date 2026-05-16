let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.08,
) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

export const sounds = {
  move: () => tone(440, 0.08, "triangle"),
  capture: () => {
    tone(220, 0.06, "square", 0.1);
    setTimeout(() => tone(330, 0.1, "square", 0.09), 50);
  },
  king: () => {
    tone(523, 0.1);
    setTimeout(() => tone(659, 0.12), 80);
  },
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => tone(f, 0.2, "sine", 0.07), i * 120),
    );
  },
  puzzle: () => tone(880, 0.15, "triangle", 0.06),
  error: () => tone(150, 0.2, "sawtooth", 0.05),
};
