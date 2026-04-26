import { alertRepo } from '../repositories/alertRepo.js';
import { cacheService } from '../services/cacheService.js';
import { scoringService } from '../services/scoringService.js';
import { emailService } from '../services/emailService.js';
import { spotRepo } from '../repositories/spotRepo.js';
import { logger } from '../lib/logger.js';

function isSentToday(lastSentAt: Date | null): boolean {
  if (!lastSentAt) return false;
  const today = new Date();
  return (
    lastSentAt.getFullYear() === today.getFullYear() &&
    lastSentAt.getMonth() === today.getMonth() &&
    lastSentAt.getDate() === today.getDate()
  );
}

export async function runAlertChecker(): Promise<void> {
  logger.info('Alert checker started');

  const alerts = await alertRepo.findAllActive();

  for (const alert of alerts) {
    if (isSentToday(alert.lastSentAt)) continue;

    const spot = await spotRepo.findById(alert.spotId);
    if (!spot) continue;

    try {
      const forecasts = await cacheService.getCachedOrFetch(alert.spotId, spot.lat, spot.lng);
      const current = forecasts[0];
      if (!current) continue;

      const score = scoringService.calculateScore(current, null);

      if (score.overall >= alert.minScore) {
        const sent = await emailService.sendSurfAlert({
          to: alert.user.email,
          spotName: spot.name,
          score: score.overall,
          summary: `Swell: ${current.swellHeight}m @ ${current.swellPeriod}s | Wind: ${current.windSpeed} km/h`,
          unsubscribeUrl: `/api/alerts/${alert.id}`, // TODO: sign this URL
        });

        if (sent) {
          await alertRepo.markSent(alert.id);
        }
      }
    } catch (err) {
      logger.error('Alert check failed for alert', {
        alertId: alert.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info('Alert checker completed');
}
