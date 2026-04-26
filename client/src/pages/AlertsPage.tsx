import { Card } from '../components/ui/Card';
import { Bell, Lock } from 'lucide-react';

export function AlertsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-ocean-800 dark:text-ocean-200">
        <Bell className="h-6 w-6" />
        Surf Alerts
      </h1>
      <Card className="text-center">
        <Lock className="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Backend required
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Email alerts require the Express server with cron jobs and SendGrid.
          Deploy the backend to enable scheduled surf alerts.
        </p>
      </Card>
    </div>
  );
}
