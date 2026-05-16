import confetti from "canvas-confetti";

export function fireWinConfetti() {
  const duration = 2500;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ["#ff6b35", "#ffd166", "#ffffff"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ["#7b2cbf", "#ff6b35", "#ffd166"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

export function fireCaptureBurst(x: number, y: number) {
  confetti({
    particleCount: 12,
    spread: 40,
    startVelocity: 18,
    origin: { x, y },
    ticks: 60,
    scalar: 0.7,
    colors: ["#ff6b35", "#ffd166"],
  });
}

export function firePuzzleSuccess() {
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    colors: ["#2dc653", "#ffd166", "#ff6b35"],
  });
}
