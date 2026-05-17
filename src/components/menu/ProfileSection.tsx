"use client";

import { useEffect, useState } from "react";
import { getCityLeaderboard, loadGameHistory } from "@/lib/storage";
import { useGameStore } from "@/store/gameStore";

export function ProfileSection() {
  const { profile, updateProfile, game } = useGameStore();
  const [history, setHistory] = useState(loadGameHistory());
  const cityBoard = getCityLeaderboard(profile.city).slice(0, 8);

  useEffect(() => {
    setHistory(loadGameHistory());
  }, [game.status, game.history.length]);

  return (
    <div className="menu-section">
      <p className="section-lead">
        Никнейм и город попадают в <strong>рейтинг по городу</strong>. Статистика
        сохраняется в браузере.
      </p>

      <div className="profile-form panel-inner">
        <label>
          Никнейм
          <input
            value={profile.nickname}
            onChange={(e) => updateProfile({ nickname: e.target.value })}
          />
        </label>
        <label>
          Город (для лидерборда)
          <input
            value={profile.city}
            onChange={(e) => updateProfile({ city: e.target.value })}
          />
        </label>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-label">Рейтинг</span>
          <span className="stat-value">⭐ {profile.rating}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Побед</span>
          <span className="stat-value">🏆 {profile.wins}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Задач</span>
          <span className="stat-value">🧩 {profile.puzzlesSolved}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Серия</span>
          <span className="stat-value">🔥 {profile.streak}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Партий</span>
          <span className="stat-value">♟️ {profile.gamesPlayed}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Лучшая серия</span>
          <span className="stat-value">📈 {profile.bestStreak}</span>
        </div>
      </div>

      {profile.isPro && <span className="pro-badge large">PRO активен</span>}

      <h3 className="subsection-title">Топ · {profile.city}</h3>
      <ul className="leader-list">
        {cityBoard.map((e, i) => (
          <li key={e.nickname} className={e.nickname === profile.nickname ? "you" : ""}>
            <span>{i + 1}</span>
            <span>
              {e.nickname}
              {e.nickname === profile.nickname ? " (вы)" : ""}
            </span>
            <span>{e.rating}</span>
          </li>
        ))}
      </ul>

      <h3 className="subsection-title">История партий</h3>
      <ul className="history-list">
        {history.slice(0, 8).map((h) => (
          <li key={h.id}>
            <span>{new Date(h.date).toLocaleDateString("ru")}</span>
            <span>{h.mode}</span>
            <span>{h.moves} ходов</span>
          </li>
        ))}
        {history.length === 0 && (
          <li className="muted">Сыграйте первую партию в разделе «Игра»</li>
        )}
      </ul>
    </div>
  );
}
