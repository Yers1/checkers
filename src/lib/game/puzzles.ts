import { createInitialBoard } from "./board";
import type { Board, GameMove, Player } from "./types";
import { getAllLegalMoves } from "./moves";

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  board: Board;
  player: Player;
  /** Minimum captures required (for «find max capture» puzzles) */
  minCaptures: number;
}

function emptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function place(
  board: Board,
  row: number,
  col: number,
  player: Player,
  kind: "man" | "king" = "man",
) {
  board[row][col] = { player, kind };
}

/** Тактическая задача: белые находят максимальное взятие */
const PUZZLES: Puzzle[] = [
  {
    id: "p1-double",
    title: "Двойной удар",
    description: "Белые: найдите взятие на 2 фигуры за один ход",
    difficulty: 1,
    minCaptures: 2,
    player: "white",
    board: (() => {
      const b = emptyBoard();
      place(b, 5, 0, "white");
      place(b, 4, 1, "black");
      place(b, 2, 3, "black");
      return b;
    })(),
  },
  {
    id: "p2-triple",
    title: "Тройная серия",
    description: "Белые: съешьте 3 фигуры подряд",
    difficulty: 2,
    minCaptures: 3,
    player: "white",
    board: (() => {
      const b = emptyBoard();
      place(b, 6, 2, "white");
      place(b, 5, 3, "black");
      place(b, 3, 5, "black");
      place(b, 1, 7, "black");
      return b;
    })(),
  },
  {
    id: "p3-king-hunt",
    title: "Охота дамой",
    description: "Дамка белых: дальнее взятие",
    difficulty: 3,
    minCaptures: 2,
    player: "white",
    board: (() => {
      const b = emptyBoard();
      place(b, 2, 2, "white", "king");
      place(b, 5, 5, "black");
      place(b, 7, 7, "black");
      return b;
    })(),
  },
  {
    id: "p4-fork",
    title: "Вилка",
    description: "Одним ходом откройте путь к двум фигурам",
    difficulty: 2,
    minCaptures: 2,
    player: "white",
    board: (() => {
      const b = emptyBoard();
      place(b, 4, 0, "white");
      place(b, 3, 1, "black");
      place(b, 1, 3, "black");
      place(b, 6, 6, "black", "king");
      return b;
    })(),
  },
  {
    id: "p5-endgame",
    title: "Эндшпиль",
    description: "Завершите комбинацию в центре доски",
    difficulty: 3,
    minCaptures: 2,
    player: "white",
    board: (() => {
      const b = emptyBoard();
      place(b, 3, 3, "white", "king");
      place(b, 4, 4, "black");
      place(b, 6, 6, "black");
      place(b, 2, 6, "black");
      return b;
    })(),
  },
];

export function getAllPuzzles(): Puzzle[] {
  return PUZZLES;
}

export function getPuzzleById(id: string): Puzzle | undefined {
  return PUZZLES.find((p) => p.id === id);
}

export function getDailyPuzzle(): Puzzle {
  const day = new Date().toISOString().slice(0, 10);
  const index =
    day.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % PUZZLES.length;
  const base = PUZZLES[index];
  return { ...base, id: `daily-${day}`, title: `Челлендж дня · ${day}` };
}

export function validatePuzzleMove(
  puzzle: Puzzle,
  move: GameMove,
  board: Board,
): { correct: boolean; message: string } {
  const legal = getAllLegalMoves(board, puzzle.player);
  const isLegal = legal.some(
    (m) =>
      m.from.row === move.from.row &&
      m.from.col === move.from.col &&
      m.to.row === move.to.row &&
      m.to.col === move.to.col,
  );

  if (!isLegal) {
    return { correct: false, message: "Недопустимый ход по правилам" };
  }

  if (move.captures.length >= puzzle.minCaptures) {
    return { correct: true, message: "Отлично! Комбинация найдена!" };
  }

  const maxCap = Math.max(0, ...legal.map((m) => m.captures.length));
  if (maxCap > move.captures.length) {
    return {
      correct: false,
      message: `Можно взять ${maxCap} фигур — попробуйте сильнее!`,
    };
  }

  return { correct: true, message: "Задача решена!" };
}

export function createPuzzleBoard(puzzle: Puzzle): Board {
  return puzzle.board.map((row) => row.map((c) => (c ? { ...c } : null)));
}

export { createInitialBoard };
