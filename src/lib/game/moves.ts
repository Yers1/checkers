import {
  BOARD_SIZE,
  cloneBoard,
  getPiece,
  isDarkSquare,
  isInside,
  isKingRow,
  opponent,
  promoteIfNeeded,
  setPiece,
} from "./board";
import type { Board, GameMove, Piece, Player, Position } from "./types";

const DIAGONALS = [
  { dr: -1, dc: -1 },
  { dr: -1, dc: 1 },
  { dr: 1, dc: -1 },
  { dr: 1, dc: 1 },
];

function forwardDirs(player: Player) {
  return player === "white"
    ? [
        { dr: -1, dc: -1 },
        { dr: -1, dc: 1 },
      ]
    : [
        { dr: 1, dc: -1 },
        { dr: 1, dc: 1 },
      ];
}

function copyBoard(board: Board): Board {
  return cloneBoard(board);
}

function getManSimpleMoves(board: Board, from: Position, piece: Piece): GameMove[] {
  const moves: GameMove[] = [];
  for (const { dr, dc } of forwardDirs(piece.player)) {
    const to = { row: from.row + dr, col: from.col + dc };
    if (!isInside(to.row, to.col) || !isDarkSquare(to.row, to.col)) continue;
    if (getPiece(board, to)) continue;
    moves.push({
      from,
      to,
      captures: [],
      path: [from, to],
    });
  }
  return moves;
}

function getKingSimpleMoves(board: Board, from: Position): GameMove[] {
  const moves: GameMove[] = [];
  for (const { dr, dc } of DIAGONALS) {
    let r = from.row + dr;
    let c = from.col + dc;
    while (isInside(r, c) && isDarkSquare(r, c)) {
      const pos = { row: r, col: c };
      if (getPiece(board, pos)) break;
      moves.push({
        from,
        to: pos,
        captures: [],
        path: [from, pos],
      });
      r += dr;
      c += dc;
    }
  }
  return moves;
}

function findManCaptures(
  board: Board,
  from: Position,
  piece: Piece,
  captured: Position[],
): GameMove[] {
  const results: GameMove[] = [];

  for (const { dr, dc } of DIAGONALS) {
    const mid = { row: from.row + dr, col: from.col + dc };
    const land = { row: from.row + dr * 2, col: from.col + dc * 2 };

    if (!isInside(land.row, land.col) || !isDarkSquare(land.row, land.col)) continue;

    const midPiece = getPiece(board, mid);
    if (!midPiece || midPiece.player === piece.player) continue;
    if (captured.some((p) => p.row === mid.row && p.col === mid.col)) continue;
    if (getPiece(board, land)) continue;

    const nextBoard = copyBoard(board);
    setPiece(nextBoard, from, null);
    setPiece(nextBoard, mid, null);
    let landingPiece = promoteIfNeeded(piece, land.row);
    setPiece(nextBoard, land, landingPiece);

    const newCaptured = [...captured, mid];
    const further = findManCaptures(nextBoard, land, landingPiece, newCaptured);

    if (further.length > 0) {
      for (const seq of further) {
        results.push({
          from,
          to: seq.to,
          captures: seq.captures,
          path: [from, ...seq.path.slice(1)],
        });
      }
    } else {
      results.push({
        from,
        to: land,
        captures: newCaptured,
        path: [from, land],
      });
    }
  }

  return results;
}

