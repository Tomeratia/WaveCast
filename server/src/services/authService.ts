import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { userRepo } from '../repositories/userRepo.js';
import { AuthError, ValidationError } from '../middleware/errorHandler.js';
import type { AuthResponse, TokenPayload } from '@wavecast/shared';

const SALT_ROUNDS = 12;

function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email } satisfies Omit<TokenPayload, 'iat' | 'exp'>, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY,
  });
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
}

export const authService = {
  async register(email: string, name: string, password: string): Promise<AuthResponse> {
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      throw new ValidationError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepo.create({ email, name, passwordHash });
    const accessToken = generateAccessToken(user.id, user.email);

    return { accessToken, user };
  },

  async login(email: string, password: string): Promise<AuthResponse & { refreshToken: string }> {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new AuthError('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AuthError('Invalid email or password');
    }

    const dto = userRepo.toDTO(user);
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    return { accessToken, refreshToken, user: dto };
  },

  verifyRefreshToken(token: string): { sub: string } {
    try {
      return jwt.verify(token, env.JWT_SECRET) as { sub: string };
    } catch {
      throw new AuthError('Invalid refresh token');
    }
  },

  async refreshAccessToken(refreshTokenValue: string): Promise<{ accessToken: string }> {
    const payload = this.verifyRefreshToken(refreshTokenValue);
    const user = await userRepo.findById(payload.sub);
    if (!user) {
      throw new AuthError('User not found');
    }
    const accessToken = generateAccessToken(user.id, user.email);
    return { accessToken };
  },
};
