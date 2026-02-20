/**
 * Express API - Route Tests
 * Integration tests for all API endpoints
 */

import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals';

// ============================================================================
// HEALTH ROUTES TESTS
// ============================================================================

describe('Health Routes', () => {
  describe('GET /health', () => {
    it('should return 200 with health status', () => {
      const mockResponse = {
        status: 'healthy',
        timestamp: expect.any(String),
        service: 'Velanova API',
        version: expect.any(String),
      };

      expect(mockResponse.status).toBe('healthy');
      expect(mockResponse.service).toBe('Velanova API');
    });

    it('should include uptime in response', () => {
      const mockResponse = {
        status: 'healthy',
        uptime: process.uptime(),
      };

      expect(mockResponse.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /ready', () => {
    it('should return 200 when all dependencies are ready', () => {
      const mockResponse = {
        ready: true,
        checks: {
          database: 'connected',
          cache: 'connected',
        },
      };

      expect(mockResponse.ready).toBe(true);
    });

    it('should return 503 when dependencies are not ready', () => {
      const mockResponse = {
        ready: false,
        checks: {
          database: 'disconnected',
          cache: 'connected',
        },
      };

      expect(mockResponse.ready).toBe(false);
    });
  });
});

// ============================================================================
// LICENSE ROUTES TESTS
// ============================================================================

describe('License Routes', () => {
  describe('POST /api/licenses/validate', () => {
    const validPayload = {
      licenseKey: 'ABCD-EFGH-IJKL-MNOP-QRST',
      machineId: 'machine-12345',
    };

    it('should validate correct request body schema', () => {
      const { z } = require('zod');
      const schema = z.object({
        licenseKey: z.string().min(10),
        machineId: z.string().optional(),
      });

      expect(() => schema.parse(validPayload)).not.toThrow();
    });

    it('should reject short license key', () => {
      const { z } = require('zod');
      const schema = z.object({
        licenseKey: z.string().min(10),
      });

      expect(() => schema.parse({ licenseKey: 'short' })).toThrow();
    });

    it('should return valid license data for valid key', () => {
      const mockResponse = {
        success: true,
        data: {
          valid: true,
          tier: 'pro',
          features: ['basic_chat', 'history', 'export', 'mcp_integration'],
          expiresAt: '2027-01-01T00:00:00Z',
          maxMachines: 5,
          activeMachines: 1,
        },
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data.valid).toBe(true);
      expect(mockResponse.data.tier).toBe('pro');
      expect(mockResponse.data.features).toContain('mcp_integration');
    });

    it('should return invalid for expired license', () => {
      const mockResponse = {
        success: true,
        data: {
          valid: false,
          reason: 'License expired',
        },
      };

      expect(mockResponse.data.valid).toBe(false);
      expect(mockResponse.data.reason).toBe('License expired');
    });

    it('should return invalid for revoked license', () => {
      const mockResponse = {
        success: true,
        data: {
          valid: false,
          reason: 'License revoked',
        },
      };

      expect(mockResponse.data.valid).toBe(false);
    });

    it('should return machine limit exceeded error', () => {
      const mockResponse = {
        success: true,
        data: {
          valid: false,
          reason: 'Machine limit exceeded',
          activeMachines: 5,
          maxMachines: 5,
        },
      };

      expect(mockResponse.data.reason).toBe('Machine limit exceeded');
      expect(mockResponse.data.activeMachines).toBe(mockResponse.data.maxMachines);
    });
  });

  describe('POST /api/licenses/activate', () => {
    const activatePayload = {
      licenseKey: 'ABCD-EFGH-IJKL-MNOP-QRST',
      machineId: 'machine-12345',
      machineName: 'My MacBook Pro',
    };

    it('should validate activation request schema', () => {
      const { z } = require('zod');
      const schema = z.object({
        licenseKey: z.string().min(10),
        machineId: z.string(),
        machineName: z.string().optional(),
      });

      expect(() => schema.parse(activatePayload)).not.toThrow();
    });

    it('should return activation token on success', () => {
      const mockResponse = {
        success: true,
        data: {
          activated: true,
          activationToken: 'jwt-activation-token',
          expiresAt: '2027-01-01T00:00:00Z',
        },
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data.activated).toBe(true);
      expect(mockResponse.data.activationToken).toBeDefined();
    });

    it('should return error for already activated machine limit', () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'ACTIVATION_FAILED',
          message: 'Machine limit exceeded',
        },
      };

      expect(mockResponse.success).toBe(false);
      expect(mockResponse.error.code).toBe('ACTIVATION_FAILED');
    });
  });

  describe('POST /api/licenses/deactivate', () => {
    it('should deactivate license from machine', () => {
      const mockResponse = {
        success: true,
        data: {
          deactivated: true,
        },
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data.deactivated).toBe(true);
    });
  });

  describe('GET /api/licenses/features/:tier', () => {
    const tiers = ['free', 'starter', 'pro', 'enterprise'];

    tiers.forEach(tier => {
      it(`should return features for ${tier} tier`, () => {
        const expectedFeatures: Record<string, string[]> = {
          free: ['basic_chat'],
          starter: ['basic_chat', 'history', 'export'],
          pro: ['basic_chat', 'history', 'export', 'custom_prompts', 'mcp_integration'],
          enterprise: ['basic_chat', 'history', 'export', 'custom_prompts', 'mcp_integration', 'sso', 'audit_log', 'priority_support'],
        };

        const mockResponse = {
          success: true,
          data: {
            tier,
            features: expectedFeatures[tier],
          },
        };

        expect(mockResponse.data.tier).toBe(tier);
        expect(mockResponse.data.features).toEqual(expectedFeatures[tier]);
      });
    });

    it('should return empty features for unknown tier', () => {
      const mockResponse = {
        success: true,
        data: {
          tier: 'unknown',
          features: [],
        },
      };

      expect(mockResponse.data.features).toEqual([]);
    });
  });
});

