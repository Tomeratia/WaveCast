import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Card } from './Card';
import { ScoreBadge } from './ScoreBadge';
import { Spinner } from './Spinner';
import { fetchForecast } from '../../services/weatherClient';
import { calculateScore } from '../../services/scoringClient';
import type { SpotDTO, ScoreResult } from '@shared/types';

interface SpotCardProps {
  spot: SpotDTO;
}

export function SpotCard({ spot }: SpotCardProps) {
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchForecast(spot.lat, spot.lng)
      .then((forecasts) => {
        if (cancelled) return;
        const first = forecasts[0];
        if (first) setScore(calculateScore(first, null));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [spot.lat, spot.lng]);

  return (
    <Link to={`/spot/${spot.id}`} className="block transition-transform hover:scale-[1.02]">
      <Card className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-ocean-800 dark:text-ocean-200">
            {spot.name}
          </h3>
          <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5" />
            {spot.region}, {spot.country}
          </p>
        </div>
        <div className="flex-shrink-0">
          {isLoading ? (
            <Spinner className="h-6 w-6" />
          ) : score ? (
            <ScoreBadge score={score.overall} label={score.label} />
          ) : (
            <span className="text-sm text-gray-400">N/A</span>
          )}
        </div>
      </Card>
    </Link>
  );
}
