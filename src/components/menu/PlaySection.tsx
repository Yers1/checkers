"use client";

import { motion } from "framer-motion";
import { getAllPuzzles } from "@/lib/game/puzzles";
import { isDailyChallengeDone } from "@/lib/storage";
import type { Difficulty, GameMode } from "@/lib/game/types";
import { useGameStore } from "@/store/gameStore";

const MODES: { id: GameMode; label: string; desc: string; badge?: string }[] = [
  { id: "ai", label: "Против ИИ", desc: "Вы белые, 3 уровня сложности", badge: "HOT" },
  { id: "blitz", label: "Блиц 3 мин", desc: "Таймер на каждого — быстрая дуэль", badge: "⚡" },
  { id: "puzzle", label: "Тактика", desc: "Найди лучшее взятие", badge: "NEW" },
  { id: "daily", label: "Челлендж дня", desc: "Одна задача в сутки", badge: "📅" },
  { id: "local", label: "Вдвоём", desc: "Два игрока на одном экране" },
  { id: "online", label: "Онлайн", desc: "Ссылка для друга (P2P)" },
];

export function PlaySection() {
  const { game, newGame, setDifficulty, startPuzzle } = useGameStore();
  const dailyDone = isDailyChallengeDone();
  const puzzles = getAllPuzzles();

  return (
    <div className="menu-section">
      <p className="section-lead">
        Выберите режим — партия начнётся на доске справа. Подсказки ходов:{" "}
        <strong>Настройки → Подсказки</strong>.
      </p>

      <h3 className="subsection-title">Режимы</h3>
      <div className="mode-grid extended">
        {MODES.map((m, i) => (
          <motion.button
            key={m.id}
            type="button"
            className={game.mode === m.id ? "mode-btn active" : "mode-btn"}
            onClick={() => newGame(m.id, game.difficulty)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {m.badge && <span className="mode-badge">{m.badge}</span>}
            <strong>{m.label}</strong>
            <span>{m.desc}</span>
            {m.id === "daily" && dailyDone && <span className="done-tag">✓ сегодня</span>}
          </motion.button>
        ))}
      </div>

      {game.mode === "ai" && (
        <>
          <h3 className="subsection-title">Сложность ИИ</h3>
          <div className="difficulty-row">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                className={game.difficulty === d ? "chip active" : "chip"}
                onClick={() => setDifficulty(d)}
              >
                {d === "easy" ? "Лёгкий" : d === "medium" ? "Средний" : "Сложный"}
              </button>
            ))}
          </div>
        </>
      )}

      <h3 className="subsection-title">Тактические задачи</h3>
      <p className="hint-text">Считаются для достижения «Тактик» (5 решённых).</p>
      <ul className="puzzle-list detailed">
        {puzzles.map((p) => (
          <li key={p.id}>
            <button type="button" className="puzzle-link" onClick={() => startPuzzle(p.id)}>
              <span>{"⭐".repeat(p.difficulty)}</span>
              <span>
                <strong>{p.title}</strong>
                <small>{p.description}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
