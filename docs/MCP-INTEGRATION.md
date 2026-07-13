# MCP Integration Strategy for Desktop App

## Overview

Model Context Protocol (MCP) will enable your desktop app to provide AI models with direct, standardized access to databases and enterprise systems.

---

## Why MCP for Your Desktop App?

### Current Limitations Without MCP:

1. **Text-based queries**: AI generates SQL as text, you parse it
2. **No schema awareness**: AI doesn't "see" your database structure
3. **Manual execution**: You handle all query execution logic
4. **Error-prone**: Parsing AI-generated SQL can fail
5. **Limited context**: AI can't explore tables, columns, relationships

### Benefits With MCP:

1. ✅ **Direct execution**: AI runs queries through MCP protocol
2. ✅ **Schema introspection**: AI can list tables, columns, types
3. ✅ **Safe operations**: MCP provides sandboxing and validation
4. ✅ **Standardized interface**: Same protocol for all databases
5. ✅ **Rich context**: AI understands your data structure
6. ✅ **Multi-database**: Connect to multiple databases simultaneously

---

## Architecture With MCP

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop App (Electron)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Interface (React)                                      │
│         ↓                                                    │
│  ┌─────────────────────────────────────────────┐            │
│  │         MCP Manager (Node.js)                │            │
│  │                                               │            │
│  │  • Spawns MCP servers as child processes    │            │
│  │  • Routes AI requests to correct server     │            │
│  │  • Manages connections and credentials      │            │
│  └─────────────────┬───────────────────────────┘            │
│                    ↓                                         │
│  ┌─────────────────────────────────────────────┐            │
│  │        AI Provider (Claude, GPT, etc)        │            │
│  │        with MCP Client Integration           │            │
│  └─────────────────┬───────────────────────────┘            │
│                    ↓                                         │
│  ┌─────────────────────────────────────────────┐            │
│  │     MCP Server Registry (Plugin System)     │            │
│  │                                               │            │
│  │  📦 Databases:                               │            │
│  │    • PostgreSQL MCP ←→ PostgreSQL           │            │
│  │    • MySQL MCP      ←→ MySQL                │            │
│  │    • Oracle MCP     ←→ Oracle               │            │
│  │    • SQL Server MCP ←→ SQL Server           │            │
│  │    • MongoDB MCP    ←→ MongoDB              │            │
│  │    • SAP HANA MCP   ←→ SAP HANA             │            │
│  │                                               │            │
│  │  📦 Enterprise Systems:                      │            │
│  │    • Salesforce MCP ←→ Salesforce API       │            │
│  │    • Jira MCP       ←→ Jira API             │            │
│  │    • ServiceNow MCP ←→ ServiceNow API       │            │
│  │    • SAP ERP MCP    ←→ SAP ERP              │            │
│  │    • Dynamics 365   ←→ Microsoft Dynamics   │            │
│  │                                               │            │
│  │  📦 Cloud/Other:                             │            │
│  │    • Snowflake MCP  ←→ Snowflake            │            │
│  │    • BigQuery MCP   ←→ Google BigQuery      │            │
│  │    • AWS RDS MCP    ←→ AWS Databases        │            │
│  │    • [Your Custom Plugin Here]              │            │
│  └───────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## Extensible Architecture: Adding New Systems

### 🔌 Plugin System Design

Your desktop app needs a **plugin architecture** so you can add:

- New databases (Cassandra, Redis, Neo4j, etc.)
- New enterprise systems (Workday, Zendesk, etc.)
- New AI providers (local models, custom APIs)
- Custom integrations specific to clients

---

## 1. MCP Server Registry (Data Sources)

**Create a plugin registry for all data source connectors:**

