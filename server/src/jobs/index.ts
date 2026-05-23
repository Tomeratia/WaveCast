import cron from 'node-cron';
import { runAlertChecker } from './alertChecker.js';
import { runCacheCleanup } from './cacheCleanup.js';
import { logger } from '../lib/logger.js';

export function startCronJobs(): void {
  // Check surf conditions every 30 minutes (5:00–20:00)
  cron.schedule('*/30 5-20 * * *', () => {
    runAlertChecker().catch((err) =>
      logger.error('Alert checker cron failed', { error: String(err) }),
    );
  });

  // Clean stale cache every 6 hours
  cron.schedule('0 */6 * * *', () => {
    runCacheCleanup().catch((err) =>
      logger.error('Cache cleanup cron failed', { error: String(err) }),
    );
  });

  logger.info('Cron jobs registered');
}
