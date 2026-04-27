import { useEffect, useState } from 'react';
import { fetchTides } from '../services/tideClient';
import type { TideData } from '../services/tideClient';

export function useTides(lat: number, lon: number) {
  const [data, setData] = useState<TideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noKey, setNoKey] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchTides(lat, lon)
      .then((result) => {
        if (cancelled) return;
        if (result === null) { setNoKey(true); setIsLoading(false); return; }
        setData(result);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [lat, lon]);

  return { data, isLoading, noKey };
}
