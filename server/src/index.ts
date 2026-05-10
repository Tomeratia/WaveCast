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
