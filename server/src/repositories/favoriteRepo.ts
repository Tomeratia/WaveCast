import { prisma } from '../lib/prisma.js';
import type { SpotDTO } from '@wavecast/shared';
import { spotRepo } from './spotRepo.js';

export const favoriteRepo = {
  async findByUser(userId: string): Promise<SpotDTO[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { spot: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => spotRepo.toDTO(f.spot));
  },

  async add(userId: string, spotId: string): Promise<void> {
    await prisma.favorite.create({
      data: { userId, spotId },
    });
  },

  async remove(userId: string, spotId: string): Promise<void> {
    await prisma.favorite.deleteMany({
      where: { userId, spotId },
    });
  },

  async exists(userId: string, spotId: string): Promise<boolean> {
    const count = await prisma.favorite.count({
      where: { userId, spotId },
    });
    return count > 0;
  },
};
