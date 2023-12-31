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

export function getGameFromMoves(
  startingFen: string,
  moves: (Move | string)[]
): Chess | null {
  try {
    const game = new Chess(startingFen);

    for (const move of moves) {
      game.move(move);
    }

    return game;
  } catch {
    return null;
  }
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
        }) as Move
    );
  }
}

export function getStartingFen(game: Chess): string {
  const clone = new Chess();

  try {
    clone.loadPgn(game.pgn());

    while (clone.undo()) {}
  } catch {}

  return clone.fen();
}

export function getFensFromMoves(
  startingFen: string,
  moves: (Move | string)[]
): string[] {
  const fens: string[] = [];

  const game = new Chess(startingFen);

  for (const move of moves) {
    game.move(move);

    fens.push(game.fen());
  }

  return fens;
}

export function checkPromotion(
  sourceSquare: Square,
  targetSquare: Square,
  piece: string
): boolean {
  return (
    ((piece === "wP" && sourceSquare[1] === "7" && targetSquare[1] === "8") ||
      (piece === "bP" && sourceSquare[1] === "2" && targetSquare[1] === "1")) &&
    Math.abs(sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0)) <= 1
  );
}

export function getFlippedFen(fen: string): string {
  const flippedFenParts = fen.split(" ");

  flippedFenParts[1] = flippedFenParts[1] === "w" ? "b" : "w";

  const flippedFen = flippedFenParts.join(" ");

  return flippedFen;
}
