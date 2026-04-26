import { SCORING_WEIGHTS } from '../config/scoring.js';
import type { NormalizedForecast, TideData, ScoreResult, ScoreLabel } from '@wavecast/shared';

/** Normalize swell height to [0, 1]. Ideal: 1.5–3m */
function normalizeSwellHeight(meters: number): number {
  if (meters <= 0) return 0;
  if (meters >= 3) return 1;
  return meters / 3;
}

/** Normalize swell period to [0, 1]. Ideal: >= 12s */
function normalizeSwellPeriod(seconds: number): number {
  if (seconds <= 0) return 0;
  if (seconds >= 14) return 1;
  return seconds / 14;
}

/** Normalize wind speed to [0, 1]. Lower wind = better. Ideal: < 10 km/h */
function normalizeWindSpeed(kmh: number): number {
  if (kmh <= 0) return 1;
  if (kmh >= 40) return 0;
  return 1 - kmh / 40;
}

/** Normalize wind direction to [0, 1]. Offshore (270–360, 0–90 relative to swell) is best */
function normalizeWindDirection(windDeg: number, swellDeg: number): number {
  const diff = Math.abs(((windDeg - swellDeg + 180) % 360) - 180);
  return diff / 180; // 180° = perfectly offshore = 1.0
}

/** Normalize tide to [0, 1]. Mid-tide is generally best */
function normalizeTide(tide: TideData | null): number {
  if (!tide) return 0.5; // unknown tide → neutral score
  if (tide.type === 'rising' || tide.type === 'falling') return 0.8;
  return 0.5; // high/low tide
}

function getLabel(score: number): ScoreLabel {
  if (score < 20) return 'flat';
  if (score < 40) return 'poor';
  if (score < 60) return 'fair';
  if (score < 80) return 'good';
  return 'epic';
}

export const scoringService = {
  calculateScore(forecast: NormalizedForecast, tide: TideData | null): ScoreResult {
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
  },
};
