"use client";

import { create } from "zustand";
import { checkNewAchievements, ACHIEVEMENTS } from "@/lib/achievements";
import { fireCaptureBurst, firePuzzleSuccess, fireWinConfetti } from "@/lib/effects";
import { pickAiMove } from "@/lib/game/ai";
import { analyzeGame } from "@/lib/game/coach";
import {
  createCustomGame,
  createNewGame,
  executeMove,
  getHintMoves,
  loadGameState,
  selectSquare,
} from "@/lib/game/engine";
import {
  createPuzzleBoard,
  getDailyPuzzle,
  getPuzzleById,
  validatePuzzleMove,
} from "@/lib/game/puzzles";
import type {
  BoardSkin,
  CoachInsight,
  Difficulty,
  GameMode,
  GameMove,
  GameState,
  LastMoveHighlight,
  PlayerProfile,
  UiSettings,
} from "@/lib/game/types";
import { sounds } from "@/lib/sounds";
import {
  appendGameHistory,
  clearActiveGame,
  isDailyChallengeDone,
  loadActiveGame,
  loadProfile,
  loadUiSettings,
  markDailyChallengeDone,
  saveActiveGame,
  saveProfile,
  saveUiSettings,
  updateLeaderboard,
  type SavedGameSummary,
} from "@/lib/storage";

interface GameStore {
  game: GameState;
  profile: PlayerProfile;
  ui: UiSettings;
  coachInsights: CoachInsight[];
  showCoach: boolean;
  showProModal: boolean;
  onlineRoomId: string | null;
  gameStartTime: number;
  lastMove: LastMoveHighlight | null;
  aiThinking: boolean;
  comboCount: number;
  shakeBoard: boolean;
  replayIndex: number | null;
  toastAchievements: string[];
  puzzleMessage: string | null;
  currentPuzzleIndex: number;
  init: () => void;
  newGame: (mode: GameMode, difficulty?: Difficulty) => void;
  startPuzzle: (puzzleId: string) => void;
  startDaily: () => void;
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
  setBoardSkin: (skin: BoardSkin) => void;
  toggleUi: (key: keyof UiSettings) => void;
  setReplayIndex: (index: number | null) => void;
  dismissAchievementToast: () => void;
  nextPuzzle: () => void;
}

let peerSender: ((move: GameMove) => void) | null = null;

const PUZZLE_IDS = ["p1-double", "p2-triple", "p3-king-hunt", "p4-fork", "p5-endgame"];

