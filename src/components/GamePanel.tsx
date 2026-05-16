"use client";

import { winnerLabel } from "@/lib/game/engine";
import { useGameStore } from "@/store/gameStore";
import { CheckersBoard } from "./CheckersBoard";
import { OnlinePanel } from "./OnlinePanel";
import { CoachPanel } from "./CoachPanel";
import { ProModal } from "./ProModal";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GamePanel() {
  const {
    game,
    clickSquare,
    getHints,
    newGame,
    showCoach,
    coachInsights,
    dismissCoach,
    showProModal,
    setShowProModal,
    upgradePro,
  } = useGameStore();

  const hints = getHints();
  const winner = winnerLabel(game.status);

  return (
    <main className="game-area">
      <div className="game-header">
        <div className="turn-indicator">
          <span
            className={
              game.currentPlayer === "white" ? "player-dot white" : "player-dot"
            }
          />
          <p>
            {game.status === "playing"
              ? `Ход: ${game.currentPlayer === "white" ? "Белые" : "Чёрные"}`
              : winner}
          </p>
        </div>

        {game.blitzActive && (
          <div className="blitz-timers">
            <span className={game.currentPlayer === "white" ? "active" : ""}>
              ⬜ {formatTime(game.blitzSeconds.white)}
            </span>
            <span className={game.currentPlayer === "black" ? "active" : ""}>
              ⬛ {formatTime(game.blitzSeconds.black)}
            </span>
          </div>
        )}

        <button
          type="button"
          className="btn ghost"
          onClick={() => newGame(game.mode, game.difficulty)}
        >
          Новая партия
        </button>
      </div>

      {game.mode === "online" && <OnlinePanel />}

      <CheckersBoard game={game} onSquareClick={clickSquare} hints={hints} />

      {game.status !== "playing" && !showCoach && (
        <p className="game-over-banner">{winner ?? "Ничья"}</p>
      )}

      {showCoach && (
        <CoachPanel insights={coachInsights} onClose={dismissCoach} />
      )}

      {showProModal && (
        <ProModal onClose={() => setShowProModal(false)} onUpgrade={upgradePro} />
      )}
    </main>
  );
}
