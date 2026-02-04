import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { Prisma } from '@fintutto/database';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export async function errorHandler(err: Error, c: Context) {
  console.error('Error:', err);

  // AppError (eigene Fehler)
  if (err instanceof AppError) {
    return c.json({
      error: err.code,
      message: err.message,
      details: err.details,
    }, err.statusCode as any);
  }

  // Hono HTTPException
  if (err instanceof HTTPException) {
    return c.json({
      error: 'HTTP_ERROR',
      message: err.message,
    }, err.status);
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    return c.json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    }, 400);
  }

  // Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return c.json({
          error: 'CONFLICT',
          message: 'A record with this value already exists',
          details: { fields: err.meta?.target },
        }, 409);

      case 'P2025':
        return c.json({
          error: 'NOT_FOUND',
          message: 'Record not found',
        }, 404);

      case 'P2003':
        return c.json({
          error: 'FOREIGN_KEY_ERROR',
          message: 'Related record not found',
        }, 400);

      default:
        return c.json({
          error: 'DATABASE_ERROR',
          message: 'Database operation failed',
        }, 500);
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return c.json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid data format',
    }, 400);
  }

  // Generischer Fehler
  return c.json({
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  }, 500);
}
