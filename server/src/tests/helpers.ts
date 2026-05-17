import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

/** Create a test user in the DB and return a valid access token for it */
export async function createTestUser(overrides?: Partial<{ email: string; name: string; password: string }>) {
  const email = overrides?.email ?? 'test@example.com';
  const name = overrides?.name ?? 'Test User';
  const password = overrides?.password ?? 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });

  const accessToken = jwt.sign(
    { sub: user.id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  return { user, accessToken, password };
}

/** Auth header object for supertest requests */
export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
