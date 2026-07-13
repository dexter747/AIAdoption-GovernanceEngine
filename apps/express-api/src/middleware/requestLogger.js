/**
 * Request Logger Middleware
 * Logs all incoming requests with timing
 */

import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

export function requestLogger(req, res, next) {
  // Assign request ID
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-ID', req.id);

  // Skip logging for health checks
  if (req.path === '/health' || req.path === '/health/ready') {
    return next();
  }

  const startTime = process.hrtime();

  // Log request
  logger.info({
    type: 'request',
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

    logger.info({
      type: 'response',
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: parseFloat(durationMs),
    });

    return originalSend.call(this, body);
  };

  next();
}
