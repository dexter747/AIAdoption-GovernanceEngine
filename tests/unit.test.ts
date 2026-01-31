import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

// Get the project root directory (parent of tests directory)
const PROJECT_ROOT = path.resolve(__dirname, '..');

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

  describe('Package Structure Tests', () => {
    mcpServers.forEach((server) => {
      it(`should have valid package.json for ${server}`, async () => {
        const pkgPath = path.join(PROJECT_ROOT, `packages/mcp-servers/${server}/package.json`);
        
        expect(fs.existsSync(pkgPath)).toBe(true);
        
        const content = fs.readFileSync(pkgPath, 'utf-8');
        const packageJson = JSON.parse(content);
        
        expect(packageJson.name).toContain('mcp-server');
        expect(packageJson.type).toBe('module');
        expect(packageJson.main).toBe('dist/index.js');
        expect(packageJson.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
      });

      it(`should have compiled output for ${server}`, async () => {
        const distPath = path.join(PROJECT_ROOT, `packages/mcp-servers/${server}/dist/index.js`);
        expect(fs.existsSync(distPath)).toBe(true);
      });
    });
  });

  describe('TypeScript Configuration Tests', () => {
    mcpServers.forEach((server) => {
      it(`should have valid tsconfig.json for ${server}`, async () => {
        const tsconfigPath = path.join(PROJECT_ROOT, `packages/mcp-servers/${server}/tsconfig.json`);
        
        expect(fs.existsSync(tsconfigPath)).toBe(true);
        
        const content = fs.readFileSync(tsconfigPath, 'utf-8');
        const tsconfig = JSON.parse(content);
        
        expect(tsconfig.compilerOptions).toHaveProperty('outDir');
        expect(tsconfig.compilerOptions).toHaveProperty('rootDir');
      });
    });
  });

  describe('Source Code Tests', () => {
    mcpServers.forEach((server) => {
      it(`should have index.ts source file for ${server}`, async () => {
        const srcPath = path.join(PROJECT_ROOT, `packages/mcp-servers/${server}/src/index.ts`);
        
        expect(fs.existsSync(srcPath)).toBe(true);
        
        const content = fs.readFileSync(srcPath, 'utf-8');
        const lineCount = content.split('\n').length;
        
        expect(lineCount).toBeGreaterThan(40); // Each server should have meaningful code
      });

      it(`should export Server instance in ${server}`, async () => {
        const srcPath = path.join(PROJECT_ROOT, `packages/mcp-servers/${server}/src/index.ts`);
        const content = fs.readFileSync(srcPath, 'utf-8');
        
        expect(content).toContain('new Server');
      });

      it(`should implement ListToolsRequestSchema in ${server}`, async () => {
        const srcPath = path.join(PROJECT_ROOT, `packages/mcp-servers/${server}/src/index.ts`);
        const content = fs.readFileSync(srcPath, 'utf-8');
        
        expect(content).toContain('ListToolsRequestSchema');
      });

      it(`should implement CallToolRequestSchema in ${server}`, async () => {
        const srcPath = path.join(PROJECT_ROOT, `packages/mcp-servers/${server}/src/index.ts`);
        const content = fs.readFileSync(srcPath, 'utf-8');
        
        expect(content).toContain('CallToolRequestSchema');
      });
    });
  });

  describe('Tool Definition Tests', () => {
    mcpServers.forEach((server) => {
      it(`should define at least 3 tools in ${server}`, async () => {
        const srcPath = path.join(PROJECT_ROOT, `packages/mcp-servers/${server}/src/index.ts`);
        const content = fs.readFileSync(srcPath, 'utf-8');
        
        const toolMatches = content.match(/name:\s*['"]/g) || [];
        expect(toolMatches.length).toBeGreaterThanOrEqual(3);
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
        const providerPath = path.join(PROJECT_ROOT, `apps/express-api/src/services/ai/providers/${provider}.js`);
        expect(fs.existsSync(providerPath)).toBe(true);
      });

      it(`should export chat function from ${provider} provider`, async () => {
        const providerPath = path.join(PROJECT_ROOT, `apps/express-api/src/services/ai/providers/${provider}.js`);
        const content = fs.readFileSync(providerPath, 'utf-8');
        
        expect(content).toMatch(/export\s+(class|function|const)/);
      });
    });
  });
});

describe('Encryption Service - Unit Tests', () => {
  describe('Encryption Implementation', () => {
    it('should have encryption service file', async () => {
      const encPath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/encryption.js');
      expect(fs.existsSync(encPath)).toBe(true);
    });

    it('should implement encrypt function', async () => {
      const encPath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/encryption.js');
      const content = fs.readFileSync(encPath, 'utf-8');
      
      expect(content).toMatch(/export.*encrypt/);
    });

    it('should implement decrypt function', async () => {
      const encPath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/encryption.js');
      const content = fs.readFileSync(encPath, 'utf-8');
      
      expect(content).toMatch(/export.*decrypt/);
    });

    it('should use proper encryption algorithm', async () => {
      const encPath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/encryption.js');
      const content = fs.readFileSync(encPath, 'utf-8');
      
      // Should use AES-256-GCM or similar secure algorithm
      expect(content).toMatch(/aes-256|AES-256|gcm|GCM/i);
    });
  });
});

describe('License Service - Unit Tests', () => {
  describe('License Implementation', () => {
    it('should have license service file', async () => {
      const licPath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/license.js');
      expect(fs.existsSync(licPath)).toBe(true);
    });

    it('should implement license validation', async () => {
      const licPath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/license.js');
      const content = fs.readFileSync(licPath, 'utf-8');
      
      expect(content).toMatch(/validate|verify/i);
    });

    it('should implement license generation', async () => {
      const licPath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/license.js');
      const content = fs.readFileSync(licPath, 'utf-8');
      
      expect(content).toMatch(/generate|create/i);
    });
  });
});

describe('Middleware - Unit Tests', () => {
  const middlewares = [
    'auth',
    'errorHandler',
    'requestLogger',
    'security',
    'validation',
  ];

  describe('Middleware Files', () => {
    middlewares.forEach((middleware) => {
      it(`should have ${middleware} middleware file`, async () => {
        const mwPath = path.join(PROJECT_ROOT, `apps/express-api/src/middleware/${middleware}.js`);
        expect(fs.existsSync(mwPath)).toBe(true);
      });

      it(`should export functions from ${middleware} middleware`, async () => {
        const mwPath = path.join(PROJECT_ROOT, `apps/express-api/src/middleware/${middleware}.js`);
        const content = fs.readFileSync(mwPath, 'utf-8');
        
        expect(content).toMatch(/export\s+(function|const|default)/);
      });
    });
  });
});

describe('Route Handlers - Unit Tests', () => {
  describe('Route Files', () => {
    it('should have routes directory', async () => {
      const routesPath = path.join(PROJECT_ROOT, 'apps/express-api/src/routes');
      expect(fs.existsSync(routesPath)).toBe(true);
    });

    it('should have at least 3 route files', async () => {
      const routesPath = path.join(PROJECT_ROOT, 'apps/express-api/src/routes');
      const files = fs.readdirSync(routesPath);
      
      const jsFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.ts'));
      expect(jsFiles.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe('Configuration - Unit Tests', () => {
  describe('Config Files', () => {
    it('should have config directory', async () => {
      const configPath = path.join(PROJECT_ROOT, 'apps/express-api/src/config');
      expect(fs.existsSync(configPath)).toBe(true);
    });

    it('should have index.js config file', async () => {
      const configPath = path.join(PROJECT_ROOT, 'apps/express-api/src/config/index.js');
      expect(fs.existsSync(configPath)).toBe(true);
    });
  });
});

describe('Utilities - Unit Tests', () => {
  describe('Utility Files', () => {
    it('should have utils directory', async () => {
      const utilsPath = path.join(PROJECT_ROOT, 'apps/express-api/src/utils');
      expect(fs.existsSync(utilsPath)).toBe(true);
    });

    it('should have logger utility', async () => {
      const loggerPath = path.join(PROJECT_ROOT, 'apps/express-api/src/utils/logger.js');
      expect(fs.existsSync(loggerPath)).toBe(true);
    });
  });
});
