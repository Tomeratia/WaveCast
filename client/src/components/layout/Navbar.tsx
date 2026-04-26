import { Link } from 'react-router-dom';
import { Waves, Heart, Bell } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b border-ocean-700 bg-ocean-800 text-white dark:border-ocean-900 dark:bg-ocean-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Waves className="h-6 w-6" />
          WaveCast
        </Link>

        <div className="flex items-center gap-4">
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
