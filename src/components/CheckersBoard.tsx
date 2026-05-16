"use client";

import { BOARD_SIZE, isDarkSquare } from "@/lib/game/board";
import type { GameMove, GameState, Position } from "@/lib/game/types";

interface Props {
  game: GameState;
  onSquareClick: (row: number, col: number) => void;
  hints?: GameMove[];
}

function isSelected(selected: Position | null, row: number, col: number) {
  return selected?.row === row && selected?.col === col;
}

function isHintTarget(hints: GameMove[], row: number, col: number) {
  return hints.some((m) => m.to.row === row && m.to.col === col);
}

function isLegalTarget(
  legalMoves: GameMove[],
  selected: Position | null,
  row: number,
  col: number,
) {
  if (!selected) return false;
  return legalMoves.some(
    (m) =>
      m.from.row === selected.row &&
      m.from.col === selected.col &&
      m.to.row === row &&
      m.to.col === col,
  );
}

export function CheckersBoard({ game, onSquareClick, hints = [] }: Props) {
  const displayHints = game.hintsEnabled ? hints : [];

  return (
    <div className="board-shell">
      <div className="board-grid" role="grid" aria-label="Доска шашек">
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => {
            const dark = isDarkSquare(row, col);
            const piece = game.board[row][col];
            const selected = isSelected(game.selected, row, col);
            const target =
              isLegalTarget(game.legalMoves, game.selected, row, col) ||
              isHintTarget(displayHints, row, col);

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                disabled={!dark || game.status !== "playing"}
                onClick={() => dark && onSquareClick(row, col)}
                className={[
                  "square",
                  dark ? "square-dark" : "square-light",
                  selected ? "square-selected" : "",
                  target ? "square-target" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {piece && (
                  <span
                    className={[
                      "piece",
                      piece.player === "white" ? "piece-white" : "piece-black",
                      piece.kind === "king" ? "piece-king" : "",
                    ].join(" ")}
                  >
                    {piece.kind === "king" && <span className="crown">♔</span>}
                  </span>
                )}
                {target && !piece && <span className="move-dot" />}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
