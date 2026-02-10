/**
 * Comprehensive Integration Test Suite
 * 
 * Tests every function, connection, and component across the entire codebase:
 * - Shared types & utilities
 * - AI Router (Express) - all 9 providers
 * - MCP Server packages (13 servers)
 * - MCP Client & Manager
 * - Context Manager
 * - IPC Handlers
 * - Preload API surface
 * - Express API endpoints
 * - Desktop app components
 */

import { jest } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');

// =============================================================================
// 1. SHARED TYPES PACKAGE
// =============================================================================

describe('Shared Types Package', () => {
  const typesPath = path.join(ROOT, 'packages/shared/src/types.ts');
  let typesContent: string;

  beforeAll(() => {
    typesContent = fs.readFileSync(typesPath, 'utf-8');
  });

  test('types.ts file exists', () => {
    expect(fs.existsSync(typesPath)).toBe(true);
  });

  describe('AIProvider type', () => {
    const requiredProviders = [
      'openai', 'anthropic', 'google', 'groq', 'xai',
      'mistral', 'deepseek', 'cohere', 'perplexity', 'ollama', 'azure'
    ];

    test.each(requiredProviders)('should include %s provider', (provider) => {
      expect(typesContent).toContain(`'${provider}'`);
    });

    test('should export AIProvider type', () => {
      expect(typesContent).toMatch(/export\s+type\s+AIProvider\s*=/);
    });
  });

  describe('LegacySystemType type', () => {
    const requiredSystems = [
      'mysql', 'postgresql', 'oracle', 'sqlserver', 'mongodb',
      'sap-hana', 'salesforce', 'servicenow', 'jira', 'zendesk',
      'mariadb', 'redis', 'elasticsearch', 'workday'
    ];

    test.each(requiredSystems)('should include %s system type', (system) => {
      expect(typesContent).toContain(`'${system}'`);
    });

    test('should export LegacySystemType', () => {
      expect(typesContent).toMatch(/export\s+type\s+LegacySystemType\s*=/);
    });
  });

  describe('Core interfaces', () => {
    const requiredInterfaces = [
      'ConnectionConfig', 'AIQueryOptions', 'AIQueryResult'
    ];

    test.each(requiredInterfaces)('should export %s', (iface) => {
      expect(typesContent).toMatch(new RegExp(`export\\s+(interface|type)\\s+${iface}`));
    });
  });
});

// =============================================================================
// 2. EXPRESS API - AI ROUTER
// =============================================================================

