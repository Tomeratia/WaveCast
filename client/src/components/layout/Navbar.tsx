import { Link } from 'react-router-dom';
import { Waves, Heart, Bell } from 'lucide-react';
import { useUnits } from '../../context/UnitsContext';
import type { HeightUnit, SpeedUnit } from '../../context/UnitsContext';

function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded overflow-hidden border border-app-border text-xs">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 font-semibold transition-colors ${
            value === o.value
              ? 'bg-ocean-500 text-white'
              : 'bg-app-card text-gray-400 hover:bg-app-muted hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const { heightUnit, speedUnit, setHeightUnit, setSpeedUnit } = useUnits();

  return (
    <nav className="border-b border-app-border bg-app-surface text-gray-200 sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 gap-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white flex-shrink-0">
          <Waves className="h-5 w-5 text-ocean-400" />
          WaveCast
        </Link>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Units */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">Height</span>
            <SegmentToggle<HeightUnit>
              options={[{ value: 'm', label: 'm' }, { value: 'ft', label: 'ft' }]}
              value={heightUnit}
              onChange={setHeightUnit}
            />
            <span className="text-xs text-gray-500 hidden sm:block">Wind</span>
            <SegmentToggle<SpeedUnit>
              options={[
                { value: 'kmh', label: 'km/h' },
                { value: 'mph', label: 'mph' },
                { value: 'kts', label: 'kts' },
              ]}
              value={speedUnit}
              onChange={setSpeedUnit}
            />
          </div>

          <div className="h-4 w-px bg-app-border hidden sm:block" />

          <Link to="/favorites" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Favourites</span>
          </Link>
          <Link to="/alerts" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
