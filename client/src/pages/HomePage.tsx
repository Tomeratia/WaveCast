import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Waves, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { SpotMap } from '../components/map/SpotMap';
import { Spinner } from '../components/ui/Spinner';
import { DEMO_SPOTS } from '../data/spots';
import { fetchForecast } from '../services/weatherClient';
import { calculateScore } from '../services/scoringClient';
import { useUnits } from '../context/UnitsContext';
import type { SpotWithCams } from '../data/spots';
import type { ScoreResult, NormalizedForecast } from '@shared/types';

// ── Types & helpers ───────────────────────────────────────────────────────────

interface LiveData { score: ScoreResult | null; forecast: NormalizedForecast | null; loading: boolean }

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

// ── Continent → Country structure ────────────────────────────────────────────

interface ContinentDef {
  name: string;
  emoji: string;
  countries: string[];
}

const CONTINENTS: ContinentDef[] = [
  { name: 'Middle East', emoji: '🌍', countries: ['Israel'] },
  { name: 'North America', emoji: '🌎', countries: ['USA'] },
  { name: 'South America', emoji: '🌎', countries: ['Chile', 'Brazil'] },
  { name: 'Europe', emoji: '🌍', countries: ['Portugal', 'France', 'Spain', 'Ireland', 'UK'] },
  { name: 'Africa', emoji: '🌍', countries: ['South Africa', 'Morocco'] },
  { name: 'Oceania', emoji: '🌏', countries: ['Australia', 'French Polynesia'] },
  { name: 'Asia', emoji: '🌏', countries: ['Indonesia', 'Japan'] },
];

// ── Global live-data store (shared across all cards) ─────────────────────────

function useLiveData() {
  const [data, setData] = useState<Record<string, LiveData>>(
    Object.fromEntries(DEMO_SPOTS.map((s) => [s.id, { score: null, forecast: null, loading: true }]))
  );

  useEffect(() => {
    // Stagger requests slightly to avoid hammering the API
    DEMO_SPOTS.forEach((spot, i) => {
      setTimeout(() => {
        fetchForecast(spot.lat, spot.lng)
          .then((forecasts) => {
            const first = forecasts[0];
            setData((prev) => ({
              ...prev,
              [spot.id]: { score: first ? calculateScore(first, null) : null, forecast: first ?? null, loading: false },
            }));
          })
          .catch(() => {
            setData((prev) => ({ ...prev, [spot.id]: { score: null, forecast: null, loading: false } }));
          });
      }, i * 120); // 120ms stagger
    });
  }, []);

  return data;
}

// ── Horizontal spots scroll bar (top nav) ────────────────────────────────────

