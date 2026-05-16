"use client";

import { motion } from "framer-motion";

export function HeroBanner() {
  return (
    <motion.div
      className="hero-banner"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="hero-glow" />
      <h2>
        Единственные шашки с <span className="gradient-text">AI Coach</span>, блицом
        и тактическими задачами
      </h2>
      <p>Тренируй комбинации · Играй за 3 минуты · Побеждай в своём городе</p>
    </motion.div>
  );
}
