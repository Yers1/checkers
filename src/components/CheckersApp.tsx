"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useGameStore } from "@/store/gameStore";
import { AppMenu } from "./menu/AppMenu";
import { GamePanel } from "./GamePanel";
import { HeroBanner } from "./HeroBanner";
import { TopBar } from "./TopBar";

export function CheckersApp() {
  const { theme, toggle } = useTheme();
  const { init, tickBlitz, game, ui } = useGameStore();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!game.blitzActive || game.status !== "playing") return;
    const id = setInterval(() => tickBlitz(), 1000);
    return () => clearInterval(id);
  }, [game.blitzActive, game.status, game.currentPlayer, tickBlitz]);

  return (
    <div className="app-shell">
      {!ui.zenMode && (
        <AppMenu
          theme={theme}
          onThemeToggle={toggle}
          mobileOpen={menuOpen}
          onMobileClose={() => setMenuOpen(false)}
        />
      )}

      <div className="main-column">
        {!ui.zenMode && <TopBar onMenuOpen={() => setMenuOpen(true)} />}
        {!ui.zenMode && <HeroBanner />}
        <GamePanel />
        {!ui.zenMode && (
          <p className="mobile-menu-hint">
            На телефоне: кнопка ☰ вверху → <strong>Достижения</strong> и{" "}
            <strong>Скины</strong> с инструкциями
          </p>
        )}
      </div>

      {ui.zenMode && (
        <button
          type="button"
          className="zen-exit"
          onClick={() => useGameStore.getState().toggleUi("zenMode")}
        >
          Выйти из Zen
        </button>
      )}
    </div>
  );
}
