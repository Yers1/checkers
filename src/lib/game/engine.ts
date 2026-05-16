import { cloneBoard, getPiece, promoteIfNeeded, setPiece } from "./board";
import { getAllLegalMoves, getGameStatus } from "./moves";
import type { Board, GameMove, GameState, MoveRecord, Player } from "./types";
import { createInitialBoard } from "./board";
import { opponent } from "./board";

export function applyMove(board: Board, move: GameMove): Board {
  const next = cloneBoard(board);
  const piece = getPiece(next, move.from);
  if (!piece) return next;

  setPiece(next, move.from, null);
  for (const cap of move.captures) {
    setPiece(next, cap, null);
  }

  const finalPiece = promoteIfNeeded(piece, move.to.row);
  setPiece(next, move.to, finalPiece);

  return next;
}

export function createNewGame(
  mode: GameState["mode"] = "local",
  difficulty: GameState["difficulty"] = "medium",
): GameState {
  const board = createInitialBoard();
  return buildGameState(board, "white", mode, difficulty);
}

export function createCustomGame(
  board: Board,
  currentPlayer: Player,
  mode: GameState["mode"],
  extra?: Partial<GameState>,
): GameState {
  return {
    ...buildGameState(board, currentPlayer, mode, "medium"),
    ...extra,
    legalMoves: getAllLegalMoves(board, currentPlayer),
  };
}

function buildGameState(
  board: Board,
  currentPlayer: Player,
  mode: GameState["mode"],
  difficulty: GameState["difficulty"],
): GameState {
  return {
    board,
    currentPlayer,
    status: "playing",
    selected: null,
    legalMoves: getAllLegalMoves(board, currentPlayer),
    mustContinueFrom: null,
    history: [],
    mode,
    difficulty,
    hintsEnabled: mode !== "puzzle",
    blitzSeconds: { white: 180, black: 180 },
    blitzActive: mode === "blitz",
  };
}

export function boardAtMoveIndex(state: GameState, index: number): Board {
  if (index < 0) return state.board;
  let board = JSON.parse(state.history[0]?.boardBefore ?? "null") as Board | null;
  if (!board) return state.board;
  for (let i = 0; i <= index && i < state.history.length; i++) {
    board = applyMove(board, state.history[i].move);
  }
  return board;
}

export function refreshLegalMoves(state: GameState): GameMove[] {
  return getAllLegalMoves(state.board, state.currentPlayer);
}

export function executeMove(state: GameState, move: GameMove): GameState {
  const boardBefore = JSON.stringify(state.board);
  const newBoard = applyMove(state.board, move);
  const record: MoveRecord = {
    move,
    player: state.currentPlayer,
    boardBefore,
    timestamp: Date.now(),
  };

  const nextPlayer = opponent(state.currentPlayer);
  const status = getGameStatus(newBoard, nextPlayer);

  return {
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    status,
    selected: null,
    legalMoves: status === "playing" ? getAllLegalMoves(newBoard, nextPlayer) : [],
    mustContinueFrom: null,
    history: [...state.history, record],
  };
}

export function selectSquare(state: GameState, pos: { row: number; col: number }): GameState {
  if (state.status !== "playing") return state;

  const legal = refreshLegalMoves(state);
  const piece = state.board[pos.row][pos.col];

  if (state.selected) {
    const move = legal.find(
      (m) =>
        m.from.row === state.selected!.row &&
        m.from.col === state.selected!.col &&
        m.to.row === pos.row &&
        m.to.col === pos.col,
    );
    if (move) return executeMove(state, move);

    if (piece?.player === state.currentPlayer) {
      const fromMoves = legal.filter(
        (m) => m.from.row === pos.row && m.from.col === pos.col,
      );
      return { ...state, selected: pos, legalMoves: fromMoves };
    }

    return { ...state, selected: null, legalMoves: legal };
  }

  if (piece?.player === state.currentPlayer) {
    const fromMoves = legal.filter(
      (m) => m.from.row === pos.row && m.from.col === pos.col,
    );
    return { ...state, selected: pos, legalMoves: fromMoves };
  }

  return state;
}

export function getHintMoves(state: GameState): GameMove[] {
  return refreshLegalMoves(state).slice(0, 5);
}

export function loadGameState(partial: Partial<GameState>): GameState {
  const base = createNewGame();
  const merged = { ...base, ...partial };
  merged.legalMoves =
    merged.status === "playing"
      ? getAllLegalMoves(merged.board, merged.currentPlayer)
      : [];
  return merged;
}

export function winnerLabel(status: GameState["status"]): string | null {
  if (status === "white-won") return "Белые победили!";
  if (status === "black-won") return "Чёрные победили!";
  return null;
}

export function playerDisplayName(player: Player, mode: GameState["mode"]): string {
  if (mode === "ai") {
    return player === "white" ? "Вы" : "ИИ";
  }
  return player === "white" ? "Белые" : "Чёрные";
}
