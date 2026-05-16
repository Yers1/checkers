import type { BoardSkin, GameState, PlayerProfile } from "./game/types";
import type { UiSettings } from "./game/types";

const PROFILE_KEY = "checkers-profile";
const HISTORY_KEY = "checkers-game-history";
const THEME_KEY = "checkers-theme";
const ACTIVE_GAME_KEY = "checkers-active-game";
const UI_KEY = "checkers-ui";
const DAILY_KEY = "checkers-daily-done";

export type Theme = "light" | "dark";

export interface SavedGameSummary {
  id: string;
  date: string;
  mode: GameState["mode"];
  winner: GameState["status"];
  moves: number;
  durationSec: number;
}

const DEFAULT_UI: UiSettings = {
  soundEnabled: true,
  boardFlipped: false,
  zenMode: false,
  particlesEnabled: true,
};

export function loadProfile(): PlayerProfile {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile();
    return { ...defaultProfile(), ...JSON.parse(raw) };
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(profile: PlayerProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function defaultProfile(): PlayerProfile {
  return {
    id: crypto.randomUUID(),
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

export function loadUiSettings(): UiSettings {
  if (typeof window === "undefined") return DEFAULT_UI;
  try {
    const raw = localStorage.getItem(UI_KEY);
    return raw ? { ...DEFAULT_UI, ...JSON.parse(raw) } : DEFAULT_UI;
  } catch {
    return DEFAULT_UI;
  }
}

export function saveUiSettings(settings: UiSettings): void {
  localStorage.setItem(UI_KEY, JSON.stringify(settings));
}

export function isDailyChallengeDone(): boolean {
  if (typeof window === "undefined") return false;
  const day = new Date().toISOString().slice(0, 10);
  return localStorage.getItem(DAILY_KEY) === day;
}

export function markDailyChallengeDone(): void {
  const day = new Date().toISOString().slice(0, 10);
  localStorage.setItem(DAILY_KEY, day);
}

export function loadTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(THEME_KEY) as Theme) || "dark";
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadGameHistory(): SavedGameSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendGameHistory(summary: SavedGameSummary): void {
  const history = loadGameHistory();
  history.unshift(summary);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export function saveActiveGame(state: GameState): void {
  localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(state));
}

export function loadActiveGame(): GameState | null {
  try {
    const raw = localStorage.getItem(ACTIVE_GAME_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearActiveGame(): void {
  localStorage.removeItem(ACTIVE_GAME_KEY);
}

export interface LeaderboardEntry {
  nickname: string;
  city: string;
  rating: number;
  wins: number;
}

const LEADERBOARD_KEY = "checkers-leaderboard";

export function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return seedLeaderboard();
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return seedLeaderboard();
    return JSON.parse(raw);
  } catch {
    return seedLeaderboard();
  }
}

export function updateLeaderboard(profile: PlayerProfile): void {
  const board = loadLeaderboard().filter((e) => e.nickname !== profile.nickname);
  board.push({
    nickname: profile.nickname,
    city: profile.city,
    rating: profile.rating,
    wins: profile.wins,
  });
  board.sort((a, b) => b.rating - a.rating);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board.slice(0, 100)));
}

function seedLeaderboard(): LeaderboardEntry[] {
  return [
    { nickname: "Айдар", city: "Алматы", rating: 1840, wins: 142 },
    { nickname: "Мария", city: "Астана", rating: 1760, wins: 98 },
    { nickname: "Timur", city: "Шымкент", rating: 1690, wins: 76 },
    { nickname: "Dana", city: "Алматы", rating: 1620, wins: 64 },
    { nickname: "Alex", city: "Караганда", rating: 1580, wins: 55 },
  ];
}

export function getCityLeaderboard(city: string): LeaderboardEntry[] {
  return loadLeaderboard()
    .filter((e) => e.city.toLowerCase() === city.toLowerCase())
    .sort((a, b) => b.rating - a.rating);
}

export function saveBoardSkin(skin: BoardSkin): void {
  const p = loadProfile();
  saveProfile({ ...p, boardSkin: skin });
}
