"use client";

import { getCityLeaderboard, loadGameHistory } from "@/lib/storage";
import type { Difficulty, GameMode } from "@/lib/game/types";
import { useGameStore } from "@/store/gameStore";
import { useEffect, useState } from "react";

const MODES: { id: GameMode; label: string; desc: string }[] = [
  { id: "local", label: "Вдвоём", desc: "Один экран" },
  { id: "ai", label: "Против ИИ", desc: "3 уровня" },
  { id: "blitz", label: "Блиц 3 мин", desc: "Быстрые дуэли" },
  { id: "online", label: "Онлайн", desc: "По ссылке P2P" },
];

interface Props {
  onThemeToggle: () => void;
  theme: "light" | "dark";
}

export function Sidebar({ onThemeToggle, theme }: Props) {
  const {
    game,
    profile,
    newGame,
    setDifficulty,
    toggleHints,
    updateProfile,
    setShowProModal,
  } = useGameStore();

  const [history, setHistory] = useState<ReturnType<typeof loadGameHistory>>([]);
  const cityBoard = getCityLeaderboard(profile.city).slice(0, 5);

  useEffect(() => {
    setHistory(loadGameHistory());
  }, [game.status, game.history.length]);

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">⚡</span>
        <div>
          <h1>BlitzCheckers</h1>
          <p>Русские шашки · тренировка и дуэли</p>
        </div>
      </div>

      <section className="panel">
        <h2>Режим</h2>
        <div className="mode-grid">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={game.mode === m.id ? "mode-btn active" : "mode-btn"}
              onClick={() => newGame(m.id, game.difficulty)}
            >
              <strong>{m.label}</strong>
              <span>{m.desc}</span>
            </button>
          ))}
        </div>
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
          <span>Рейтинг {profile.rating}</span>
          <span>Побед {profile.wins}</span>
        </div>
        {profile.isPro && <span className="pro-badge">PRO</span>}
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
          {game.hintsEnabled ? "Скрыть подсказки" : "Показать подсказки"}
        </button>
        <button type="button" className="btn ghost" onClick={onThemeToggle}>
          {theme === "dark" ? "☀️ Светлая" : "🌙 Тёмная"}
        </button>
        <button type="button" className="btn pro" onClick={() => setShowProModal(true)}>
          Upgrade to Pro
        </button>
      </div>
    </aside>
  );
}