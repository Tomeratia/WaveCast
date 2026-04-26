import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ForecastSlot } from '@shared/types';

interface ForecastChartProps {
  hourly: ForecastSlot[];
  hours?: number;
}

export function ForecastChart({ hourly, hours = 48 }: ForecastChartProps) {
  const data = useMemo(
    () =>
      hourly.slice(0, hours).map((slot) => ({
        time: new Date(slot.forecast.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
        }),
        score: slot.score.overall,
        swellHeight: Number(slot.forecast.swellHeight.toFixed(2)),
        windSpeed: Number(slot.forecast.windSpeed.toFixed(1)),
      })),
    [hourly, hours],
  );

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No forecast data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="score" stroke="#0284c7" strokeWidth={2} name="Score" dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="swellHeight" stroke="#22c55e" strokeWidth={2} name="Swell (m)" dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="windSpeed" stroke="#f59e0b" strokeWidth={2} name="Wind (km/h)" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
