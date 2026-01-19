/**
 * Usage Routes
 * Track and report API usage
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateJwt, validateApiKey } from '../middleware/auth.js';
import { UsageService } from '../services/usage.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

// Validation schemas
const usageQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  provider: z.string().optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).optional().default('day'),
});

/**
 * GET /api/usage
 * Get usage statistics for the authenticated user
 */
router.get('/', validateJwt, async (req, res, next) => {
  try {
    const query = usageQuerySchema.parse(req.query);
    
    const usage = await UsageService.getUsage(req.user.id, query);
    
    res.json({
      success: true,
      data: usage,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(err);
    }
    next(err);
  }
});

/**
 * GET /api/usage/summary
 * Get usage summary for the authenticated user
 */
router.get('/summary', validateJwt, async (req, res, next) => {
  try {
    const summary = await UsageService.getSummary(req.user.id);
    
    res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/usage/limits
 * Get usage limits and remaining quota
 */
router.get('/limits', validateJwt, async (req, res, next) => {
  try {
    const limits = await UsageService.getLimits(req.user.id);
    
    res.json({
      success: true,
      data: limits,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/usage/cost
 * Get cost breakdown
 */
router.get('/cost', validateJwt, async (req, res, next) => {
  try {
    const query = usageQuerySchema.parse(req.query);
    const cost = await UsageService.getCostBreakdown(req.user.id, query);
    
    res.json({
      success: true,
      data: cost,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(err);
    }
    next(err);
  }
});

export default router;
