// Type definitions for Electron IPC API exposed via preload script

// =============================================================================
// LLM CONTEXT TYPES
// =============================================================================

type ContextType = 
  | 'system_prompt'
  | 'database_schema'
  | 'knowledge_base'
  | 'memory_summary'
  | 'project'
  | 'template';

interface LLMContext {
  id: string;
  name: string;
  type: ContextType;
  content: string;
  description?: string;
  tags: string[];
  tokenCount: number;
  charCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
  isActive: boolean;
  priority: number;
  maxTokens?: number;
  autoInclude: boolean;
  connectionId?: string;
  projectId?: string;
  sourceFile?: string;
}

interface ContextSearchOptions {
  type?: ContextType;
  tags?: string[];
  isActive?: boolean;
  autoInclude?: boolean;
  connectionId?: string;
  projectId?: string;
  query?: string;
}

interface ContextWindowConfig {
  maxTokens: number;
  reservedForResponse: number;
  reservedForConversation: number;
}

interface CompiledContext {
  contexts: LLMContext[];
  totalTokens: number;
  systemPrompt: string;
  truncated: boolean;
}

interface ContextStats {
  totalContexts: number;
  byType: Record<ContextType, number>;
  totalTokens: number;
  totalChars: number;
  mostUsed: LLMContext[];
}

// =============================================================================
// OTHER TYPES
// =============================================================================

interface MCPConnection {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
  error?: string;
  mcpServerType: 'docker' | 'npm' | 'custom';
  mcpServerInfo?: {
    image?: string;
    package?: string;
    command?: string;
  };
}

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  tokens?: number;
  cost?: number;
}

interface ChatConversation {
  id: string;
  title: string;
  connectionId?: string;
  connectionName?: string;
  provider: string;
  model: string;
  messages: ChatMessage[];
  totalTokens: number;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  archived: boolean;
}

interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  models: AIModel[];
}

interface AIModel {
  id: string;
  name: string;
  contextWindow: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  description?: string;
}

interface ExpressResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ElectronAPI {
  // Auth API
  auth: {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    getSession: () => Promise<{ user: any } | null>;
  };

  // Connection API
  connection: {
    addConnection: (config: any) => Promise<{ success: boolean; connection?: any; error?: string }>;
    testConnection: (id: string) => Promise<{ success: boolean; error?: string }>;
    getAllConnections: () => Promise<any[]>;
    deleteConnection: (id: string) => Promise<{ success: boolean; error?: string }>;
    updateConnection: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  };

