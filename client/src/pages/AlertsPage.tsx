import { Bell, Construction } from 'lucide-react';

export function AlertsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 flex items-center gap-2 text-2xl font-bold text-ocean-800 dark:text-ocean-200">
        <Bell className="h-6 w-6 text-ocean-500" />
        Surf Alerts
      </h1>
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center">
        <Construction className="mx-auto mb-4 h-12 w-12 text-amber-400" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Coming Soon</h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Get an email when your spot reaches your target conditions.
          Set a minimum score, choose a time of day, and WaveCast will notify you automatically.
          This feature is coming in the next release.
        </p>
      </div>
    </div>
  );
}
