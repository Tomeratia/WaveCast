import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { verifyToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startCronJobs } from './jobs/index.js';
import { logger } from './lib/logger.js';

import { emailService } from './services/emailService.js';
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

// Temporary test endpoint — remove after verifying email works
app.get('/health/test-email', async (_req, res) => {
  const { env: envConfig } = await import('./config/env.js');
  const gmailUser = envConfig.GMAIL_USER;
  const hasPassword = !!envConfig.GMAIL_APP_PASSWORD;

  try {
    const sent = await emailService.sendSurfAlert({
      to: 'tomeratia44@gmail.com',
      spotName: 'Test Spot',
      score: 85,
      summary: 'Swell: 1.5m @ 12s | Wind: 15 km/h',
      unsubscribeUrl: 'http://localhost',
    });
    res.json({ sent, gmailUser, hasPassword });
  } catch (err) {
    res.json({ sent: false, gmailUser, hasPassword, error: err instanceof Error ? err.message : String(err) });
  }
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