```typescript
// apps/desktop-app/src/mcp/registry.ts

export interface MCPServerPlugin {
  id: string;
  name: string;
  type: 'database' | 'api' | 'enterprise' | 'cloud' | 'custom';
  icon: string;
  description: string;

  // MCP server details
  serverCommand: string;
  serverArgs?: string[];

  // Configuration schema
  configSchema: {
    fields: Array<{
      name: string;
      type: 'text' | 'password' | 'number' | 'select';
      label: string;
      required: boolean;
      options?: string[];
    }>;
  };

  // Capabilities
  capabilities: {
    read: boolean;
    write: boolean;
    schema: boolean;
    streaming: boolean;
  };

  // Health check
  healthCheck: (config: any) => Promise<boolean>;
}

export class MCPServerRegistry {
  private plugins: Map<string, MCPServerPlugin> = new Map();

  // Register built-in plugins at startup
  constructor() {
    this.registerBuiltInPlugins();
    this.loadCustomPlugins();
  }

  private registerBuiltInPlugins() {
    // PostgreSQL
    this.register({
      id: 'postgresql',
      name: 'PostgreSQL',
      type: 'database',
      icon: '🐘',
      description: 'Connect to PostgreSQL databases',
      serverCommand: 'node',
      serverArgs: ['node_modules/@modelcontextprotocol/server-postgres/dist/index.js'],
      configSchema: {
        fields: [
          { name: 'host', type: 'text', label: 'Host', required: true },
          { name: 'port', type: 'number', label: 'Port', required: true },
          { name: 'database', type: 'text', label: 'Database', required: true },
          { name: 'username', type: 'text', label: 'Username', required: true },
          { name: 'password', type: 'password', label: 'Password', required: true },
        ],
      },
      capabilities: {
        read: true,
        write: true,
        schema: true,
        streaming: false,
      },
      healthCheck: async config => {
        // Test connection
        return true;
      },
    });

    // MySQL
    this.register({
      id: 'mysql',
      name: 'MySQL',
      type: 'database',
      icon: '🐬',
      description: 'Connect to MySQL databases',
      serverCommand: 'node',
      serverArgs: ['packages/mcp-servers/mysql/dist/index.js'],
      configSchema: {
        fields: [
          { name: 'host', type: 'text', label: 'Host', required: true },
          { name: 'port', type: 'number', label: 'Port', required: true },
          { name: 'database', type: 'text', label: 'Database', required: true },
          { name: 'username', type: 'text', label: 'Username', required: true },
          { name: 'password', type: 'password', label: 'Password', required: true },
        ],
      },
      capabilities: { read: true, write: true, schema: true, streaming: false },
      healthCheck: async config => true,
    });

    // Oracle
    this.register({
      id: 'oracle',
      name: 'Oracle Database',
      type: 'database',
      icon: '🔴',
      description: 'Connect to Oracle databases',
      serverCommand: 'node',
      serverArgs: ['packages/mcp-servers/oracle/dist/index.js'],
      configSchema: {
        fields: [
          { name: 'host', type: 'text', label: 'Host', required: true },
          { name: 'port', type: 'number', label: 'Port', required: true },
          { name: 'serviceName', type: 'text', label: 'Service Name', required: true },
          { name: 'username', type: 'text', label: 'Username', required: true },
          { name: 'password', type: 'password', label: 'Password', required: true },
        ],
      },
      capabilities: { read: true, write: true, schema: true, streaming: false },
      healthCheck: async config => true,
    });

    // Salesforce
    this.register({
      id: 'salesforce',
      name: 'Salesforce',
      type: 'enterprise',
      icon: '☁️',
      description: 'Connect to Salesforce CRM',
      serverCommand: 'node',
      serverArgs: ['packages/mcp-servers/salesforce/dist/index.js'],
      configSchema: {
        fields: [
          { name: 'instanceUrl', type: 'text', label: 'Instance URL', required: true },
          { name: 'clientId', type: 'text', label: 'Client ID', required: true },
          { name: 'clientSecret', type: 'password', label: 'Client Secret', required: true },
          { name: 'username', type: 'text', label: 'Username', required: true },
          { name: 'password', type: 'password', label: 'Password', required: true },
        ],
      },
      capabilities: { read: true, write: true, schema: true, streaming: false },
      healthCheck: async config => true,
    });

    // Add more built-in plugins...
  }

  // Load custom plugins from user directory
  private async loadCustomPlugins() {
    const pluginsDir = path.join(app.getPath('userData'), 'plugins');

    if (!fs.existsSync(pluginsDir)) {
      fs.mkdirSync(pluginsDir, { recursive: true });
      return;
    }

    // Scan for plugin.json files
    const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.plugin.json'));

    for (const file of pluginFiles) {
      try {
        const pluginPath = path.join(pluginsDir, file);
        const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
        this.register(plugin);
      } catch (error) {
        console.error(`Failed to load plugin ${file}:`, error);
      }
    }
  }

  register(plugin: MCPServerPlugin) {
    this.plugins.set(plugin.id, plugin);
  }

  get(id: string): MCPServerPlugin | undefined {
    return this.plugins.get(id);
  }

  list(type?: string): MCPServerPlugin[] {
    const plugins = Array.from(this.plugins.values());
    return type ? plugins.filter(p => p.type === type) : plugins;
  }

  // Search plugins
  search(query: string): MCPServerPlugin[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.plugins.values()).filter(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    );
  }
}
```

