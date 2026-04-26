import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService.js';
import { ValidationError } from '../middleware/errorHandler.js';
import type { ApiResponse, AuthResponse } from '@wavecast/shared';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const result = await authService.register(parsed.data.email, parsed.data.name, parsed.data.password);

  const response: ApiResponse<AuthResponse> = { success: true, data: result };
  res.status(201).json(response);
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { refreshToken, ...result } = await authService.login(parsed.data.email, parsed.data.password);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const response: ApiResponse<AuthResponse> = { success: true, data: result };
  res.json(response);
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) {
    throw new ValidationError('Missing refresh token');
  }

  const result = await authService.refreshAccessToken(token);
  const response: ApiResponse<{ accessToken: string }> = { success: true, data: result };
  res.json(response);
});

router.post('/logout', (_req, res) => {
  res.clearCookie('refreshToken');
  const response: ApiResponse<null> = { success: true, data: null };
  res.json(response);
});

export default router;
