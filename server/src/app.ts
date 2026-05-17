import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { verifyToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import forecastRoutes from './routes/forecast.js';
import favoritesRoutes from './routes/favorites.js';
import alertsRoutes from './routes/alerts.js';
import agentRoutes from './routes/agent.js';

export const app = express();

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
app.use(verifyToken);

app.get('/health', (_req, res) => { res.json({ ok: true }); });

app.use('/api/auth', authRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/agent', agentRoutes);

app.use(errorHandler);
