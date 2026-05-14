import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Trash2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFavorites, removeFavorite } from '../services/favoritesClient';
import { DEMO_SPOTS } from '../data/spots';
import type { SpotWithCams } from '../data/spots';

export function FavoritesPage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [spots, setSpots] = useState<SpotWithCams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    getFavorites(accessToken)
      .then((ids) => {
        const enriched = ids
          .map((id) => DEMO_SPOTS.find((s) => s.id === id))
          .filter((s): s is SpotWithCams => !!s);
        setSpots(enriched);
      })
      .catch(() => setError('Failed to load favourites'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  async function handleRemove(spotId: string) {
    if (!accessToken) return;
    setRemoving(spotId);
    try {
      await removeFavorite(accessToken, spotId);
      setSpots((prev) => prev.filter((s) => s.id !== spotId));
    } catch {
      setError('Failed to remove favourite');
    } finally {
      setRemoving(null);
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <h1 className="text-xl font-semibold text-white">Sign in to see your favourites</h1>
        <p className="mt-2 text-gray-400">Save surf spots and check conditions at a glance.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ocean-500 px-5 py-2.5 font-semibold text-white hover:bg-ocean-600"
        >
          <LogIn className="h-4 w-4" /> Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-ocean-200">
        <Heart className="h-6 w-6 text-red-500" /> Favourite Spots
      </h1>

      {loading && (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      )}

      {error && (
        <div className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {!loading && !error && spots.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900 p-12 text-center">
          <Heart className="mx-auto mb-4 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">No favourites yet. Browse spots and tap ♥ to save them.</p>
          <Link to="/" className="mt-4 inline-block text-ocean-400 hover:underline">Browse spots →</Link>
        </div>
      )}

      {!loading && spots.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {spots.map((spot) => (
            <div
              key={spot.id}
              className="group flex items-center justify-between rounded-xl border border-gray-700 bg-gray-900 p-4 hover:border-ocean-500 transition-colors"
            >
              <Link to={`/spot/${spot.id}`} className="flex items-start gap-3 flex-1 min-w-0">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-ocean-400" />
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{spot.name}</p>
                  <p className="text-sm text-gray-400">{spot.region}, {spot.country}</p>
                </div>
              </Link>
              <button
                onClick={() => handleRemove(spot.id)}
                disabled={removing === spot.id}
                className="ml-3 rounded-lg p-2 text-gray-600 hover:bg-red-900/30 hover:text-red-400 transition-colors disabled:opacity-40"
                title="Remove favourite"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
