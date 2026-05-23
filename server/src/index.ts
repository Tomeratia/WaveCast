import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { verifyToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startCronJobs } from './jobs/index.js';
import { logger } from './lib/logger.js';

import authRoutes from './routes/auth.js';
import forecastRoutes from './routes/forecast.js';
import favoritesRoutes from './routes/favorites.js';
import alertsRoutes from './routes/alerts.js';
import agentRoutes from './routes/agent.js';

const app = express();

// Global middleware
app.use(cors({
  origin: [
    'https://wavecast-tomeratia.netlify.app',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Auth middleware — checks all routes, skips PUBLIC_ROUTES
app.use(verifyToken);

// Health check — used by keep-alive ping to prevent Render cold starts
app.get('/health', (_req, res) => { res.json({ ok: true }); });

// Temporary diagnostic endpoint
app.get('/health/diagnose', async (_req, res) => {
  const diagnostics: Record<string, unknown> = {
    hasResendKey: !!env.RESEND_API_KEY,
    resendKeyPrefix: env.RESEND_API_KEY?.slice(0, 8) ?? null,
  };

  try {
    const { alertRepo } = await import('./repositories/alertRepo.js');
    const alerts = await alertRepo.findAllActive();
    diagnostics['alertCount'] = alerts.length;
    diagnostics['alerts'] = alerts.map((a) => ({
      id: a.id,
      spotId: a.spotId,
      minScore: a.minScore,
      lastSentAt: a.lastSentAt,
      userEmail: a.user.email,
    }));
  } catch (err) {
    diagnostics['alertsError'] = err instanceof Error ? err.message : String(err);
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'tomeratia44@gmail.com',
      subject: 'WaveCast Diagnostic',
      html: '<p>Diagnostic test from /health/diagnose</p>',
    });
    diagnostics['resendResult'] = result;
  } catch (err) {
    diagnostics['resendException'] = err instanceof Error ? err.message : String(err);
  }

  res.json(diagnostics);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/agent', agentRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start
app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`, { env: env.NODE_ENV });
  startCronJobs();
});