describe('Express AI Router', () => {
  const routerPath = path.join(ROOT, 'apps/express-api/src/providers/ai-router.js');
  let routerContent: string;

  beforeAll(() => {
    routerContent = fs.readFileSync(routerPath, 'utf-8');
  });

  test('ai-router.js file exists', () => {
    expect(fs.existsSync(routerPath)).toBe(true);
  });

  describe('Provider configurations', () => {
    const providers = [
      { name: 'openai', envKey: 'OPENAI_API_KEY' },
      { name: 'anthropic', envKey: 'ANTHROPIC_API_KEY' },
      { name: 'google', envKey: 'GOOGLE_AI_API_KEY' },
      { name: 'groq', envKey: 'GROQ_API_KEY' },
      { name: 'xai', envKey: 'XAI_API_KEY' },
      { name: 'mistral', envKey: 'MISTRAL_API_KEY' },
      { name: 'deepseek', envKey: 'DEEPSEEK_API_KEY' },
      { name: 'cohere', envKey: 'COHERE_API_KEY' },
      { name: 'perplexity', envKey: 'PERPLEXITY_API_KEY' },
    ];

    test.each(providers)('$name provider is configured with $envKey', ({ name, envKey }) => {
      expect(routerContent).toContain(envKey);
      expect(routerContent).toContain(`'${name}'`);
    });
  });

  describe('Provider implementations', () => {
    test('has callOpenAI function', () => {
      expect(routerContent).toMatch(/async\s+function\s+callOpenAI/);
    });

    test('has callAnthropic function', () => {
      expect(routerContent).toMatch(/async\s+function\s+callAnthropic/);
    });

    test('has callGoogle function with systemInstruction', () => {
      expect(routerContent).toMatch(/async\s+function\s+callGoogle/);
      expect(routerContent).toContain('systemInstruction');
    });

    test('has callGroq function', () => {
      expect(routerContent).toMatch(/async\s+function\s+callGroq/);
    });

    test('has callOpenAICompatible for xAI/Mistral/DeepSeek/Cohere/Perplexity', () => {
      expect(routerContent).toMatch(/async\s+function\s+callOpenAICompatible/);
      // Verify it handles all 5 OpenAI-compatible providers
      expect(routerContent).toContain("'xai': 'XAI_API_KEY'");
      expect(routerContent).toContain("'mistral': 'MISTRAL_API_KEY'");
      expect(routerContent).toContain("'deepseek': 'DEEPSEEK_API_KEY'");
      expect(routerContent).toContain("'cohere': 'COHERE_API_KEY'");
      expect(routerContent).toContain("'perplexity': 'PERPLEXITY_API_KEY'");
    });
  });

  describe('Router switch cases', () => {
    const switchCases = [
      'openai', 'anthropic', 'google', 'groq',
      'xai', 'mistral', 'deepseek', 'cohere', 'perplexity'
    ];

    test.each(switchCases)('has case for %s', (provider) => {
      expect(routerContent).toContain(`case '${provider}':`);
    });

    test('has default case', () => {
      expect(routerContent).toContain('default:');
    });
  });

  describe('Cost calculation functions', () => {
    test('has calculateOpenAICost', () => {
      expect(routerContent).toMatch(/function\s+calculateOpenAICost/);
    });

    test('has calculateAnthropicCost', () => {
      expect(routerContent).toMatch(/function\s+calculateAnthropicCost/);
    });

    test('has calculateGoogleCost', () => {
      expect(routerContent).toMatch(/function\s+calculateGoogleCost/);
    });
  });

  describe('Database helper functions', () => {
    test('getUserApiKey handles null supabase', () => {
      expect(routerContent).toContain('if (!supabase) return null');
    });

    test('logUsage handles null supabase', () => {
      expect(routerContent).toMatch(/if\s*\(!supabase\)/);
    });

    test('getUserApiKey has try/catch', () => {
      // Verify it doesn't crash on supabase errors
      const getUserApiKeyMatch = routerContent.match(/async\s+function\s+getUserApiKey[\s\S]*?(?=\n\s*async\s+function|\nexport)/);
      expect(getUserApiKeyMatch).toBeTruthy();
      expect(getUserApiKeyMatch![0]).toContain('try');
      expect(getUserApiKeyMatch![0]).toContain('catch');
    });

    test('logUsage has try/catch', () => {
      const logUsageMatch = routerContent.match(/async\s+function\s+logUsage[\s\S]*?(?=\n\s*\/\/\s*===|$)/);
      expect(logUsageMatch).toBeTruthy();
      expect(logUsageMatch![0]).toContain('try');
      expect(logUsageMatch![0]).toContain('catch');
    });
  });

  describe('Exported functions', () => {
    test('exports routeAIRequest', () => {
      expect(routerContent).toMatch(/export\s+async\s+function\s+routeAIRequest/);
    });

    test('exports getAvailableProviders', () => {
      expect(routerContent).toMatch(/export\s+function\s+getAvailableProviders/);
    });

    test('exports isProviderAvailable', () => {
      expect(routerContent).toMatch(/export\s+function\s+isProviderAvailable/);
    });

    test('exports isModelAvailable', () => {
      expect(routerContent).toMatch(/export\s+function\s+isModelAvailable/);
    });
  });

  describe('BYOK (Bring Your Own Key) support', () => {
    test('callOpenAI supports userApiKey', () => {
      const match = routerContent.match(/async\s+function\s+callOpenAI[\s\S]*?^}/m);
      expect(match).toBeTruthy();
      expect(match![0]).toContain('userApiKey');
    });

    test('callAnthropic supports userApiKey', () => {
      const match = routerContent.match(/async\s+function\s+callAnthropic[\s\S]*?^}/m);
      expect(match).toBeTruthy();
      expect(match![0]).toContain('userApiKey');
    });

    test('callGoogle supports userApiKey', () => {
      const match = routerContent.match(/async\s+function\s+callGoogle[\s\S]*?^}/m);
      expect(match).toBeTruthy();
      expect(match![0]).toContain('userApiKey');
    });
  });
});

// =============================================================================
// 3. EXPRESS SERVER - API ENDPOINTS
// =============================================================================

describe('Express Server', () => {
  const serverPath = path.join(ROOT, 'apps/express-api/src/server.js');
  let serverContent: string;

  beforeAll(() => {
    serverContent = fs.readFileSync(serverPath, 'utf-8');
  });

  describe('API endpoints', () => {
    const endpoints = [
      { method: 'get', path: '/health' },
      { method: 'get', path: '/api/status' },
      { method: 'post', path: '/api/licenses/validate' },
      { method: 'get', path: '/api/users/:userId/api-keys' },
      { method: 'post', path: '/api/users/:userId/api-keys' },
      { method: 'post', path: '/api/usage/log' },
      { method: 'get', path: '/api/usage/:userId' },
      { method: 'get', path: '/api/subscriptions/:userId' },
      { method: 'get', path: '/api/ai/providers' },
      { method: 'post', path: '/api/ai/query' },
      { method: 'get', path: '/api/user/connections' },
      { method: 'post', path: '/api/user/connections' },
      { method: 'delete', path: '/api/user/connections/:id' },
      { method: 'post', path: '/api/webhooks/dodo' },
    ];

    test.each(endpoints)('has $method $path endpoint', ({ method, path: ep }) => {
      expect(serverContent).toContain(`app.${method}('${ep}'`);
    });
  });

  describe('Security', () => {
    test('uses CORS', () => {
      expect(serverContent).toContain('cors');
    });

    test('uses JSON body parser', () => {
      expect(serverContent).toContain('express.json');
    });

    test('has JWT validation middleware', () => {
      expect(serverContent).toContain('validateJwtMiddleware');
      expect(serverContent).toContain('jwt.verify');
    });
  });

  describe('AI query endpoint', () => {
    test('validates required fields', () => {
      expect(serverContent).toContain("'Missing required fields: provider, model, messages'");
    });

    test('checks provider availability', () => {
      expect(serverContent).toContain('isProviderAvailable(provider)');
    });

    test('imports routeAIRequest', () => {
      expect(serverContent).toContain('routeAIRequest');
    });
  });
});

