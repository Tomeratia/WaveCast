import axios from 'axios';
import type { NormalizedForecast } from '@shared/types';

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
    wind_gusts_10m: number[];
    temperature_2m: number[];
    surface_pressure: number[];
  };
}

export async function fetchForecast(lat: number, lon: number): Promise<NormalizedForecast[]> {
  const [marineRes, windRes] = await Promise.allSettled([
    axios.get<MarineResponse>(MARINE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'wave_height,wave_period,wave_direction',
        forecast_days: 7,
      },
    }),
    axios.get<ForecastResponse>(FORECAST_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m,surface_pressure',
        wind_speed_unit: 'kmh',
        forecast_days: 7,
      },
    }),
  ]);

  if (marineRes.status !== 'fulfilled') {
    throw new Error('Failed to fetch marine forecast');
  }

  const marine = marineRes.value.data.hourly;
  const wind = windRes.status === 'fulfilled' ? windRes.value.data.hourly : null;

  return marine.time.map((time, i) => ({
    swellHeight: marine.wave_height[i] ?? 0,
    swellPeriod: marine.wave_period[i] ?? 0,
    swellDirection: marine.wave_direction[i] ?? 0,
    windSpeed: wind?.wind_speed_10m[i] ?? 0,
    windDirection: wind?.wind_direction_10m[i] ?? 0,
    windGusts: wind?.wind_gusts_10m[i] ?? 0,
    temperature: wind?.temperature_2m[i] ?? 0,
    pressure: wind?.surface_pressure[i] ?? 0,
    timestamp: new Date(time).toISOString(),
  }));
}
