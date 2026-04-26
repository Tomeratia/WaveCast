import { prisma } from '../lib/prisma.js';
import { CACHE_TTL_MS } from '../config/scoring.js';
import type { NormalizedForecast } from '@wavecast/shared';

export const cacheRepo = {
  async get(spotId: string, provider: string): Promise<NormalizedForecast[] | null> {
    const staleThreshold = new Date(Date.now() - CACHE_TTL_MS);

    const cached = await prisma.forecastCache.findFirst({
      where: {
        spotId,
        provider,
        fetchedAt: { gte: staleThreshold },
      },
    });

    return cached ? (cached.data as NormalizedForecast[]) : null;
  },

  async upsert(spotId: string, provider: string, data: NormalizedForecast[]): Promise<void> {
    await prisma.forecastCache.upsert({
      where: { spotId_provider: { spotId, provider } },
      update: { data: data as unknown as Record<string, unknown>[], fetchedAt: new Date() },
      create: { spotId, provider, data: data as unknown as Record<string, unknown>[], fetchedAt: new Date() },
    });
  },

  async purgeStale(): Promise<number> {
    const threshold = new Date(Date.now() - CACHE_TTL_MS * 2); // 6 hours
    const result = await prisma.forecastCache.deleteMany({
      where: { fetchedAt: { lt: threshold } },
    });
    return result.count;
  },
};
