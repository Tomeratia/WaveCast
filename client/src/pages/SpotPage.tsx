import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ArrowLeft, Video, VideoOff, Thermometer, Gauge } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import { HlsPlayer } from '../components/ui/HlsPlayer';
import { useSpotForecast } from '../hooks/useSpotForecast';
import { DEMO_SPOTS } from '../data/spots';
import { degreesToCompass } from '../utils/wind';
import { useUnits } from '../context/UnitsContext';
import { TidePanel } from '../components/ui/TidePanel';
import type { ForecastSlot } from '@shared/types';

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
function scoreTextColor(score: number) {
  if (score >= 75) return 'text-score-epic';
  if (score >= 50) return 'text-score-good';
  if (score >= 25) return 'text-score-fair';
  if (score > 5)   return 'text-score-poor';
  return 'text-gray-500';
}

function WindArrow({ deg, className = '' }: { deg: number; className?: string }) {
  return (
    <span
      className={`inline-block leading-none select-none ${className}`}
      style={{ transform: `rotate(${deg}deg)` }}
      title={`${Math.round(deg)}°`}
    >↑</span>
  );
}

function waveEnergy(h: number, t: number) {
  return Math.round(0.5 * 1025 * 9.81 * h * h * t / 1000);
}

function Stars({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 5);
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} className={`h-3.5 w-3.5 ${i <= filled ? 'text-score-fair' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

// ── Day grouping ──────────────────────────────────────────────────────────────

interface DayGroup {
  date: string;
  slots: ForecastSlot[];
  morning: ForecastSlot | null;
  noon: ForecastSlot | null;
  evening: ForecastSlot | null;
  best: ForecastSlot | null;
}

function groupByDay(hourly: ForecastSlot[]): DayGroup[] {
  const map = new Map<string, ForecastSlot[]>();
  for (const slot of hourly) {
    const date = slot.forecast.timestamp.slice(0, 10);
    const arr = map.get(date) ?? [];
    arr.push(slot);
    map.set(date, arr);
  }
  return Array.from(map.entries()).slice(0, 7).map(([date, slots]) => ({
    date,
    slots,
    morning: slots.find((s) => new Date(s.forecast.timestamp).getUTCHours() === 6) ?? slots[0] ?? null,
    noon:    slots.find((s) => new Date(s.forecast.timestamp).getUTCHours() === 12) ?? null,
    evening: slots.find((s) => new Date(s.forecast.timestamp).getUTCHours() === 18) ?? null,
    best:    slots.reduce<ForecastSlot | null>((b, s) => (!b || s.score.overall > b.score.overall ? s : b), null),
  }));
}

// ── Daily overview cards ──────────────────────────────────────────────────────

function DayCard({ day, isToday }: { day: DayGroup; isToday: boolean }) {
  const { formatHeight, formatSpeed } = useUnits();
  const d = new Date(day.date + 'T12:00:00Z');
  const label = isToday ? 'TODAY' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const sc = day.best?.score.overall ?? 0;

  const timePoints = [day.morning, day.noon, day.evening];

  return (
    <div className={`bg-app-card border rounded-xl p-3 min-w-[150px] flex-shrink-0 ${isToday ? 'border-ocean-500' : 'border-app-border'}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-ocean-400' : 'text-gray-500'}`}>{label}</div>
          <div className="text-sm font-bold text-white">{dateStr}</div>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${scoreBg(sc)} text-white uppercase`}>
          {scoreLabel(sc)}
        </span>
      </div>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-8 mb-2">
        {timePoints.map((s, i) => {
          const h = s ? Math.min(1, s.forecast.swellHeight / 3) : 0.05;
          return <div key={i} className="flex-1 bg-ocean-500/60 rounded-sm" style={{ height: `${Math.max(8, h * 100)}%` }} />;
        })}
      </div>

      {/* AM / NOON / PM labels */}
      <div className="grid grid-cols-3 text-center text-[9px] text-gray-600 mb-1">
        <span>AM</span><span>NOON</span><span>PM</span>
      </div>

      {/* Heights */}
      <div className="grid grid-cols-3 text-center text-[11px] font-bold text-white">
        {timePoints.map((s, i) => <span key={i}>{s ? formatHeight(s.forecast.swellHeight) : '—'}</span>)}
      </div>
      {/* Wind */}
      <div className="grid grid-cols-3 text-center text-[10px] text-orange-400 mt-0.5">
        {timePoints.map((s, i) => <span key={i}>{s ? formatSpeed(s.forecast.windSpeed) : '—'}</span>)}
      </div>
      {/* Period */}
      <div className="grid grid-cols-3 text-center text-[10px] text-purple-400 mt-0.5">
        {timePoints.map((s, i) => <span key={i}>{s ? `${Math.round(s.forecast.swellPeriod)}s` : '—'}</span>)}
      </div>
    </div>
  );
}

// ── Hourly details table ──────────────────────────────────────────────────────

function HourlyTable({ day }: { day: DayGroup }) {
  const { formatHeight, formatSpeed } = useUnits();
  const slots = [day.morning, day.noon, day.evening].filter(Boolean) as ForecastSlot[];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[580px]">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 border-b border-app-border">
            <th className="text-left py-2.5 px-4 w-20">Time</th>
            <th className="text-left py-2.5 px-4">Surf</th>
            <th className="text-left py-2.5 px-4">Primary Swell</th>
            <th className="text-left py-2.5 px-4">Secondary Swell</th>
            <th className="text-left py-2.5 px-4">Wind</th>
            <th className="text-right py-2.5 px-4">Energy</th>
            <th className="text-right py-2.5 px-4">Temp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-app-border/60">
          {slots.map((slot) => {
            const f = slot.forecast;
            const hour = new Date(f.timestamp).getUTCHours().toString().padStart(2, '0') + ':00';
            const sc = slot.score.overall;
            const energy = waveEnergy(f.swellHeight, f.swellPeriod);
            return (
              <tr key={f.timestamp} className="hover:bg-app-muted/20 transition-colors">
                {/* Time */}
                <td className="py-3.5 px-4 font-mono font-bold text-gray-300 text-sm">{hour}</td>

                {/* Surf */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{formatHeight(f.swellHeight)}</span>
                      <span className="text-gray-500 text-xs">{Math.round(f.swellPeriod)}s</span>
                    </div>
                    <Stars score={sc} />
                  </div>
                </td>

                {/* Primary swell */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <WindArrow deg={f.swellDirection} className="text-ocean-400 text-sm" />
                    <span className="font-semibold">{degreesToCompass(f.swellDirection)}</span>
                    <span className="text-gray-600 text-xs">{Math.round(f.swellDirection)}°</span>
                  </div>
                </td>

                {/* Secondary swell */}
                <td className="py-3.5 px-4">
                  {f.swellHeight2 > 0.1 ? (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <span className="font-semibold text-gray-300">{formatHeight(f.swellHeight2)}</span>
                        <span className="text-gray-600 text-xs">@ {Math.round(f.swellPeriod2)}s</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <WindArrow deg={f.swellDirection2} className="text-ocean-600 text-xs" />
                        <span>{degreesToCompass(f.swellDirection2)}</span>
                        <span>{Math.round(f.swellDirection2)}°</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-700 text-xs">—</span>
                  )}
                </td>

                {/* Wind */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold text-white ${
                      f.windSpeed < 15 ? 'bg-score-good' :
                      f.windSpeed < 30 ? 'bg-score-fair' : 'bg-score-poor'
                    }`}>
                      {formatSpeed(f.windSpeed)}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <WindArrow deg={f.windDirection} />
                      <span>{degreesToCompass(f.windDirection)}</span>
                    </div>
                  </div>
                </td>

                {/* Energy */}
                <td className="py-3.5 px-4 text-right">
                  <span className="text-gray-200 font-semibold">{energy}</span>
                  <span className="text-gray-600 text-xs ml-1">kJ</span>
                </td>

                {/* Temp */}
                <td className="py-3.5 px-4 text-right">
                  <span className="text-gray-400 text-sm">{Math.round(f.temperature)}°C</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Live cameras ──────────────────────────────────────────────────────────────

