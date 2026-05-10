import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import type { ForecastSlot } from '@shared/types';
import { useUnits } from '../../context/UnitsContext';

interface HourlyBarChartProps {
  slots: ForecastSlot[];
  /** Filter to hours between these (inclusive). Default 5-20 (dawn to dusk). */
  startHour?: number;
  endHour?: number;
}

function scoreColor(score: number): string {
  if (score >= 75) return '#8b5cf6'; // epic
  if (score >= 50) return '#22c55e'; // good
  if (score >= 25) return '#f59e0b'; // fair
  if (score > 5)   return '#ef4444'; // poor
  return '#6b7280';                   // flat
}

interface TooltipPayload {
  payload: {
    hour: string;
    height: number;
    period: number;
    wind: number;
    score: number;
    heightLabel: string;
    windLabel: string;
  };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-app-border bg-app-surface/95 px-3 py-2 text-xs shadow-xl">
      <div className="font-bold text-white mb-1">{d.hour}</div>
      <div className="text-gray-300">Wave: <span className="font-semibold text-white">{d.heightLabel}</span> @ {d.period}s</div>
      <div className="text-gray-300">Wind: <span className="font-semibold text-white">{d.windLabel}</span></div>
      <div className="text-gray-300">Score: <span className="font-bold" style={{ color: scoreColor(d.score) }}>{d.score}</span></div>
    </div>
  );
}

export function HourlyBarChart({ slots, startHour = 5, endHour = 20 }: HourlyBarChartProps) {
  const { formatHeight, formatSpeed, heightUnit } = useUnits();

  const data = useMemo(() => {
    return slots
      .filter((s) => {
        const h = new Date(s.forecast.timestamp).getUTCHours();
        return h >= startHour && h <= endHour;
      })
      .map((s) => {
        const h = new Date(s.forecast.timestamp).getUTCHours();
        const heightInUnits = heightUnit === 'ft'
          ? Number((s.forecast.swellHeight * 3.281).toFixed(2))
          : Number(s.forecast.swellHeight.toFixed(2));
        return {
          hour: `${h.toString().padStart(2, '0')}:00`,
          height: heightInUnits,
          period: Math.round(s.forecast.swellPeriod),
          wind: Number(s.forecast.windSpeed.toFixed(1)),
          score: s.score.overall,
          heightLabel: formatHeight(s.forecast.swellHeight),
          windLabel: formatSpeed(s.forecast.windSpeed),
        };
      });
  }, [slots, startHour, endHour, formatHeight, formatSpeed, heightUnit]);

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-gray-500">
        No hourly data for this range
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.4} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            label={{ value: `Wave (${heightUnit})`, angle: -90, position: 'insideLeft', offset: 25, fontSize: 10, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f2937', opacity: 0.4 }} />
          <Bar dataKey="height" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={scoreColor(d.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-wider text-gray-500">
        {[
          { label: 'Flat', color: '#6b7280' },
          { label: 'Poor', color: '#ef4444' },
          { label: 'Fair', color: '#f59e0b' },
          { label: 'Good', color: '#22c55e' },
          { label: 'Epic', color: '#8b5cf6' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
