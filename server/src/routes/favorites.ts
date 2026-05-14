import { Router } from 'express';
import { favoriteRepo } from '../repositories/favoriteRepo.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { ApiResponse } from '@wavecast/shared';

const router = Router();

router.get('/', async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const spotIds = await favoriteRepo.findByUser(user.sub);
  const response: ApiResponse<string[]> = { success: true, data: spotIds };
  res.json(response);
});

router.post('/:spotId', async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  await favoriteRepo.add(user.sub, req.params['spotId']!);
  const response: ApiResponse<null> = { success: true, data: null };
  res.status(201).json(response);
});

router.delete('/:spotId', async (req, res) => {
  const { user } = req as AuthenticatedRequest;
  await favoriteRepo.remove(user.sub, req.params['spotId']!);
  const response: ApiResponse<null> = { success: true, data: null };
  res.json(response);
});

export default router;
