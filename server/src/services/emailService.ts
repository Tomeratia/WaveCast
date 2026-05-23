import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

function isConfigured(): boolean {
  if (!env.BREVO_API_KEY || !env.BREVO_FROM_EMAIL) {
    logger.warn('Brevo not configured — email features disabled');
    return false;
  }
  return true;
}

export const emailService = {
  async sendSurfAlert(params: {
    to: string;
    spotName: string;
    score: number;
    summary: string;
    unsubscribeUrl: string;
  }): Promise<boolean> {
    if (!isConfigured()) return false;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': env.BREVO_API_KEY!,
          'content-type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'WaveCast', email: env.BREVO_FROM_EMAIL },
          to: [{ email: params.to }],
          subject: `WaveCast Alert: ${params.spotName} — Score ${params.score}/100`,
          htmlContent: buildAlertHtml(params),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Failed to send alert email', { status: response.status, body: errorText });
        return false;
      }

      logger.info('Alert email sent', { to: params.to, spot: params.spotName });
      return true;
    } catch (err) {
      logger.error('Failed to send alert email', {
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  },
};

function buildAlertHtml(params: {
  spotName: string;
  score: number;
  summary: string;
  unsubscribeUrl: string;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>WaveCast Surf Alert</h1>
      <h2>${params.spotName} — Score: ${params.score}/100</h2>
      <p>${params.summary}</p>
      <p><a href="${params.unsubscribeUrl}">Unsubscribe from this alert</a></p>
      <hr />
      <p style="color: #666; font-size: 12px;">
        WaveCast — Free, open-source surf forecasting
      </p>
    </div>
  `;
}