export const useGameStore = create<GameStore>((set, get) => ({
  game: createNewGame(),
  profile: defaultProfile(),
  ui: loadUiSettings(),
  coachInsights: [],
  showCoach: false,
  showProModal: false,
  onlineRoomId: null,
  gameStartTime: Date.now(),
  lastMove: null,
  aiThinking: false,
  comboCount: 0,
  shakeBoard: false,
  replayIndex: null,
  toastAchievements: [],
  puzzleMessage: null,
  currentPuzzleIndex: 0,

  init: () => {
    const profile = loadProfile();
    const saved = loadActiveGame();
    set({
      profile,
      ui: loadUiSettings(),
      game: saved ? loadGameState(saved) : createNewGame(),
      gameStartTime: Date.now(),
    });
  },

  newGame: (mode, difficulty = "medium") => {
    if (mode === "puzzle") {
      get().startPuzzle(PUZZLE_IDS[0]);
      return;
    }
    if (mode === "daily") {
      get().startDaily();
      return;
    }
    const game = createNewGame(mode, difficulty);
    set({
      game,
      coachInsights: [],
      showCoach: false,
      gameStartTime: Date.now(),
      lastMove: null,
      replayIndex: null,
      puzzleMessage: null,
      comboCount: 0,
    });
    saveActiveGame(game);
  },

  startPuzzle: (puzzleId) => {
    const puzzle = getPuzzleById(puzzleId);
    if (!puzzle) return;
    const game = createCustomGame(createPuzzleBoard(puzzle), puzzle.player, "puzzle", {
      puzzleId: puzzle.id,
    });
    set({
      game,
      puzzleMessage: puzzle.description,
      currentPuzzleIndex: PUZZLE_IDS.indexOf(puzzleId),
      gameStartTime: Date.now(),
      lastMove: null,
      replayIndex: null,
    });
  },

  startDaily: () => {
    const puzzle = getDailyPuzzle();
    const game = createCustomGame(createPuzzleBoard(puzzle), puzzle.player, "daily", {
      puzzleId: puzzle.id,
      dailyDate: new Date().toISOString().slice(0, 10),
    });
    set({
      game,
      puzzleMessage: `📅 ${puzzle.description}`,
      lastMove: null,
      replayIndex: null,
    });
  },

  nextPuzzle: () => {
    const next = (get().currentPuzzleIndex + 1) % PUZZLE_IDS.length;
    set({ currentPuzzleIndex: next });
    get().startPuzzle(PUZZLE_IDS[next]);
  },

  clickSquare: (row, col) => {
    const {
      game,
      profile,
      gameStartTime,
      ui,
      replayIndex,
    } = get();
    if (replayIndex !== null) return;
    if (game.status !== "playing") return;
    if (game.mode === "ai" && game.currentPlayer === "black") return;

    const before = game;
    let next = selectSquare(game, { row, col });
    if (next === game) return;

    const madeMove = next.history.length > game.history.length;

    if (madeMove) {
      const record = next.history[next.history.length - 1];
      const lastMove: LastMoveHighlight = {
        from: record.move.from,
        to: record.move.to,
        captures: record.move.captures,
      };
      const combo = record.move.captures.length;

      if (ui.soundEnabled) {
        if (combo > 0) sounds.capture();
        else sounds.move();
      }

      if (ui.particlesEnabled && combo > 0) {
        fireCaptureBurst(0.5, 0.5);
      }

      if (game.mode === "online" && peerSender) {
        peerSender(record.move);
      }

      if (game.mode === "puzzle" || game.mode === "daily") {
        const puzzle =
          game.mode === "daily"
            ? getDailyPuzzle()
            : getPuzzleById(game.puzzleId ?? PUZZLE_IDS[0]);
        if (puzzle) {
          const boardBefore = JSON.parse(record.boardBefore) as GameState["board"];
          const result = validatePuzzleMove(puzzle, record.move, boardBefore);
          if (!result.correct) {
            if (ui.soundEnabled) sounds.error();
            set({ shakeBoard: true, puzzleMessage: result.message });
            setTimeout(() => set({ shakeBoard: false }), 500);
            return;
          }
          if (ui.soundEnabled) sounds.puzzle();
          if (ui.particlesEnabled) firePuzzleSuccess();
          const updated = {
            ...profile,
            puzzlesSolved: profile.puzzlesSolved + 1,
          };
          if (game.mode === "daily") markDailyChallengeDone();
          const achievements = checkNewAchievements(
            updated,
            next,
            combo,
            false,
            true,
          );
          saveProfile({
            ...updated,
            unlockedAchievements: [
              ...updated.unlockedAchievements,
              ...achievements,
            ],
          });
          set({
            game: { ...next, status: "white-won" },
            profile: updated,
            puzzleMessage: result.message,
            lastMove,
            comboCount: combo,
            toastAchievements: achievements,
          });
          return;
        }
      }

      set({ lastMove, comboCount: combo });

      if (next.status === "playing") {
        saveActiveGame(next);
      }

      if (game.mode === "ai" && next.currentPlayer === "black" && next.status === "playing") {
        set({ game: next, aiThinking: true });
        setTimeout(() => {
          const aiMove = pickAiMove(next.board, "black", next.difficulty);
          if (!aiMove) {
            set({ aiThinking: false });
            return;
          }
          const afterAi = executeMove(next, aiMove);
          const aiRecord = afterAi.history[afterAi.history.length - 1];
          if (get().ui.soundEnabled) {
            if (aiRecord.move.captures.length) sounds.capture();
            else sounds.move();
          }
          finishOrContinue(afterAi, profile, gameStartTime, {
            from: aiRecord.move.from,
            to: aiRecord.move.to,
            captures: aiRecord.move.captures,
          });
          set({ aiThinking: false });
        }, 450 + Math.random() * 350);
        return;
      }

      finishOrContinue(next, profile, gameStartTime, lastMove);
      return;
    }

    set({ game: next });
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
    const achievements = checkNewAchievements(profile, get().game, 0, false);
    saveProfile({
      ...profile,
      unlockedAchievements: [...profile.unlockedAchievements, ...achievements],
    });
    set({ profile, showProModal: false, toastAchievements: achievements });
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
    const { game, profile, gameStartTime, ui } = get();
    const next = executeMove(game, move);
    if (ui.soundEnabled) sounds.move();
    finishOrContinue(next, profile, gameStartTime, {
      from: move.from,
      to: move.to,
      captures: move.captures,
    });
  },

  getRemoteState: () => get().game,

  setPeerSender: (fn) => {
    peerSender = fn;
  },

  setBoardSkin: (skin) => {
    const profile = { ...get().profile, boardSkin: skin };
    saveProfile(profile);
    set({ profile });
    document.documentElement.setAttribute("data-skin", skin);
  },

  toggleUi: (key) => {
    const ui = { ...get().ui, [key]: !get().ui[key] };
    saveUiSettings(ui);
    set({ ui });
  },

  setReplayIndex: (index) => set({ replayIndex: index }),

  dismissAchievementToast: () => set({ toastAchievements: [] }),
}));