function SpotScrollBar({ liveData }: { liveData: Record<string, LiveData> }) {
  return (
    <div className="bg-app-surface border-b border-app-border">
      <div className="flex overflow-x-auto scrollbar-none">
        {DEMO_SPOTS.map((spot) => {
          const d = liveData[spot.id];
          const sc = d?.score?.overall ?? 0;
          return (
            <Link
              key={spot.id}
              to={`/spot/${spot.id}`}
              className="flex-shrink-0 px-3 py-2 text-center hover:bg-app-card transition-colors border-r border-app-border min-w-[90px]"
            >
              <div className="text-[11px] font-semibold text-gray-300 truncate">{spot.name}</div>
              <div className="mt-0.5">
                {d?.loading ? (
                  <div className="h-3.5 w-full rounded bg-app-muted animate-pulse" />
                ) : d?.score ? (
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold text-white uppercase ${scoreBg(sc)}`}>
                    {scoreLabel(sc)}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-600">N/A</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Spot card ─────────────────────────────────────────────────────────────────

function SpotCard({ spot, ld }: { spot: SpotWithCams; ld: LiveData }) {
  const { formatHeight, formatSpeed } = useUnits();
  const sc = ld.score?.overall ?? 0;
  const f = ld.forecast;

  return (
    <Link to={`/spot/${spot.id}`} className="group block">
      <div className="bg-app-card border border-app-border rounded-xl p-4 hover:border-ocean-600 transition-colors h-full">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate text-sm group-hover:text-ocean-300 transition-colors">
              {spot.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              {spot.region}
            </p>
          </div>
          <div className="shrink-0">
            {ld.loading ? (
              <Spinner className="h-4 w-4" />
            ) : ld.score ? (
              <span className={`rounded px-2 py-0.5 text-[11px] font-bold text-white uppercase ${scoreBg(sc)}`}>
                {scoreLabel(sc)}
              </span>
            ) : (
              <span className="text-[11px] text-gray-600">—</span>
            )}
          </div>
        </div>

        {f ? (
          <div className="grid grid-cols-3 gap-1 text-center border-t border-app-border pt-2.5">
            <div>
              <div className="text-[9px] text-gray-600 uppercase tracking-wide">Surf</div>
              <div className="text-xs font-bold text-white mt-0.5">{formatHeight(f.swellHeight)}</div>
            </div>
            <div>
              <div className="text-[9px] text-gray-600 uppercase tracking-wide">Period</div>
              <div className="text-xs font-bold text-white mt-0.5">{Math.round(f.swellPeriod)}s</div>
            </div>
            <div>
              <div className="text-[9px] text-gray-600 uppercase tracking-wide">Wind</div>
              <div className="text-xs font-bold text-orange-400 mt-0.5">{formatSpeed(f.windSpeed)}</div>
            </div>
          </div>
        ) : (
          ld.loading && <div className="h-8 rounded bg-app-muted animate-pulse mt-2" />
        )}

        {!ld.loading && ld.score && (
          <div className="mt-2.5 h-0.5 w-full overflow-hidden rounded-full bg-app-muted">
            <div className={`h-full ${scoreBg(sc)}`} style={{ width: `${sc}%` }} />
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Country section (collapsible) ─────────────────────────────────────────────

function CountrySection({
  country,
  spots,
  liveData,
  defaultOpen,
}: {
  country: string;
  spots: SpotWithCams[];
  liveData: Record<string, LiveData>;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Best condition label across all spots in this country
  const best = useMemo(() => {
    const scores = spots
      .map((s) => liveData[s.id]?.score?.overall ?? 0)
      .filter((s) => s > 0);
    if (!scores.length) return null;
    return Math.max(...scores);
  }, [spots, liveData]);

  return (
    <div className="border border-app-border rounded-xl overflow-hidden">
      {/* Country header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-app-card hover:bg-app-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          <span className="font-semibold text-white">{country}</span>
          <span className="text-xs text-gray-500">{spots.length} spot{spots.length !== 1 ? 's' : ''}</span>
        </div>
        {best !== null && (
          <span className={`rounded px-2 py-0.5 text-[11px] font-bold text-white uppercase ${scoreBg(best)}`}>
            Best: {scoreLabel(best)}
          </span>
        )}
      </button>

      {/* Spot grid */}
      {open && (
        <div className="p-3 bg-app-bg/50 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} ld={liveData[spot.id] ?? { score: null, forecast: null, loading: true }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Continent section (collapsible) ──────────────────────────────────────────

function ContinentSection({
  continent,
  liveData,
  defaultOpen,
}: {
  continent: ContinentDef;
  liveData: Record<string, LiveData>;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // All spots belonging to this continent's countries
  const spotsByCountry = useMemo(() => {
    const map = new Map<string, SpotWithCams[]>();
    for (const country of continent.countries) {
      const countrySpots = DEMO_SPOTS.filter((s) => s.country === country);
      if (countrySpots.length) map.set(country, countrySpots);
    }
    return map;
  }, [continent]);

  const totalSpots = useMemo(
    () => Array.from(spotsByCountry.values()).reduce((a, b) => a + b.length, 0),
    [spotsByCountry]
  );

  if (totalSpots === 0) return null;

  return (
    <section>
      {/* Continent header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 mb-3 group"
      >
        <span className="text-xl">{continent.emoji}</span>
        <h2 className="text-base font-bold text-white group-hover:text-ocean-300 transition-colors">
          {continent.name}
        </h2>
        <span className="text-xs text-gray-600">{totalSpots} spots</span>
        <div className="flex-1 h-px bg-app-border ml-2" />
        {open ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {open && (
        <div className="space-y-2 mb-2">
          {Array.from(spotsByCountry.entries()).map(([country, spots], i) => (
            <CountrySection
              key={country}
              country={country}
              spots={spots}
              liveData={liveData}
              defaultOpen={i === 0 && defaultOpen}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── HomePage ──────────────────────────────────────────────────────────────────

export function HomePage() {
  const liveData = useLiveData();

  return (
    <div className="min-h-screen bg-app-bg">
      <SpotScrollBar liveData={liveData} />

      {/* Hero */}
      <div className="bg-app-surface border-b border-app-border py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-3 text-3xl font-bold text-white">
          <Waves className="h-8 w-8 text-ocean-400" />
          WaveCast
        </div>
        <p className="mt-1.5 text-gray-400 text-sm">
          Free, open-source surf forecasting · Powered by Open-Meteo
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-10">
        {/* Map */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Surf Spots Map
          </h2>
          <div className="overflow-hidden rounded-xl border border-app-border shadow-lg">
            <SpotMap spots={DEMO_SPOTS} />
          </div>
        </section>

        {/* Continents */}
        <div className="space-y-8">
          {CONTINENTS.map((continent, i) => (
            <ContinentSection
              key={continent.name}
              continent={continent}
              liveData={liveData}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
