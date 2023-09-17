export function getScoreText(params: { mate: boolean; score: number }) {
  return params.mate
    ? `M${params.score}`
    : `${params.score >= 0 ? "+" : ""}${params.score.toFixed(1)}`;
}
