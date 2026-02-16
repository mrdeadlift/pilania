import { clamp } from "@/lib/utils/math";

export type ScoreLabel = "excellent" | "good" | "fair" | "needs_work";

export function applyExponentialMovingAverage(
  previousScore: number | null,
  nextScore: number,
  alpha = 0.25
): number {
  const clampedAlpha = clamp(alpha, 0.01, 1);
  const clampedNextScore = clamp(nextScore, 0, 100);

  if (previousScore === null) {
    return clampedNextScore;
  }

  return clamp(
    previousScore + clampedAlpha * (clampedNextScore - previousScore),
    0,
    100
  );
}

export function getScoreLabel(score: number): ScoreLabel {
  const safeScore = clamp(score, 0, 100);

  if (safeScore >= 90) return "excellent";
  if (safeScore >= 75) return "good";
  if (safeScore >= 55) return "fair";
  return "needs_work";
}

export function getScoreLabelText(
  score: number,
  language: "ja" | "en" = "ja"
): string {
  const label = getScoreLabel(score);

  if (language === "en") {
    if (label === "excellent") return "Excellent";
    if (label === "good") return "Good";
    if (label === "fair") return "Fair";
    return "Needs Work";
  }

  if (label === "excellent") return "素晴らしい";
  if (label === "good") return "良好";
  if (label === "fair") return "まずまず";
  return "要改善";
}
