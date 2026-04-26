/**
 * OpenWeatherMap adapter (FALLBACK provider)
 * Rate limit: 60 requests/minute (free tier)
 * Requires OPENWEATHER_API_KEY
 */
import axios from 'axios';
import { PROVIDERS } from '../config/providers.js';
import { env } from '../config/env.js';
import type { WeatherProvider } from './types.js';
import type { NormalizedForecast } from '@wavecast/shared';

interface OWMForecastItem {
  dt: number;
  wind: { speed: number; deg: number };
  main: { temp: number };
}

interface OWMResponse {
  list: OWMForecastItem[];
}

function normalize(raw: OWMResponse): NormalizedForecast[] {
  return raw.list.map((item) => ({
    swellHeight: 0,       // OWM doesn't provide swell data — filled by primary
    swellPeriod: 0,
    swellDirection: 0,
    windSpeed: item.wind.speed * 3.6,  // m/s → km/h
    windDirection: item.wind.deg,
    timestamp: new Date(item.dt * 1000).toISOString(),
  }));
}

export const openWeatherMapAdapter: WeatherProvider = {
  name: PROVIDERS.openWeatherMap.name,

  async fetch(lat: number, lon: number): Promise<NormalizedForecast[]> {
    const apiKey = env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY is not configured');
    }

    const response = await axios.get<OWMResponse>(`${PROVIDERS.openWeatherMap.baseUrl}/forecast`, {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric',
      },
      timeout: 10_000,
    });
    return normalize(response.data);
  },
};
