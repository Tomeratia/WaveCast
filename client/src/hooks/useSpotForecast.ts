import { useState, useEffect } from 'react';
import { fetchForecast } from '../services/weatherClient';
import { calculateScore } from '../services/scoringClient';
import type { ForecastSlot, SpotDTO } from '@shared/types';

interface SpotForecastState {
  current: ForecastSlot | null;
  hourly: ForecastSlot[];
  isLoading: boolean;
  error: string | null;
}

export function useSpotForecast(spot: SpotDTO | null): SpotForecastState {
  const [state, setState] = useState<SpotForecastState>({
    current: null,
    hourly: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!spot) return;

    let cancelled = false;
    setState({ current: null, hourly: [], isLoading: true, error: null });

    fetchForecast(spot.lat, spot.lng)
      .then((forecasts) => {
        if (cancelled) return;
        const hourly: ForecastSlot[] = forecasts.map((f) => ({
          forecast: f,
          tide: null,
          score: calculateScore(f, null),
        }));
        const current = hourly[0] ?? null;
        setState({ current, hourly, isLoading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          current: null,
          hourly: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load forecast',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [spot]);

  return state;
}
