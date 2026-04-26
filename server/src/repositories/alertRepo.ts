import { prisma } from '../lib/prisma.js';

export interface CreateAlertData {
  userId: string;
  spotId: string;
  minScore: number;
  timePref: string;
}

export const alertRepo = {
  async findByUser(userId: string) {
    return prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findAllActive() {
    return prisma.alert.findMany({
      where: { active: true },
      include: { user: true },
    });
  },

  async create(data: CreateAlertData) {
    return prisma.alert.create({ data });
  },

  async update(alertId: string, userId: string, data: Partial<CreateAlertData & { active: boolean }>) {
    return prisma.alert.updateMany({
      where: { id: alertId, userId },
      data,
    });
  },

  async delete(alertId: string, userId: string) {
    return prisma.alert.deleteMany({
      where: { id: alertId, userId },
    });
  },

  async markSent(alertId: string) {
    return prisma.alert.update({
      where: { id: alertId },
      data: { lastSentAt: new Date() },
    });
  },
};
