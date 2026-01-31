/**
 * Input Validation Middleware
 * Uses Zod schemas for validating request bodies, params, and queries
 */

import { z } from 'zod';
import { ApiError } from './errorHandler.js';

/**
 * Validate request body against a Zod schema
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        next(ApiError.badRequest('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request query parameters against a Zod schema
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        next(ApiError.badRequest('Invalid query parameters', details));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request params against a Zod schema
 */
export function validateParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        next(ApiError.badRequest('Invalid URL parameters', details));
      } else {
        next(error);
      }
    }
  };
}

// ============================================================================
// Common Validation Schemas
// ============================================================================

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().optional().transform(v => parseInt(v || '1', 10)).pipe(z.number().min(1)),
  limit: z.string().optional().transform(v => parseInt(v || '20', 10)).pipe(z.number().min(1).max(100)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// License key schema
export const licenseKeySchema = z.object({
  licenseKey: z.string().min(8, 'License key must be at least 8 characters').max(256),
  deviceId: z.string().min(1, 'Device ID is required').max(256),
  deviceInfo: z.object({
    platform: z.string().optional(),
    arch: z.string().optional(),
    hostname: z.string().optional(),
  }).optional(),
});

// AI Query schema
export const aiQuerySchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  model: z.string().min(1, 'Model is required'),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().min(1),
  })).min(1, 'At least one message is required'),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(128000).optional(),
  connectionId: z.string().optional(),
  tools: z.array(z.any()).optional(),
});

// User API Key schema
export const userApiKeySchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  apiKey: z.string().min(8, 'API key must be at least 8 characters'),
  keyName: z.string().max(100).optional(),
  config: z.object({
    orgId: z.string().optional(),
    baseUrl: z.string().url().optional(),
    version: z.string().optional(),
  }).optional(),
});

// User Connection schema
export const userConnectionSchema = z.object({
  name: z.string().min(1, 'Connection name is required').max(100),
  connectionType: z.enum([
    'postgresql', 'mysql', 'sqlserver', 'oracle', 'mongodb',
    'sap-hana', 'salesforce', 'servicenow', 'jira', 'sqlite'
  ]),
  config: z.object({
    host: z.string().optional(),
    port: z.number().optional(),
    database: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    ssl: z.boolean().optional(),
    // Salesforce specific
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    instanceUrl: z.string().optional(),
    refreshToken: z.string().optional(),
    // ServiceNow/Jira specific
    baseUrl: z.string().optional(),
    apiToken: z.string().optional(),
  }),
  mcpServerType: z.enum(['docker', 'npm', 'custom']).optional().default('npm'),
});

// Usage log schema
export const usageLogSchema = z.object({
  eventType: z.enum(['query', 'tool_call', 'connection', 'export']),
  provider: z.string().optional(),
  model: z.string().optional(),
  tokensUsed: z.number().min(0).optional().default(0),
  cost: z.number().min(0).optional().default(0),
  metadata: z.record(z.any()).optional(),
});
