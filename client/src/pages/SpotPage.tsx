import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { ArrowLeft, Wind, Waves as WavesIcon, Thermometer, Gauge, Video } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import { useSpotForecast } from '../hooks/useSpotForecast';
import { DEMO_SPOTS } from '../data/spots';
import { degreesToCompass } from '../utils/wind';
import { useUnits } from '../context/UnitsContext';
import type { ForecastSlot } from '@shared/types';

// ── helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return 'bg-score-epic text-white';
  if (score >= 50) return 'bg-score-good text-white';
  if (score >= 25) return 'bg-score-fair text-gray-900';
  if (score > 5)   return 'bg-score-poor text-white';
  return 'bg-gray-400 text-white';
}

function scoreBorderColor(score: number): string {
  if (score >= 75) return 'border-score-epic';
  if (score >= 50) return 'border-score-good';
  if (score >= 25) return 'border-score-fair';
  if (score > 5)   return 'border-score-poor';
  return 'border-gray-400';
}

function scoreLabel(score: number): string {
  if (score >= 75) return 'EPIC';
  if (score >= 50) return 'GOOD';
  if (score >= 25) return 'FAIR';
  if (score > 5)   return 'POOR';
  return 'FLAT';
}

function WindArrow({ deg }: { deg: number }) {
  return (
    <span
      className="inline-block leading-none"
      style={{ transform: `rotate(${deg}deg)`, display: 'inline-block' }}
    >
      ↑
    </span>
  );
}

function waveEnergy(height: number, period: number): number {
  return Math.round(0.5 * 1025 * 9.81 * height * height * period / 1000);
}

// ── Rating bar ────────────────────────────────────────────────────────────────

function RatingBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="w-full">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-500 ${scoreColor(score).split(' ')[0]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-ocean-300 opacity-80">
        <span>Flat</span><span>Poor</span><span>Fair</span><span>Good</span><span>Epic</span>
      </div>
    </div>
  );
}

// ── Current conditions ────────────────────────────────────────────────────────

function CurrentConditions({ slot }: { slot: ForecastSlot }) {
  const { formatHeight, formatSpeed } = useUnits();
  const f = slot.forecast;
  const energy = waveEnergy(f.swellHeight, f.swellPeriod);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Surf height */}
      <div className={`rounded-xl border-l-4 ${scoreBorderColor(slot.score.overall)} bg-ocean-900 p-5 text-white`}>
        <div className="mb-1 flex items-center gap-2 text-ocean-300 text-xs font-semibold uppercase tracking-wider">
          <WavesIcon className="h-4 w-4" /> Surf Height
        </div>
        <div className="text-4xl font-bold tracking-tight">
          {formatHeight(f.swellHeight)}
        </div>
        <div className="mt-3 inline-block rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
          <span className={`rounded px-2 py-0.5 ${scoreColor(slot.score.overall)}`}>
            {scoreLabel(slot.score.overall)}
          </span>
        </div>
      </div>

      {/* Swell */}
      <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Primary Swell
        </div>
        <div className="text-2xl font-bold text-ocean-800 dark:text-ocean-200">
          {formatHeight(f.swellHeight)} @ {Math.round(f.swellPeriod)}s
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <WindArrow deg={f.swellDirection} />
          <span>{degreesToCompass(f.swellDirection)} {Math.round(f.swellDirection)}°</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Energy: {energy} kJ/m²
        </div>
      </div>

      {/* Wind */}
      <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
        <div className="mb-3 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <Wind className="h-3.5 w-3.5" /> Wind
        </div>
        <div className="text-2xl font-bold text-ocean-800 dark:text-ocean-200">
          {formatSpeed(f.windSpeed)}
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <WindArrow deg={f.windDirection} />
          <span>{degreesToCompass(f.windDirection)} {Math.round(f.windDirection)}°</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Gusts: {formatSpeed(f.windGusts)}
        </div>
      </div>

      {/* Conditions */}
      <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Conditions
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Thermometer className="h-4 w-4 text-orange-400" />
          <span>{Math.round(f.temperature)}°C</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Gauge className="h-4 w-4 text-blue-400" />
          <span>{Math.round(f.pressure)} hPa</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Period: {Math.round(f.swellPeriod)}s
        </div>
      </div>
    </div>
  );
}

// ── Daily forecast table ──────────────────────────────────────────────────────

interface DayGroup {
  date: string;
  morning: ForecastSlot | null;
  noon: ForecastSlot | null;
  evening: ForecastSlot | null;
}