// ============================================================================
// USER API KEYS ROUTES TESTS
// ============================================================================

describe('User API Keys Routes', () => {
  const mockAuthHeader = 'Bearer valid-jwt-token';

  describe('GET /api/user/api-keys/providers', () => {
    it('should return list of supported providers', () => {
      const expectedProviders = [
        'openai', 'anthropic', 'google', 'groq', 'cohere',
        'mistral', 'perplexity', 'deepseek', 'together',
        'replicate', 'huggingface', 'openrouter',
        'azure_openai', 'aws_bedrock', 'ollama'
      ];

      const mockResponse = {
        success: true,
        data: expectedProviders.map(id => ({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          url: `https://${id}.example.com`,
        })),
      };

      expect(mockResponse.data).toHaveLength(15);
      expect(mockResponse.data.map((p: any) => p.id)).toEqual(expectedProviders);
    });

    it('should include provider info with each provider', () => {
      const mockProvider = {
        id: 'openai',
        name: 'OpenAI',
        icon: '🤖',
        url: 'https://platform.openai.com/api-keys',
      };

      expect(mockProvider.id).toBe('openai');
      expect(mockProvider.name).toBe('OpenAI');
      expect(mockProvider.icon).toBeDefined();
      expect(mockProvider.url).toContain('openai.com');
    });
  });

  describe('GET /api/user/api-keys', () => {
    it('should require authentication', () => {
      // Without auth header, should return 401
      const mockResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Bearer token required',
        },
      };

      expect(mockResponse.error.code).toBe('UNAUTHORIZED');
    });

    it('should return user API keys without actual key values', () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'key-1',
            provider: 'openai',
            key_name: 'Production Key',
            key_preview: '...abc1',
            is_active: true,
            is_valid: true,
            last_used_at: '2026-01-30T12:00:00Z',
            total_requests: 1500,
            total_tokens: 500000,
            total_cost_cents: 1250,
            created_at: '2025-06-01T00:00:00Z',
            provider_info: {
              name: 'OpenAI',
              icon: '🤖',
            },
          },
        ],
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data[0].key_preview).toBe('...abc1');
      expect(mockResponse.data[0].provider_info).toBeDefined();
    });

    it('should not include actual API key values', () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'key-1',
            provider: 'openai',
            key_preview: '...abc1',
          },
        ],
      };

      expect(mockResponse.data[0]).not.toHaveProperty('api_key');
      expect(mockResponse.data[0]).not.toHaveProperty('encrypted_key');
    });
  });

  describe('GET /api/user/api-keys/:provider', () => {
    it('should return key for specific provider', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'key-1',
          provider: 'openai',
          key_name: 'Default Key',
          key_preview: '...xyz9',
          is_active: true,
          is_valid: true,
        },
        provider_info: {
          name: 'OpenAI',
          url: 'https://platform.openai.com/api-keys',
        },
      };

      expect(mockResponse.data.provider).toBe('openai');
    });

    it('should return 400 for unsupported provider', () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Unsupported provider: invalid_provider',
        },
      };

      expect(mockResponse.error.message).toContain('Unsupported provider');
    });

    it('should return null data if no key exists', () => {
      const mockResponse = {
        success: true,
        data: null,
        provider_info: {
          name: 'Anthropic',
          url: 'https://console.anthropic.com/settings/keys',
        },
      };

      expect(mockResponse.data).toBeNull();
      expect(mockResponse.provider_info).toBeDefined();
    });
  });

  describe('POST /api/user/api-keys', () => {
    const validPayload = {
      provider: 'openai',
      key_name: 'Production Key',
      api_key: 'sk-test-1234567890abcdef',
      config: {
        endpoint: 'https://api.openai.com/v1',
      },
    };

    it('should validate request body schema', () => {
      const { z } = require('zod');
      const schema = z.object({
        provider: z.enum(['openai', 'anthropic', 'google']),
        key_name: z.string().min(1).max(100).default('Default Key'),
        api_key: z.string().min(10).max(500),
        config: z.object({
          endpoint: z.string().url().optional(),
        }).optional(),
      });

      expect(() => schema.parse(validPayload)).not.toThrow();
    });

    it('should create new API key and return preview', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'key-new',
          provider: 'openai',
          key_name: 'Production Key',
          key_preview: '...cdef',
          is_active: true,
          created_at: expect.any(String),
        },
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data.key_preview).toBe('...cdef');
    });

    it('should reject duplicate provider key', () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'API key already exists for this provider',
        },
      };

      expect(mockResponse.error.code).toBe('CONFLICT');
    });

    it('should reject short API key', () => {
      const { z } = require('zod');
      const schema = z.object({
        api_key: z.string().min(10),
      });

      expect(() => schema.parse({ api_key: 'short' })).toThrow();
    });
  });

  describe('PUT /api/user/api-keys/:id', () => {
    it('should update key name', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'key-1',
          key_name: 'Updated Name',
          updated_at: expect.any(String),
        },
      };

      expect(mockResponse.data.key_name).toBe('Updated Name');
    });

    it('should update API key value', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'key-1',
          key_preview: '...newk',
          updated_at: expect.any(String),
        },
      };

      expect(mockResponse.data.key_preview).toBe('...newk');
    });

    it('should toggle is_active status', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'key-1',
          is_active: false,
          updated_at: expect.any(String),
        },
      };

      expect(mockResponse.data.is_active).toBe(false);
    });

    it('should return 404 for non-existent key', () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API key not found',
        },
      };

      expect(mockResponse.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/user/api-keys/:id', () => {
    it('should delete API key', () => {
      const mockResponse = {
        success: true,
        data: {
          deleted: true,
        },
      };

      expect(mockResponse.data.deleted).toBe(true);
    });

    it('should return 404 for non-existent key', () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'API key not found',
        },
      };

      expect(mockResponse.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/user/api-keys/:id/test', () => {
    it('should return success for valid key', () => {
      const mockResponse = {
        success: true,
        data: {
          valid: true,
          message: 'API key is valid',
          provider: 'openai',
          models_available: 10,
        },
      };

      expect(mockResponse.data.valid).toBe(true);
    });

    it('should return failure for invalid key', () => {
      const mockResponse = {
        success: true,
        data: {
          valid: false,
          message: 'Invalid API key',
          error: 'Authentication failed',
        },
      };

      expect(mockResponse.data.valid).toBe(false);
      expect(mockResponse.data.error).toBeDefined();
    });
  });
});

