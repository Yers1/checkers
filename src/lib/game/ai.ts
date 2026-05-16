import { applyMove } from "./engine";
import { getAllLegalMoves, getGameStatus } from "./moves";
import type { Board, Difficulty, GameMove, Player } from "./types";

function evaluateBoard(board: Board, aiPlayer: Player): number {
  let score = 0;

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      const value = cell.kind === "king" ? 180 : 100;
      const positional =
        cell.kind === "man"
          ? cell.player === "white"
            ? (7 - r) * 2
            : r * 2
          : 15;
      const total = value + positional;
      score += cell.player === aiPlayer ? total : -total;
    }
  }

  return score;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiPlayer: Player,
  currentPlayer: Player,
): number {
  const status = getGameStatus(board, currentPlayer);
  if (depth === 0 || status !== "playing") {
    if (status === "white-won") return aiPlayer === "white" ? 10000 : -10000;
    if (status === "black-won") return aiPlayer === "black" ? 10000 : -10000;
    return evaluateBoard(board, aiPlayer);
  }

  const moves = getAllLegalMoves(board, currentPlayer);
  if (moves.length === 0) {
    return evaluateBoard(board, aiPlayer);
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const next = applyMove(board, move);
      const nextPlayer = currentPlayer === "white" ? "black" : "white";
      const ev = minimax(
        next,
        depth - 1,
        alpha,
        beta,
        false,
        aiPlayer,
        nextPlayer,
      );
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (const move of moves) {
    const next = applyMove(board, move);
    const nextPlayer = currentPlayer === "white" ? "black" : "white";
    const ev = minimax(next, depth - 1, alpha, beta, true, aiPlayer, nextPlayer);
    minEval = Math.min(minEval, ev);
    beta = Math.min(beta, ev);
    if (beta <= alpha) break;
  }
  return minEval;
}

const DEPTH: Record<Difficulty, number> = {
  easy: 2,
  medium: 4,
  hard: 6,
};

export function pickAiMove(
  board: Board,
  aiPlayer: Player,
  difficulty: Difficulty,
): GameMove | null {
  const moves = getAllLegalMoves(board, aiPlayer);
  if (moves.length === 0) return null;

  if (difficulty === "easy" && Math.random() < 0.35) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = DEPTH[difficulty];
  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const next = applyMove(board, move);
    const nextPlayer = aiPlayer === "white" ? "black" : "white";
    const score = minimax(
      next,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      aiPlayer,
      nextPlayer,
    );

    const noise = difficulty === "easy" ? (Math.random() - 0.5) * 40 : 0;

    if (score + noise > bestScore) {
      bestScore = score + noise;
      bestMove = move;
    }
  }

  return bestMove;
}
