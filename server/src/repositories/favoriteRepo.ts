import { prisma } from '../lib/prisma.js';

export const favoriteRepo = {
  async findByUser(userId: string): Promise<string[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { spotId: true },
    });
    return favorites.map((f) => f.spotId);
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