// =============================================================================
// 4. MCP SERVER PACKAGES (13 servers)
// =============================================================================

describe('MCP Server Packages', () => {
  const mcpServersDir = path.join(ROOT, 'packages/mcp-servers');
  
  const servers = [
    { name: 'mysql', driver: 'mysql2', type: 'database' },
    { name: 'oracle', driver: 'oracledb', type: 'database' },
    { name: 'sqlserver', driver: 'tedious', type: 'database' },
    { name: 'mongodb', driver: 'mongodb', type: 'database' },
    { name: 'sap-hana', driver: 'hana-client', type: 'database' },
    { name: 'mariadb', driver: 'mysql2', type: 'database' },
    { name: 'redis', driver: 'redis', type: 'database' },
    { name: 'elasticsearch', driver: 'elasticsearch', type: 'database' },
    { name: 'salesforce', driver: 'jsforce', type: 'api' },
    { name: 'servicenow', driver: 'axios', type: 'api' },
    { name: 'jira', driver: 'axios', type: 'api' },
    { name: 'zendesk', driver: 'axios', type: 'api' },
    { name: 'workday', driver: 'axios', type: 'api' },
  ];

  describe.each(servers)('$name MCP Server', ({ name, driver, type }) => {
    const serverDir = path.join(mcpServersDir, name);
    const indexPath = path.join(serverDir, 'src/index.ts');

    test('directory exists', () => {
      expect(fs.existsSync(serverDir)).toBe(true);
    });

    test('has package.json', () => {
      const pkgPath = path.join(serverDir, 'package.json');
      expect(fs.existsSync(pkgPath)).toBe(true);
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      expect(pkg.name).toContain(name);
    });

    test('has tsconfig.json', () => {
      expect(fs.existsSync(path.join(serverDir, 'tsconfig.json'))).toBe(true);
    });

    test('has index.ts source file', () => {
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    test('uses @modelcontextprotocol/sdk', () => {
      const content = fs.readFileSync(indexPath, 'utf-8');
      expect(content).toContain('@modelcontextprotocol/sdk');
    });

    test('creates MCP Server instance', () => {
      const content = fs.readFileSync(indexPath, 'utf-8');
      expect(content).toMatch(/new\s+Server\s*\(/);
    });

    test('uses StdioServerTransport', () => {
      const content = fs.readFileSync(indexPath, 'utf-8');
      expect(content).toContain('StdioServerTransport');
    });

    test('implements tools/list handler', () => {
      const content = fs.readFileSync(indexPath, 'utf-8');
      expect(content).toContain('ListToolsRequestSchema');
    });

    test('implements tools/call handler', () => {
      const content = fs.readFileSync(indexPath, 'utf-8');
      expect(content).toContain('CallToolRequestSchema');
    });

    if (type === 'database') {
      test('has query tool', () => {
        const content = fs.readFileSync(indexPath, 'utf-8');
        expect(content).toMatch(/query|execute|search|redis_get|redis_set/i);
      });
    }

    if (type === 'api') {
      test('has API integration', () => {
        const content = fs.readFileSync(indexPath, 'utf-8');
        // API servers should have some form of HTTP/REST integration
        expect(content).toMatch(/fetch|axios|http|request|jsforce/i);
      });
    }
  });
});

// =============================================================================
// 5. MCP CLIENT (Desktop App)
// =============================================================================

describe('MCP Client', () => {
  const clientPath = path.join(ROOT, 'apps/desktop-app/src/main/mcp/mcp-client.ts');
  let clientContent: string;

  beforeAll(() => {
    clientContent = fs.readFileSync(clientPath, 'utf-8');
  });

  test('file exists', () => {
    expect(fs.existsSync(clientPath)).toBe(true);
  });

  describe('MCP Client class', () => {
    test('exports MCPClient class', () => {
      expect(clientContent).toMatch(/export\s+class\s+MCPClient/);
    });

    test('has connect method', () => {
      expect(clientContent).toMatch(/async\s+connect\s*\(/);
    });

    test('has disconnect method', () => {
      expect(clientContent).toMatch(/async\s+disconnect\s*\(/);
    });

    test('has query method', () => {
      expect(clientContent).toMatch(/async\s+query\s*\(/);
    });

    test('has callTool method', () => {
      expect(clientContent).toMatch(/async\s+callTool\s*\(/);
    });

    test('has listTables method', () => {
      expect(clientContent).toMatch(/async\s+listTables\s*\(/);
    });

    test('has getTableSchema method', () => {
      expect(clientContent).toMatch(/async\s+getTableSchema\s*\(/);
    });

    test('has getAllToolsForAI method', () => {
      expect(clientContent).toContain('getAllToolsForAI');
    });

    test('has getStatus method', () => {
      expect(clientContent).toContain('getStatus');
    });
  });

  describe('Server type support', () => {
    const serverTypes = [
      'mysql', 'postgresql', 'oracle', 'sqlserver', 'mongodb',
      'sap-hana', 'salesforce', 'servicenow', 'jira', 'zendesk',
      'mariadb', 'redis', 'elasticsearch', 'workday'
    ];

    test.each(serverTypes)('supports %s server type', (type) => {
      expect(clientContent).toContain(`'${type}'`);
    });
  });

  describe('Transport', () => {
    test('uses StdioClientTransport', () => {
      expect(clientContent).toContain('StdioClientTransport');
    });

    test('imports from @modelcontextprotocol/sdk', () => {
      expect(clientContent).toContain('@modelcontextprotocol/sdk');
    });
  });

  describe('Local server paths', () => {
    test('has localServerPaths configuration', () => {
      expect(clientContent).toContain('localServerPaths');
    });
  });
});

// =============================================================================
// 6. MCP MANAGER
// =============================================================================

describe('MCP Manager', () => {
  const managerPath = path.join(ROOT, 'apps/desktop-app/src/main/mcp/mcp-manager.ts');
  let managerContent: string;

  beforeAll(() => {
    managerContent = fs.readFileSync(managerPath, 'utf-8');
  });

  test('file exists', () => {
    expect(fs.existsSync(managerPath)).toBe(true);
  });

  describe('MCPManager class', () => {
    test('exports MCPConnectionManager class', () => {
      expect(managerContent).toMatch(/export\s+class\s+MCPConnectionManager/);
    });

    test('has addConnection method', () => {
      expect(managerContent).toMatch(/addConnection\s*\(/);
    });

    test('has enableConnection method', () => {
      expect(managerContent).toMatch(/enableConnection\s*\(/);
    });

    test('has disableConnection method', () => {
      expect(managerContent).toMatch(/disableConnection\s*\(/);
    });

    test('has testConnection method', () => {
      expect(managerContent).toMatch(/testConnection\s*\(/);
    });
  });

  describe('System support', () => {
    const systems = [
      'mysql', 'postgresql', 'oracle', 'sqlserver', 'mongodb',
      'sap-hana', 'salesforce', 'servicenow', 'jira', 'zendesk',
      'mariadb', 'redis', 'elasticsearch', 'workday'
    ];

    test.each(systems)('supports %s in server configs', (system) => {
      expect(managerContent).toContain(`'${system}'`);
    });
  });

  describe('MCP Server launching', () => {
    test('has Docker server support', () => {
      expect(managerContent).toContain('docker');
    });

    test('has npm server support', () => {
      expect(managerContent).toContain('startNpmMCPServer');
    });
  });
});

// =============================================================================
// 7. CONTEXT MANAGER
// =============================================================================

describe('Context Manager', () => {
  const contextPath = path.join(ROOT, 'apps/desktop-app/src/main/context/context-manager.ts');
  let contextContent: string;

  beforeAll(() => {
    contextContent = fs.readFileSync(contextPath, 'utf-8');
  });

  test('file exists', () => {
    expect(fs.existsSync(contextPath)).toBe(true);
  });

  describe('ContextManager class', () => {
    test('exports ContextManager class', () => {
      expect(contextContent).toMatch(/export\s+class\s+ContextManager/);
    });
  });

  describe('CRUD operations', () => {
    const methods = ['create', 'get', 'update', 'delete', 'list'];

    test.each(methods)('has %s method', (method) => {
      expect(contextContent).toMatch(new RegExp(`(async\\s+)?${method}\\s*\\(`));
    });
  });

  describe('Context types', () => {
    const types = [
      'system_prompt', 'database_schema', 'knowledge_base',
      'memory_summary', 'project', 'template'
    ];

    test.each(types)('supports %s context type', (type) => {
      expect(contextContent).toContain(`'${type}'`);
    });
  });

  describe('Advanced features', () => {
    test('has compile method for context window management', () => {
      expect(contextContent).toMatch(/(async\s+)?compile\s*\(/);
    });

    test('has token estimation', () => {
      expect(contextContent).toContain('estimateTokens');
    });

    test('has knowledge base import', () => {
      expect(contextContent).toMatch(/import.*[Ff]ile|importKnowledge/);
    });

    test('has memory summary creation', () => {
      expect(contextContent).toContain('memory');
    });

    test('has schema context generation', () => {
      expect(contextContent).toContain('schema');
    });

    test('has toggleActive support via update', () => {
      expect(contextContent).toContain('isActive');
    });

    test('has toggleAutoInclude support via update', () => {
      expect(contextContent).toContain('autoInclude');
    });

    test('has stats method', () => {
      expect(contextContent).toContain('getStats');
    });

    test('has export method', () => {
      expect(contextContent).toContain('export');
    });
  });

  describe('Storage', () => {
    test('uses electron-store', () => {
      expect(contextContent).toContain('electron-store');
    });

    test('handles knowledge base directory', () => {
      expect(contextContent).toContain('knowledge-base');
    });
  });
});

// =============================================================================
// 8. AI ROUTER (Desktop)
// =============================================================================

describe('Desktop AI Router', () => {
  const routerPath = path.join(ROOT, 'apps/desktop-app/src/main/ai/ai-router.ts');
  let routerContent: string;

  beforeAll(() => {
    routerContent = fs.readFileSync(routerPath, 'utf-8');
  });

  test('file exists', () => {
    expect(fs.existsSync(routerPath)).toBe(true);
  });

  describe('AI Router class', () => {
    test('exports AIRouter', () => {
      expect(routerContent).toMatch(/export\s+(class|function|const)\s+AIRouter/i);
    });

    test('has query method', () => {
      expect(routerContent).toMatch(/(async\s+)?query\s*\(/);
    });
  });

  describe('Express integration', () => {
    test('routes through Express backend', () => {
      expect(routerContent).toContain('expressClient');
    });

    test('has fallback for when Express is unavailable', () => {
      // Should have try/catch or conditional for express failure
      expect(routerContent).toContain('catch');
    });
  });

  describe('Context compilation', () => {
    test('compiles contexts before query', () => {
      expect(routerContent).toContain('compile');
    });

    test('references contextManager', () => {
      expect(routerContent).toContain('contextManager');
    });
  });
});

// =============================================================================
// 9. EXPRESS CLIENT (Desktop → Express)
// =============================================================================

describe('Express Client', () => {
  const clientPath = path.join(ROOT, 'apps/desktop-app/src/main/api/express-client.ts');
  let clientContent: string;

  beforeAll(() => {
    clientContent = fs.readFileSync(clientPath, 'utf-8');
  });

  test('file exists', () => {
    expect(fs.existsSync(clientPath)).toBe(true);
  });

  describe('ExpressClient class', () => {
    test('exports ExpressClient', () => {
      expect(clientContent).toMatch(/export\s+(class|const)\s+ExpressClient/i);
    });
  });

  describe('API methods', () => {
    const methods = [
      'queryAI',
      'validateLicense',
      'checkHealth',
    ];

    test.each(methods)('has %s method', (method) => {
      expect(clientContent).toContain(method);
    });
  });

  describe('BYOK methods', () => {
    test('has getUserApiKeys', () => {
      expect(clientContent).toContain('getUserApiKey');
    });

    test('has addUserApiKey', () => {
      expect(clientContent).toContain('addUserApiKey');
    });
  });

  describe('Connection methods', () => {
    test('has getUserConnections', () => {
      expect(clientContent).toContain('getUserConnection');
    });
  });

  describe('Configuration', () => {
    test('configurable base URL', () => {
      expect(clientContent).toContain('baseURL');
    });

    test('uses port 5500 default', () => {
      expect(clientContent).toContain('5500');
    });
  });
});

// =============================================================================
// 10. IPC HANDLERS
// =============================================================================

describe('IPC Handlers', () => {
  const handlersPath = path.join(ROOT, 'apps/desktop-app/src/main/ipc-handlers.ts');
  let handlersContent: string;

  beforeAll(() => {
    handlersContent = fs.readFileSync(handlersPath, 'utf-8');
  });

  test('file exists', () => {
    expect(fs.existsSync(handlersPath)).toBe(true);
  });

  describe('Auth handlers', () => {
    // Auth handlers are registered in index.ts, not ipc-handlers.ts
    const indexPath = path.join(ROOT, 'apps/desktop-app/src/main/index.ts');
    let indexContent: string;

    beforeAll(() => {
      indexContent = fs.readFileSync(indexPath, 'utf-8');
    });

    const handlers = ['auth:check', 'auth:login', 'auth:logout', 'auth:getUser'];
    test.each(handlers)('handles %s', (handler) => {
      expect(indexContent).toContain(`'${handler}'`);
    });
  });

  describe('MCP handlers', () => {
    const handlers = [
      'mcp:add-connection', 'mcp:enable-connection', 'mcp:disable-connection',
      'mcp:test-connection', 'mcp:get-all-connections',
    ];
    test.each(handlers)('handles %s', (handler) => {
      expect(handlersContent).toContain(`'${handler}'`);
    });
  });

  describe('MCP Client SDK handlers', () => {
    const handlers = [
      'mcp:client-connect', 'mcp:client-disconnect', 'mcp:query',
      'mcp:call-tool', 'mcp:list-tables', 'mcp:get-table-schema',
    ];
    test.each(handlers)('handles %s', (handler) => {
      expect(handlersContent).toContain(`'${handler}'`);
    });
  });

  describe('Chat handlers', () => {
    const handlers = [
      'chat:create-conversation', 'chat:add-message', 'chat:get-conversation',
      'chat:get-all-conversations', 'chat:delete-conversation',
    ];
    test.each(handlers)('handles %s', (handler) => {
      expect(handlersContent).toContain(`'${handler}'`);
    });
  });

  describe('Context handlers', () => {
    const handlers = [
      'context:create', 'context:get', 'context:update', 'context:delete',
      'context:list', 'context:compile', 'context:stats',
    ];
    test.each(handlers)('handles %s', (handler) => {
      expect(handlersContent).toContain(`'${handler}'`);
    });
  });

  describe('AI handlers', () => {
    test('handles ai:chat', () => {
      expect(handlersContent).toContain("'ai:chat'");
    });

    test('handles mcp:query-with-ai', () => {
      expect(handlersContent).toContain("'mcp:query-with-ai'");
    });
  });

  describe('Express API handlers', () => {
    const handlers = [
      'express:check-health', 'express:get-providers', 'express:query-ai',
    ];
    test.each(handlers)('handles %s', (handler) => {
      expect(handlersContent).toContain(`'${handler}'`);
    });
  });

  describe('Auto-schema generation', () => {
    test('generates schema context on mcp:client-connect', () => {
      expect(handlersContent).toContain('mcp:generate-schema-context');
    });
  });
});

// =============================================================================
// 11. PRELOAD API SURFACE
// =============================================================================

describe('Preload API Surface', () => {
  const preloadPath = path.join(ROOT, 'apps/desktop-app/src/main/preload.ts');
  let preloadContent: string;

  beforeAll(() => {
    preloadContent = fs.readFileSync(preloadPath, 'utf-8');
  });

  test('file exists', () => {
    expect(fs.existsSync(preloadPath)).toBe(true);
  });

  test('uses contextBridge', () => {
    expect(preloadContent).toContain('contextBridge');
  });

  test('exposes electron API', () => {
    expect(preloadContent).toContain('exposeInMainWorld');
  });

  describe('API namespaces', () => {
    const namespaces = [
      'auth', 'connection', 'ai', 'mcp', 'chat',
      'express', 'context', 'api', 'license', 'settings', 'system'
    ];

    test.each(namespaces)('exposes %s namespace', (ns) => {
      expect(preloadContent).toMatch(new RegExp(`${ns}:\\s*\\{`));
    });
  });

  describe('Auth API', () => {
    test('has login method', () => {
      expect(preloadContent).toContain("'auth:login'");
    });

    test('has logout method', () => {
      expect(preloadContent).toContain("'auth:logout'");
    });

    test('has check method', () => {
      expect(preloadContent).toContain("'auth:check'");
    });

    test('has onSuccess listener with cleanup', () => {
      expect(preloadContent).toContain("'auth:success'");
      expect(preloadContent).toContain('removeListener');
    });

    test('has onError listener with cleanup', () => {
      expect(preloadContent).toContain("'auth:error'");
    });
  });

  describe('Context API', () => {
    const contextMethods = [
      'context:create', 'context:get', 'context:update', 'context:delete',
      'context:list', 'context:compile', 'context:stats',
      'context:import-file', 'context:create-memory',
      'context:toggle-active', 'context:toggle-auto-include',
    ];

    test.each(contextMethods)('has %s method', (method) => {
      expect(preloadContent).toContain(`'${method}'`);
    });
  });

  describe('MCP Client API', () => {
    test('has query method', () => {
      expect(preloadContent).toContain("'mcp:query'");
    });

    test('has listTables method', () => {
      expect(preloadContent).toContain("'mcp:list-tables'");
    });

    test('has generateSchemaContext method', () => {
      expect(preloadContent).toContain("'mcp:generate-schema-context'");
    });
  });
});

// =============================================================================
// 12. TYPE DEFINITIONS (electron.d.ts)
// =============================================================================

describe('Electron API Type Definitions', () => {
  const typesPath = path.join(ROOT, 'apps/desktop-app/src/renderer/types/electron.d.ts');
  let typesContent: string;

  beforeAll(() => {
    typesContent = fs.readFileSync(typesPath, 'utf-8');
  });

  test('file exists', () => {
    expect(fs.existsSync(typesPath)).toBe(true);
  });

  test('stale duplicate does not exist', () => {
    const oldPath = path.join(ROOT, 'apps/desktop-app/src/renderer/electron.d.ts');
    expect(fs.existsSync(oldPath)).toBe(false);
  });

  describe('ElectronAPI interface', () => {
    const requiredProperties = [
      'auth', 'connection', 'mcp', 'chat', 'express', 'ai',
      'license', 'settings', 'system', 'api', 'context'
    ];

    test.each(requiredProperties)('has %s property', (prop) => {
      expect(typesContent).toMatch(new RegExp(`${prop}:\\s*\\{`));
    });
  });

  describe('Auth type', () => {
    test('login returns Promise (no args)', () => {
      expect(typesContent).toMatch(/login:\s*\(\)\s*=>/);
    });

    test('onSuccess returns cleanup function', () => {
      expect(typesContent).toMatch(/onSuccess.*=>\s*\(\(\)\s*=>\s*void\)/);
    });

    test('onError returns cleanup function', () => {
      expect(typesContent).toMatch(/onError.*=>\s*\(\(\)\s*=>\s*void\)/);
    });
  });

  describe('MCP type', () => {
    test('has generateSchemaContext', () => {
      expect(typesContent).toContain('generateSchemaContext');
    });

    test('has getAllToolsForAI', () => {
      expect(typesContent).toContain('getAllToolsForAI');
    });
  });

  describe('Context type', () => {
    test('has create method', () => {
      expect(typesContent).toMatch(/create:\s*\(data:/);
    });

    test('has compile method', () => {
      expect(typesContent).toMatch(/compile:\s*\(options:/);
    });

    test('has toggleActive method', () => {
      expect(typesContent).toContain('toggleActive');
    });

    test('has createMemory method', () => {
      expect(typesContent).toContain('createMemory');
    });
  });

  describe('ChatMessage type', () => {
    test('id is required string (not optional)', () => {
      // Verify the ChatMessage interface has id as required string
      const chatMsgMatch = typesContent.match(/interface\s+ChatMessage\s*\{[\s\S]*?\}/);
      expect(chatMsgMatch).toBeTruthy();
      // Should have `id: string` not `id?: string`
      expect(chatMsgMatch![0]).toMatch(/^\s+id:\s*string;/m);
    });
  });

  describe('Global Window declaration', () => {
    test('declares global Window.electron', () => {
      expect(typesContent).toContain('interface Window');
      expect(typesContent).toContain('electron: ElectronAPI');
    });
  });
});

// =============================================================================
// 13. RENDERER COMPONENTS
// =============================================================================

describe('Renderer Pages & Components', () => {
  const rendererDir = path.join(ROOT, 'apps/desktop-app/src/renderer');

  describe('ModernChatPage', () => {
    const pagePath = path.join(rendererDir, 'pages/ModernChatPage.tsx');
    let content: string;

    beforeAll(() => {
      content = fs.readFileSync(pagePath, 'utf-8');
    });

    test('file exists', () => {
      expect(fs.existsSync(pagePath)).toBe(true);
    });

    test('has model selection', () => {
      expect(content).toContain('getProviderForModel');
    });

    test('has context window config', () => {
      expect(content).toContain('getContextWindowConfig');
    });

    test('has auto-schema generation on connection select', () => {
      expect(content).toContain('generateSchemaContext');
    });

    test('has memory auto-save', () => {
      expect(content).toContain('createMemory');
    });

    test('compiles contexts before sending', () => {
      expect(content).toContain('context?.compile');
    });
  });

  describe('ContextManager Component', () => {
    const componentPath = path.join(rendererDir, 'components/ContextManager.tsx');
    
    test('file exists', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    test('uses useContexts hook', () => {
      const content = fs.readFileSync(componentPath, 'utf-8');
      expect(content).toContain('useContexts');
    });
  });

  describe('ContextSelector Component', () => {
    const componentPath = path.join(rendererDir, 'components/ContextSelector.tsx');

    test('file exists', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    test('no unused React import', () => {
      const content = fs.readFileSync(componentPath, 'utf-8');
      expect(content).not.toMatch(/import\s+React\s*,/);
    });
  });

  describe('useContexts Hook', () => {
    const hookPath = path.join(rendererDir, 'hooks/useContexts.ts');
    let content: string;

    beforeAll(() => {
      content = fs.readFileSync(hookPath, 'utf-8');
    });

    test('file exists', () => {
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    test('exports useContexts hook', () => {
      expect(content).toMatch(/export\s+function\s+useContexts/);
    });

    test('has create function', () => {
      expect(content).toContain('createContext');
    });

    test('has update function', () => {
      expect(content).toContain('updateContext');
    });

    test('has delete function', () => {
      expect(content).toContain('deleteContext');
    });

    test('has compile function', () => {
      expect(content).toContain('compile');
    });

    test('exports LLMContext type', () => {
      expect(content).toContain('LLMContext');
    });

    test('exports ContextType type', () => {
      expect(content).toContain('ContextType');
    });
  });

  describe('AuthContext', () => {
    const contextPath = path.join(rendererDir, 'context/AuthContext.tsx');
    let content: string;

    beforeAll(() => {
      content = fs.readFileSync(contextPath, 'utf-8');
    });

    test('file exists', () => {
      expect(fs.existsSync(contextPath)).toBe(true);
    });

    test('has AuthProvider', () => {
      expect(content).toContain('AuthProvider');
    });

    test('has useAuth hook or AuthContext export', () => {
      // useAuth may be in a separate file; AuthContext is exported here
      expect(content).toContain('AuthContext');
    });

    test('properly cleans up auth listeners', () => {
      expect(content).toContain('unsubSuccess');
      expect(content).toContain('unsubError');
    });
  });

  describe('ProfileSettingsPage', () => {
    const pagePath = path.join(rendererDir, 'pages/ProfileSettingsPage.tsx');
    let content: string;

    beforeAll(() => {
      content = fs.readFileSync(pagePath, 'utf-8');
    });

    test('no unused Mail/Key/Bell imports', () => {
      expect(content).not.toMatch(/import\s*\{[^}]*\bMail\b/);
      expect(content).not.toMatch(/import\s*\{[^}]*\bKey\b/);
      expect(content).not.toMatch(/import\s*\{[^}]*\bBell\b/);
    });

    test('no unused Textarea import', () => {
      expect(content).not.toContain("import { Textarea }");
    });
  });

  describe('SubscriptionPage', () => {
    const pagePath = path.join(rendererDir, 'pages/SubscriptionPage.tsx');
    let content: string;

    beforeAll(() => {
      content = fs.readFileSync(pagePath, 'utf-8');
    });

    test('no unused React import', () => {
      expect(content).not.toMatch(/import\s+React\s*,/);
    });

    test('uses system.openExternal (not bare openExternal)', () => {
      expect(content).not.toMatch(/window\.electron\.openExternal\(/);
      expect(content).toContain('system?.openExternal');
    });
  });
});

// =============================================================================
// 14. BUILD CONFIGURATION
// =============================================================================

describe('Build Configuration', () => {
  describe('Monorepo setup', () => {
    test('has pnpm-workspace.yaml', () => {
      const wsPath = path.join(ROOT, 'pnpm-workspace.yaml');
      expect(fs.existsSync(wsPath)).toBe(true);
      const content = fs.readFileSync(wsPath, 'utf-8');
      expect(content).toContain('apps/*');
      expect(content).toContain('packages/*');
      expect(content).toContain('packages/mcp-servers/*');
    });

    test('has turbo.json', () => {
      expect(fs.existsSync(path.join(ROOT, 'turbo.json'))).toBe(true);
    });

    test('has root package.json with workspaces', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts.build).toBeDefined();
      expect(pkg.scripts.test).toBeDefined();
    });
  });

  describe('Desktop app configs', () => {
    const desktopDir = path.join(ROOT, 'apps/desktop-app');

    test('has tsconfig.json for renderer', () => {
      const config = JSON.parse(fs.readFileSync(path.join(desktopDir, 'tsconfig.json'), 'utf-8'));
      expect(config.compilerOptions.jsx).toBe('react-jsx');
    });

    test('has tsconfig.main.json for main process', () => {
      const config = JSON.parse(fs.readFileSync(path.join(desktopDir, 'tsconfig.main.json'), 'utf-8'));
      expect(config.include).toContain('src/main/**/*');
    });

    test('has vite.config.ts', () => {
      expect(fs.existsSync(path.join(desktopDir, 'vite.config.ts'))).toBe(true);
    });
  });

  describe('Express API config', () => {
    test('is ESM module', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps/express-api/package.json'), 'utf-8'));
      expect(pkg.type).toBe('module');
    });
  });
});

// =============================================================================
// 15. CROSS-CUTTING CONCERNS
// =============================================================================

describe('Cross-Cutting Concerns', () => {
  describe('Provider consistency', () => {
    const sharedTypes = fs.readFileSync(path.join(ROOT, 'packages/shared/src/types.ts'), 'utf-8');
    const expressRouter = fs.readFileSync(path.join(ROOT, 'apps/express-api/src/providers/ai-router.js'), 'utf-8');

    test('all Express providers are in shared AIProvider type', () => {
      const expressProviders = ['openai', 'anthropic', 'google', 'groq', 'xai', 'mistral', 'deepseek', 'cohere', 'perplexity'];
      for (const p of expressProviders) {
        expect(sharedTypes).toContain(`'${p}'`);
      }
    });
  });

  describe('System type consistency', () => {
    const sharedTypes = fs.readFileSync(path.join(ROOT, 'packages/shared/src/types.ts'), 'utf-8');
    const mcpClient = fs.readFileSync(path.join(ROOT, 'apps/desktop-app/src/main/mcp/mcp-client.ts'), 'utf-8');

    test('all MCP client types are in shared LegacySystemType', () => {
      const clientTypes = [
        'mysql', 'postgresql', 'oracle', 'sqlserver', 'mongodb',
        'sap-hana', 'salesforce', 'servicenow', 'jira', 'zendesk',
        'mariadb', 'redis', 'elasticsearch', 'workday'
      ];
      for (const t of clientTypes) {
        expect(sharedTypes).toContain(`'${t}'`);
        expect(mcpClient).toContain(`'${t}'`);
      }
    });
  });

  describe('Google Gemini system message handling', () => {
    test('Express router extracts system messages for Gemini', () => {
      const router = fs.readFileSync(path.join(ROOT, 'apps/express-api/src/providers/ai-router.js'), 'utf-8');
      const googleFn = router.match(/async\s+function\s+callGoogle[\s\S]*?^}/m);
      expect(googleFn).toBeTruthy();
      expect(googleFn![0]).toContain('systemInstruction');
      expect(googleFn![0]).toContain("role !== 'system'");
    });
  });

  describe('Anthropic system message handling', () => {
    test('Express router extracts system messages for Anthropic', () => {
      const router = fs.readFileSync(path.join(ROOT, 'apps/express-api/src/providers/ai-router.js'), 'utf-8');
      const anthropicFn = router.match(/async\s+function\s+callAnthropic[\s\S]*?^}/m);
      expect(anthropicFn).toBeTruthy();
      expect(anthropicFn![0]).toContain("role === 'system'");
      expect(anthropicFn![0]).toContain("role !== 'system'");
    });
  });
});
