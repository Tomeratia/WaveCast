import { useMemo } from 'react';
import { useTides } from '../../hooks/useTides';
import type { TideExtreme, TideHourly } from '../../services/tideClient';

// ── Mini tide graph (SVG) ─────────────────────────────────────────────────────

function TideGraph({ heights, extremes }: { heights: TideHourly[]; extremes: TideExtreme[] }) {
  const W = 400, H = 80, PAD = 8;

  const todayStart = useMemo(() => {
    const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d.getTime() / 1000;
  }, []);
  const todayEnd = todayStart + 86400;

  const todayHeights = heights.filter((h) => h.dt >= todayStart && h.dt <= todayEnd);
  if (todayHeights.length < 2) return null;

  const minH = Math.min(...todayHeights.map((h) => h.height));
  const maxH = Math.max(...todayHeights.map((h) => h.height));
  const range = maxH - minH || 1;

  function x(dt: number) {
    return PAD + ((dt - todayStart) / 86400) * (W - PAD * 2);
  }
  function y(h: number) {
    return H - PAD - ((h - minH) / range) * (H - PAD * 2);
  }

  const points = todayHeights.map((h) => `${x(h.dt).toFixed(1)},${y(h.height).toFixed(1)}`).join(' ');

  // Current time marker
  const now = Date.now() / 1000;
  const nowX = Math.max(PAD, Math.min(W - PAD, x(now)));

  const todayExtremes = extremes.filter((e) => e.dt >= todayStart && e.dt <= todayEnd);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
      {/* Fill */}
      <defs>
        <linearGradient id="tideGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polyline
        points={`${PAD},${H} ${points} ${W - PAD},${H}`}
        fill="url(#tideGrad)"
        stroke="none"
      />
      <polyline points={points} fill="none" stroke="#38bdf8" strokeWidth="1.5" />

      {/* High/Low markers */}
      {todayExtremes.map((e) => (
        <g key={e.dt}>
          <circle cx={x(e.dt)} cy={y(e.height)} r="3" fill={e.type === 'High' ? '#38bdf8' : '#f59e0b'} />
          <text x={x(e.dt)} y={y(e.height) - 6} textAnchor="middle" fontSize="8" fill={e.type === 'High' ? '#38bdf8' : '#f59e0b'}>
            {e.type === 'High' ? 'H' : 'L'}
          </text>
        </g>
      ))}

      {/* Now line */}
      {now >= todayStart && now <= todayEnd && (
        <line x1={nowX} y1={PAD} x2={nowX} y2={H - PAD} stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" />
      )}
    </svg>
  );
}

// ── Extremes list ─────────────────────────────────────────────────────────────

function ExtremesList({ extremes }: { extremes: TideExtreme[] }) {
  const upcoming = extremes
    .filter((e) => e.dt * 1000 >= Date.now() - 3600000)
    .slice(0, 4);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
      {upcoming.map((e) => {
        const d = new Date(e.dt * 1000);
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isHigh = e.type === 'High';
        return (
          <div key={e.dt} className="bg-app-bg rounded-lg px-3 py-2 text-center">
            <div className={`text-xs font-bold uppercase tracking-wider ${isHigh ? 'text-ocean-400' : 'text-score-fair'}`}>
              {isHigh ? '▲ High' : '▼ Low'}
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              {e.height.toFixed(2)} <span className="text-xs font-normal text-gray-500">m</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{timeStr}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── TidePanel ─────────────────────────────────────────────────────────────────

interface TidePanelProps { lat: number; lon: number }

export function TidePanel({ lat, lon }: TidePanelProps) {
  const { data, isLoading, noKey } = useTides(lat, lon);

  if (noKey) {
    return (
      <div className="bg-app-card border border-dashed border-app-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tides</h3>
          <span className="text-[10px] bg-app-muted text-gray-500 px-2 py-0.5 rounded">API key required</span>
        </div>
        <p className="text-xs text-gray-600">
          Add <code className="text-ocean-400">VITE_WORLDTIDES_KEY=your_key</code> to enable tide data.{' '}
          <a href="https://www.worldtides.info/developer" target="_blank" rel="noreferrer" className="text-ocean-400 hover:underline">
            Get a free key →
          </a>
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-app-card border border-app-border rounded-xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Tides</h3>
        <div className="h-20 rounded bg-app-muted animate-pulse" />
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[1,2,3,4].map((i) => <div key={i} className="h-14 rounded bg-app-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data || (!data.extremes.length && !data.heights.length)) {
    return (
      <div className="bg-app-card border border-app-border rounded-xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Tides</h3>
        <p className="text-xs text-gray-600">No tide data available for this location.</p>
      </div>
    );
  }

  // Current tide height
  const now = Date.now() / 1000;
  const closest = data.heights.reduce<TideHourly | null>((best, h) =>
    !best || Math.abs(h.dt - now) < Math.abs(best.dt - now) ? h : best, null
  );

  // Rising or falling?
  const nextExtreme = data.extremes.find((e) => e.dt > now);
  const tideDir = nextExtreme?.type === 'High' ? 'Rising' : 'Falling';
  const tideDirColor = tideDir === 'Rising' ? 'text-ocean-400' : 'text-score-fair';

  return (
    <div className="bg-app-card border border-app-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tides — Today</h3>
        {closest && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">
              {closest.height.toFixed(2)} <span className="text-xs font-normal text-gray-500">m</span>
            </span>
            <span className={`text-xs font-semibold ${tideDirColor}`}>
              {tideDir === 'Rising' ? '▲' : '▼'} {tideDir}
            </span>
          </div>
        )}
      </div>

      {data.heights.length > 0 && (
        <TideGraph heights={data.heights} extremes={data.extremes} />
      )}

      {data.extremes.length > 0 && (
        <ExtremesList extremes={data.extremes} />
      )}
    </div>
  );
}
