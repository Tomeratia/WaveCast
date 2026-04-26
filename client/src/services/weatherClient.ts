import axios from 'axios';
import type { NormalizedForecast } from '@shared/types';

/**
 * Client-side Open-Meteo fetcher for static-only deploy.
 * Open-Meteo is CORS-enabled and requires no API key.
 *
 * In full deployment, the backend handles this with caching.
 */
const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

interface MarineResponse {
  hourly: {
    time: string[];
    wave_height: number[];
    wave_period: number[];
    wave_direction: number[];
  };
}

interface ForecastResponse {
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
  };
}

export async function fetchForecast(lat: number, lon: number): Promise<NormalizedForecast[]> {
  const [marineRes, windRes] = await Promise.allSettled([
    axios.get<MarineResponse>(MARINE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'wave_height,wave_period,wave_direction',
        forecast_days: 3,
      },
    }),
    axios.get<ForecastResponse>(FORECAST_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'wind_speed_10m,wind_direction_10m',
        wind_speed_unit: 'kmh',
        forecast_days: 3,
      },
    }),
  ]);

  if (marineRes.status !== 'fulfilled') {
    throw new Error('Failed to fetch marine forecast');
  }

  const marine = marineRes.value.data.hourly;
  const wind =
    windRes.status === 'fulfilled' ? windRes.value.data.hourly : null;

  return marine.time.map((time, i) => ({
    swellHeight: marine.wave_height[i] ?? 0,
    swellPeriod: marine.wave_period[i] ?? 0,
    swellDirection: marine.wave_direction[i] ?? 0,
    windSpeed: wind?.wind_speed_10m[i] ?? 0,
    windDirection: wind?.wind_direction_10m[i] ?? 0,
    timestamp: new Date(time).toISOString(),
  }));
}
