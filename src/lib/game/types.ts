export type Player = "white" | "black";

export type PieceKind = "man" | "king";

export interface Piece {
  player: Player;
  kind: PieceKind;
}

export type Cell = Piece | null;

export type Board = Cell[][];

export interface Position {
  row: number;
  col: number;
}

export interface GameMove {
  from: Position;
  to: Position;
  captures: Position[];
  path: Position[];
}

export type GameMode =
  | "local"
  | "ai"
  | "blitz"
  | "online"
  | "puzzle"
  | "daily";

export type Difficulty = "easy" | "medium" | "hard";

export type GameStatus = "playing" | "white-won" | "black-won" | "draw";

export type BoardSkin = "classic" | "neon" | "marble" | "midnight";

export interface MoveRecord {
  move: GameMove;
  player: Player;
  boardBefore: string;
  timestamp: number;
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  selected: Position | null;
  legalMoves: GameMove[];
  mustContinueFrom: Position | null;
  history: MoveRecord[];
  mode: GameMode;
  difficulty: Difficulty;
  hintsEnabled: boolean;
  blitzSeconds: { white: number; black: number };
  blitzActive: boolean;
  puzzleId?: string;
  dailyDate?: string;
}

export interface PlayerProfile {
  id: string;
  nickname: string;
  city: string;
  wins: number;
  losses: number;
  rating: number;
  isPro: boolean;
  streak: number;
  bestStreak: number;
  puzzlesSolved: number;
  gamesPlayed: number;
  unlockedAchievements: string[];
  boardSkin: BoardSkin;
}

export interface CoachInsight {
  type:
    | "missed-capture"
    | "blunder"
    | "good"
    | "promotion-risk"
    | "double-capture";
  moveIndex: number;
  player: Player;
  message: string;
  severity: "info" | "warning" | "critical";
}

export interface UiSettings {
  soundEnabled: boolean;
  boardFlipped: boolean;
  zenMode: boolean;
  particlesEnabled: boolean;
}

export interface LastMoveHighlight {
  from: Position;
  to: Position;
  captures: Position[];
}
