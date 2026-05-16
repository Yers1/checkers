"use client";

import { create } from "zustand";
import { pickAiMove } from "@/lib/game/ai";
import { analyzeGame } from "@/lib/game/coach";
import {
  createNewGame,
  executeMove,
  getHintMoves,
  loadGameState,
  refreshLegalMoves,
  selectSquare,
} from "@/lib/game/engine";
import type {
  CoachInsight,
  Difficulty,
  GameMode,
  GameMove,
  GameState,
  PlayerProfile,
} from "@/lib/game/types";
import {
  appendGameHistory,
  clearActiveGame,
  loadActiveGame,
  loadProfile,
  saveActiveGame,
  saveProfile,
  updateLeaderboard,
  type SavedGameSummary,
} from "@/lib/storage";

interface GameStore {
  game: GameState;
  profile: PlayerProfile;
  coachInsights: CoachInsight[];
  showCoach: boolean;
  showProModal: boolean;
  onlineRoomId: string | null;
  gameStartTime: number;
  init: () => void;
  newGame: (mode: GameMode, difficulty?: Difficulty) => void;
  clickSquare: (row: number, col: number) => void;
  setDifficulty: (d: Difficulty) => void;
  toggleHints: () => void;
  tickBlitz: () => void;
  dismissCoach: () => void;
  setShowProModal: (v: boolean) => void;
  upgradePro: () => void;
  updateProfile: (p: Partial<PlayerProfile>) => void;
  getHints: () => GameMove[];
  setOnlineRoom: (id: string | null) => void;
  applyRemoteMove: (move: GameMove) => void;
  getRemoteState: () => GameState;
  setPeerSender: (fn: ((move: GameMove) => void) | null) => void;
}

let peerSender: ((move: GameMove) => void) | null = null;

function finalizeGame(
  state: GameState,
  profile: PlayerProfile,
  startTime: number,
): { profile: PlayerProfile; insights: CoachInsight[] } {
  if (state.status === "playing") {
    return { profile, insights: [] };
  }

  const humanWon =
    state.mode === "ai"
      ? state.status === "white-won"
      : false;

  const updated = { ...profile };
  if (state.mode === "ai") {
    if (humanWon) {
      updated.wins += 1;
      updated.rating += 15;
    } else if (state.status !== "draw") {
      updated.losses += 1;
      updated.rating = Math.max(800, updated.rating - 10);
    }
  }

  saveProfile(updated);
  updateLeaderboard(updated);

  const summary: SavedGameSummary = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    mode: state.mode,
    winner: state.status,
    moves: state.history.length,
    durationSec: Math.floor((Date.now() - startTime) / 1000),
  };
  appendGameHistory(summary);
  clearActiveGame();

  return { profile: updated, insights: analyzeGame(state) };
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: createNewGame(),
  profile: defaultProfile(),
  coachInsights: [],
  showCoach: false,
  showProModal: false,
  onlineRoomId: null,
  gameStartTime: Date.now(),

  init: () => {
    const profile = loadProfile();
    const saved = loadActiveGame();
    set({
      profile,
      game: saved ? loadGameState(saved) : createNewGame(),
      gameStartTime: Date.now(),
    });
  },

  newGame: (mode, difficulty = "medium") => {
    const game = createNewGame(mode, difficulty);
    set({
      game,
      coachInsights: [],
      showCoach: false,
      gameStartTime: Date.now(),
    });
    saveActiveGame(game);
  },

  clickSquare: (row, col) => {
    const { game, profile, gameStartTime } = get();
    if (game.status !== "playing") return;
    if (game.mode === "ai" && game.currentPlayer === "black") return;

    let next = selectSquare(game, { row, col });
    if (next === game) return;

    if (next.history.length > game.history.length) {
      const lastMove = next.history[next.history.length - 1].move;
      if (game.mode === "online" && peerSender) {
        peerSender(lastMove);
      }
    }

    if (next.status === "playing") {
      saveActiveGame(next);
    }

    const final = runAiIfNeeded(next);

    if (final.status !== "playing") {
      const result = finalizeGame(final, profile, gameStartTime);
      set({
        game: final,
        profile: result.profile,
        coachInsights: result.insights,
        showCoach: result.insights.length > 0,
      });
      return;
    }

    set({ game: final });
  },

  setDifficulty: (d) => {
    const { game } = get();
    set({ game: { ...game, difficulty: d } });
  },

  toggleHints: () => {
    const { game } = get();
    set({ game: { ...game, hintsEnabled: !game.hintsEnabled } });
  },

  tickBlitz: () => {
    const { game } = get();
    if (!game.blitzActive || game.status !== "playing") return;

    const key = game.currentPlayer;
    const seconds = { ...game.blitzSeconds };
    seconds[key] = Math.max(0, seconds[key] - 1);

    if (seconds[key] === 0) {
      const status = key === "white" ? "black-won" : "white-won";
      set({ game: { ...game, blitzSeconds: seconds, status, legalMoves: [] } });
      return;
    }

    set({ game: { ...game, blitzSeconds: seconds } });
  },

  dismissCoach: () => set({ showCoach: false }),

  setShowProModal: (v) => set({ showProModal: v }),

  upgradePro: () => {
    const profile = { ...get().profile, isPro: true };
    saveProfile(profile);
    set({ profile, showProModal: false });
  },

  updateProfile: (p) => {
    const profile = { ...get().profile, ...p };
    saveProfile(profile);
    updateLeaderboard(profile);
    set({ profile });
  },

  getHints: () => getHintMoves(get().game),

  setOnlineRoom: (id) => set({ onlineRoomId: id }),

  applyRemoteMove: (move) => {
    const { game, profile, gameStartTime } = get();
    const next = executeMove(game, move);
    if (next.status !== "playing") {
      const result = finalizeGame(next, profile, gameStartTime);
      set({
        game: next,
        profile: result.profile,
        coachInsights: result.insights,
        showCoach: true,
      });
    } else {
      saveActiveGame(next);
      set({ game: next });
    }
  },

  getRemoteState: () => get().game,

  setPeerSender: (fn) => {
    peerSender = fn;
  },
}));

function defaultProfile(): PlayerProfile {
  return {
    id: "guest",
    nickname: "Игрок",
    city: "Алматы",
    wins: 0,
    losses: 0,
    rating: 1000,
    isPro: false,
  };
}

function runAiIfNeeded(game: GameState): GameState {
  if (game.mode !== "ai" || game.currentPlayer !== "black" || game.status !== "playing") {
    return game;
  }

  const move = pickAiMove(game.board, "black", game.difficulty);
  if (!move) return game;
  return executeMove(game, move);
}
