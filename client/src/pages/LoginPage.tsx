import { Card } from '../components/ui/Card';
import { Lock } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card className="text-center">
        <Lock className="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Authentication unavailable
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Login requires the Express backend with JWT. Deploy the server to
          enable user accounts.
        </p>
      </Card>
    </div>
  );
}