---

## 2. AI Provider Registry (Multi-Model Support)

**Create a registry for ALL AI providers, not just main LLMs:**

```typescript
// apps/desktop-app/src/ai/provider-registry.ts

export interface AIProviderPlugin {
  id: string;
  name: string;
  category: 'llm' | 'embedding' | 'image' | 'audio' | 'specialized';
  icon: string;
  description: string;

  // Model configurations
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    costPer1kTokens: number;
    capabilities: string[];
  }>;

  // Authentication
  authType: 'api_key' | 'oauth' | 'none' | 'custom';
  authFields?: Array<{
    name: string;
    type: 'text' | 'password';
    label: string;
  }>;

  // Capabilities
  supportsMCP: boolean;
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsFunctionCalling: boolean;

  // Client implementation
  createClient: (config: any) => Promise<any>;
}

export class AIProviderRegistry {
  private providers: Map<string, AIProviderPlugin> = new Map();

  constructor() {
    this.registerBuiltInProviders();
    this.loadCustomProviders();
  }

  private registerBuiltInProviders() {
    // OpenAI / ChatGPT
    this.register({
      id: 'openai',
      name: 'OpenAI',
      category: 'llm',
      icon: '🤖',
      description: 'GPT-4, GPT-3.5 models',
      models: [
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          contextWindow: 128000,
          costPer1kTokens: 0.01,
          capabilities: ['text', 'code', 'function-calling'],
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          contextWindow: 16000,
          costPer1kTokens: 0.002,
          capabilities: ['text', 'code', 'function-calling'],
        },
      ],
      authType: 'api_key',
      authFields: [{ name: 'apiKey', type: 'password', label: 'API Key' }],
      supportsMCP: true,
      supportsStreaming: true,
      supportsImages: true,
      supportsFunctionCalling: true,
      createClient: async config => {
        const OpenAI = (await import('openai')).default;
        return new OpenAI({ apiKey: config.apiKey });
      },
    });

    // Anthropic / Claude
    this.register({
      id: 'anthropic',
      name: 'Anthropic',
      category: 'llm',
      icon: '🧠',
      description: 'Claude models with MCP support',
      models: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          contextWindow: 200000,
          costPer1kTokens: 0.003,
          capabilities: ['text', 'code', 'mcp', 'function-calling', 'vision'],
        },
      ],
      authType: 'api_key',
      authFields: [{ name: 'apiKey', type: 'password', label: 'API Key' }],
      supportsMCP: true,
      supportsStreaming: true,
      supportsImages: true,
      supportsFunctionCalling: true,
      createClient: async config => {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        return new Anthropic({ apiKey: config.apiKey });
      },
    });

    // Google Gemini
    this.register({
      id: 'google',
      name: 'Google AI',
      category: 'llm',
      icon: '🔷',
      description: 'Gemini models',
      models: [
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          contextWindow: 30000,
          costPer1kTokens: 0.00025,
          capabilities: ['text', 'code', 'vision'],
        },
      ],
      authType: 'api_key',
      authFields: [{ name: 'apiKey', type: 'password', label: 'API Key' }],
      supportsMCP: false,
      supportsStreaming: true,
      supportsImages: true,
      supportsFunctionCalling: true,
      createClient: async config => {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        return new GoogleGenerativeAI(config.apiKey);
      },
    });

    // Ollama (Local)
    this.register({
      id: 'ollama',
      name: 'Ollama',
      category: 'llm',
      icon: '🦙',
      description: 'Local AI models (offline)',
      models: [
        {
          id: 'llama2',
          name: 'Llama 2',
          contextWindow: 4096,
          costPer1kTokens: 0,
          capabilities: ['text', 'code'],
        },
        {
          id: 'codellama',
          name: 'Code Llama',
          contextWindow: 16000,
          costPer1kTokens: 0,
          capabilities: ['code'],
        },
        {
          id: 'mistral',
          name: 'Mistral',
          contextWindow: 8000,
          costPer1kTokens: 0,
          capabilities: ['text', 'code'],
        },
      ],
      authType: 'none',
      supportsMCP: false,
      supportsStreaming: true,
      supportsImages: false,
      supportsFunctionCalling: false,
      createClient: async config => {
        const { Ollama } = await import('ollama');
        return new Ollama({ host: config.host || 'http://localhost:11434' });
      },
    });

    // Cohere
    this.register({
      id: 'cohere',
      name: 'Cohere',
      category: 'llm',
      icon: '🎯',
      description: 'Command models',
      models: [
        {
          id: 'command',
          name: 'Command',
          contextWindow: 4000,
          costPer1kTokens: 0.0015,
          capabilities: ['text', 'code'],
        },
      ],
      authType: 'api_key',
      authFields: [{ name: 'apiKey', type: 'password', label: 'API Key' }],
      supportsMCP: false,
      supportsStreaming: true,
      supportsImages: false,
      supportsFunctionCalling: false,
      createClient: async config => {
        const { CohereClient } = await import('cohere-ai');
        return new CohereClient({ token: config.apiKey });
      },
    });

    // Groq
    this.register({
      id: 'groq',
      name: 'Groq',
      category: 'llm',
      icon: '⚡',
      description: 'Ultra-fast inference',
      models: [
        {
          id: 'mixtral-8x7b',
          name: 'Mixtral 8x7B',
          contextWindow: 32000,
          costPer1kTokens: 0.00027,
          capabilities: ['text', 'code'],
        },
      ],
      authType: 'api_key',
      authFields: [{ name: 'apiKey', type: 'password', label: 'API Key' }],
      supportsMCP: false,
      supportsStreaming: true,
      supportsImages: false,
      supportsFunctionCalling: false,
      createClient: async config => {
        const Groq = (await import('groq-sdk')).default;
        return new Groq({ apiKey: config.apiKey });
      },
    });

    // Azure OpenAI
    this.register({
      id: 'azure-openai',
      name: 'Azure OpenAI',
      category: 'llm',
      icon: '☁️',
      description: 'Enterprise OpenAI via Azure',
      models: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          contextWindow: 8000,
          costPer1kTokens: 0.03,
          capabilities: ['text', 'code', 'function-calling'],
        },
      ],
      authType: 'custom',
      authFields: [
        { name: 'endpoint', type: 'text', label: 'Endpoint URL' },
        { name: 'apiKey', type: 'password', label: 'API Key' },
        { name: 'deployment', type: 'text', label: 'Deployment Name' },
      ],
      supportsMCP: true,
      supportsStreaming: true,
      supportsImages: true,
      supportsFunctionCalling: true,
      createClient: async config => {
        const { AzureOpenAI } = await import('@azure/openai');
        return new AzureOpenAI({
          endpoint: config.endpoint,
          apiKey: config.apiKey,
          deployment: config.deployment,
        });
      },
    });

    // Perplexity
    this.register({
      id: 'perplexity',
      name: 'Perplexity',
      category: 'specialized',
      icon: '🔍',
      description: 'Search-augmented AI',
      models: [
        {
          id: 'pplx-70b-online',
          name: 'Perplexity 70B',
          contextWindow: 4000,
          costPer1kTokens: 0.001,
          capabilities: ['text', 'search', 'citations'],
        },
      ],
      authType: 'api_key',
      authFields: [{ name: 'apiKey', type: 'password', label: 'API Key' }],
      supportsMCP: false,
      supportsStreaming: true,
      supportsImages: false,
      supportsFunctionCalling: false,
      createClient: async config => {
        // Perplexity uses OpenAI-compatible API
        const OpenAI = (await import('openai')).default;
        return new OpenAI({
          apiKey: config.apiKey,
          baseURL: 'https://api.perplexity.ai',
        });
      },
    });

    // HuggingFace (Custom models)
    this.register({
      id: 'huggingface',
      name: 'HuggingFace',
      category: 'specialized',
      icon: '🤗',
      description: 'Access thousands of models',
      models: [
        {
          id: 'custom',
          name: 'Custom Model',
          contextWindow: 2000,
          costPer1kTokens: 0.0001,
          capabilities: ['text'],
        },
      ],
      authType: 'api_key',
      authFields: [
        { name: 'apiKey', type: 'password', label: 'API Key' },
        { name: 'modelId', type: 'text', label: 'Model ID' },
      ],
      supportsMCP: false,
      supportsStreaming: false,
      supportsImages: false,
      supportsFunctionCalling: false,
      createClient: async config => {
        const { HfInference } = await import('@huggingface/inference');
        return new HfInference(config.apiKey);
      },
    });
  }

  private async loadCustomProviders() {
    const providersDir = path.join(app.getPath('userData'), 'ai-providers');

    if (!fs.existsSync(providersDir)) {
      fs.mkdirSync(providersDir, { recursive: true });
      return;
    }

    // Load custom AI provider plugins
    const providerFiles = fs.readdirSync(providersDir).filter(f => f.endsWith('.provider.json'));

    for (const file of providerFiles) {
      try {
        const providerPath = path.join(providersDir, file);
        const provider = JSON.parse(fs.readFileSync(providerPath, 'utf8'));
        this.register(provider);
      } catch (error) {
        console.error(`Failed to load provider ${file}:`, error);
      }
    }
  }

  register(provider: AIProviderPlugin) {
    this.providers.set(provider.id, provider);
  }

  get(id: string): AIProviderPlugin | undefined {
    return this.providers.get(id);
  }

  list(category?: string): AIProviderPlugin[] {
    const providers = Array.from(this.providers.values());
    return category ? providers.filter(p => p.category === category) : providers;
  }

  // Get providers with specific capability
  getByCapability(capability: string): AIProviderPlugin[] {
    return Array.from(this.providers.values()).filter(p =>
      p.models.some(m => m.capabilities.includes(capability))
    );
  }

  // Search providers
  search(query: string): AIProviderPlugin[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.providers.values()).filter(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    );
  }
}
```

