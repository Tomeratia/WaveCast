import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthError } from './errorHandler.js';
import type { TokenPayload } from '@wavecast/shared';

/** Routes that do NOT require authentication */
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
];

/** Extends Express Request with authenticated user data */
export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

export function verifyToken(req: Request, _res: Response, next: NextFunction): void {
  if (PUBLIC_ROUTES.includes(req.path)) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    throw new AuthError('Invalid or expired token');
  }
}
