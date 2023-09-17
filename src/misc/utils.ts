export function getScoreText(params: { mate: boolean; score: number }) {
  return params.mate
    ? `M${Math.abs(params.score)}`
    : `${params.score >= 0 ? "+" : ""}${(params.score / 100).toFixed(1)}`;
}