---

## 3. Adding New Systems: Step-by-Step Procedure

### Adding a New Database (e.g., Cassandra)

**Step 1: Create MCP Server Plugin**

```bash
mkdir -p packages/mcp-servers/cassandra
cd packages/mcp-servers/cassandra
pnpm init
```

**Step 2: Define Plugin Manifest**

```json
// packages/mcp-servers/cassandra/plugin.json
{
  "id": "cassandra",
  "name": "Apache Cassandra",
  "type": "database",
  "icon": "⚡",
  "description": "Connect to Cassandra NoSQL database",
  "serverCommand": "node",
  "serverArgs": ["dist/index.js"],
  "configSchema": {
    "fields": [
      { "name": "contactPoints", "type": "text", "label": "Contact Points", "required": true },
      { "name": "keyspace", "type": "text", "label": "Keyspace", "required": true },
      { "name": "username", "type": "text", "label": "Username", "required": false },
      { "name": "password", "type": "password", "label": "Password", "required": false }
    ]
  },
  "capabilities": {
    "read": true,
    "write": true,
    "schema": true,
    "streaming": false
  }
}
```

**Step 3: Implement MCP Server**

```typescript
// packages/mcp-servers/cassandra/src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Client as CassandraClient } from 'cassandra-driver';

const server = new Server(
  {
    name: 'cassandra-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: { tools: {} },
  }
);

let client: CassandraClient;

server.setRequestHandler('initialize', async request => {
  client = new CassandraClient({
    contactPoints: process.env.CASSANDRA_CONTACT_POINTS?.split(','),
    localDataCenter: process.env.CASSANDRA_DATACENTER,
    keyspace: process.env.CASSANDRA_KEYSPACE,
  });
  await client.connect();
  return { protocolVersion: '0.1.0' };
});

server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'execute_cql',
        description: 'Execute CQL query',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'string' } },
        },
      },
      {
        name: 'list_tables',
        description: 'List tables in keyspace',
        inputSchema: { type: 'object' },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async request => {
  if (request.params.name === 'execute_cql') {
    const result = await client.execute(request.params.arguments.query);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result.rows),
        },
      ],
    };
  }

  if (request.params.name === 'list_tables') {
    const result = await client.execute(
      `SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?`,
      [client.keyspace]
    );
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result.rows),
        },
      ],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Step 4: Register in Desktop App**

```typescript
// Desktop app automatically discovers it via registry
const registry = new MCPServerRegistry();
const cassandraPlugin = registry.get('cassandra');
// Now available in UI!
```

---

### Adding a New AI Provider (e.g., Local BERT Model)

**Step 1: Create Provider Plugin**

```json
// user-data/ai-providers/local-bert.provider.json
{
  "id": "local-bert",
  "name": "Local BERT",
  "category": "embedding",
  "icon": "🧬",
  "description": "Local BERT embeddings for semantic search",
  "models": [
    {
      "id": "bert-base",
      "name": "BERT Base",
      "contextWindow": 512,
      "costPer1kTokens": 0,
      "capabilities": ["embeddings", "semantic-search"]
    }
  ],
  "authType": "none",
  "supportsMCP": false,
  "supportsStreaming": false,
  "supportsImages": false,
  "supportsFunctionCalling": false,
  "createClient": "require('./bert-client.js')"
}
```

**Step 2: Implement Client**

```typescript
// user-data/ai-providers/bert-client.js
const { pipeline } = require('@xenova/transformers');

