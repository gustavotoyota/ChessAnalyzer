import { MoveScore } from "./types";

export function getScoreText(params: MoveScore) {
  return params.mate
    ? `M${Math.abs(params.score)}`
    : `${params.score >= 0 ? "+" : ""}${(params.score / 100).toFixed(1)}`;
}
