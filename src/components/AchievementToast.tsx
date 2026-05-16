"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getAchievementMeta } from "@/store/gameStore";

interface Props {
  ids: string[];
  onDismiss: () => void;
}

export function AchievementToast({ ids, onDismiss }: Props) {
  return (
    <div className="achievement-stack">
      <AnimatePresence>
        {ids.map((id) => {
          const meta = getAchievementMeta(id);
          if (!meta) return null;
          return (
            <motion.div
              key={id}
              className="achievement-toast"
              initial={{ opacity: 0, x: 80, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80 }}
              onAnimationComplete={() => setTimeout(onDismiss, 3200)}
            >
              <span className="ach-icon">{meta.icon}</span>
              <div>
                <strong>Достижение!</strong>
                <p>{meta.title}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