module.exports = async function createBertClient(config) {
  const embedder = await pipeline('feature-extraction', 'Xenova/bert-base-uncased');

  return {
    async generateEmbedding(text) {
      const output = await embedder(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    },

    async semanticSearch(query, documents) {
      const queryEmb = await this.generateEmbedding(query);
      const docEmbs = await Promise.all(documents.map(doc => this.generateEmbedding(doc)));

      // Calculate cosine similarity
      const scores = docEmbs.map((docEmb, i) => ({
        document: documents[i],
        score: cosineSimilarity(queryEmb, docEmb),
      }));

      return scores.sort((a, b) => b.score - a.score);
    },
  };
};
```

---

## 4. UI for Plugin Management

**Create a plugin marketplace/manager in your desktop app:**

```typescript
// apps/desktop-app/src/pages/PluginManager.tsx
import React, { useState, useEffect } from 'react';

export function PluginManager() {
  const [mcpPlugins, setMcpPlugins] = useState([]);
  const [aiProviders, setAiProviders] = useState([]);

  useEffect(() => {
    // Load installed plugins
    window.electron.getMCPPlugins().then(setMcpPlugins);
    window.electron.getAIProviders().then(setAiProviders);
  }, []);

  return (
    <div className="plugin-manager">
      <h1>Plugin Manager</h1>

      {/* Data Source Plugins */}
      <section>
        <h2>Data Sources</h2>
        <div className="plugin-grid">
          {mcpPlugins.map(plugin => (
            <PluginCard
              key={plugin.id}
              icon={plugin.icon}
              name={plugin.name}
              description={plugin.description}
              type={plugin.type}
              installed={true}
              onConfigure={() => configurePlugin(plugin)}
            />
          ))}
          <AddPluginCard onAdd={installMCPPlugin} />
        </div>
      </section>

      {/* AI Provider Plugins */}
      <section>
        <h2>AI Providers</h2>
        <div className="plugin-grid">
          {aiProviders.map(provider => (
            <ProviderCard
              key={provider.id}
              icon={provider.icon}
              name={provider.name}
              description={provider.description}
              models={provider.models.length}
              category={provider.category}
              installed={true}
              onConfigure={() => configureProvider(provider)}
            />
          ))}
          <AddPluginCard onAdd={installAIProvider} />
        </div>
      </section>
    </div>
  );
}
```

---

## 5. Configuration-Driven Approach

**All plugins defined in configuration files:**

```yaml
# apps/desktop-app/config/plugins.yaml

data_sources:
  - id: postgresql
    enabled: true
    default_config:
      port: 5432

  - id: mysql
    enabled: true
    default_config:
      port: 3306

  - id: cassandra
    enabled: false # Disabled by default

ai_providers:
  - id: anthropic
    enabled: true
    default_model: claude-3-5-sonnet-20241022

  - id: openai
    enabled: true
    default_model: gpt-4-turbo

  - id: ollama
    enabled: true
    default_model: llama2
    auto_start: true # Auto-start Ollama server
```

---

## Summary: Future-Proof Architecture

### ✅ To Add a New Database/System:

1. Create MCP server package (or use existing community server)
2. Add plugin manifest (JSON file)
3. Registry auto-discovers it
4. Shows up in UI automatically

### ✅ To Add a New AI Provider:

1. Create provider plugin (JSON + client implementation)
2. Add to provider registry
3. Appears in model selector automatically

### ✅ No Code Changes Needed:

- Plugin system handles discovery
- UI dynamically generates connection forms
- Configuration validates via JSON Schema
- Health checks ensure reliability

### ✅ Extensibility:

- **100+ databases** can be added
- **Any AI model** (cloud or local)
- **Custom enterprise systems**
- **User-created plugins**

This architecture means you can support **any data source** and **any AI model** without modifying core code!

---

## Implementation Steps

### Phase 1: Use Existing MCP Servers (Week 1-2)

**For PostgreSQL, MySQL, SQLite:**

```bash
# Install existing MCP servers
pnpm add @modelcontextprotocol/server-postgres
pnpm add @modelcontextprotocol/server-sqlite
pnpm add @modelcontextprotocol/sdk
```

**Desktop app code:**

```typescript
// apps/desktop-app/src/mcp/manager.ts
import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class MCPManager {
  private servers: Map<string, MCPServerInstance> = new Map();

  async connectPostgreSQL(connectionId: string, config: DatabaseConfig) {
    // Spawn PostgreSQL MCP server as child process
    const serverProcess = spawn(
      'node',
      ['node_modules/@modelcontextprotocol/server-postgres/dist/index.js'],
      {
        env: {
          POSTGRES_CONNECTION_STRING: config.connectionString,
        },
      }
    );

    // Connect MCP client to server
    const transport = new StdioClientTransport({
      command: serverProcess,
    });

    const client = new Client(
      {
        name: 'velanova-desktop',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);

    this.servers.set(connectionId, { client, process: serverProcess });
    return client;
  }

  async executeQuery(connectionId: string, query: string) {
    const server = this.servers.get(connectionId);
    if (!server) throw new Error('Connection not found');

    // AI model uses MCP to execute query
    return await server.client.callTool('execute_query', {
      query,
    });
  }

  async listTables(connectionId: string) {
    const server = this.servers.get(connectionId);
    return await server.client.callTool('list_tables', {});
  }

  disconnect(connectionId: string) {
    const server = this.servers.get(connectionId);
    if (server) {
      server.process.kill();
      this.servers.delete(connectionId);
    }
  }
}
```

### Phase 2: Create Custom MCP Servers (Week 3-6)

**For Oracle, SAP HANA, Salesforce, Jira:**

Create custom MCP servers in your monorepo:

```bash
mkdir -p packages/mcp-servers
cd packages/mcp-servers
```

**Structure:**

```
packages/mcp-servers/
├── oracle/
│   ├── package.json
│   ├── src/
│   │   └── index.ts          # Oracle MCP server
│   └── tsconfig.json
├── sap-hana/
│   ├── package.json
│   └── src/
│       └── index.ts          # SAP HANA MCP server
├── salesforce/
│   ├── package.json
│   └── src/
│       └── index.ts          # Salesforce MCP server
└── jira/
    ├── package.json
    └── src/
        └── index.ts          # Jira MCP server
```

**Example: Oracle MCP Server**

```typescript
// packages/mcp-servers/oracle/src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import oracledb from 'oracledb';

const server = new Server(
  {
    name: 'oracle-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let connection: oracledb.Connection;

// Initialize Oracle connection
server.setRequestHandler('initialize', async request => {
  connection = await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
  });
  return { protocolVersion: '0.1.0' };
});

// List tables tool
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'execute_query',
        description: 'Execute SQL query against Oracle database',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
        },
      },
      {
        name: 'list_tables',
        description: 'List all tables in Oracle database',
        inputSchema: { type: 'object' },
      },
      {
        name: 'describe_table',
        description: 'Get schema information for a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' },
          },
        },
      },
    ],
  };
});

