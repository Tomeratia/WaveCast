import { prisma } from '../lib/prisma.js';
import { SPOTS } from '../../../shared/data/spots.js';
import type { SpotDTO } from '@wavecast/shared';

function spotById(id: string): SpotDTO | undefined {
  return SPOTS.find((s) => s.id === id);
}

export const favoriteRepo = {
  async findByUser(userId: string): Promise<SpotDTO[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return favorites
      .map((f) => spotById(f.spotId))
      .filter((s): s is SpotDTO => s !== undefined);
  },

  async add(userId: string, spotId: string): Promise<void> {
    await prisma.favorite.create({ data: { userId, spotId } });
  },

  async remove(userId: string, spotId: string): Promise<void> {
    await prisma.favorite.deleteMany({ where: { userId, spotId } });
  },

  async exists(userId: string, spotId: string): Promise<boolean> {
    const count = await prisma.favorite.count({ where: { userId, spotId } });
    return count > 0;
  },
};