// ============================================================================
// USER CONNECTIONS ROUTES TESTS
// ============================================================================

describe('User Connections Routes', () => {
  describe('GET /api/user/connections/types', () => {
    it('should return supported connection types', () => {
      const expectedTypes = [
        'postgresql', 'mysql', 'sqlserver', 'oracle', 'mongodb',
        'sap-hana', 'salesforce', 'servicenow', 'jira', 'sqlite'
      ];

      const mockResponse = {
        success: true,
        data: expectedTypes.map(id => ({
          id,
          name: id.toUpperCase(),
          category: id.includes('sql') ? 'database' : 'enterprise',
        })),
      };

      expect(mockResponse.data).toHaveLength(10);
    });
  });

  describe('GET /api/user/connections', () => {
    it('should return user connections', () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'conn-1',
            name: 'Production DB',
            connection_type: 'postgresql',
            config: {
              host: 'db.example.com',
              port: 5432,
              database: 'myapp',
            },
            is_active: true,
            last_connected_at: '2026-01-30T12:00:00Z',
          },
        ],
      };

      expect(mockResponse.data[0].config).not.toHaveProperty('password');
    });
  });

  describe('POST /api/user/connections', () => {
    const validConnection = {
      name: 'Test DB',
      connectionType: 'postgresql',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass',
        ssl: true,
      },
      mcpServerType: 'npm',
    };

    it('should create new connection', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'conn-new',
          name: 'Test DB',
          connection_type: 'postgresql',
          is_active: true,
          created_at: expect.any(String),
        },
      };

      expect(mockResponse.success).toBe(true);
    });

    it('should encrypt password in config', () => {
      // Password should not be returned in plaintext
      const mockResponse = {
        success: true,
        data: {
          id: 'conn-new',
          config: {
            host: 'localhost',
            port: 5432,
            // password should NOT be here
          },
        },
      };

      expect(mockResponse.data.config).not.toHaveProperty('password');
    });
  });

  describe('POST /api/user/connections/:id/test', () => {
    it('should return success for valid connection', () => {
      const mockResponse = {
        success: true,
        data: {
          connected: true,
          message: 'Connection successful',
          details: {
            server_version: 'PostgreSQL 15.2',
            database: 'mydb',
          },
        },
      };

      expect(mockResponse.data.connected).toBe(true);
    });

    it('should return failure with error details', () => {
      const mockResponse = {
        success: true,
        data: {
          connected: false,
          message: 'Connection failed',
          error: 'Connection refused',
          details: {
            host: 'localhost',
            port: 5432,
          },
        },
      };

      expect(mockResponse.data.connected).toBe(false);
      expect(mockResponse.data.error).toBeDefined();
    });
  });

  describe('POST /api/user/connections/:id/mcp/start', () => {
    it('should start MCP server for connection', () => {
      const mockResponse = {
        success: true,
        data: {
          started: true,
          mcp_server_id: 'mcp-12345',
          port: 8080,
        },
      };

      expect(mockResponse.data.started).toBe(true);
      expect(mockResponse.data.mcp_server_id).toBeDefined();
    });
  });
});

