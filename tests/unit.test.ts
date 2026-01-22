import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Unit Tests for MCP Servers
 * Tests each MCP server's compilation and basic functionality
 */

describe('MCP Servers - Unit Tests', () => {
  const mcpServers = [
    'mysql',
    'mongodb',
    'sqlserver',
    'oracle',
    'sap-hana',
    'salesforce',
    'servicenow',
    'jira',
    'redis',
    'elasticsearch',
    'zendesk',
    'workday',
    'mariadb',
  ];

  describe('Compilation Tests', () => {
    mcpServers.forEach((server) => {
      it(`should compile ${server} MCP server without errors`, async () => {
        const { stdout, stderr } = await execAsync(
          `cd packages/mcp-servers/${server} && pnpm run build`
        );
        
        expect(stderr).not.toContain('error TS');
        expect(stdout).toContain('tsc');
      }, 30000);
    });
  });

  describe('Package Structure Tests', () => {
    mcpServers.forEach((server) => {
      it(`should have valid package.json for ${server}`, async () => {
        const { stdout } = await execAsync(
          `cat packages/mcp-servers/${server}/package.json`
        );
        
        const packageJson = JSON.parse(stdout);
        expect(packageJson.name).toContain('mcp-server');
        expect(packageJson.type).toBe('module');
        expect(packageJson.main).toBe('dist/index.js');
        expect(packageJson.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
      });

      it(`should have compiled output for ${server}`, async () => {
        const { stdout } = await execAsync(
          `ls -la packages/mcp-servers/${server}/dist/index.js`
        );
        
        expect(stdout).toContain('index.js');
      });
    });
  });

  describe('TypeScript Configuration Tests', () => {
    mcpServers.forEach((server) => {
      it(`should have valid tsconfig.json for ${server}`, async () => {
        const { stdout } = await execAsync(
          `cat packages/mcp-servers/${server}/tsconfig.json`
        );
        
        const tsconfig = JSON.parse(stdout);
        expect(tsconfig.compilerOptions).toHaveProperty('outDir');
        expect(tsconfig.compilerOptions).toHaveProperty('rootDir');
      });
    });
  });

  describe('Source Code Tests', () => {
    mcpServers.forEach((server) => {
      it(`should have index.ts source file for ${server}`, async () => {
        const { stdout } = await execAsync(
          `wc -l packages/mcp-servers/${server}/src/index.ts`
        );
        
        const lineCount = parseInt(stdout.trim().split(' ')[0]);
        expect(lineCount).toBeGreaterThan(40); // Each server should have meaningful code
      });

      it(`should export Server instance in ${server}`, async () => {
        const { stdout } = await execAsync(
          `grep -c "new Server" packages/mcp-servers/${server}/src/index.ts`
        );
        
        expect(parseInt(stdout.trim())).toBeGreaterThan(0);
      });

      it(`should implement ListToolsRequestSchema in ${server}`, async () => {
        const { stdout } = await execAsync(
          `grep -c "ListToolsRequestSchema" packages/mcp-servers/${server}/src/index.ts`
        );
        
        expect(parseInt(stdout.trim())).toBeGreaterThan(0);
      });

      it(`should implement CallToolRequestSchema in ${server}`, async () => {
        const { stdout } = await execAsync(
          `grep -c "CallToolRequestSchema" packages/mcp-servers/${server}/src/index.ts`
        );
        
        expect(parseInt(stdout.trim())).toBeGreaterThan(0);
      });
    });
  });

  describe('Tool Definition Tests', () => {
    mcpServers.forEach((server) => {
      it(`should define at least 3 tools in ${server}`, async () => {
        const { stdout } = await execAsync(
          `grep -c "name:" packages/mcp-servers/${server}/src/index.ts || echo 0`
        );
        
        const toolCount = parseInt(stdout.trim());
        expect(toolCount).toBeGreaterThanOrEqual(3);
      });
    });
  });
});

describe('LLM Providers - Unit Tests', () => {
  const providers = [
    'openai',
    'anthropic',
    'google',
    'groq',
    'cohere',
    'mistral',
    'perplexity',
    'deepseek',
    'openrouter',
  ];

  describe('Provider Implementation Tests', () => {
    providers.forEach((provider) => {
      it(`should have ${provider} provider implementation`, async () => {
        try {
          const { stdout } = await execAsync(
            `ls -la apps/express-api/src/services/ai/providers/${provider}.js`
          );
          expect(stdout).toContain(`${provider}.js`);
        } catch (error) {
          fail(`Provider ${provider} not found`);
        }
      });

      it(`should export ${provider} class`, async () => {
        const { stdout } = await execAsync(
          `grep -c "export class.*Provider" apps/express-api/src/services/ai/providers/${provider}.js`
        );
        
        expect(parseInt(stdout.trim())).toBeGreaterThan(0);
      });

      it(`should implement chat method in ${provider}`, async () => {
        const { stdout } = await execAsync(
          `grep -c "async chat" apps/express-api/src/services/ai/providers/${provider}.js`
        );
        
        expect(parseInt(stdout.trim())).toBeGreaterThan(0);
      });

      it(`should implement chatStream method in ${provider}`, async () => {
        const { stdout } = await execAsync(
          `grep -c "chatStream" apps/express-api/src/services/ai/providers/${provider}.js`
        );
        
        expect(parseInt(stdout.trim())).toBeGreaterThan(0);
      });
    });
  });

  describe('Provider Registry Tests', () => {
    it('should have all providers registered in MODEL_PROVIDER_MAP', async () => {
      const { stdout } = await execAsync(
        'grep -A 100 "MODEL_PROVIDER_MAP" apps/express-api/src/services/ai/index.js'
      );
      
      providers.forEach((provider) => {
        expect(stdout).toContain(`'${provider}'`);
      });
    });

    it('should have default models for each provider', async () => {
      const { stdout } = await execAsync(
        'grep -A 20 "DEFAULT_MODELS" apps/express-api/src/services/ai/index.js'
      );
      
      providers.forEach((provider) => {
        expect(stdout).toContain(`${provider}:`);
      });
    });
  });
});

describe('Payment Integration - Unit Tests', () => {
  describe('Dodo Payments Client', () => {
    it('should have DodoPaymentsClient class', async () => {
      const { stdout } = await execAsync(
        'grep -c "export class DodoPaymentsClient" apps/cloud-backend/src/lib/payments/dodo.ts'
      );
      
      expect(parseInt(stdout.trim())).toBeGreaterThan(0);
    });

    it('should implement createCheckoutSession method', async () => {
      const { stdout } = await execAsync(
        'grep -c "createCheckoutSession" apps/cloud-backend/src/lib/payments/dodo.ts'
      );
      
      expect(parseInt(stdout.trim())).toBeGreaterThan(0);
    });

    it('should implement webhook verification', async () => {
      const { stdout } = await execAsync(
        'grep -c "verifyWebhookSignature" apps/cloud-backend/src/lib/payments/dodo.ts'
      );
      
      expect(parseInt(stdout.trim())).toBeGreaterThan(0);
    });

    it('should implement subscription management', async () => {
      const { stdout } = await execAsync(
        'grep -c "getSubscription\\|cancelSubscription\\|updateSubscription" apps/cloud-backend/src/lib/payments/dodo.ts'
      );
      
      expect(parseInt(stdout.trim())).toBeGreaterThan(0);
    });
  });

  describe('Payment API Endpoints', () => {
    it('should have checkout endpoint', async () => {
      const { stdout } = await execAsync(
        'ls -la apps/cloud-backend/src/app/api/payments/create-checkout/route.ts'
      );
      
      expect(stdout).toContain('route.ts');
    });

    it('should have webhook endpoint', async () => {
      const { stdout } = await execAsync(
        'ls -la apps/cloud-backend/src/app/api/webhooks/dodo/route.ts'
      );
      
      expect(stdout).toContain('route.ts');
    });

    it('should have subscription management endpoint', async () => {
      const { stdout } = await execAsync(
        'ls -la apps/cloud-backend/src/app/api/subscription/route.ts'
      );
      
      expect(stdout).toContain('route.ts');
    });
  });

  describe('Database Schema', () => {
    it('should have payment tables defined', async () => {
      const { stdout } = await execAsync(
        'grep -c "CREATE TABLE.*payment_sessions\\|subscriptions\\|payments" database/schema-v4-payments.sql'
      );
      
      expect(parseInt(stdout.trim())).toBe(3);
    });

    it('should only allow dodo as payment provider', async () => {
      const { stdout } = await execAsync(
        'grep -c "provider = .dodo." database/schema-v4-payments.sql'
      );
      
      expect(parseInt(stdout.trim())).toBeGreaterThan(0);
    });

    it('should have RLS policies for payment tables', async () => {
      const { stdout } = await execAsync(
        'grep -c "ROW LEVEL SECURITY" database/schema-v4-payments.sql'
      );
      
      expect(parseInt(stdout.trim())).toBeGreaterThan(0);
    });
  });
});

describe('Environment Configuration - Unit Tests', () => {
  it('should not have PayPal env variables', async () => {
    const { stdout } = await execAsync(
      'grep -c "PAYPAL" apps/cloud-backend/.env.example || echo 0'
    );
    
    expect(parseInt(stdout.trim())).toBe(0);
  });

  it('should not have Razorpay env variables', async () => {
    const { stdout } = await execAsync(
      'grep -c "RAZORPAY" apps/cloud-backend/.env.example || echo 0'
    );
    
    expect(parseInt(stdout.trim())).toBe(0);
  });

  it('should have Dodo Payments env variables', async () => {
    const { stdout } = await execAsync(
      'grep -c "DODO_API_KEY\\|DODO_WEBHOOK_SECRET" apps/cloud-backend/.env.example'
    );
    
    expect(parseInt(stdout.trim())).toBe(2);
  });
});
