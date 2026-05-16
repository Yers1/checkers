"use client";

import { useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useGameStore } from "@/store/gameStore";
import { Sidebar } from "./Sidebar";
import { GamePanel } from "./GamePanel";
import { HeroBanner } from "./HeroBanner";

export function CheckersApp() {
  const { theme, toggle } = useTheme();
  const { init, tickBlitz, game, ui } = useGameStore();

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
      <Sidebar onThemeToggle={toggle} theme={theme} />
      <div className="main-column">
        {!ui.zenMode && <HeroBanner />}
        <GamePanel />
      </div>
    </div>
  );
}
