"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BOARD_SIZE, isDarkSquare } from "@/lib/game/board";
import { applyMove } from "@/lib/game/engine";
import type { Board, GameMove, GameState, LastMoveHighlight, Position } from "@/lib/game/types";

interface Props {
  game: GameState;
  displayBoard?: Board;
  onSquareClick: (row: number, col: number) => void;
  hints?: GameMove[];
  lastMove?: LastMoveHighlight | null;
  skin?: string;
  flipped?: boolean;
  shake?: boolean;
  disabled?: boolean;
}

function mapRow(row: number, flipped: boolean) {
  return flipped ? BOARD_SIZE - 1 - row : row;
}

function mapCol(col: number, flipped: boolean) {
  return flipped ? BOARD_SIZE - 1 - col : col;
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

function isGhost(
  lastMove: LastMoveHighlight | null | undefined,
  row: number,
  col: number,
) {
  if (!lastMove) return false;
  return (
    (lastMove.from.row === row && lastMove.from.col === col) ||
    lastMove.captures.some((c) => c.row === row && c.col === col)
  );
}

export function CheckersBoard({
  game,
  displayBoard,
  onSquareClick,
  hints = [],
  lastMove,
  skin = "classic",
  flipped = false,
  shake = false,
  disabled = false,
}: Props) {
  const board = displayBoard ?? game.board;
  const displayHints = game.hintsEnabled ? hints : [];
  const canPlay = game.status === "playing" && !disabled;

  return (
    <motion.div
      className={`board-shell skin-${skin} ${shake ? "board-shake" : ""}`}
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="board-grid"
        role="grid"
        aria-label="Доска шашек"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        {Array.from({ length: BOARD_SIZE }, (_, vr) =>
          Array.from({ length: BOARD_SIZE }, (_, vc) => {
            const row = mapRow(vr, flipped);
            const col = mapCol(vc, flipped);
            const dark = isDarkSquare(row, col);
            const piece = board[row][col];
            const selected = isSelected(game.selected, row, col);
            const target =
              isLegalTarget(game.legalMoves, game.selected, row, col) ||
              isHintTarget(displayHints, row, col);
            const ghost = isGhost(lastMove, row, col);

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                disabled={!dark || !canPlay}
                onClick={() => dark && onSquareClick(row, col)}
                className={[
                  "square",
                  dark ? "square-dark" : "square-light",
                  selected ? "square-selected" : "",
                  target ? "square-target" : "",
                  ghost ? "square-ghost" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <AnimatePresence mode="popLayout">
                  {piece && (
                    <motion.span
                      key={`${row}-${col}-${piece.player}-${piece.kind}`}
                      layoutId={`piece-${row}-${col}`}
                      className={[
                        "piece",
                        piece.player === "white" ? "piece-white" : "piece-black",
                        piece.kind === "king" ? "piece-king" : "",
                      ].join(" ")}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0, rotate: 90 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      whileHover={canPlay && dark ? { scale: 1.08 } : undefined}
                      whileTap={canPlay && dark ? { scale: 0.95 } : undefined}
                    >
                      {piece.kind === "king" && (
                        <motion.span
                          className="crown"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          ♔
                        </motion.span>
                      )}
                    </motion.span>
                  )}
                </AnimatePresence>
                {target && !piece && (
                  <motion.span
                    className="move-dot"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                )}
              </button>
            );
          }),
        )}
      </motion.div>
    </motion.div>
  );
}

export function getReplayBoard(game: GameState, index: number): Board {
  if (game.history.length === 0) return game.board;
  let board = JSON.parse(game.history[0].boardBefore) as Board;
  for (let i = 0; i <= index && i < game.history.length; i++) {
    board = applyMove(board, game.history[i].move);
  }
  return board;
}
