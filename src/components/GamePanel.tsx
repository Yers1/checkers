"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { winnerLabel } from "@/lib/game/engine";
import { useGameStore } from "@/store/gameStore";
import { CheckersBoard, getReplayBoard } from "./CheckersBoard";
import { OnlinePanel } from "./OnlinePanel";
import { CoachPanel } from "./CoachPanel";
import { ProModal } from "./ProModal";
import { ReplayBar } from "./ReplayBar";
import { StatsHUD } from "./StatsHUD";
import { AchievementToast } from "./AchievementToast";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GamePanel() {
  const {
    game,
    profile,
    ui,
    clickSquare,
    getHints,
    newGame,
    showCoach,
    coachInsights,
    dismissCoach,
    showProModal,
    setShowProModal,
    upgradePro,
    lastMove,
    aiThinking,
    comboCount,
    shakeBoard,
    replayIndex,
    setReplayIndex,
    toastAchievements,
    dismissAchievementToast,
    puzzleMessage,
    nextPuzzle,
  } = useGameStore();

  const hints = getHints();
  const winner = winnerLabel(game.status);
  const isPuzzle = game.mode === "puzzle" || game.mode === "daily";

  const displayBoard = useMemo(() => {
    if (replayIndex !== null && game.history.length > 0) {
      return getReplayBoard(game, replayIndex);
    }
    return game.board;
  }, [game, replayIndex]);

  return (
    <main className={`game-area ${ui.zenMode ? "zen" : ""}`}>
      {!ui.zenMode && (
        <StatsHUD
          profile={profile}
          comboCount={comboCount}
          aiThinking={aiThinking}
        />
      )}

      <div className="game-header">
        <div className="turn-indicator">
          <motion.span
            className={`player-dot ${game.currentPlayer === "white" ? "white" : ""}`}
            layout
            transition={{ type: "spring", stiffness: 500 }}
          />
          <p>
            {isPuzzle && puzzleMessage
              ? puzzleMessage
              : game.status === "playing"
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

        <div className="header-actions">
          {isPuzzle && game.status !== "playing" && (
            <button type="button" className="btn" onClick={nextPuzzle}>
              Следующая задача →
            </button>
          )}
          <button
            type="button"
            className="btn ghost"
            onClick={() => newGame(game.mode, game.difficulty)}
          >
            Новая партия
          </button>
        </div>
      </div>

      {game.mode === "online" && !ui.zenMode && <OnlinePanel />}

      <CheckersBoard
        game={game}
        displayBoard={displayBoard}
        onSquareClick={clickSquare}
        hints={hints}
        lastMove={lastMove}
        skin={profile.boardSkin}
        flipped={ui.boardFlipped}
        shake={shakeBoard}
        disabled={replayIndex !== null || aiThinking}
      />

      <ReplayBar
        game={game}
        replayIndex={replayIndex}
        onChange={setReplayIndex}
      />

      <AnimatePresence>
        {game.status !== "playing" && !showCoach && winner && (
          <motion.p
            className="game-over-banner"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {winner}
          </motion.p>
        )}
      </AnimatePresence>

      {showCoach && (
        <CoachPanel insights={coachInsights} onClose={dismissCoach} />
      )}

      {showProModal && (
        <ProModal onClose={() => setShowProModal(false)} onUpgrade={upgradePro} />
      )}

      <AchievementToast
        ids={toastAchievements}
        onDismiss={dismissAchievementToast}
      />
    </main>
  );
}
