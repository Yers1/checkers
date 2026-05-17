"use client";

import { ACHIEVEMENTS } from "@/lib/achievements";
import { useGameStore } from "@/store/gameStore";

export function AchievementsSection() {
  const profile = useGameStore((s) => s.profile);
  const unlocked = new Set(profile.unlockedAchievements);

  return (
    <div className="menu-section">
      <p className="section-lead">
        Открыто <strong>{unlocked.size}</strong> из {ACHIEVEMENTS.length}. Выполните
        условие — достижение откроется автоматически (уведомление справа сверху).
      </p>

      <ul className="achievement-cards">
        {ACHIEVEMENTS.map((a) => {
          const done = unlocked.has(a.id);
          return (
            <li key={a.id} className={done ? "ach-card done" : "ach-card"}>
              <div className="ach-card-head">
                <span className="ach-card-icon">{a.icon}</span>
                <div>
                  <h3>{a.title}</h3>
                  <p className="ach-card-desc">{a.description}</p>
                </div>
                <span className={`ach-status ${done ? "ok" : "pending"}`}>
                  {done ? "✓ Получено" : "Не открыто"}
                </span>
              </div>
              <div className="how-to-box">
                <strong>Как получить:</strong>
                <p>{a.howToUnlock}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
