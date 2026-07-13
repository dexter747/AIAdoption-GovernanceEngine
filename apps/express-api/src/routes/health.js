/**
 * Health Check Routes
 * Provides liveness and readiness endpoints
 */

import { Router } from 'express';
import { supabase, config, getEnabledProviders } from '../config/index.js';

const router = Router();

/**
 * GET /health
 * Basic liveness check
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: config.version,
    environment: config.env,
  });
});

/**
 * GET /health/ready
 * Readiness check - verifies all dependencies
 */
router.get('/ready', async (req, res) => {
  const checks = {
    api: { status: 'ok' },
    database: { status: 'unknown' },
    aiProviders: { status: 'unknown', enabled: [] },
  };

  // Check database
  if (supabase) {
    try {
      const { error } = await supabase.from('_health_check').select('*').limit(1);
      // Table might not exist, but connection worked if no network error
      if (error && error.message.includes('does not exist')) {
        checks.database.status = 'ok';
        checks.database.note = 'Connected (tables not initialized)';
      } else if (error) {
        checks.database.status = 'error';
        checks.database.error = error.message;
      } else {
        checks.database.status = 'ok';
      }
    } catch (err) {
      checks.database.status = 'error';
      checks.database.error = err.message;
    }
  } else {
    checks.database.status = 'not_configured';
  }

  // Check AI providers
  const enabledProviders = getEnabledProviders();
  checks.aiProviders.enabled = enabledProviders;
  checks.aiProviders.status = enabledProviders.length > 0 ? 'ok' : 'no_providers';
  checks.aiProviders.count = enabledProviders.length;

  // Overall status
  const isReady =
    checks.api.status === 'ok' &&
    (checks.database.status === 'ok' || checks.database.status === 'not_configured') &&
    checks.aiProviders.status === 'ok';

  res.status(isReady ? 200 : 503).json({
    ready: isReady,
    timestamp: new Date().toISOString(),
    checks,
  });
});

/**
 * GET /health/metrics
 * Basic metrics endpoint
 */
router.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage();

  res.json({
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
    },
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
