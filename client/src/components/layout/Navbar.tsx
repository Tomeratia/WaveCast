import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Waves, Heart, Bell, Bot, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import { useUnits } from '../../context/UnitsContext';
import { useAuth } from '../../context/AuthContext';
import { logoutApi } from '../../services/authClient';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try { await logoutApi(); } catch { /* ignore */ }
    logout();
    navigate('/login');
    setMenuOpen(false);
  }

  return (
    <nav className="border-b border-app-border bg-app-surface text-gray-200 sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white flex-shrink-0">
          <Waves className="h-5 w-5 text-ocean-400" />
          WaveCast
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Height</span>
            <SegmentToggle<HeightUnit>
              options={[{ value: 'm', label: 'm' }, { value: 'ft', label: 'ft' }]}
              value={heightUnit}
              onChange={setHeightUnit}
            />
            <span className="text-xs text-gray-500">Wind</span>
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

          <div className="h-4 w-px bg-app-border" />

          <Link to="/favorites" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <Heart className="h-4 w-4" />
            <span>Favourites</span>
          </Link>
          <Link to="/alerts" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <Bell className="h-4 w-4" />
            <span>Alerts</span>
          </Link>
          <Link to="/agent" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <Bot className="h-4 w-4" />
            <span>AI Assistant</span>
          </Link>

          <div className="h-4 w-px bg-app-border" />

          {user ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">{user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
              <LogIn className="h-4 w-4" />
              <span>Sign in</span>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-app-border bg-app-surface px-4 py-4 space-y-4">
          {/* Units */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Units</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Height</span>
                <SegmentToggle<HeightUnit>
                  options={[{ value: 'm', label: 'm' }, { value: 'ft', label: 'ft' }]}
                  value={heightUnit}
                  onChange={setHeightUnit}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Wind</span>
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
            </div>
          </div>

          <div className="border-t border-app-border" />

          {/* Nav links */}
          <div className="space-y-1">
            <Link to="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-app-muted transition-colors">
              <Heart className="h-4 w-4" /> Favourites
            </Link>
            <Link to="/alerts" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-app-muted transition-colors">
              <Bell className="h-4 w-4" /> Alerts
            </Link>
            <Link to="/agent" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-app-muted transition-colors">
              <Bot className="h-4 w-4" /> AI Assistant
            </Link>
          </div>

          <div className="border-t border-app-border" />

          {user ? (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-app-muted transition-colors">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
