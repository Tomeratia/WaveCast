import { cacheRepo } from '../repositories/cacheRepo.js';
import { logger } from '../lib/logger.js';

export async function runCacheCleanup(): Promise<void> {
  logger.info('Cache cleanup started');
  const deleted = await cacheRepo.purgeStale();
  logger.info('Cache cleanup completed', { deletedRows: deleted });
}
