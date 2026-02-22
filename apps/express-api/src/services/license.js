/**
 * License Service
 * Handles license validation, activation, and management
 */

import jwt from 'jsonwebtoken';
import { supabase, config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('license-service');

// License tiers and their features
const TIER_FEATURES = {
  free: {
    maxTokensPerDay: 10000,
    maxMachines: 1,
    providers: ['groq'],
    features: ['basic_chat'],
  },
  starter: {
    maxTokensPerDay: 100000,
    maxMachines: 2,
    providers: ['openai', 'anthropic', 'google', 'groq'],
    features: ['basic_chat', 'history', 'export'],
  },
  pro: {
    maxTokensPerDay: 500000,
    maxMachines: 5,
    providers: ['openai', 'anthropic', 'google', 'groq', 'cohere', 'mistral'],
    features: ['basic_chat', 'history', 'export', 'custom_prompts', 'mcp_integration'],
  },
  enterprise: {
    maxTokensPerDay: -1, // Unlimited
    maxMachines: -1, // Unlimited
    providers: ['openai', 'anthropic', 'google', 'groq', 'cohere', 'mistral'],
    features: [
      'basic_chat',
      'history',
      'export',
      'custom_prompts',
      'mcp_integration',
      'sso',
      'audit_log',
      'priority_support',
    ],
  },
};

export const LicenseService = {
  /**
   * Validate a license key
   */
  async validate(licenseKey, machineId = null) {
    try {
      // First, try to decode as JWT
      const decoded = this.decodeLicense(licenseKey);

      if (!decoded) {
        return { valid: false, reason: 'Invalid license format' };
      }

      // Check expiration
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return { valid: false, reason: 'License expired' };
      }

      // If we have database, check against it
      if (supabase) {
        const { data: license, error } = await supabase
          .from('licenses')
          .select('*')
          .eq('key_hash', this.hashLicense(licenseKey))
          .single();

        if (error || !license) {
          return { valid: false, reason: 'License not found' };
        }

        if (!license.is_active) {
          return { valid: false, reason: 'License revoked' };
        }

        // Check machine limit
        if (machineId && license.max_machines > 0) {
          const { data: activations } = await supabase
            .from('license_activations')
            .select('machine_id')
            .eq('license_id', license.id)
            .eq('is_active', true);

          const activeMachines = activations?.map(a => a.machine_id) || [];

          if (
            !activeMachines.includes(machineId) &&
            activeMachines.length >= license.max_machines
          ) {
            return {
              valid: false,
              reason: 'Machine limit exceeded',
              activeMachines: activeMachines.length,
              maxMachines: license.max_machines,
            };
          }
        }

        return {
          valid: true,
          tier: license.tier,
          features: TIER_FEATURES[license.tier]?.features || [],
          expiresAt: license.expires_at,
          maxMachines: license.max_machines,
          activeMachines: machineId ? 1 : 0, // Simplified for now
        };
      }

      // No database - use JWT data directly (development mode)
      return {
        valid: true,
        tier: decoded.tier || 'pro',
        features: TIER_FEATURES[decoded.tier || 'pro']?.features || [],
        expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
        maxMachines: TIER_FEATURES[decoded.tier || 'pro']?.maxMachines || 1,
        activeMachines: 0,
      };
    } catch (err) {
      logger.error({ error: err.message }, 'License validation error');
      return { valid: false, reason: 'Validation error' };
    }
  },

  /**
   * Activate a license on a machine
   */
  async activate(licenseKey, machineId, machineName = null) {
    // First validate
    const validation = await this.validate(licenseKey, machineId);

    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    if (!supabase) {
      // Development mode - just return success
      return {
        success: true,
        activationToken: this.generateActivationToken(licenseKey, machineId, validation.tier),
        expiresAt: validation.expiresAt,
      };
    }

    try {
      // Get license ID
      const { data: license } = await supabase
        .from('licenses')
        .select('id')
        .eq('key_hash', this.hashLicense(licenseKey))
        .single();

      if (!license) {
        return { success: false, reason: 'License not found' };
      }

      // Upsert activation
      const { error } = await supabase.from('license_activations').upsert(
        {
          license_id: license.id,
          machine_id: machineId,
          machine_name: machineName,
          is_active: true,
          last_seen: new Date().toISOString(),
        },
        {
          onConflict: 'license_id,machine_id',
        }
      );

      if (error) {
        logger.error({ error: error.message }, 'Failed to create activation');
        return { success: false, reason: 'Activation failed' };
      }

      return {
        success: true,
        activationToken: this.generateActivationToken(licenseKey, machineId, validation.tier),
        expiresAt: validation.expiresAt,
      };
    } catch (err) {
      logger.error({ error: err.message }, 'Activation error');
      return { success: false, reason: 'Activation error' };
    }
  },

  /**
   * Deactivate a license from a machine
   */
  async deactivate(licenseKey, machineId) {
    if (!supabase) {
      return { success: true };
    }

    try {
      const { data: license } = await supabase
        .from('licenses')
        .select('id')
        .eq('key_hash', this.hashLicense(licenseKey))
        .single();

      if (!license) {
        return { success: false, reason: 'License not found' };
      }

      await supabase
        .from('license_activations')
        .update({ is_active: false })
        .eq('license_id', license.id)
        .eq('machine_id', machineId);

      return { success: true };
    } catch (err) {
      logger.error({ error: err.message }, 'Deactivation error');
      return { success: false, reason: 'Deactivation error' };
    }
  },

  /**
   * Get features for a tier
   */
  getTierFeatures(tier) {
    return TIER_FEATURES[tier] || TIER_FEATURES.free;
  },

  /**
   * Decode license JWT
   */
  decodeLicense(licenseKey) {
    try {
      return jwt.verify(licenseKey, config.license.jwtSecret);
    } catch {
      try {
        // Try to decode without verification (for checking format)
        return jwt.decode(licenseKey);
      } catch {
        return null;
      }
    }
  },

  /**
   * Generate activation token
   */
  generateActivationToken(licenseKey, machineId, tier) {
    return jwt.sign(
      {
        machineId,
        tier,
        iat: Math.floor(Date.now() / 1000),
      },
      config.license.jwtSecret,
      { expiresIn: '30d' }
    );
  },

  /**
   * Hash license key for storage
   */
  hashLicense(licenseKey) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(licenseKey).digest('hex');
  },

  /**
   * Generate a new license key
   */
  generateLicense(userId, tier, expiresInDays = 365) {
    const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;

    return jwt.sign(
      {
        userId,
        tier,
        exp,
        iat: Math.floor(Date.now() / 1000),
      },
      config.license.jwtSecret
    );
  },
};
