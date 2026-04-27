import axios from 'axios';

export interface TideExtreme {
  dt: number;       // unix timestamp
  height: number;   // meters
  type: 'High' | 'Low';
}

export interface TideHourly {
  dt: number;
  height: number;
}

export interface TideData {
  extremes: TideExtreme[];
  heights: TideHourly[];
}

const WORLDTIDES_KEY = import.meta.env.VITE_WORLDTIDES_KEY as string | undefined;
const WORLDTIDES_URL = 'https://www.worldtides.info/api/v3';

export async function fetchTides(lat: number, lon: number): Promise<TideData | null> {
  if (!WORLDTIDES_KEY) return null;

  const [extremesRes, heightsRes] = await Promise.allSettled([
    axios.get<{ extremes: { dt: number; height: number; type: string }[] }>(WORLDTIDES_URL, {
      params: { extremes: 1, lat, lon, days: 2, datum: 'LAT', key: WORLDTIDES_KEY },
    }),
    axios.get<{ heights: { dt: number; height: number }[] }>(WORLDTIDES_URL, {
      params: { heights: 1, lat, lon, days: 2, step: 3600, datum: 'LAT', key: WORLDTIDES_KEY },
    }),
  ]);

  const extremes =
    extremesRes.status === 'fulfilled'
      ? extremesRes.value.data.extremes.map((e) => ({
          ...e,
          type: e.type as 'High' | 'Low',
        }))
      : [];

  const heights =
    heightsRes.status === 'fulfilled' ? heightsRes.value.data.heights : [];

  return { extremes, heights };
}
