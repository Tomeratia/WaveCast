import { prisma } from '../lib/prisma.js';
import type { UserDTO } from '@wavecast/shared';
import type { User } from '@prisma/client';

function toDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export const userRepo = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: { email: string; name: string; passwordHash: string }) {
    const user = await prisma.user.create({ data });
    return toDTO(user);
  },

  toDTO,
};