function LiveCameras({ cameras }: { cameras: { label: string; hlsUrl: string }[] }) {
  const [active, setActive] = useState(0);

  if (cameras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-app-border bg-app-card p-12 text-center gap-3">
        <VideoOff className="h-8 w-8 text-gray-700" />
        <p className="text-sm text-gray-500">No live cameras available for this spot.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cameras.length > 1 && (
        <div className="flex gap-2">
          {cameras.map((cam, i) => (
            <button
              key={cam.label}
              onClick={() => setActive(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                active === i
                  ? 'bg-ocean-500 text-white'
                  : 'bg-app-card border border-app-border text-gray-400 hover:text-white'
              }`}
            >
              {cam.label}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-hidden rounded-xl bg-black border border-app-border">
        <div className="flex items-center gap-2 bg-app-surface px-3 py-2 border-b border-app-border">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-white">{cameras[active]?.label}</span>
          <span className="ml-auto text-[10px] font-bold text-red-400 tracking-widest">LIVE</span>
          <Video className="h-3.5 w-3.5 text-gray-500" />
        </div>
        <div className="aspect-video">
          <HlsPlayer key={cameras[active]?.hlsUrl} src={cameras[active]?.hlsUrl ?? ''} />
        </div>
      </div>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = 'forecast' | 'live';

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'forecast', label: 'Forecast' },
    { id: 'live',     label: 'Live' },
  ];
  return (
    <div className="flex border-b border-app-border">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
            tab === t.id
              ? 'border-ocean-400 text-ocean-400'
              : 'border-transparent text-gray-500 hover:text-gray-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Current conditions summary strip ─────────────────────────────────────────

function CurrentStrip({ slot }: { slot: ForecastSlot }) {
  const { formatHeight, formatSpeed } = useUnits();
  const f = slot.forecast;
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-app-bg/60 border-b border-app-border text-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-gray-500 text-xs uppercase tracking-wide">Now</span>
        <span className="font-bold text-white">{formatHeight(f.swellHeight)}</span>
        <span className="text-gray-500">@</span>
        <span className="text-purple-400 font-semibold">{Math.round(f.swellPeriod)}s</span>
      </div>
      <div className="h-3 w-px bg-app-border" />
      <div className="flex items-center gap-1.5">
        <WindArrow deg={f.windDirection} className="text-gray-400" />
        <span className="text-orange-400 font-semibold">{formatSpeed(f.windSpeed)}</span>
        <span className="text-gray-500 text-xs">{degreesToCompass(f.windDirection)}</span>
      </div>
      <div className="h-3 w-px bg-app-border" />
      <div className="flex items-center gap-1.5">
        <Thermometer className="h-3.5 w-3.5 text-orange-300" />
        <span className="text-gray-400">{Math.round(f.temperature)}°C</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Gauge className="h-3.5 w-3.5 text-blue-400" />
        <span className="text-gray-400">{Math.round(f.pressure)} hPa</span>
      </div>
    </div>
  );
}

// ── SpotPage ──────────────────────────────────────────────────────────────────

export function SpotPage() {
  const { spotId } = useParams<{ spotId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) ?? 'forecast';

  const spot = useMemo(() => DEMO_SPOTS.find((s) => s.id === spotId) ?? null, [spotId]);
  const { current, hourly, isLoading, error } = useSpotForecast(spot);
  const days = useMemo(() => groupByDay(hourly), [hourly]);
  const todayDate = new Date().toISOString().slice(0, 10);

  function setTab(t: Tab) { setSearchParams({ tab: t }, { replace: true }); }

  if (!spot) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-gray-400">Spot not found.</p>
        <Link to="/" className="mt-4 inline-block text-ocean-400 hover:underline">← Back to home</Link>
      </div>
    );
  }

  const sc = current?.score.overall ?? 0;

  return (
    <div className="min-h-screen bg-app-bg text-gray-200">
      {/* Header */}
      <div className="bg-app-surface border-b border-app-border">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-500 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{spot.name}</h1>
                <p className="text-sm text-gray-500">{spot.region}, {spot.country}</p>
              </div>
            </div>
            {current && (
              <div className="flex items-center gap-3">
                <Stars score={sc} />
                <span className={`rounded-lg px-3 py-1 text-sm font-bold text-white ${scoreBg(sc)}`}>
                  {scoreLabel(sc)}
                </span>
              </div>
            )}
          </div>
          <TabBar tab={tab} onChange={setTab} />
        </div>
      </div>

      {/* Current conditions strip */}
      {current && <CurrentStrip slot={current} />}

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {isLoading && (
          <div className="flex h-64 items-center justify-center"><Spinner /></div>
        )}
        {error && (
          <div className="rounded-xl bg-red-900/20 border border-red-800 p-4">
            <p className="text-red-400">Failed to load forecast: {error}</p>
          </div>
        )}

        {!isLoading && current && (
          <>
            {/* FORECAST tab */}
            {tab === 'forecast' && (
              <div className="space-y-6">
                {/* Daily overview */}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Daily Overview</h2>
                  <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
                    {days.map((day) => (
                      <DayCard key={day.date} day={day} isToday={day.date === todayDate} />
                    ))}
                  </div>
                </div>

                {/* Hourly details */}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Hourly Details</h2>
                  <div className="space-y-3">
                    {days.map((day) => {
                      const d = new Date(day.date + 'T12:00:00Z');
                      const isToday = day.date === todayDate;
                      const dayLabel = isToday
                        ? 'Today'
                        : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                      return (
                        <div key={day.date} className="bg-app-card border border-app-border rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2.5 border-b border-app-border bg-app-surface/50">
                            <span className="font-bold text-white text-sm">{dayLabel}</span>
                            <span className={`text-xs font-bold uppercase ${scoreTextColor(day.best?.score.overall ?? 0)}`}>
                              {scoreLabel(day.best?.score.overall ?? 0)}
                            </span>
                          </div>
                          <HourlyTable day={day} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tides */}
                <TidePanel lat={spot.lat} lon={spot.lng} />
              </div>
            )}

            {/* LIVE tab */}
            {tab === 'live' && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Live Cameras</h2>
                <LiveCameras cameras={spot.cameras} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
