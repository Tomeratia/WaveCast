import { Waves } from 'lucide-react';
import { SpotMap } from '../components/map/SpotMap';
import { SpotCard } from '../components/ui/SpotCard';
import { DEMO_SPOTS } from '../data/spots';

export function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="flex items-center justify-center gap-3 text-4xl font-bold text-ocean-800 dark:text-ocean-200">
          <Waves className="h-10 w-10" />
          WaveCast
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Free, open-source surf forecasting · Powered by Open-Meteo
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
          Surf Spots
        </h2>
        <SpotMap spots={DEMO_SPOTS} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
          Current Conditions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_SPOTS.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      </section>
    </div>
  );
}
