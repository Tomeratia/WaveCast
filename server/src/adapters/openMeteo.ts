/**
 * Open-Meteo Marine API adapter (PRIMARY provider)
 * Rate limit: 10,000 requests/day — no API key required
 */
import axios from 'axios';
import { PROVIDERS } from '../config/providers.js';
import type { WeatherProvider } from './types.js';
import type { NormalizedForecast } from '@wavecast/shared';

interface OpenMeteoHourly {
  time: string[];
  wave_height: number[];
  wave_period: number[];
  wave_direction: number[];
  wind_wave_height?: number[];
  wind_wave_direction?: number[];
}

interface OpenMeteoResponse {
  hourly: OpenMeteoHourly;
}

function normalize(raw: OpenMeteoResponse): NormalizedForecast[] {
  const { hourly } = raw;
  return hourly.time.map((time, i) => ({
    swellHeight: hourly.wave_height[i] ?? 0,
    swellPeriod: hourly.wave_period[i] ?? 0,
    swellDirection: hourly.wave_direction[i] ?? 0,
    windSpeed: 0,        // Open-Meteo marine endpoint doesn't include wind — filled by fallback
    windDirection: 0,
    timestamp: new Date(time).toISOString(),
  }));
}

export const openMeteoAdapter: WeatherProvider = {
  name: PROVIDERS.openMeteo.name,

  async fetch(lat: number, lon: number): Promise<NormalizedForecast[]> {
    const response = await axios.get<OpenMeteoResponse>(PROVIDERS.openMeteo.baseUrl, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'wave_height,wave_period,wave_direction',
        forecast_days: 3,
      },
      timeout: 10_000,
    });
    return normalize(response.data);
  },
};
