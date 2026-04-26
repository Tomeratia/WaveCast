import { cacheService } from './cacheService.js';
import { scoringService } from './scoringService.js';
import { spotRepo } from '../repositories/spotRepo.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { SpotForecastDTO, ForecastSlot } from '@wavecast/shared';

export const forecastService = {
  async getSpotForecast(spotId: string): Promise<SpotForecastDTO> {
    const spot = await spotRepo.findById(spotId);
    if (!spot) {
      throw new NotFoundError('Spot');
    }

    const forecasts = await cacheService.getCachedOrFetch(spotId, spot.lat, spot.lng);

    const hourly: ForecastSlot[] = forecasts.map((f) => ({
      forecast: f,
      tide: null, // TODO: integrate tide data source
      score: scoringService.calculateScore(f, null),
    }));

    const current = hourly[0];
    if (!current) {
      throw new NotFoundError('Forecast data');
    }

    return { spot, current, hourly };
  },

  async getAllSpots() {
    return spotRepo.findAll();
  },
};