  // MCP API
  mcp: {
    addConnection: (config: Partial<MCPConnection>) => Promise<MCPConnection>;
    enableConnection: (id: string) => Promise<MCPConnection>;
    disableConnection: (id: string) => Promise<MCPConnection>;
    testConnection: (id: string) => Promise<{ success: boolean; error?: string }>;
    getAllConnections: () => Promise<MCPConnection[]>;
    getConnection: (id: string) => Promise<MCPConnection | null>;
    updateConnection: (id: string, updates: Partial<MCPConnection>) => Promise<MCPConnection>;
    deleteConnection: (id: string) => Promise<void>;
    getAvailableServers: () => Promise<any[]>;
    checkDocker: () => Promise<boolean>;
    
    // MCP Client SDK methods
    connect: (config: { id: string; type: string; connectionString: string; name: string }) => 
      Promise<{ success: boolean; tools?: any[]; status?: string; error?: string }>;
    disconnect: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
    query: (connectionId: string, sql: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    callTool: (connectionId: string, toolName: string, args: any) => 
      Promise<{ success: boolean; data?: any; error?: string }>;
    listTables: (connectionId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
    getTableSchema: (connectionId: string, tableName: string) => 
      Promise<{ success: boolean; data?: any; error?: string }>;
    getTools: (connectionId: string) => Promise<any[]>;
    getAllToolsForAI: () => Promise<any[]>;
    getStatus: () => Promise<any>;
    isConnected: (connectionId: string) => Promise<boolean>;
    disconnectAll: () => Promise<{ success: boolean }>;
    generateSchemaContext: (connectionId: string, connectionName: string) => 
      Promise<{ success: boolean; context?: LLMContext; error?: string }>;
  };

  // Chat API
  chat: {
    createConversation: (options: {
      connectionId?: string;
      connectionName?: string;
      provider: string;
      model: string;
      initialMessage?: string;
    }) => Promise<ChatConversation>;
    addMessage: (conversationId: string, message: Partial<ChatMessage>) => Promise<ChatMessage>;
    getConversation: (id: string) => Promise<ChatConversation>;
    getAllConversations: (options?: {
      includeArchived?: boolean;
      pinnedOnly?: boolean;
      connectionId?: string;
      provider?: string;
      limit?: number;
    }) => Promise<ChatConversation[]>;
    updateConversation: (id: string, updates: Partial<ChatConversation>) => Promise<ChatConversation>;
    deleteConversation: (id: string) => Promise<void>;
    clearConversation: (id: string) => Promise<void>;
    searchConversations: (query: string) => Promise<ChatConversation[]>;
    getStats: () => Promise<{
      totalConversations: number;
      totalMessages: number;
      totalTokens: number;
      totalCost: number;
      costByProvider: Record<string, number>;
    }>;
    exportConversation: (id: string) => Promise<string>;
    importConversation: (json: string) => Promise<ChatConversation>;
    togglePin: (id: string) => Promise<void>;
    toggleArchive: (id: string) => Promise<void>;
    getRecent: (limit?: number) => Promise<ChatConversation[]>;
    cleanupOld: (daysOld?: number) => Promise<number>;
  };

  // Express API
  express: {
    checkHealth: () => Promise<ExpressResponse<{ status: string; timestamp: string }>>;
    getProviders: () => Promise<ExpressResponse<AIProvider[]>>;
    queryAI: (request: {
      userId: string;
      licenseId: string;
      provider: string;
      model: string;
      messages: { role: string; content: string }[];
      temperature?: number;
      maxTokens?: number;
      connectionId?: string;
    }) => Promise<ExpressResponse<{
      response: string;
      usage?: {
        tokensUsed: number;
        cost: number;
      };
    }>>;
    validateLicense: (licenseKey: string, deviceId: string, deviceInfo: any) => Promise<ExpressResponse<{
      valid: boolean;
      license?: any;
    }>>;
    
    // User API Keys (BYOK)
    getProvidersList: () => Promise<any[]>;
    getUserApiKeys: () => Promise<any[]>;
    getUserApiKeyByProvider: (provider: string) => Promise<any>;
    addUserApiKey: (provider: string, apiKey: string, keyName?: string, config?: any) => Promise<any>;
    updateUserApiKey: (keyId: string, updates: any) => Promise<any>;
    deleteUserApiKey: (keyId: string) => Promise<void>;
    testUserApiKey: (keyId: string) => Promise<{ success: boolean; message?: string }>;
    
    // User Database Connections
    getConnectionTypes: () => Promise<any[]>;
    getUserConnections: () => Promise<any[]>;
    getUserConnection: (connectionId: string) => Promise<any>;
    addUserConnection: (name: string, connectionType: string, config: any, mcpServerType?: string) => Promise<any>;
    updateUserConnection: (connectionId: string, updates: any) => Promise<any>;
    deleteUserConnection: (connectionId: string) => Promise<void>;
    testUserConnection: (connectionId: string) => Promise<{ success: boolean; message?: string; details?: any }>;
    startMCPServer: (connectionId: string) => Promise<any>;
    
    // Usage & Subscriptions
    getUsage: (userId: string, options?: {
      startDate?: string;
      endDate?: string;
      provider?: string;
    }) => Promise<ExpressResponse<any[]>>;
    logUsage: (data: {
      userId: string;
      licenseId: string;
      eventType: string;
      provider: string;
      model: string;
      tokensUsed: number;
      cost: number;
      metadata?: any;
    }) => Promise<ExpressResponse<void>>;
    getSubscription: (userId: string) => Promise<ExpressResponse<any>>;
    
    // Auth
    setAuth: (userId: string, licenseKey: string, authToken?: string) => Promise<void>;
    setAuthToken: (token: string) => Promise<void>;
    updateConfig: (config: { baseURL?: string }) => Promise<void>;
  };

  // AI API
  ai: {
    queryWithContext: (
      prompt: string,
      connectionId: string,
      options: any
    ) => Promise<{ success: boolean; response?: string; error?: string }>;
    streamQuery: (prompt: string, connectionId: string, options: any) => Promise<any>;
  };

  // License API
  license: {
    validate: (key: string) => Promise<{
      valid: boolean;
      tier?: 'free' | 'starter' | 'pro' | 'enterprise';
      expiresAt?: string | null;
      features?: string[];
      maxMachines?: number;
      activeMachines?: number;
      reason?: string;
      error?: string;
    }>;
    get: () => Promise<{
      id: string;
      key: string;
      activatedAt?: string;
    } | null>;
    refresh: () => Promise<{
      valid: boolean;
      license?: {
        tier: 'free' | 'starter' | 'pro' | 'enterprise';
        expiresAt?: string | null;
        features?: string[];
      };
    }>;
    activate: (key: string) => Promise<{ success: boolean; error?: string }>;
    getStatus: () => Promise<{ active: boolean; details?: any }>;
  };

  // Settings API
  settings: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    getAll: () => Promise<Record<string, any>>;
  };

  // System API
  system: {
    getVersion: () => Promise<string>;
    getPlatform: () => Promise<string>;
    openExternal: (url: string) => Promise<void>;
    showItemInFolder: (path: string) => Promise<void>;
  };

  // LLM Context API
  context: {
    // CRUD operations
    create: (data: {
      name: string;
      type: ContextType;
      content: string;
      description?: string;
      tags?: string[];
      priority?: number;
      autoInclude?: boolean;
      connectionId?: string;
      projectId?: string;
      maxTokens?: number;
    }) => Promise<LLMContext>;
    get: (id: string) => Promise<LLMContext | undefined>;
    update: (id: string, updates: Partial<LLMContext>) => Promise<LLMContext>;
    delete: (id: string) => Promise<{ success: boolean }>;
    list: (options?: ContextSearchOptions) => Promise<LLMContext[]>;
    
    // Context compilation
    compile: (options: {
      config: ContextWindowConfig;
      connectionId?: string;
      projectId?: string;
      additionalContextIds?: string[];
      excludeIds?: string[];
    }) => Promise<CompiledContext>;
    
    // Schema management
    createSchema: (data: {
      connectionId: string;
      connectionName: string;
      tables: Array<{
        name: string;
        schema?: string;
        columns: Array<{
          name: string;
          type: string;
          nullable: boolean;
          primaryKey?: boolean;
          foreignKey?: { table: string; column: string };
        }>;
      }>;
    }) => Promise<LLMContext>;
    
    // Knowledge base
    importFile: (options?: { name?: string; tags?: string[]; chunkSize?: number }) => 
      Promise<{ canceled: boolean; contexts: LLMContext[] }>;
    importFilePath: (filePath: string, options?: { name?: string; tags?: string[]; chunkSize?: number }) => 
      Promise<LLMContext[]>;
    
    // Memory
    createMemory: (data: { conversationId: string; summary: string; keyFacts: string[] }) => 
      Promise<LLMContext>;
    
    // Statistics & utilities
    getStats: () => Promise<ContextStats>;
    exportAll: () => Promise<{ success?: boolean; canceled?: boolean; path?: string }>;
    importJson: (options?: { overwrite?: boolean }) => Promise<{ canceled: boolean; count: number }>;
    getTemplates: () => Promise<Array<Omit<LLMContext, 'id' | 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'usageCount' | 'charCount' | 'tokenCount'>>>;
    
    // Toggles
    toggleActive: (id: string) => Promise<LLMContext>;
    toggleAutoInclude: (id: string) => Promise<LLMContext>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
