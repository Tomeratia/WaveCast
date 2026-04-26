import { Router } from 'express';
import { z } from 'zod';
import { alertRepo } from '../repositories/alertRepo.js';
import { ValidationError } from '../middleware/errorHandler.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { ApiResponse } from '@wavecast/shared';

const router = Router();

const createAlertSchema = z.object({
  spotId: z.string().uuid(),
  minScore: z.number().int().min(0).max(100),
  timePref: z.enum(['dawn', 'morning', 'any']),
});

const updateAlertSchema = z.object({
  minScore: z.number().int().min(0).max(100).optional(),
  timePref: z.enum(['dawn', 'morning', 'any']).optional(),
  active: z.boolean().optional(),
});

router.get('/', async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const alerts = await alertRepo.findByUser(user.sub);
  const response: ApiResponse<typeof alerts> = { success: true, data: alerts };
  res.json(response);
});

router.post('/', async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const parsed = createAlertSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const alert = await alertRepo.create({ userId: user.sub, ...parsed.data });
  const response: ApiResponse<typeof alert> = { success: true, data: alert };
  res.status(201).json(response);
});

router.put('/:alertId', async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const parsed = updateAlertSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  await alertRepo.update(req.params['alertId']!, user.sub, parsed.data);
  const response: ApiResponse<null> = { success: true, data: null };
  res.json(response);
});

router.delete('/:alertId', async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  await alertRepo.delete(req.params['alertId']!, user.sub);
  const response: ApiResponse<null> = { success: true, data: null };
  res.json(response);
});

export default router;
