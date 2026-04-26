import { Link } from 'react-router-dom';
import { Waves, Heart, Bell } from 'lucide-react';
import { useUnits } from '../../context/UnitsContext';
import type { HeightUnit, SpeedUnit } from '../../context/UnitsContext';

function UnitToggle() {
  const { heightUnit, speedUnit, setHeightUnit, setSpeedUnit } = useUnits();

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Height */}
      <div className="flex rounded-md overflow-hidden border border-ocean-600">
        {(['m', 'ft'] as HeightUnit[]).map((u) => (
          <button
            key={u}
            onClick={() => setHeightUnit(u)}
            className={`px-2 py-1 font-semibold uppercase transition-colors ${
              heightUnit === u
                ? 'bg-ocean-400 text-white'
                : 'bg-ocean-800 text-ocean-300 hover:bg-ocean-700'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Speed */}
      <div className="flex rounded-md overflow-hidden border border-ocean-600">
        {(['kmh', 'mph', 'kts'] as SpeedUnit[]).map((u) => (
          <button
            key={u}
            onClick={() => setSpeedUnit(u)}
            className={`px-2 py-1 font-semibold uppercase transition-colors ${
              speedUnit === u
                ? 'bg-ocean-400 text-white'
                : 'bg-ocean-800 text-ocean-300 hover:bg-ocean-700'
            }`}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Navbar() {
  return (
    <nav className="border-b border-ocean-700 bg-ocean-800 text-white dark:border-ocean-900 dark:bg-ocean-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 gap-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold flex-shrink-0">
          <Waves className="h-6 w-6" />
          WaveCast
        </Link>

        <div className="flex items-center gap-4 flex-wrap justify-end">
          <UnitToggle />
          <Link to="/favorites" className="flex items-center gap-1 hover:text-ocean-200">
            <Heart className="h-5 w-5" />
            <span className="hidden sm:inline">Favorites</span>
          </Link>
          <Link to="/alerts" className="flex items-center gap-1 hover:text-ocean-200">
            <Bell className="h-5 w-5" />
            <span className="hidden sm:inline">Alerts</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
