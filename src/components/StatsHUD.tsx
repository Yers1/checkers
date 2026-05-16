"use client";

import { motion } from "framer-motion";
import type { PlayerProfile } from "@/lib/game/types";

interface Props {
  profile: PlayerProfile;
  comboCount: number;
  aiThinking: boolean;
}

export function StatsHUD({ profile, comboCount, aiThinking }: Props) {
  return (
    <div className="stats-hud">
      {profile.streak > 0 && (
        <motion.span
          className="hud-chip streak"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          key={profile.streak}
        >
          🔥 Серия {profile.streak}
        </motion.span>
      )}
      {comboCount >= 2 && (
        <motion.span
          className="hud-chip combo"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
        >
          💥 COMBO x{comboCount}
        </motion.span>
      )}
      {aiThinking && (
        <motion.span
          className="hud-chip ai"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          🤖 ИИ думает…
        </motion.span>
      )}
      <span className="hud-chip rating">⭐ {profile.rating}</span>
    </div>
  );
}