function finishOrContinue(
  final: GameState,
  profile: PlayerProfile,
  startTime: number,
  lastMove: LastMoveHighlight | null,
) {
  const { ui, comboCount } = useGameStore.getState();

  if (final.status !== "playing") {
    const humanWon = final.mode === "ai" && final.status === "white-won";
    const updated = { ...profile, gamesPlayed: profile.gamesPlayed + 1 };

    if (final.mode === "ai") {
      if (humanWon) {
        updated.wins += 1;
        updated.rating += 15;
        updated.streak += 1;
        updated.bestStreak = Math.max(updated.bestStreak, updated.streak);
        if (ui.soundEnabled) sounds.win();
        if (ui.particlesEnabled) fireWinConfetti();
      } else {
        updated.losses += 1;
        updated.rating = Math.max(800, updated.rating - 10);
        updated.streak = 0;
      }
    }

    const achievements = checkNewAchievements(
      updated,
      final,
      comboCount,
      humanWon,
    );
    updated.unlockedAchievements = [
      ...new Set([...updated.unlockedAchievements, ...achievements]),
    ];

    saveProfile(updated);
    updateLeaderboard(updated);

    const summary: SavedGameSummary = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mode: final.mode,
      winner: final.status,
      moves: final.history.length,
      durationSec: Math.floor((Date.now() - startTime) / 1000),
    };
    appendGameHistory(summary);
    clearActiveGame();

    useGameStore.setState({
      game: final,
      profile: updated,
      coachInsights: analyzeGame(final),
      showCoach: true,
      lastMove,
      toastAchievements: achievements,
      replayIndex: final.history.length > 0 ? final.history.length - 1 : null,
    });
    return;
  }

  useGameStore.setState({ game: final, lastMove });
}

function defaultProfile(): PlayerProfile {
  return {
    id: "guest",
    nickname: "Игрок",
    city: "Алматы",
    wins: 0,
    losses: 0,
    rating: 1000,
    isPro: false,
    streak: 0,
    bestStreak: 0,
    puzzlesSolved: 0,
    gamesPlayed: 0,
    unlockedAchievements: [],
    boardSkin: "classic",
  };
}

export function getAchievementMeta(id: string) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