// Execute query tool
server.setRequestHandler('tools/call', async request => {
  if (request.params.name === 'execute_query') {
    const { query } = request.params.arguments;
    const result = await connection.execute(query);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result.rows),
        },
      ],
    };
  }

  if (request.params.name === 'list_tables') {
    const result = await connection.execute(
      `SELECT table_name FROM user_tables ORDER BY table_name`
    );
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result.rows),
        },
      ],
    };
  }

  if (request.params.name === 'describe_table') {
    const { tableName } = request.params.arguments;
    const result = await connection.execute(
      `SELECT column_name, data_type, nullable 
       FROM user_tab_columns 
       WHERE table_name = :tableName`,
      [tableName]
    );
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result.rows),
        },
      ],
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Phase 3: AI Integration with MCP (Week 7-8)

**Connect AI models to MCP servers:**

```typescript
// apps/desktop-app/src/ai/mcp-client.ts
import Anthropic from '@anthropic-ai/sdk';
import { MCPManager } from '../mcp/manager';

export class AIWithMCP {
  private anthropic = new Anthropic();
  private mcpManager = new MCPManager();

  async queryDatabase(connectionId: string, naturalLanguageQuery: string) {
    // Connect to database via MCP
    const mcpClient = await this.mcpManager.connectPostgreSQL(connectionId, databaseConfig);

    // Get available tools from MCP server
    const tools = await mcpClient.listTools();

    // Ask Claude to use MCP tools
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: naturalLanguageQuery,
        },
      ],
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      })),
    });

    // Handle tool use
    if (response.stop_reason === 'tool_use') {
      const toolUse = response.content.find(c => c.type === 'tool_use');

      // Execute via MCP
      const result = await mcpClient.callTool(toolUse.name, toolUse.input);

      // Continue conversation with tool result
      const finalResponse = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          { role: 'user', content: naturalLanguageQuery },
          { role: 'assistant', content: response.content },
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: result.content,
              },
            ],
          },
        ],
      });

      return finalResponse;
    }

    return response;
  }
}
```

