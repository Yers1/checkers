"use client";

import { useGameStore } from "@/store/gameStore";

interface Props {
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export function SettingsSection({ theme, onThemeToggle }: Props) {
  const { game, toggleHints, ui, toggleUi, setShowProModal } = useGameStore();

  return (
    <div className="menu-section">
      <p className="section-lead">Настройки сохраняются в браузере автоматически.</p>

      <ul className="settings-list">
        <li>
          <div>
            <strong>💡 Подсказки ходов</strong>
            <p>Подсвечивает куда можно пойти</p>
          </div>
          <button type="button" className="btn ghost" onClick={toggleHints}>
            {game.hintsEnabled ? "Вкл" : "Выкл"}
          </button>
        </li>
        <li>
          <div>
            <strong>🔊 Звуковые эффекты</strong>
            <p>Ходы, взятия, победа</p>
          </div>
          <button type="button" className="btn ghost" onClick={() => toggleUi("soundEnabled")}>
            {ui.soundEnabled ? "Вкл" : "Выкл"}
          </button>
        </li>
        <li>
          <div>
            <strong>🔄 Перевернуть доску</strong>
            <p>Вид с стороны чёрных</p>
          </div>
          <button type="button" className="btn ghost" onClick={() => toggleUi("boardFlipped")}>
            {ui.boardFlipped ? "Да" : "Нет"}
          </button>
        </li>
        <li>
          <div>
            <strong>🧘 Zen-режим</strong>
            <p>Скрывает боковое меню — только доска</p>
          </div>
          <button type="button" className="btn ghost" onClick={() => toggleUi("zenMode")}>
            {ui.zenMode ? "Вкл" : "Выкл"}
          </button>
        </li>
        <li>
          <div>
            <strong>✨ Частицы</strong>
            <p>Confetti при победах и задачах</p>
          </div>
          <button
            type="button"
            className="btn ghost"
            onClick={() => toggleUi("particlesEnabled")}
          >
            {ui.particlesEnabled ? "Вкл" : "Выкл"}
          </button>
        </li>
        <li>
          <div>
            <strong>{theme === "dark" ? "☀️" : "🌙"} Тема интерфейса</strong>
            <p>Светлая или тёмная</p>
          </div>
          <button type="button" className="btn ghost" onClick={onThemeToggle}>
            {theme === "dark" ? "Светлая" : "Тёмная"}
          </button>
        </li>
      </ul>

      <button type="button" className="btn pro full-width" onClick={() => setShowProModal(true)}>
        💎 Pro — скины и значок в рейтинге
      </button>
    </div>
  );
}
