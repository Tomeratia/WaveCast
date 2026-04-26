import { Router } from 'express';
import { forecastService } from '../services/forecastService.js';
import type { ApiResponse, SpotForecastDTO, SpotDTO } from '@wavecast/shared';

const router = Router();

router.get('/spots', async (_req, res) => {
  const spots = await forecastService.getAllSpots();
  const response: ApiResponse<SpotDTO[]> = { success: true, data: spots };
  res.json(response);
});

router.get('/:spotId', async (req, res) => {
  const forecast = await forecastService.getSpotForecast(req.params['spotId']!);
  const response: ApiResponse<SpotForecastDTO> = { success: true, data: forecast };
  res.json(response);
});

router.get('/:spotId/hourly', async (req, res) => {
  const forecast = await forecastService.getSpotForecast(req.params['spotId']!);
  const response: ApiResponse<SpotForecastDTO['hourly']> = { success: true, data: forecast.hourly };
  res.json(response);
});

export default router;