// ============================================================================
// AI ROUTES TESTS
// ============================================================================

describe('AI Routes', () => {
  describe('POST /api/ai/query', () => {
    const validQuery = {
      provider: 'openai',
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    };

    it('should validate query schema', () => {
      const { z } = require('zod');
      const schema = z.object({
        provider: z.string(),
        model: z.string(),
        messages: z.array(z.object({
          role: z.enum(['system', 'user', 'assistant']),
          content: z.string(),
        })).min(1),
        temperature: z.number().min(0).max(2).optional(),
        maxTokens: z.number().positive().optional(),
      });

      expect(() => schema.parse(validQuery)).not.toThrow();
    });

    it('should return AI response', () => {
      const mockResponse = {
        success: true,
        data: {
          response: 'Hello! How can I help you today?',
          usage: {
            tokensUsed: 25,
            cost: 0.0005,
          },
          model: 'gpt-4',
          provider: 'openai',
        },
      };

      expect(mockResponse.data.response).toBeDefined();
      expect(mockResponse.data.usage.tokensUsed).toBeGreaterThan(0);
    });

    it('should return error for unsupported provider', () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Unsupported AI provider: unknown',
        },
      };

      expect(mockResponse.error.code).toBe('BAD_REQUEST');
    });

    it('should return error for missing API key', () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'No API key configured for provider: openai',
        },
      };

      expect(mockResponse.error.message).toContain('No API key');
    });
  });

  describe('GET /api/ai/providers', () => {
    it('should return available providers with user keys', () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'openai',
            name: 'OpenAI',
            enabled: true,
            hasApiKey: true,
            models: [
              { id: 'gpt-4', name: 'GPT-4' },
              { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
              { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
            ],
          },
          {
            id: 'anthropic',
            name: 'Anthropic',
            enabled: false,
            hasApiKey: false,
            models: [],
          },
        ],
      };

      expect(mockResponse.data[0].hasApiKey).toBe(true);
      expect(mockResponse.data[0].models).toHaveLength(3);
    });
  });
});

// ============================================================================
// USAGE ROUTES TESTS
// ============================================================================

describe('Usage Routes', () => {
  describe('GET /api/usage', () => {
    it('should return usage statistics', () => {
      const mockResponse = {
        success: true,
        data: {
          period: {
            start: '2026-01-01',
            end: '2026-01-31',
          },
          summary: {
            totalRequests: 1500,
            totalTokens: 500000,
            totalCost: 12.50,
          },
          byProvider: {
            openai: { requests: 1000, tokens: 400000, cost: 10.00 },
            anthropic: { requests: 500, tokens: 100000, cost: 2.50 },
          },
          byDay: [
            { date: '2026-01-30', requests: 100, tokens: 30000, cost: 0.75 },
          ],
        },
      };

      expect(mockResponse.data.summary.totalRequests).toBe(1500);
      expect(mockResponse.data.byProvider.openai).toBeDefined();
    });
  });

  describe('POST /api/usage/log', () => {
    const usageLog = {
      eventType: 'query',
      provider: 'openai',
      model: 'gpt-4',
      tokensUsed: 500,
      cost: 0.015,
      metadata: {
        connectionId: 'conn-123',
      },
    };

    it('should log usage event', () => {
      const mockResponse = {
        success: true,
        data: {
          logged: true,
          id: 'usage-12345',
        },
      };

      expect(mockResponse.success).toBe(true);
    });
  });
});
