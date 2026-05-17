import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '../lib/prisma.js';

beforeAll(async () => {
  // Verify we're on the test database
  const dbUrl = process.env['DATABASE_URL'] ?? '';
  if (!dbUrl.includes('test') && process.env['NODE_ENV'] !== 'test') {
    throw new Error('Tests must run against a test database. DATABASE_URL must contain "test".');
  }
});

afterEach(async () => {
  // Clean tables in dependency order after each test
  await prisma.alert.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.forecastCache.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