---

## Docker/Existing MCP Servers

### Using Existing Servers (Don't Reinvent the Wheel!)

**Check these repositories first:**

1. **Official MCP Servers** (Anthropic)
   - https://github.com/modelcontextprotocol/servers
   - PostgreSQL, SQLite, Filesystem, Git, etc.

2. **Community MCP Servers**
   - Search GitHub for "mcp server [database-name]"
   - Many databases already have community implementations

3. **Docker MCP Servers**
   - If someone created a Docker MCP server, you can use it!
   - Run Docker containers from your Electron app
   - Connect via stdio or HTTP transport

**Using Docker MCP Server:**

```typescript
import Docker from 'dockerode';

const docker = new Docker();

// Pull and run existing MCP server from Docker Hub
const container = await docker.createContainer({
  Image: 'community/postgres-mcp-server',
  Env: [`DATABASE_URL=${connectionString}`],
  HostConfig: {
    NetworkMode: 'host',
  },
});

await container.start();

// Connect your MCP client to the container
```

---

## When to Create Custom vs Use Existing

### ✅ Use Existing MCP Servers:

- PostgreSQL → Use `@modelcontextprotocol/server-postgres`
- SQLite → Use `@modelcontextprotocol/server-sqlite`
- MySQL → Check community servers
- MongoDB → Check community servers
- Filesystem operations → Use official filesystem server
- Docker management → Use existing Docker MCP server

