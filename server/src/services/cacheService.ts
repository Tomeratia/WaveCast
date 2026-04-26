import { cacheRepo } from '../repositories/cacheRepo.js';
import { openMeteoAdapter } from '../adapters/openMeteo.js';
import { openWeatherMapAdapter } from '../adapters/openWeatherMap.js';
import type { WeatherProvider } from '../adapters/types.js';
import type { NormalizedForecast } from '@wavecast/shared';
import { logger } from '../lib/logger.js';
import { ApiError } from '../middleware/errorHandler.js';

/** Fixed fallback order: Open-Meteo → OpenWeatherMap */
const PROVIDERS: WeatherProvider[] = [openMeteoAdapter, openWeatherMapAdapter];

const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 3000];

async function fetchWithRetry(
  provider: WeatherProvider,
  lat: number,
  lon: number,
): Promise<NormalizedForecast[]> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await provider.fetch(lat, lon);
    } catch (err) {
      const is4xx =
        err instanceof Error &&
        'response' in err &&
        typeof (err as Record<string, unknown>).response === 'object' &&
        (err as { response: { status: number } }).response.status >= 400 &&
        (err as { response: { status: number } }).response.status < 500;

      if (is4xx || attempt === MAX_RETRIES) {
        throw err;
      }

      const delay = RETRY_DELAYS[attempt] ?? 3000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}

export const cacheService = {
  /**
   * Cache-first fetch: check DB cache → on miss, try providers in order → store result.
   * This is the ONLY way to get forecast data. Never call adapters directly.
   */
  async getCachedOrFetch(spotId: string, lat: number, lon: number): Promise<NormalizedForecast[]> {
    // Check cache for each provider
    for (const provider of PROVIDERS) {
      const cached = await cacheRepo.get(spotId, provider.name);
      if (cached) {
        logger.debug('Cache hit', { spotId, provider: provider.name });
        return cached;
      }
    }

    // Cache miss — fetch from providers using allSettled
    const results = await Promise.allSettled(
      PROVIDERS.map((p) => fetchWithRetry(p, lat, lon)),
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i]!;
      const provider = PROVIDERS[i]!;

      if (result.status === 'fulfilled') {
        await cacheRepo.upsert(spotId, provider.name, result.value);
        logger.info('Cache updated', { spotId, provider: provider.name });
        return result.value;
      }

      logger.warn('Provider failed', {
        provider: provider.name,
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      });
    }

    throw new ApiError('All weather providers failed');
  },
};
