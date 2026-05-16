import type { Board, Cell, Piece, Player, Position } from "./types";

export const BOARD_SIZE = 8;

export function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1;
}

export function isInside(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function posKey(p: Position): string {
  return `${p.row},${p.col}`;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array<Cell>(BOARD_SIZE).fill(null),
  );

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!isDarkSquare(row, col)) continue;
      if (row < 3) {
        board[row][col] = { player: "black", kind: "man" };
      } else if (row > 4) {
        board[row][col] = { player: "white", kind: "man" };
      }
    }
  }

  return board;
}

export function getPiece(board: Board, pos: Position): Cell {
  return board[pos.row][pos.col];
}

export function setPiece(board: Board, pos: Position, piece: Cell): void {
  board[pos.row][pos.col] = piece;
}

export function opponent(player: Player): Player {
  return player === "white" ? "black" : "white";
}

export function isKingRow(player: Player, row: number): boolean {
  return player === "white" ? row === 0 : row === BOARD_SIZE - 1;
}

export function promoteIfNeeded(piece: Piece, row: number): Piece {
  if (piece.kind === "man" && isKingRow(piece.player, row)) {
    return { ...piece, kind: "king" };
  }
  return piece;
}

export function countPieces(board: Board, player?: Player): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (!cell) continue;
      if (!player || cell.player === player) count++;
    }
  }
  return count;
}

export function serializeBoard(board: Board): string {
  return board
    .map((row) =>
      row
        .map((cell) => {
          if (!cell) return ".";
          const k = cell.kind === "king" ? "K" : "M";
          return cell.player === "white" ? `w${k}` : `b${k}`;
        })
        .join(""),
    )
    .join("/");
}
