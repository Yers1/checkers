"use client";

import type { CoachInsight } from "@/lib/game/types";

interface Props {
  insights: CoachInsight[];
  onClose: () => void;
}

export function CoachPanel({ insights, onClose }: Props) {
  return (
    <div className="coach-overlay">
      <div className="coach-panel">
        <header>
          <h3>🧠 AI Coach</h3>
          <p>Разбор вашей партии</p>
          <button type="button" className="btn ghost" onClick={onClose}>
            Закрыть
          </button>
        </header>
        <ul>
          {insights.map((item, i) => (
            <li key={i} className={`insight ${item.severity}`}>
              {item.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
