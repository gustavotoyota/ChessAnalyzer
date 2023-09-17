import { MoveScore } from "./types";

export function getScoreText(score: MoveScore) {
  return score.mate
    ? `M${Math.abs(score.score)}`
    : `${score.score >= 0 ? "+" : ""}${(score.score / 100).toFixed(1)}`;
}

export function getSmoothScore(score: MoveScore) {
  return score.mate
    ? Math.sign(score.score)
    : 2 / (1 + Math.exp(-0.00368208 * score.score)) - 1;
}
