import { describe, it, expect } from 'vitest';
import { scoringService } from '../../services/scoringService.js';
import type { NormalizedForecast, TideData } from '@wavecast/shared';

const baseForecast: NormalizedForecast = {
  time: new Date().toISOString(),
  swellHeight: 2.0,
  swellPeriod: 12,
  swellDirection: 270,
  windSpeed: 8,
  windDirection: 90, // offshore relative to SW swell
  waterTemp: 20,
};

const risingTide: TideData = { type: 'rising', height: 1.2 };

describe('scoringService.calculateScore', () => {
  it('returns a score between 0 and 100', () => {
    const result = scoringService.calculateScore(baseForecast, risingTide);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
  });

  it('returns correct label for score ranges', () => {
    // Epic conditions: tall swell, long period, no wind
    const epicForecast: NormalizedForecast = { ...baseForecast, swellHeight: 3, swellPeriod: 14, windSpeed: 0 };
    const epic = scoringService.calculateScore(epicForecast, risingTide);
    expect(epic.label).toBe('epic');

    // Flat conditions: tiny swell
    const flatForecast: NormalizedForecast = { ...baseForecast, swellHeight: 0.1, swellPeriod: 4, windSpeed: 35 };
    const flat = scoringService.calculateScore(flatForecast, null);
    expect(flat.label).toBe('flat');
  });

  it('penalizes high wind speed', () => {
    const calmWind = scoringService.calculateScore({ ...baseForecast, windSpeed: 2 }, risingTide);
    const strongWind = scoringService.calculateScore({ ...baseForecast, windSpeed: 35 }, risingTide);
    expect(calmWind.overall).toBeGreaterThan(strongWind.overall);
  });

  it('rewards longer swell period', () => {
    const shortPeriod = scoringService.calculateScore({ ...baseForecast, swellPeriod: 6 }, risingTide);
    const longPeriod = scoringService.calculateScore({ ...baseForecast, swellPeriod: 14 }, risingTide);
    expect(longPeriod.overall).toBeGreaterThan(shortPeriod.overall);
  });

  it('returns neutral tide score when tide is null', () => {
    const withTide = scoringService.calculateScore(baseForecast, risingTide);
    const noTide = scoringService.calculateScore(baseForecast, null);
    // Both should be valid scores — null tide gives neutral 0.5
    expect(noTide.overall).toBeGreaterThanOrEqual(0);
    expect(withTide.breakdown.tide).toBe(0.8); // rising tide
    expect(noTide.breakdown.tide).toBe(0.5);   // null → neutral
  });

  it('includes all breakdown keys', () => {
    const result = scoringService.calculateScore(baseForecast, risingTide);
    expect(result.breakdown).toHaveProperty('swellHeight');
    expect(result.breakdown).toHaveProperty('swellPeriod');
    expect(result.breakdown).toHaveProperty('windSpeed');
    expect(result.breakdown).toHaveProperty('windDirection');
    expect(result.breakdown).toHaveProperty('tide');
  });

  it('clamps score to [0, 100] even with extreme inputs', () => {
    const extreme: NormalizedForecast = { ...baseForecast, swellHeight: 100, swellPeriod: 100, windSpeed: 0 };
    const result = scoringService.calculateScore(extreme, risingTide);
    expect(result.overall).toBeLessThanOrEqual(100);

    const zero: NormalizedForecast = { ...baseForecast, swellHeight: 0, swellPeriod: 0, windSpeed: 100 };
    const flat = scoringService.calculateScore(zero, null);
    expect(flat.overall).toBeGreaterThanOrEqual(0);
  });
});