function findKingCaptures(
  board: Board,
  from: Position,
  piece: Piece,
  captured: Position[],
): GameMove[] {
  const results: GameMove[] = [];

  for (const { dr, dc } of DIAGONALS) {
    let r = from.row + dr;
    let c = from.col + dc;
    let enemy: Position | null = null;

    while (isInside(r, c) && isDarkSquare(r, c)) {
      const pos = { row: r, col: c };
      const cell = getPiece(board, pos);

      if (!cell) {
        if (enemy) {
          const nextBoard = copyBoard(board);
          setPiece(nextBoard, from, null);
          setPiece(nextBoard, enemy, null);
          const landingPiece = promoteIfNeeded(piece, pos.row);
          setPiece(nextBoard, pos, landingPiece);

          const newCaptured = [...captured, enemy];
          const further = findKingCaptures(
            nextBoard,
            pos,
            landingPiece,
            newCaptured,
          );

          if (further.length > 0) {
            for (const seq of further) {
              results.push({
                from,
                to: seq.to,
                captures: seq.captures,
                path: [from, ...seq.path.slice(1)],
              });
            }
          } else {
            results.push({
              from,
              to: pos,
              captures: newCaptured,
              path: [from, pos],
            });
          }
        }
      } else {
        if (cell.player === piece.player) break;
        if (enemy) break;
        if (captured.some((p) => p.row === pos.row && p.col === pos.col)) break;
        enemy = pos;
      }

      r += dr;
      c += dc;
    }
  }

  return results;
}

function getCapturesForPiece(board: Board, from: Position): GameMove[] {
  const piece = getPiece(board, from);
  if (!piece) return [];
  return piece.kind === "man"
    ? findManCaptures(board, from, piece, [])
    : findKingCaptures(board, from, piece, []);
}

function getSimpleMovesForPiece(board: Board, from: Position): GameMove[] {
  const piece = getPiece(board, from);
  if (!piece) return [];
  return piece.kind === "man"
    ? getManSimpleMoves(board, from, piece)
    : getKingSimpleMoves(board, from);
}

export function getMovesForPiece(board: Board, from: Position, player: Player): GameMove[] {
  const piece = getPiece(board, from);
  if (!piece || piece.player !== player) return [];
  return getCapturesForPiece(board, from);
}

export function getAllLegalMoves(board: Board, player: Player): GameMove[] {
  const allCaptures: GameMove[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!isDarkSquare(row, col)) continue;
      const from = { row, col };
      const piece = getPiece(board, from);
      if (!piece || piece.player !== player) continue;
      allCaptures.push(...getCapturesForPiece(board, from));
    }
  }

  if (allCaptures.length > 0) {
    const maxCaptures = Math.max(...allCaptures.map((m) => m.captures.length));
    return allCaptures.filter((m) => m.captures.length === maxCaptures);
  }

  const simpleMoves: GameMove[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!isDarkSquare(row, col)) continue;
      const from = { row, col };
      const piece = getPiece(board, from);
      if (!piece || piece.player !== player) continue;
      simpleMoves.push(...getSimpleMovesForPiece(board, from));
    }
  }

  return simpleMoves;
}

export function movesFromSquare(
  board: Board,
  from: Position,
  player: Player,
  allLegal: GameMove[],
): GameMove[] {
  return allLegal.filter((m) => m.from.row === from.row && m.from.col === from.col);
}

export function isPromotionMove(board: Board, move: GameMove): boolean {
  const piece = getPiece(board, move.from);
  if (!piece || piece.kind === "king") return false;
  return move.path.some((p) => isKingRow(piece.player, p.row));
}

export function moveEquals(a: GameMove, b: GameMove): boolean {
  return (
    a.from.row === b.from.row &&
    a.from.col === b.from.col &&
    a.to.row === b.to.row &&
    a.to.col === b.to.col &&
    a.captures.length === b.captures.length
  );
}

export function canPlayerMove(board: Board, player: Player): boolean {
  return getAllLegalMoves(board, player).length > 0;
}

export function getGameStatus(board: Board, currentPlayer: Player): "playing" | "white-won" | "black-won" {
  if (!canPlayerMove(board, currentPlayer)) {
    return currentPlayer === "white" ? "black-won" : "white-won";
  }
  const whitePieces = countPlayerPieces(board, "white");
  const blackPieces = countPlayerPieces(board, "black");
  if (whitePieces === 0) return "black-won";
  if (blackPieces === 0) return "white-won";
  return "playing";
}

function countPlayerPieces(board: Board, player: Player): number {
  let n = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell?.player === player) n++;
    }
  }
  return n;
}
