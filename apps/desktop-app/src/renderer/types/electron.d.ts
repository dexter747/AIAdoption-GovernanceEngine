// Type definitions for Electron IPC API exposed via preload script
// This is the single source of truth for window.electron types

export interface MCPConnection {
  id: string;
  name: string;
  type: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  tokens?: number;
  cost?: number;
}

export interface ChatConversation {
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

export interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  models: AIModel[];
}

export interface AIModel {
  id: string;
  name: string;
  contextWindow: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  description?: string;
}

export interface ExpressResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthData {
  user: User;
  session?: any;
  accessToken: string;
  expiresAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  avatar?: string;
}

export interface ElectronAPI {
  // Auth API
  auth: {
    check: () => Promise<AuthData | null>;
    login: () => Promise<{ opened: boolean }>;
    logout: () => Promise<{ success: boolean }>;
    getUser: () => Promise<User | null>;
    onSuccess: (callback: (data: AuthData) => void) => void;
    onError: (callback: (error: string) => void) => void;
  };

  // Connection API
  connection: {
    test: (config: any) => Promise<any>;
    connect: (config: any) => Promise<any>;
    disconnect: (id: string) => Promise<any>;
    list: () => Promise<any[]>;
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
    // New MCP Client SDK methods
    connect: (config: { id: string; type: string; connectionString: string; name: string }) => 
      Promise<{ success: boolean; error?: string }>;
    disconnect: (connectionId: string) => Promise<{ success: boolean }>;
    query: (connectionId: string, sql: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    callTool: (connectionId: string, toolName: string, args: any) => 
      Promise<{ success: boolean; data?: any; error?: string }>;
    listTables: (connectionId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    getTableSchema: (connectionId: string, tableName: string) => 
      Promise<{ success: boolean; data?: any; error?: string }>;
    getTools: (connectionId: string) => Promise<Array<{ name: string; description: string; inputSchema: any }> | null>;
    getAllToolsForAI: () => Promise<Array<{ name: string; description: string; inputSchema: any }>>;
    getStatus: () => Promise<{ connections: string[]; activeCount: number }>;
    isConnected: (connectionId: string) => Promise<boolean>;
    disconnectAll: () => Promise<{ success: boolean }>;
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
    validateLicense: (licenseKey: string, deviceId: string, deviceInfo?: any) => Promise<ExpressResponse<{
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
    query: (prompt: string, options: any) => Promise<any>;
    getModels: () => Promise<any[]>;
    getCost: () => Promise<any>;
  };

  // License API
  license: {
    validate: (key: string) => Promise<any>;
    get: () => Promise<any>;
    refresh: () => Promise<any>;
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
    checkUpdates: () => Promise<any>;
    openExternal: (url: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
