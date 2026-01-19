/**
 * Error Handler Middleware
 * Centralized error handling with proper status codes
 */

import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

// Custom API Error class
export class ApiError extends Error {
  constructor(statusCode, message, code = 'ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details = null) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Not Found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static tooManyRequests(message = 'Too Many Requests') {
    return new ApiError(429, message, 'RATE_LIMIT_EXCEEDED');
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }

  static serviceUnavailable(message = 'Service Unavailable') {
    return new ApiError(503, message, 'SERVICE_UNAVAILABLE');
  }
}

// 404 Handler
export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.path} not found`));
}

// Main Error Handler
export function errorHandler(err, req, res, next) {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';
  let details = err.details || null;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }

  // Log error
  if (statusCode >= 500) {
    logger.error({
      type: 'error',
      requestId: req.id,
      statusCode,
      code,
      message,
      stack: err.stack,
    });
  } else {
    logger.warn({
      type: 'error',
      requestId: req.id,
      statusCode,
      code,
      message,
    });
  }

  // Send response
  const response = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(config.env === 'development' && statusCode >= 500 && { stack: err.stack }),
    },
    requestId: req.id,
  };

  res.status(statusCode).json(response);
}
