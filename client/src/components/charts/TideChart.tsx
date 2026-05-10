import { useEffect, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';
import { Waves, ArrowUp, ArrowDown } from 'lucide-react';
import { fetchOpenMeteoTides, type OpenMeteoTideData } from '../../services/openMeteoTideClient';
import { useUnits } from '../../context/UnitsContext';

interface TideChartProps {
  lat: number;
  lon: number;
}

interface TooltipPayload {
  payload: { hour: string; height: number; heightLabel: string };
}

function TideTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-app-border bg-app-surface/95 px-3 py-2 text-xs shadow-xl">
      <div className="font-bold text-white">{d.hour}</div>
      <div className="text-ocean-300">{d.heightLabel}</div>
    </div>
  );
}

export function TideChart({ lat, lon }: TideChartProps) {
  const [data, setData] = useState<OpenMeteoTideData | null>(null);
  const [loading, setLoading] = useState(true);
  const { heightUnit, formatHeight } = useUnits();

  useEffect(() => {
    setLoading(true);
    fetchOpenMeteoTides(lat, lon)
      .then(setData)
      .finally(() => setLoading(false));
  }, [lat, lon]);

  const { chartData, todayExtremes, currentHeight, todayDateStr } = useMemo(() => {
    if (!data) return { chartData: [], todayExtremes: [], currentHeight: null, todayDateStr: '' };

    const today = new Date().toISOString().slice(0, 10);
    const todayPoints = data.hourly.filter((p) => p.timestamp.slice(0, 10) === today);
    const todayExtremes = data.extremes.filter((e) => e.timestamp.slice(0, 10) === today);

    const chartData = todayPoints.map((p) => {
      const h = new Date(p.timestamp).getUTCHours();
      const heightInUnits = heightUnit === 'ft' ? Number((p.height * 3.281).toFixed(3)) : Number(p.height.toFixed(3));
      return {
        hour: `${h.toString().padStart(2, '0')}:00`,
        rawTimestamp: p.timestamp,
        height: heightInUnits,
        heightLabel: formatHeight(p.height),
      };
    });

    // Estimate current height by finding the slot closest to now
    const now = Date.now();
    let closest: typeof todayPoints[0] | null = null;
    let minDelta = Infinity;
    for (const p of todayPoints) {
      const delta = Math.abs(new Date(p.timestamp).getTime() - now);
      if (delta < minDelta) {
        minDelta = delta;
        closest = p;
      }
    }

    const currentHeightM = closest?.height ?? null;
    const currentHeight = currentHeightM !== null
      ? (heightUnit === 'ft' ? Number((currentHeightM * 3.281).toFixed(2)) : Number(currentHeightM.toFixed(2)))
      : null;
    return { chartData, todayExtremes, currentHeight, currentHeightM, todayDateStr: today };
  }, [data, heightUnit, formatHeight]);

  if (loading) {
    return (
      <div className="rounded-xl border border-app-border bg-app-card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <Waves className="h-4 w-4 text-ocean-400" /> Tide — Today
        </h3>
        <div className="flex h-40 items-center justify-center text-sm text-gray-500">Loading tides…</div>
      </div>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <div className="rounded-xl border border-app-border bg-app-card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <Waves className="h-4 w-4 text-ocean-400" /> Tide — Today
        </h3>
        <p className="text-xs text-gray-500">No tide data available for this location.</p>
      </div>
    );
  }

  const minH = Math.min(...chartData.map((d) => d.height));
  const maxH = Math.max(...chartData.map((d) => d.height));
  const padding = Math.max(0.05, (maxH - minH) * 0.15);

  return (
    <div className="rounded-xl border border-app-border bg-app-card p-5">
      <div className="mb-4 flex items-end justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Waves className="h-4 w-4 text-ocean-400" /> Tide — Today
        </h3>
        {currentHeight !== null && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Now</div>
            <div className="text-lg font-bold text-ocean-300">{currentHeight} {heightUnit}</div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="tideGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            domain={[minH - padding, maxH + padding]}
            tickFormatter={(v: number) => `${v.toFixed(2)}`}
            unit={` ${heightUnit}`}
          />
          <Tooltip content={<TideTooltip />} />
          <Area type="monotone" dataKey="height" stroke="#0ea5e9" strokeWidth={2} fill="url(#tideGrad)" />

          {todayExtremes.map((e) => {
            const h = new Date(e.timestamp).getUTCHours();
            return (
              <ReferenceDot
                key={e.timestamp}
                x={`${h.toString().padStart(2, '0')}:00`}
                y={Number(e.height.toFixed(3))}
                r={4}
                fill={e.type === 'high' ? '#22c55e' : '#f59e0b'}
                stroke="#fff"
                strokeWidth={1.5}
              />
            );
          })}

          {/* Vertical line at current hour */}
          <ReferenceLine
            x={`${new Date().getUTCHours().toString().padStart(2, '0')}:00`}
            stroke="#ef4444"
            strokeDasharray="3 3"
            opacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Extremes summary */}
      {todayExtremes.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          {todayExtremes.map((e) => {
            const h = new Date(e.timestamp).getUTCHours();
            const min = new Date(e.timestamp).getUTCMinutes();
            const time = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            return (
              <div key={e.timestamp} className="flex items-center gap-1.5">
                {e.type === 'high' ? (
                  <ArrowUp className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <ArrowDown className="h-3.5 w-3.5 text-orange-400" />
                )}
                <span className="font-semibold text-gray-300">{time}</span>
                <span className="text-gray-500">{formatHeight(e.height)}</span>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-[10px] text-gray-600">
        Data: Open-Meteo Marine · sea level height (MSL) · UTC · date: {todayDateStr}
      </p>
    </div>
  );
}