### 🔧 Create Custom MCP Servers:

- Oracle Database (if no community server exists)
- SAP HANA (enterprise-specific)
- Custom REST APIs (Salesforce, Jira, etc.)
- Legacy enterprise systems
- Proprietary databases
- Your Express API (create MCP interface!)

---

## Benefits for Your Desktop App

### 1. **Better AI Understanding**

Instead of:

```
User: "Show me all customers in California"
AI: "SELECT * FROM customers WHERE state = 'CA'"
App: Parse, validate, execute
```

With MCP:

```
User: "Show me all customers in California"
AI → MCP: list_tables()
AI → MCP: describe_table('customers')
AI → MCP: execute_query("SELECT * FROM customers WHERE state = 'CA'")
AI: Returns formatted results with explanations
```

### 2. **Multi-Database Queries**

```typescript
// AI can query multiple databases at once via different MCP servers
const salesData = await mcpManager.executeQuery('postgres-sales', query1);
const crmData = await mcpManager.executeQuery('salesforce-crm', query2);
const jiraTickets = await mcpManager.executeQuery('jira-api', query3);

// AI combines results intelligently
```

### 3. **Safe Exploration**

- AI can explore schema without executing dangerous queries
- MCP servers can implement read-only modes
- Sandboxing prevents data corruption

---

## Next Steps

1. **Start Small** (This Week)
   - Install `@modelcontextprotocol/sdk`
   - Test with PostgreSQL MCP server
   - Connect one database via MCP

2. **Expand Coverage** (Week 2-3)
   - Add MySQL, SQLite support
   - Test multi-database scenarios
   - Build MCP manager UI in desktop app

3. **Custom Servers** (Week 4-8)
   - Create Oracle MCP server
   - Create SAP HANA MCP server
   - Create Salesforce/Jira API wrappers

4. **Production Ready** (Week 9-12)
   - Error handling and recovery
   - Credential management
   - Server lifecycle management
   - Performance optimization

---

## Resources

- **MCP Documentation**: https://modelcontextprotocol.io
- **Official Servers**: https://github.com/modelcontextprotocol/servers
- **SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **Community Servers**: Search "mcp server" on GitHub
- **Anthropic Guide**: https://docs.anthropic.com/claude/docs/model-context-protocol

---

## Decision: Should You Use MCP?

**✅ YES, absolutely!**

MCP is **exactly what you need** for your desktop app. It will:

- Make AI interactions more reliable
- Provide better schema understanding
- Enable multi-database queries
- Standardize your architecture
- Future-proof your app (MCP is gaining adoption)

Start with existing servers, create custom ones only when needed.
