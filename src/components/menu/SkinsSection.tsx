"use client";

import { BOARD_SKINS } from "@/lib/skins";
import { useGameStore } from "@/store/gameStore";

export function SkinsSection() {
  const { profile, setBoardSkin, setShowProModal } = useGameStore();

  return (
    <div className="menu-section">
      <div className="info-banner">
        <strong>🎨 Скины доски</strong>
        <p>
          <b>Классика</b> — бесплатно для всех.{" "}
          <b>Неон, Мрамор, Полночь</b> — только с подпиской Pro.
        </p>
      </div>

      {!profile.isPro && (
        <button type="button" className="btn pro full-width" onClick={() => setShowProModal(true)}>
          💎 Получить Pro и открыть все скины (демо)
        </button>
      )}

      {profile.isPro && (
        <p className="pro-active-note">✓ Pro активен — все скины доступны</p>
      )}

      <ul className="skin-cards">
        {BOARD_SKINS.map((skin) => {
          const locked = skin.requiresPro && !profile.isPro;
          const active = profile.boardSkin === skin.id;

          return (
            <li key={skin.id} className={`skin-card ${active ? "active" : ""} ${locked ? "locked" : ""}`}>
              <div className="skin-card-top">
                <span className="skin-preview">{skin.preview}</span>
                <div>
                  <h3>{skin.label}</h3>
                  <p>{skin.description}</p>
                </div>
              </div>
              <p className="skin-how">
                <strong>Как получить:</strong> {skin.howToGet}
              </p>
              <button
                type="button"
                className={active ? "btn active-skin" : "btn ghost"}
                disabled={locked}
                onClick={() => {
                  if (locked) setShowProModal(true);
                  else setBoardSkin(skin.id);
                }}
              >
                {locked ? "🔒 Нужен Pro" : active ? "✓ Выбрано" : "Применить"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
