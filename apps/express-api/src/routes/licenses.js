/**
 * License Routes
 * License validation and management
 */

import { Router } from 'express';
import { z } from 'zod';
import { LicenseService } from '../services/license.js';
import { ApiError } from '../middleware/errorHandler.js';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('license-routes');

// Validation schemas
const validateLicenseSchema = z.object({
  licenseKey: z.string().min(10),
  machineId: z.string().optional(),
});

const activateLicenseSchema = z.object({
  licenseKey: z.string().min(10),
  machineId: z.string(),
  machineName: z.string().optional(),
});

/**
 * POST /api/licenses/validate
 * Validate a license key
 */
router.post('/validate', async (req, res, next) => {
  try {
    const { licenseKey, machineId } = validateLicenseSchema.parse(req.body);

    logger.info({ licenseKey: licenseKey.slice(0, 8) + '...' }, 'Validating license');

    const result = await LicenseService.validate(licenseKey, machineId);

    if (!result.valid) {
      return res.status(200).json({
        success: true,
        data: {
          valid: false,
          reason: result.reason,
        },
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        tier: result.tier,
        features: result.features,
        expiresAt: result.expiresAt,
        maxMachines: result.maxMachines,
        activeMachines: result.activeMachines,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(err);
    }
    logger.error({ error: err.message }, 'License validation failed');
    next(err);
  }
});

/**
 * POST /api/licenses/activate
 * Activate a license on a machine
 */
router.post('/activate', async (req, res, next) => {
  try {
    const { licenseKey, machineId, machineName } = activateLicenseSchema.parse(req.body);

    logger.info(
      {
        licenseKey: licenseKey.slice(0, 8) + '...',
        machineId: machineId.slice(0, 8) + '...',
      },
      'Activating license'
    );

    const result = await LicenseService.activate(licenseKey, machineId, machineName);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ACTIVATION_FAILED',
          message: result.reason,
        },
      });
    }

    res.json({
      success: true,
      data: {
        activated: true,
        activationToken: result.activationToken,
        expiresAt: result.expiresAt,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(err);
    }
    logger.error({ error: err.message }, 'License activation failed');
    next(err);
  }
});

/**
 * POST /api/licenses/deactivate
 * Deactivate a license from a machine
 */
router.post('/deactivate', async (req, res, next) => {
  try {
    const { licenseKey, machineId } = validateLicenseSchema.parse(req.body);

    const result = await LicenseService.deactivate(licenseKey, machineId);

    res.json({
      success: true,
      data: {
        deactivated: result.success,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(err);
    }
    next(err);
  }
});

/**
 * GET /api/licenses/features/:tier
 * Get features for a license tier
 */
router.get('/features/:tier', (req, res) => {
  const { tier } = req.params;
  const features = LicenseService.getTierFeatures(tier);

  res.json({
    success: true,
    data: {
      tier,
      features,
    },
  });
});

export default router;
