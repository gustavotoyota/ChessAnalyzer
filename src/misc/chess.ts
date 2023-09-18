import { Chess, Move, Square } from "chess.js";
import { MoveScore } from "./types";

export function getScoreText(score: MoveScore) {
  return score.mate
    ? `M${Math.abs(score.score)}`
    : `${score.score >= 0 ? "+" : ""}${(score.score / 100).toFixed(2)}`;
}

export function getSmoothScore(score: MoveScore) {
  return score.mate
    ? Math.sign(score.score)
    : 2 / (1 + Math.exp(-0.00368208 * score.score)) - 1;
}

export function getChessMovesFromLine(game: Chess, lans: string[]): Move[] {
  const moves: Move[] = [];

  try {
    for (const lan of lans) {
      moves.push(game.move(lan));
    }
  } catch {}

  for (let i = 0; i < moves.length; ++i) {
    game.undo();
  }

  if (moves.length === lans.length) {
    return moves;
  } else {
    return lans.map(
      (lan) =>
        ({
          from: lan.slice(0, 2) as Square,
          to: lan.slice(2, 4) as Square,
          lan,
          san: "",
        } as Move)
    );
  }
}

export function getStartingFen(game: Chess) {
  const clone = new Chess();

  clone.loadPgn(game.pgn());

  while (clone.undo()) {}

  return clone.fen();
}
