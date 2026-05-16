"use client";

import { motion } from "framer-motion";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { getAllPuzzles } from "@/lib/game/puzzles";
import { getCityLeaderboard, isDailyChallengeDone, loadGameHistory } from "@/lib/storage";
import type { Difficulty, GameMode } from "@/lib/game/types";
import { useGameStore } from "@/store/gameStore";
import { useEffect, useState } from "react";
import { SkinPicker } from "./SkinPicker";

const MODES: { id: GameMode; label: string; desc: string; badge?: string }[] = [
  { id: "ai", label: "Против ИИ", desc: "Minimax AI", badge: "HOT" },
  { id: "blitz", label: "Блиц 3 мин", desc: "Быстрые дуэли", badge: "⚡" },
  { id: "puzzle", label: "Тактика", desc: "5 комбо-задач", badge: "NEW" },
  { id: "daily", label: "Челлендж дня", desc: "Новая каждый день" },
  { id: "local", label: "Вдвоём", desc: "Один экран" },
  { id: "online", label: "Онлайн P2P", desc: "По ссылке" },
];

interface Props {
  onThemeToggle: () => void;
  theme: "light" | "dark";
}

export function Sidebar({ onThemeToggle, theme }: Props) {
  const {
    game,
    profile,
    ui,
    newGame,
    setDifficulty,
    toggleHints,
    updateProfile,
    setShowProModal,
    setBoardSkin,
    toggleUi,
    startPuzzle,
  } = useGameStore();

  const [history, setHistory] = useState<ReturnType<typeof loadGameHistory>>([]);
  const cityBoard = getCityLeaderboard(profile.city).slice(0, 5);
  const dailyDone = isDailyChallengeDone();
  const puzzles = getAllPuzzles();

  useEffect(() => {
    setHistory(loadGameHistory());
    document.documentElement.setAttribute("data-skin", profile.boardSkin);
  }, [game.status, game.history.length, profile.boardSkin]);

  return (
    <aside className="sidebar">
      <motion.div
        className="brand"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span className="brand-icon pulse">⚡</span>
        <div>
          <h1>BlitzCheckers</h1>
          <p>Умные шашки нового поколения</p>
        </div>
      </motion.div>

      <section className="panel">
        <h2>Режим игры</h2>
        <div className="mode-grid extended">
          {MODES.map((m, i) => (
            <motion.button
              key={m.id}
              type="button"
              className={game.mode === m.id ? "mode-btn active" : "mode-btn"}
              onClick={() => newGame(m.id, game.difficulty)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {m.badge && <span className="mode-badge">{m.badge}</span>}
              <strong>{m.label}</strong>
              <span>{m.desc}</span>
              {m.id === "daily" && dailyDone && (
                <span className="done-tag">✓ сегодня</span>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Скин доски</h2>
        <SkinPicker
          current={profile.boardSkin}
          isPro={profile.isPro}
          onSelect={setBoardSkin}
        />
      </section>

      {game.mode === "ai" && (
        <section className="panel">
          <h2>Сложность ИИ</h2>
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
        </section>
      )}

      <section className="panel">
        <h2>Тактические задачи</h2>
        <ul className="puzzle-list">
          {puzzles.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="puzzle-link"
                onClick={() => startPuzzle(p.id)}
              >
                {"⭐".repeat(p.difficulty)} {p.title}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel profile-panel">
        <h2>Профиль</h2>
        <label>
          Никнейм
          <input
            value={profile.nickname}
            onChange={(e) => updateProfile({ nickname: e.target.value })}
          />
        </label>
        <label>
          Город
          <input
            value={profile.city}
            onChange={(e) => updateProfile({ city: e.target.value })}
          />
        </label>
        <div className="stats-row">
          <span>⭐ {profile.rating}</span>
          <span>🏆 {profile.wins}</span>
          <span>🧩 {profile.puzzlesSolved}</span>
          <span>🔥 {profile.streak}</span>
        </div>
        {profile.isPro && <span className="pro-badge">PRO</span>}
      </section>

      <section className="panel">
        <h2>Достижения · {profile.unlockedAchievements.length}/{ACHIEVEMENTS.length}</h2>
        <motion.div className="ach-grid">
          {ACHIEVEMENTS.map((a) => (
            <span
              key={a.id}
              className={
                profile.unlockedAchievements.includes(a.id)
                  ? "ach unlocked"
                  : "ach locked"
              }
              title={a.description}
            >
              {a.icon}
            </span>
          ))}
        </motion.div>
      </section>

      <section className="panel">
        <h2>Топ · {profile.city}</h2>
        <ul className="leader-list">
          {cityBoard.map((e, i) => (
            <li key={e.nickname}>
              <span>{i + 1}</span>
              <span>{e.nickname}</span>
              <span>{e.rating}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>История</h2>
        <ul className="history-list">
          {history.slice(0, 5).map((h) => (
            <li key={h.id}>
              <span>{new Date(h.date).toLocaleDateString("ru")}</span>
              <span>{h.moves} ходов</span>
            </li>
          ))}
          {history.length === 0 && <li className="muted">Пока нет партий</li>}
        </ul>
      </section>

      <div className="sidebar-actions">
        <button type="button" className="btn ghost" onClick={toggleHints}>
          {game.hintsEnabled ? "💡 Подсказки вкл" : "Подсказки выкл"}
        </button>
        <button type="button" className="btn ghost" onClick={() => toggleUi("soundEnabled")}>
          {ui.soundEnabled ? "🔊 Звук" : "🔇 Звук"}
        </button>
        <button type="button" className="btn ghost" onClick={() => toggleUi("boardFlipped")}>
          🔄 Перевернуть доску
        </button>
        <button type="button" className="btn ghost" onClick={() => toggleUi("zenMode")}>
          {ui.zenMode ? "UI вкл" : "🧘 Zen-режим"}
        </button>
        <button type="button" className="btn ghost" onClick={onThemeToggle}>
          {theme === "dark" ? "☀️ Светлая" : "🌙 Тёмная"}
        </button>
        <button type="button" className="btn pro" onClick={() => setShowProModal(true)}>
          💎 Upgrade to Pro
        </button>
      </div>
    </aside>
  );
}
