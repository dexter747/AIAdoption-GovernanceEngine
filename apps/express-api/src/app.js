/**
 * Express App Configuration
 * Sets up middleware, routes, and error handling
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import { config } from './config/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { sanitizeRequest, apiSecurityHeaders, verifyCsrfOrigin } from './middleware/security.js';

// Routes
import healthRoutes from './routes/health.js';
import aiRoutes from './routes/ai.js';
import licenseRoutes from './routes/licenses.js';
import usageRoutes from './routes/usage.js';
import userApiKeysRoutes from './routes/user-api-keys.js';
import userConnectionsRoutes from './routes/user-connections.js';

export function createApp() {
  const app = express();

  // ==========================================================================
  // SECURITY MIDDLEWARE
  // ==========================================================================
  
  // API-specific security headers
  app.use(apiSecurityHeaders);
  
  // Helmet - Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS
  app.use(cors({
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-License-Key'],
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/ready';
    },
  });
  app.use(limiter);

  // ==========================================================================
  // PARSING MIDDLEWARE
  // ==========================================================================
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Sanitize all incoming requests
  app.use(sanitizeRequest);
  
  // CSRF origin verification for state-changing requests
  app.use(verifyCsrfOrigin(config.cors.origins));

  // ==========================================================================
  // LOGGING MIDDLEWARE
  // ==========================================================================
  
  app.use(requestLogger);

  // ==========================================================================
  // ROUTES
  // ==========================================================================
  
  // Health checks (no auth required)
  app.use('/', healthRoutes);

  // API routes
  app.use('/api/ai', aiRoutes);
  app.use('/api/licenses', licenseRoutes);
  app.use('/api/usage', usageRoutes);
  app.use('/api/user/api-keys', userApiKeysRoutes);
  app.use('/api/user/connections', userConnectionsRoutes);

  // Legacy compatibility routes
  app.get('/api/status', (req, res) => {
    res.json({
      service: 'Velanova API',
      version: config.version,
      status: 'running',
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================
  
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
