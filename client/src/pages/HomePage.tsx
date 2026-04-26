import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Waves, MapPin } from 'lucide-react';
import { SpotMap } from '../components/map/SpotMap';
import { Spinner } from '../components/ui/Spinner';
import { DEMO_SPOTS } from '../data/spots';
import { fetchForecast } from '../services/weatherClient';
import { calculateScore } from '../services/scoringClient';
import type { SpotDTO, ScoreResult } from '@shared/types';

// ── helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return 'bg-score-epic text-white';
  if (score >= 50) return 'bg-score-good text-white';
  if (score >= 25) return 'bg-score-fair text-gray-900';
  if (score > 5)   return 'bg-score-poor text-white';
  return 'bg-gray-400 text-white';
}

function scoreLabel(score: number): string {
  if (score >= 75) return 'EPIC';
  if (score >= 50) return 'GOOD';
  if (score >= 25) return 'FAIR';
  if (score > 5)   return 'POOR';
  return 'FLAT';
}

// ── Horizontal spots scroll bar ───────────────────────────────────────────────

interface LiveScore {
  score: ScoreResult | null;
  loading: boolean;
}

function SpotScrollBar() {
  const [scores, setScores] = useState<Record<string, LiveScore>>(
    Object.fromEntries(DEMO_SPOTS.map((s) => [s.id, { score: null, loading: true }]))
  );

  useEffect(() => {
    DEMO_SPOTS.forEach((spot) => {
      fetchForecast(spot.lat, spot.lng)
        .then((forecasts) => {
          const first = forecasts[0];
          setScores((prev) => ({
            ...prev,
            [spot.id]: { score: first ? calculateScore(first, null) : null, loading: false },
          }));
        })
        .catch(() => {
          setScores((prev) => ({ ...prev, [spot.id]: { score: null, loading: false } }));
        });
    });
  }, []);

  return (
    <div className="bg-ocean-900 border-b border-ocean-800">
      <div className="flex overflow-x-auto scrollbar-none px-2 py-2 gap-1">
        {DEMO_SPOTS.map((spot) => {
          const ls = scores[spot.id];
          const sc = ls?.score?.overall ?? 0;
          return (
            <Link
              key={spot.id}
              to={`/spot/${spot.id}`}
              className="flex-shrink-0 rounded-lg px-3 py-2 text-center hover:bg-ocean-800 transition-colors min-w-[100px]"
            >
              <div className="text-xs font-semibold text-white truncate">{spot.name}</div>
              <div className="mt-1">
                {ls?.loading ? (
                  <div className="h-5 w-full rounded bg-ocean-700 animate-pulse" />
                ) : ls?.score ? (
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${scoreColor(sc)}`}>
                    {scoreLabel(sc)} {sc}
                  </span>
                ) : (
                  <span className="text-xs text-ocean-400">N/A</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Spot grid card ────────────────────────────────────────────────────────────

function SpotGridCard({ spot }: { spot: SpotDTO }) {
  const [ls, setLs] = useState<LiveScore>({ score: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    fetchForecast(spot.lat, spot.lng)
      .then((forecasts) => {
        if (cancelled) return;
        const first = forecasts[0];
        setLs({ score: first ? calculateScore(first, null) : null, loading: false });
      })
      .catch(() => {
        if (!cancelled) setLs({ score: null, loading: false });
      });
    return () => { cancelled = true; };
  }, [spot.lat, spot.lng]);

  const sc = ls.score?.overall ?? 0;

  return (
    <Link to={`/spot/${spot.id}`} className="group block">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-ocean-600 dark:group-hover:text-ocean-300 transition-colors">
              {spot.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="h-3 w-3" />
              {spot.region}, {spot.country}
            </p>
          </div>
          <div className="flex-shrink-0">
            {ls.loading ? (
              <Spinner className="h-5 w-5" />
            ) : ls.score ? (
              <span className={`rounded-lg px-2 py-1 text-xs font-bold ${scoreColor(sc)}`}>
                {scoreLabel(sc)}<br />
                <span className="text-[10px] font-normal opacity-80">{sc}/100</span>
              </span>
            ) : (
              <span className="text-xs text-gray-400">N/A</span>
            )}
          </div>
        </div>

        {/* Mini score bar */}
        {!ls.loading && ls.score && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className={`h-full transition-all duration-700 ${scoreColor(sc).split(' ')[0]}`}
              style={{ width: `${sc}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}

// ── HomePage ──────────────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Spots scroll bar */}
      <SpotScrollBar />

      {/* Hero */}
      <div className="bg-ocean-900 text-white py-10 px-4 text-center">
        <div className="flex items-center justify-center gap-3 text-4xl font-bold">
          <Waves className="h-10 w-10 text-ocean-300" />
          WaveCast
        </div>
        <p className="mt-2 text-ocean-300 text-sm">
          Free, open-source surf forecasting · Powered by Open-Meteo
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-10">
        {/* Map */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Surf Spots Map
          </h2>
          <div className="overflow-hidden rounded-xl shadow">
            <SpotMap spots={DEMO_SPOTS} />
          </div>
        </section>

        {/* Grid */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Current Conditions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DEMO_SPOTS.map((spot) => (
              <SpotGridCard key={spot.id} spot={spot} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
