import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { ArrowLeft, Wind, Waves as WavesIcon, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { Spinner } from '../components/ui/Spinner';
import { ForecastChart } from '../components/charts/ForecastChart';
import { useSpotForecast } from '../hooks/useSpotForecast';
import { DEMO_SPOTS } from '../data/spots';

export function SpotPage() {
  const { spotId } = useParams<{ spotId: string }>();
  const spot = useMemo(() => DEMO_SPOTS.find((s) => s.id === spotId) ?? null, [spotId]);
  const { current, hourly, isLoading, error } = useSpotForecast(spot);

  if (!spot) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Card>
          <p className="text-gray-500">Spot not found.</p>
          <Link to="/" className="mt-4 inline-block text-ocean-600 hover:underline">
            ← Back to home
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 dark:text-ocean-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ocean-800 dark:text-ocean-200">{spot.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {spot.region}, {spot.country}
          </p>
        </div>
        {current && <ScoreBadge score={current.score.overall} label={current.score.label} size="lg" />}
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      )}

      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-300">Failed to load forecast: {error}</p>
        </Card>
      )}

      {current && !isLoading && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <WavesIcon className="h-4 w-4" />
                <span className="text-sm">Swell</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-ocean-700 dark:text-ocean-300">
                {current.forecast.swellHeight.toFixed(1)} m
              </p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Period</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-ocean-700 dark:text-ocean-300">
                {current.forecast.swellPeriod.toFixed(0)} s
              </p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Wind className="h-4 w-4" />
                <span className="text-sm">Wind</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-ocean-700 dark:text-ocean-300">
                {current.forecast.windSpeed.toFixed(0)} km/h
              </p>
            </Card>
          </div>

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
              48-hour forecast
            </h2>
            <ForecastChart hourly={hourly} hours={48} />
          </Card>
        </>
      )}
    </div>
  );
}
