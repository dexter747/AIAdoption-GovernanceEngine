// Type definitions for Electron IPC API exposed via preload script

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
    getUserApiKeys: (userId: string) => Promise<ExpressResponse<any[]>>;
    addUserApiKey: (userId: string, provider: string, apiKey: string, name?: string) => Promise<ExpressResponse<any>>;
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
    setAuth: (token: string) => Promise<void>;
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
    validate: (licenseKey: string) => Promise<{ valid: boolean; details?: any; error?: string }>;
    getStatus: () => Promise<{ active: boolean; details?: any }>;
    activate: (licenseKey: string) => Promise<{ success: boolean; error?: string }>;
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
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
