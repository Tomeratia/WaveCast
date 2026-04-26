import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import type { ApiResponse } from '@wavecast/shared';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'AUTH_ERROR', message);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class CacheError extends AppError {
  constructor(message: string) {
    super(502, 'CACHE_ERROR', message);
    this.name = 'CacheError';
  }
}

export class ApiError extends AppError {
  constructor(message: string) {
    super(502, 'EXTERNAL_API_ERROR', message);
    this.name = 'ApiError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiResponse<never>>,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  logger.error('Unhandled error', { error: err.message, stack: err.stack });

  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
}
