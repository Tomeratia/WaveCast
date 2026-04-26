import type { NormalizedForecast, TideData, ScoreResult, ScoreLabel } from '@shared/types';

/**
 * Client-side scoring — mirrors server/src/services/scoringService.ts.
 * Used for static-only demo deploys where the backend is not available.
 * Weights MUST match the server config.
 */
const SCORING_WEIGHTS = {
  swellHeight:   0.35,
  swellPeriod:   0.30,
  windSpeed:     0.15,
  windDirection: 0.10,
  tide:          0.10,
} as const;

function normalizeSwellHeight(meters: number): number {
  if (meters <= 0) return 0;
  if (meters >= 3) return 1;
  return meters / 3;
}

function normalizeSwellPeriod(seconds: number): number {
  if (seconds <= 0) return 0;
  if (seconds >= 14) return 1;
  return seconds / 14;
}

function normalizeWindSpeed(kmh: number): number {
  if (kmh <= 0) return 1;
  if (kmh >= 40) return 0;
  return 1 - kmh / 40;
}

function normalizeWindDirection(windDeg: number, swellDeg: number): number {
  const diff = Math.abs(((windDeg - swellDeg + 180) % 360) - 180);
  return diff / 180;
}

function normalizeTide(tide: TideData | null): number {
  if (!tide) return 0.5;
  if (tide.type === 'rising' || tide.type === 'falling') return 0.8;
  return 0.5;
}

function getLabel(score: number): ScoreLabel {
  if (score < 20) return 'flat';
  if (score < 40) return 'poor';
  if (score < 60) return 'fair';
  if (score < 80) return 'good';
  return 'epic';
}

export function calculateScore(forecast: NormalizedForecast, tide: TideData | null = null): ScoreResult {
  const breakdown = {
    swellHeight: normalizeSwellHeight(forecast.swellHeight),
    swellPeriod: normalizeSwellPeriod(forecast.swellPeriod),
    windSpeed: normalizeWindSpeed(forecast.windSpeed),
    windDirection: normalizeWindDirection(forecast.windDirection, forecast.swellDirection),
    tide: normalizeTide(tide),
  };

  const weightedSum =
    breakdown.swellHeight * SCORING_WEIGHTS.swellHeight +
    breakdown.swellPeriod * SCORING_WEIGHTS.swellPeriod +
    breakdown.windSpeed * SCORING_WEIGHTS.windSpeed +
    breakdown.windDirection * SCORING_WEIGHTS.windDirection +
    breakdown.tide * SCORING_WEIGHTS.tide;

  const overall = Math.round(Math.max(0, Math.min(100, weightedSum * 100)));

  return { overall, breakdown, label: getLabel(overall) };
}
