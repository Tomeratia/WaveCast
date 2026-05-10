import axios from 'axios';

export interface TidePoint {
  timestamp: string; // ISO 8601
  height: number;    // meters relative to mean sea level (MSL)
}

export interface OpenMeteoTideData {
  hourly: TidePoint[];
  extremes: Array<{ timestamp: string; height: number; type: 'high' | 'low' }>;
}

/**
 * Fetches tide (sea level) data from Open-Meteo Marine API.
 * Free, no API key required — uses sea_level_height_msl.
 * Falls back to null if the location is inland and Marine API has no data.
 */
export async function fetchOpenMeteoTides(lat: number, lon: number): Promise<OpenMeteoTideData | null> {
  try {
    const res = await axios.get<{
      hourly?: { time: string[]; sea_level_height_msl: (number | null)[] };
    }>('https://marine-api.open-meteo.com/v1/marine', {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'sea_level_height_msl',
        forecast_days: 2,
        timezone: 'UTC',
      },
      timeout: 8000,
    });

    const hourlyRaw = res.data.hourly;
    if (!hourlyRaw || !hourlyRaw.time || !hourlyRaw.sea_level_height_msl) return null;

    const hourly: TidePoint[] = hourlyRaw.time
      .map((t, i) => ({ timestamp: t, height: hourlyRaw.sea_level_height_msl[i] ?? NaN }))
      .filter((p) => !isNaN(p.height));

    if (hourly.length === 0) return null;

    // Find local extremes (peaks/troughs)
    const extremes: OpenMeteoTideData['extremes'] = [];
    for (let i = 1; i < hourly.length - 1; i++) {
      const prev = hourly[i - 1]!.height;
      const curr = hourly[i]!.height;
      const next = hourly[i + 1]!.height;
      if (curr > prev && curr > next) {
        extremes.push({ timestamp: hourly[i]!.timestamp, height: curr, type: 'high' });
      } else if (curr < prev && curr < next) {
        extremes.push({ timestamp: hourly[i]!.timestamp, height: curr, type: 'low' });
      }
    }

    return { hourly, extremes };
  } catch {
    return null;
  }
}
