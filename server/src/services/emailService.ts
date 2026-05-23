import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

let resend: Resend | null = null;

function ensureInit(): boolean {
  if (resend) return true;

  if (!env.RESEND_API_KEY) {
    logger.error('RESEND_API_KEY is missing — email features disabled');
    return false;
  }
  logger.info('Resend initialized with key', { keyPrefix: env.RESEND_API_KEY.slice(0, 8) });

  resend = new Resend(env.RESEND_API_KEY);
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
    if (!ensureInit()) return false;

    try {
      const { error } = await resend!.emails.send({
        from: 'onboarding@resend.dev',
        to: params.to,
        subject: `WaveCast Alert: ${params.spotName} — Score ${params.score}/100`,
        html: buildAlertHtml(params),
      });

      if (error) {
        logger.error('Failed to send alert email', { error: error.message, name: error.name, full: JSON.stringify(error) });
        return false;
      }

      logger.info('Alert email sent', { to: params.to, spot: params.spotName });
      logger.info('Resend success');
      return true;
    } catch (err) {
      logger.error('Failed to send alert email EXCEPTION', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
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
