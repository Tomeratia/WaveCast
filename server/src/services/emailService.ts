import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

let transporter: nodemailer.Transporter | null = null;

function ensureInit(): boolean {
  if (transporter) return true;

  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    logger.warn('Gmail not configured — email features disabled');
    return false;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD,
    },
  });

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
      await transporter!.sendMail({
        from: `"WaveCast" <${env.GMAIL_USER}>`,
        to: params.to,
        subject: `WaveCast Alert: ${params.spotName} — Score ${params.score}/100`,
        html: buildAlertHtml(params),
      });
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
