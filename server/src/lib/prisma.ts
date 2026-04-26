import { PrismaClient } from '@prisma/client';

/** Singleton Prisma client — never instantiate PrismaClient elsewhere */
export const prisma = new PrismaClient();
