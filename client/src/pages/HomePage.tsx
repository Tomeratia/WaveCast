import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Waves, MapPin } from 'lucide-react';
import { SpotMap } from '../components/map/SpotMap';
import { Spinner } from '../components/ui/Spinner';
import { DEMO_SPOTS } from '../data/spots';
import { fetchForecast } from '../services/weatherClient';
import { calculateScore } from '../services/scoringClient';
import { useUnits } from '../context/UnitsContext';
import type { SpotWithCams } from '../data/spots';
import type { ScoreResult, NormalizedForecast } from '@shared/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreLabel(score: number) {
  if (score >= 75) return 'EPIC';
  if (score >= 50) return 'GOOD';
  if (score >= 25) return 'FAIR';
  if (score > 5)   return 'POOR';
  return 'FLAT';
}

function scoreBg(score: number) {
  if (score >= 75) return 'bg-score-epic';
  if (score >= 50) return 'bg-score-good';
  if (score >= 25) return 'bg-score-fair';
  if (score > 5)   return 'bg-score-poor';
  return 'bg-score-flat';
}

// ── Horizontal spots scroll bar ───────────────────────────────────────────────

interface LiveData { score: ScoreResult | null; forecast: NormalizedForecast | null; loading: boolean }

function SpotScrollBar() {
  const [data, setData] = useState<Record<string, LiveData>>(
    Object.fromEntries(DEMO_SPOTS.map((s) => [s.id, { score: null, forecast: null, loading: true }]))
  );

  useEffect(() => {
    DEMO_SPOTS.forEach((spot) => {
      fetchForecast(spot.lat, spot.lng)
        .then((forecasts) => {
          const first = forecasts[0];
          setData((prev) => ({
            ...prev,
            [spot.id]: {
              score: first ? calculateScore(first, null) : null,
              forecast: first ?? null,
              loading: false,
            },
          }));
        })
        .catch(() => {
          setData((prev) => ({ ...prev, [spot.id]: { score: null, forecast: null, loading: false } }));
        });
    });
  }, []);

  return (
    <div className="bg-app-surface border-b border-app-border">
      <div className="flex overflow-x-auto scrollbar-none">
        {DEMO_SPOTS.map((spot) => {
          const d = data[spot.id];
          const sc = d?.score?.overall ?? 0;
          return (
            <Link
              key={spot.id}
              to={`/spot/${spot.id}`}
              className="flex-shrink-0 px-4 py-2.5 text-center hover:bg-app-card transition-colors border-r border-app-border min-w-[110px]"
            >
              <div className="text-xs font-semibold text-gray-300 truncate">{spot.name}</div>
              <div className="mt-1">
                {d?.loading ? (
                  <div className="h-4 w-full rounded bg-app-muted animate-pulse" />
                ) : d?.score ? (
                  <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold text-white uppercase ${scoreBg(sc)}`}>
                    {scoreLabel(sc)}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-600">N/A</span>
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

function SpotGridCard({ spot }: { spot: SpotWithCams }) {
  const { formatHeight, formatSpeed } = useUnits();
  const [ld, setLd] = useState<LiveData>({ score: null, forecast: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    fetchForecast(spot.lat, spot.lng)
      .then((forecasts) => {
        if (cancelled) return;
        const first = forecasts[0];
        setLd({ score: first ? calculateScore(first, null) : null, forecast: first ?? null, loading: false });
      })
      .catch(() => { if (!cancelled) setLd({ score: null, forecast: null, loading: false }); });
    return () => { cancelled = true; };
  }, [spot.lat, spot.lng]);

  const sc = ld.score?.overall ?? 0;
  const f = ld.forecast;

  return (
    <Link to={`/spot/${spot.id}`} className="group block">
      <div className="bg-app-card border border-app-border rounded-xl p-4 hover:border-ocean-600 transition-colors">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-ocean-300 transition-colors">
              {spot.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {spot.region}, {spot.country}
            </p>
          </div>
          <div className="flex-shrink-0">
            {ld.loading ? (
              <Spinner className="h-5 w-5" />
            ) : ld.score ? (
              <span className={`rounded-lg px-2 py-1 text-xs font-bold text-white uppercase ${scoreBg(sc)}`}>
                {scoreLabel(sc)}
              </span>
            ) : (
              <span className="text-xs text-gray-600">N/A</span>
            )}
          </div>
        </div>

        {/* Stats */}
        {f && (
          <div className="grid grid-cols-3 gap-2 text-center border-t border-app-border pt-3">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Surf</div>
              <div className="text-sm font-bold text-white mt-0.5">{formatHeight(f.swellHeight)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Period</div>
              <div className="text-sm font-bold text-white mt-0.5">{Math.round(f.swellPeriod)}s</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Wind</div>
              <div className="text-sm font-bold text-orange-400 mt-0.5">{formatSpeed(f.windSpeed)}</div>
            </div>
          </div>
        )}
        {ld.loading && (
          <div className="h-12 rounded bg-app-muted animate-pulse mt-3" />
        )}

        {/* Score bar */}
        {!ld.loading && ld.score && (
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-app-muted">
            <div
              className={`h-full transition-all duration-700 ${scoreBg(sc)}`}
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
    <div className="min-h-screen bg-app-bg">
      {/* Spots scroll bar */}
      <SpotScrollBar />

      {/* Hero */}
      <div className="bg-app-surface border-b border-app-border py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-3 text-3xl font-bold text-white">
          <Waves className="h-8 w-8 text-ocean-400" />
          WaveCast
        </div>
        <p className="mt-2 text-gray-400 text-sm">
          Free, open-source surf forecasting · Powered by Open-Meteo
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Map */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Surf Spots Map
          </h2>
          <div className="overflow-hidden rounded-xl border border-app-border shadow-lg">
            <SpotMap spots={DEMO_SPOTS} />
          </div>
        </section>

        {/* Grid */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Current Conditions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DEMO_SPOTS.map((spot) => (
              <SpotGridCard key={spot.id} spot={spot} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