function groupByDay(hourly: ForecastSlot[]): DayGroup[] {
  const map = new Map<string, ForecastSlot[]>();
  for (const slot of hourly) {
    const date = slot.forecast.timestamp.slice(0, 10);
    const arr = map.get(date) ?? [];
    arr.push(slot);
    map.set(date, arr);
  }
  return Array.from(map.entries())
    .slice(0, 7)
    .map(([date, slots]) => ({
      date,
      morning: slots.find((s) => new Date(s.forecast.timestamp).getUTCHours() === 6) ?? slots[0] ?? null,
      noon:    slots.find((s) => new Date(s.forecast.timestamp).getUTCHours() === 12) ?? null,
      evening: slots.find((s) => new Date(s.forecast.timestamp).getUTCHours() === 18) ?? null,
    }));
}

function DayTableCell({ slot }: { slot: ForecastSlot | null }) {
  const { formatHeight, formatSpeed } = useUnits();
  if (!slot) return <td className="px-2 py-3 text-center text-gray-300 dark:text-gray-600">—</td>;
  const f = slot.forecast;
  const sc = slot.score.overall;
  const energy = waveEnergy(f.swellHeight, f.swellPeriod);
  return (
    <td className="px-3 py-3 text-sm">
      <div className="flex flex-col items-center gap-1.5">
        <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${scoreColor(sc)}`}>
          {scoreLabel(sc)}
        </span>
        <span className="font-semibold text-ocean-700 dark:text-ocean-300">
          {formatHeight(f.swellHeight)} @ {Math.round(f.swellPeriod)}s
        </span>
        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
          <WindArrow deg={f.windDirection} />
          {formatSpeed(f.windSpeed)}
        </span>
        <span className="text-gray-400 text-xs">{energy} kJ/m²</span>
      </div>
    </td>
  );
}

function DailyForecastTable({ hourly }: { hourly: ForecastSlot[] }) {
  const days = useMemo(() => groupByDay(hourly), [hourly]);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3 text-left w-28">Date</th>
            <th className="px-2 py-3 text-center">6 AM</th>
            <th className="px-2 py-3 text-center">Noon</th>
            <th className="px-2 py-3 text-center">6 PM</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
          {days.map(({ date, morning, noon, evening }) => {
            const d = new Date(date + 'T12:00:00Z');
            const dayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return (
              <tr key={date} className="hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">
                  {dayStr}
                </td>
                <DayTableCell slot={morning} />
                <DayTableCell slot={noon} />
                <DayTableCell slot={evening} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Surf Cameras ──────────────────────────────────────────────────────────────

function SurfCameras({ cameras }: { cameras: { label: string; embedUrl: string }[] }) {
  if (cameras.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-gray-400">
        <Video className="mx-auto mb-2 h-8 w-8 opacity-40" />
        <p className="text-sm">No live cameras available for this spot.</p>
        <p className="mt-1 text-xs opacity-70">Camera feeds are added as they become publicly available.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cameras.map((cam) => (
        <div key={cam.label} className="overflow-hidden rounded-xl bg-black shadow">
          <div className="flex items-center gap-2 bg-gray-900 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-white uppercase tracking-wide">{cam.label}</span>
            <span className="ml-auto text-[10px] text-gray-400">LIVE</span>
          </div>
          <div className="aspect-video">
            <iframe
              src={cam.embedUrl}
              className="h-full w-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={cam.label}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── SpotPage ──────────────────────────────────────────────────────────────────

export function SpotPage() {
  const { spotId } = useParams<{ spotId: string }>();
  const spot = useMemo(() => DEMO_SPOTS.find((s) => s.id === spotId) ?? null, [spotId]);
  const { current, hourly, isLoading, error } = useSpotForecast(spot);

  if (!spot) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-gray-500">Spot not found.</p>
        <Link to="/" className="mt-4 inline-block text-ocean-600 hover:underline">← Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-ocean-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-ocean-300 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" /> All Spots
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{spot.name}</h1>
              <p className="mt-1 text-ocean-300">{spot.region}, {spot.country}</p>
            </div>
            {current && (
              <div className="flex flex-col items-end gap-2 min-w-[220px]">
                <span className={`rounded-lg px-4 py-1.5 text-base font-bold uppercase tracking-wider ${scoreColor(current.score.overall)}`}>
                  {scoreLabel(current.score.overall)}
                </span>
                <div className="w-full">
                  <RatingBar score={current.score.overall} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-red-700 dark:text-red-300">Failed to load forecast: {error}</p>
          </div>
        )}

        {current && !isLoading && (
          <>
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">Current Conditions</h2>
              <CurrentConditions slot={current} />
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">7-Day Forecast</h2>
              <DailyForecastTable hourly={hourly} />
            </section>

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                <Video className="h-5 w-5 text-red-500" />
                Live Cameras
              </h2>
              <SurfCameras cameras={spot.cameras} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
