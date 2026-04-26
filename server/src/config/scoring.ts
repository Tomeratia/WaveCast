/**
 * LOCKED — Do NOT modify weight values without explicit user approval.
 * If asked to "improve" or "tune", propose changes in text only.
 */
export const SCORING_WEIGHTS = {
  swellHeight:   0.35,   // 35% — primary factor
  swellPeriod:   0.30,   // 30% — wave quality indicator
  windSpeed:     0.15,   // 15% — surface conditions
  windDirection: 0.10,   // 10% — offshore vs onshore
  tide:          0.10,   // 10% — water level impact
} as const;

/** Cache TTL — 3 hours in milliseconds */
export const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 10_800_000
