import { cloneBoard } from "./board";
import { applyMove } from "./engine";
import { getAllLegalMoves } from "./moves";
import type { CoachInsight, GameState, MoveRecord, Player } from "./types";

function parseBoard(json: string) {
  return JSON.parse(json) as GameState["board"];
}

function hadCaptureOption(board: GameState["board"], player: Player): boolean {
  return getAllLegalMoves(board, player).some((m) => m.captures.length > 0);
}

function maxCaptureCount(board: GameState["board"], player: Player): number {
  const moves = getAllLegalMoves(board, player);
  return moves.reduce((max, m) => Math.max(max, m.captures.length), 0);
}

export function analyzeGame(state: GameState): CoachInsight[] {
  const insights: CoachInsight[] = [];

  state.history.forEach((record: MoveRecord, index) => {
    const board = parseBoard(record.boardBefore);
    const player = record.player;

    const beforeCaptures = getAllLegalMoves(board, player);
    const captureMoves = beforeCaptures.filter((m) => m.captures.length > 0);
    const playedCapture = record.move.captures.length > 0;

    if (captureMoves.length > 0 && !playedCapture) {
      insights.push({
        type: "missed-capture",
        moveIndex: index,
        player,
        message: `Ход ${index + 1}: можно было бить — обязательное взятие пропущено.`,
        severity: "critical",
      });
    }

    if (captureMoves.length > 0 && playedCapture) {
      const maxCap = maxCaptureCount(board, player);
      if (record.move.captures.length < maxCap) {
        insights.push({
          type: "double-capture",
          moveIndex: index,
          player,
          message: `Ход ${index + 1}: было взятие на ${maxCap} фигур(ы), вы взяли только ${record.move.captures.length}.`,
          severity: "warning",
        });
      }
    }

    if (record.move.captures.length >= 2) {
      insights.push({
        type: "good",
        moveIndex: index,
        player,
        message: `Ход ${index + 1}: отличная серия — ${record.move.captures.length} фигур за ход!`,
        severity: "info",
      });
    }

    const afterBoard = applyMove(cloneBoard(board), record.move);
    const opponent = player === "white" ? "black" : "white";
    const oppMoves = getAllLegalMoves(afterBoard, opponent);
    const oppPromotes = oppMoves.some((m) => {
      const target = afterBoard[m.to.row][m.to.col];
      return !target && m.to.row === (opponent === "white" ? 0 : 7);
    });

    if (oppPromotes && record.move.captures.length === 0) {
      insights.push({
        type: "promotion-risk",
        moveIndex: index,
        player,
        message: `Ход ${index + 1}: этот ход открыл сопернику путь к дамке.`,
        severity: "warning",
      });
    }
  });

  if (insights.length === 0) {
    insights.push({
      type: "good",
      moveIndex: -1,
      player: "white",
      message: "Солидная партия! Критических ошибок не найдено.",
      severity: "info",
    });
  }

  return insights.slice(0, 12);
}
