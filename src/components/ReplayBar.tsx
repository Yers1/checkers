"use client";

import { motion } from "framer-motion";
import type { GameState } from "@/lib/game/types";

interface Props {
  game: GameState;
  replayIndex: number | null;
  onChange: (index: number | null) => void;
}

export function ReplayBar({ game, replayIndex, onChange }: Props) {
  if (game.history.length === 0) return null;

  const max = game.history.length - 1;
  const current = replayIndex ?? max;

  return (
    <motion.div
      className="replay-bar"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span>🎬 Повтор партии</span>
      <input
        type="range"
        min={0}
        max={max}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="replay-step">
        Ход {current + 1} / {max + 1}
      </span>
      <button
        type="button"
        className="btn ghost small"
        onClick={() => onChange(null)}
      >
        К игре
      </button>
    </motion.div>
  );
}
