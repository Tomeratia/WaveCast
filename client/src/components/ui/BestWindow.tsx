import { useMemo } from 'react';
import { Sparkles, Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import type { ForecastSlot } from '@shared/types';
import { useUnits } from '../../context/UnitsContext';

interface BestWindowProps {
  slots: ForecastSlot[];
}

function scoreLabel(score: number) {
  if (score >= 75) return 'EPIC';
  if (score >= 50) return 'GOOD';
  if (score >= 25) return 'FAIR';
  if (score > 5)   return 'POOR';
  return 'FLAT';
}

function scoreColor(score: number) {
  if (score >= 75) return 'text-score-epic';
  if (score >= 50) return 'text-score-good';
  if (score >= 25) return 'text-score-fair';
  if (score > 5)   return 'text-score-poor';
  return 'text-gray-500';
}

function timeOfDayIcon(hour: number) {
  if (hour < 7)  return <Sunrise className="h-5 w-5 text-orange-400" />;
  if (hour < 17) return <Sun     className="h-5 w-5 text-yellow-400" />;
  if (hour < 20) return <Sunset  className="h-5 w-5 text-orange-500" />;
  return <Moon className="h-5 w-5 text-blue-300" />;
}

/**
 * Find the best contiguous N-hour window of the day by average score.
 * Returns null if no daytime slots available.
 */
function findBestWindow(slots: ForecastSlot[], windowSize = 2): {
  startHour: number;
  endHour: number;
  avgScore: number;
  bestSlot: ForecastSlot;
} | null {
  const daySlots = slots
    .filter((s) => {
      const h = new Date(s.forecast.timestamp).getUTCHours();
      return h >= 5 && h <= 20;
    })
    .sort((a, b) =>
      new Date(a.forecast.timestamp).getUTCHours() -
      new Date(b.forecast.timestamp).getUTCHours()
    );

  if (daySlots.length === 0) return null;
  if (daySlots.length < windowSize) {
    const best = daySlots.reduce((b, s) => (s.score.overall > b.score.overall ? s : b), daySlots[0]!);
    const h = new Date(best.forecast.timestamp).getUTCHours();
    return { startHour: h, endHour: h + 1, avgScore: best.score.overall, bestSlot: best };
  }

  let bestAvg = -1;
  let bestStart = 0;
  for (let i = 0; i <= daySlots.length - windowSize; i++) {
    const window = daySlots.slice(i, i + windowSize);
    const avg = window.reduce((sum, s) => sum + s.score.overall, 0) / windowSize;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestStart = i;
    }
  }

  const window = daySlots.slice(bestStart, bestStart + windowSize);
  const bestSlot = window.reduce((b, s) => (s.score.overall > b.score.overall ? s : b), window[0]!);
  const startHour = new Date(window[0]!.forecast.timestamp).getUTCHours();
  const endHour = new Date(window[window.length - 1]!.forecast.timestamp).getUTCHours() + 1;
  return { startHour, endHour, avgScore: Math.round(bestAvg), bestSlot };
}

export function BestWindow({ slots }: BestWindowProps) {
  const { formatHeight, formatSpeed } = useUnits();

  const result = useMemo(() => findBestWindow(slots, 2), [slots]);

  if (!result) return null;

  const { startHour, endHour, avgScore, bestSlot } = result;
  const f = bestSlot.forecast;

  return (
    <div className="rounded-xl border border-ocean-700/50 bg-gradient-to-br from-ocean-900/40 to-app-card p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-ocean-500/20 p-2.5">
            <Sparkles className="h-5 w-5 text-ocean-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ocean-400">Best window today</p>
            <div className="mt-0.5 flex items-center gap-2">
              {timeOfDayIcon(startHour)}
              <span className="text-2xl font-bold text-white">
                {startHour.toString().padStart(2, '0')}:00–{endHour.toString().padStart(2, '0')}:00
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-xl font-bold uppercase tracking-wider ${scoreColor(avgScore)}`}>
            {scoreLabel(avgScore)}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 sm:grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-app-surface/60 px-2 py-2">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">Waves</div>
          <div className="mt-1 text-sm font-bold text-white">{formatHeight(f.swellHeight)}</div>
          <div className="text-[10px] text-gray-500">{Math.round(f.swellPeriod)}s period</div>
        </div>
        <div className="rounded-lg bg-app-surface/60 px-2 py-2">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">Wind</div>
          <div className="mt-1 text-sm font-bold text-white">{formatSpeed(f.windSpeed)}</div>
          <div className="text-[10px] text-gray-500">{Math.round(f.windDirection)}°</div>
        </div>
        <div className="rounded-lg bg-app-surface/60 px-2 py-2">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">Temp</div>
          <div className="mt-1 text-sm font-bold text-white">
            {f.temperature ? `${Math.round(f.temperature)}°C` : '—'}
          </div>
          <div className="text-[10px] text-gray-500">air</div>
        </div>
      </div>
    </div>
  );
}
