/**
 * Seed Demo Data Route
 * POST /api/seed-demo  — seeds comprehensive demo data for the authenticated user
 * DELETE /api/seed-demo — clears all demo data for the authenticated user
 */

import { Router } from 'express';
import { validateJwt } from '../middleware/auth.js';
import { seedDemoData } from '../services/seed-demo-data.js';
import { supabase } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('seed-demo-routes');

/**
 * POST /api/seed-demo
 * Seeds demo data for the authenticated user
 */
router.post('/', validateJwt, async (req, res) => {
  try {
    const userId = req.user.id || req.user.sub;
    logger.info(`Seeding demo data for user ${userId}`);

    const result = await seedDemoData(userId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Demo data seeded successfully',
        data: result.results,
      });
    } else {
      res.status(207).json({
        success: false,
        message: 'Demo data partially seeded — some tables had errors',
        data: result.results,
        errors: result.errors,
      });
    }
  } catch (error) {
    logger.error('Seed demo data error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to seed demo data',
    });
  }
});

/**
 * DELETE /api/seed-demo
 * Clears all demo data for the authenticated user
 */
router.delete('/', validateJwt, async (req, res) => {
  try {
    const userId = req.user.id || req.user.sub;
    logger.info(`Clearing demo data for user ${userId}`);

    const tablesToClear = [
      'project_insights', 'project_risks', 'project_tasks',
      'resource_allocations',
      'compliance_assessments', 'regulatory_changes', 'regulatory_sources',
      'contract_clauses', 'procurement_reviews',
      'kyc_checks', 'kyc_documents', 'onboarding_workflows',
      'fraud_investigations', 'fraud_alerts', 'fraud_patterns', 'transactions',
      'projects', 'resources', 'contracts', 'clients',
    ];

    const results = {};
    for (const table of tablesToClear) {
      const { error } = await supabase.from(table).delete().eq('user_id', userId);
      results[table] = error ? `error: ${error.message}` : 'cleared';
    }

    res.json({ success: true, message: 'Demo data cleared', data: results });
  } catch (error) {
    logger.error('Clear demo data error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
