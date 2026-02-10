import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Auth API
  auth: {
    check: () => ipcRenderer.invoke('auth:check'),
    login: () => ipcRenderer.invoke('auth:login'),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getUser: () => ipcRenderer.invoke('auth:getUser'),
    refresh: () => ipcRenderer.invoke('auth:refresh'),
    onSuccess: (callback: (data: any) => void) => {
      const handler = (_event: any, data: any) => callback(data);
      ipcRenderer.on('auth:success', handler);
      return () => { ipcRenderer.removeListener('auth:success', handler); };
    },
    onError: (callback: (error: string) => void) => {
      const handler = (_event: any, error: string) => callback(error);
      ipcRenderer.on('auth:error', handler);
      return () => { ipcRenderer.removeListener('auth:error', handler); };
    },
  },

  // Connection API
  connection: {
    test: (config: any) => ipcRenderer.invoke('connection:test', config),
    connect: (config: any) => ipcRenderer.invoke('connection:connect', config),
    disconnect: (id: string) => ipcRenderer.invoke('connection:disconnect', id),
    list: () => ipcRenderer.invoke('connection:list'),
  },
  
  // AI Query API
  ai: {
    query: (prompt: string, options: any) => ipcRenderer.invoke('ai:query', prompt, options),
    getModels: () => ipcRenderer.invoke('ai:get-models'),
    getCost: () => ipcRenderer.invoke('ai:get-cost'),
  },
  
  // License API
  license: {
    validate: (key: string) => ipcRenderer.invoke('license:validate', key),
    get: () => ipcRenderer.invoke('license:get'),
    refresh: () => ipcRenderer.invoke('license:refresh'),
  },
  
  // Settings API
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:get-all'),
  },
  
  // System API
  system: {
    getVersion: () => ipcRenderer.invoke('system:get-version'),
    checkUpdates: () => ipcRenderer.invoke('system:check-updates'),
    openExternal: (url: string) => ipcRenderer.invoke('system:open-external', url),
  },

  // Modern UI API (consolidated)
  api: {
    getUserConnections: () => ipcRenderer.invoke('user:get-connections'),
    testConnection: (connectionId: string) => ipcRenderer.invoke('connection:test-by-id', connectionId),
    deleteConnection: (connectionId: string) => ipcRenderer.invoke('connection:delete', connectionId),
    getAvailableModels: () => ipcRenderer.invoke('ai:get-models'),
    getChatSessions: () => ipcRenderer.invoke('chat:get-sessions'),
    chat: (params: { messages: any[]; model: string; stream?: boolean }) => ipcRenderer.invoke('ai:chat', params),
    queryWithMCP: (params: { connectionId: string; query: string; model: string }) => ipcRenderer.invoke('mcp:query-with-ai', params),
    saveChatSession: (session: any) => ipcRenderer.invoke('chat:save-session', session),
    getSubscription: () => ipcRenderer.invoke('subscription:get'),
    getPaymentHistory: () => ipcRenderer.invoke('payments:get-history'),
    createCheckout: (params: { plan: string }) => ipcRenderer.invoke('payments:create-checkout', params),
    cancelSubscription: () => ipcRenderer.invoke('subscription:cancel'),
    reactivateSubscription: () => ipcRenderer.invoke('subscription:reactivate'),
    getUserProfile: () => ipcRenderer.invoke('user:get-profile'),
    getUserPreferences: () => ipcRenderer.invoke('user:get-preferences'),
    updateUserProfile: (profile: any) => ipcRenderer.invoke('user:update-profile', profile),
    updateUserPreferences: (preferences: any) => ipcRenderer.invoke('user:update-preferences', preferences),
    uploadAvatar: (formData: any) => ipcRenderer.invoke('user:upload-avatar', formData),
    getAPIKeys: () => ipcRenderer.invoke('api-keys:get-all'),
    addAPIKey: (key: any) => ipcRenderer.invoke('api-keys:add', key),
    updateAPIKey: (key: any) => ipcRenderer.invoke('api-keys:update', key),
    deleteAPIKey: (keyId: string) => ipcRenderer.invoke('api-keys:delete', keyId),
  },

  // MCP Connection API (Legacy manager)
  mcp: {
    addConnection: (config: any) => ipcRenderer.invoke('mcp:add-connection', config),
    enableConnection: (id: string) => ipcRenderer.invoke('mcp:enable-connection', id),
    disableConnection: (id: string) => ipcRenderer.invoke('mcp:disable-connection', id),
    testConnection: (id: string) => ipcRenderer.invoke('mcp:test-connection', id),
    getAllConnections: () => ipcRenderer.invoke('mcp:get-all-connections'),
    getConnection: (id: string) => ipcRenderer.invoke('mcp:get-connection', id),
    updateConnection: (id: string, updates: any) => ipcRenderer.invoke('mcp:update-connection', id, updates),
    deleteConnection: (id: string) => ipcRenderer.invoke('mcp:delete-connection', id),
    getAvailableServers: () => ipcRenderer.invoke('mcp:get-available-servers'),
    checkDocker: () => ipcRenderer.invoke('mcp:check-docker'),
    
    // New MCP Client SDK methods
    connect: (config: { id: string; type: string; connectionString: string; name: string; connectionParams?: Record<string, string> }) => 
      ipcRenderer.invoke('mcp:client-connect', config),
    disconnect: (connectionId: string) => ipcRenderer.invoke('mcp:client-disconnect', connectionId),
    query: (connectionId: string, sql: string) => ipcRenderer.invoke('mcp:query', connectionId, sql),
    callTool: (connectionId: string, toolName: string, args: any) => 
      ipcRenderer.invoke('mcp:call-tool', connectionId, toolName, args),
    listTables: (connectionId: string) => ipcRenderer.invoke('mcp:list-tables', connectionId),
    getTableSchema: (connectionId: string, tableName: string) => 
      ipcRenderer.invoke('mcp:get-table-schema', connectionId, tableName),
    getTools: (connectionId: string) => ipcRenderer.invoke('mcp:get-tools', connectionId),
    getAllToolsForAI: () => ipcRenderer.invoke('mcp:get-all-tools-for-ai'),
    getStatus: () => ipcRenderer.invoke('mcp:get-status'),
    isConnected: (connectionId: string) => ipcRenderer.invoke('mcp:is-connected', connectionId),
    disconnectAll: () => ipcRenderer.invoke('mcp:disconnect-all'),
    generateSchemaContext: (connectionId: string, connectionName: string) => 
      ipcRenderer.invoke('mcp:generate-schema-context', connectionId, connectionName),
  },

  // Chat History API
  chat: {
    createConversation: (data: any) => ipcRenderer.invoke('chat:create-conversation', data),
    addMessage: (conversationId: string, message: any) => ipcRenderer.invoke('chat:add-message', conversationId, message),
    getConversation: (id: string) => ipcRenderer.invoke('chat:get-conversation', id),
    getAllConversations: (options?: any) => ipcRenderer.invoke('chat:get-all-conversations', options),
    updateConversation: (id: string, updates: any) => ipcRenderer.invoke('chat:update-conversation', id, updates),
    deleteConversation: (id: string) => ipcRenderer.invoke('chat:delete-conversation', id),
    clearConversation: (id: string) => ipcRenderer.invoke('chat:clear-conversation', id),
    searchConversations: (query: string) => ipcRenderer.invoke('chat:search-conversations', query),
    getStats: () => ipcRenderer.invoke('chat:get-stats'),
    exportConversation: (id: string) => ipcRenderer.invoke('chat:export-conversation', id),
    importConversation: (json: string) => ipcRenderer.invoke('chat:import-conversation', json),
    togglePin: (id: string) => ipcRenderer.invoke('chat:toggle-pin', id),
    toggleArchive: (id: string) => ipcRenderer.invoke('chat:toggle-archive', id),
    getRecent: (limit?: number) => ipcRenderer.invoke('chat:get-recent', limit),
    cleanupOld: (daysOld?: number) => ipcRenderer.invoke('chat:cleanup-old', daysOld),
  },

  // Express API
  express: {
    checkHealth: () => ipcRenderer.invoke('express:check-health'),
    getProviders: () => ipcRenderer.invoke('express:get-providers'),
    queryAI: (request: any) => ipcRenderer.invoke('express:query-ai', request),
    validateLicense: (licenseKey: string, deviceId: string, deviceInfo?: any) => 
      ipcRenderer.invoke('express:validate-license', licenseKey, deviceId, deviceInfo),
    
    // User API Keys (BYOK)
    getProvidersList: () => ipcRenderer.invoke('express:get-providers-list'),
    getUserApiKeys: () => ipcRenderer.invoke('express:get-user-api-keys'),
    getUserApiKeyByProvider: (provider: string) => ipcRenderer.invoke('express:get-user-api-key-by-provider', provider),
    addUserApiKey: (provider: string, apiKey: string, keyName?: string, config?: any) => 
      ipcRenderer.invoke('express:add-user-api-key', provider, apiKey, keyName, config),
    updateUserApiKey: (keyId: string, updates: any) => ipcRenderer.invoke('express:update-user-api-key', keyId, updates),
    deleteUserApiKey: (keyId: string) => ipcRenderer.invoke('express:delete-user-api-key', keyId),
    testUserApiKey: (keyId: string) => ipcRenderer.invoke('express:test-user-api-key', keyId),
    
    // User Database Connections
    getConnectionTypes: () => ipcRenderer.invoke('express:get-connection-types'),
    getUserConnections: () => ipcRenderer.invoke('express:get-user-connections'),
    getUserConnection: (connectionId: string) => ipcRenderer.invoke('express:get-user-connection', connectionId),
    addUserConnection: (name: string, connectionType: string, config: any, mcpServerType?: string) => 
      ipcRenderer.invoke('express:add-user-connection', name, connectionType, config, mcpServerType),
    updateUserConnection: (connectionId: string, updates: any) => ipcRenderer.invoke('express:update-user-connection', connectionId, updates),
    deleteUserConnection: (connectionId: string) => ipcRenderer.invoke('express:delete-user-connection', connectionId),
    testUserConnection: (connectionId: string) => ipcRenderer.invoke('express:test-user-connection', connectionId),
    startMCPServer: (connectionId: string) => ipcRenderer.invoke('express:start-mcp-server', connectionId),
    
    // Usage & Subscriptions
    getUsage: (userId: string, options?: any) => ipcRenderer.invoke('express:get-usage', userId, options),
    logUsage: (data: any) => ipcRenderer.invoke('express:log-usage', data),
    getSubscription: (userId: string) => ipcRenderer.invoke('express:get-subscription', userId),
    
    // Auth
    setAuth: (userId: string, licenseKey: string, authToken?: string) => ipcRenderer.invoke('express:set-auth', userId, licenseKey, authToken),
    setAuthToken: (token: string) => ipcRenderer.invoke('express:set-auth-token', token),
    updateConfig: (config: any) => ipcRenderer.invoke('express:update-config', config),
  },

  // LLM Context API
  context: {
    // CRUD operations
    create: (data: {
      name: string;
      type: string;
      content: string;
      description?: string;
      tags?: string[];
      priority?: number;
      autoInclude?: boolean;
      connectionId?: string;
      projectId?: string;
      maxTokens?: number;
    }) => ipcRenderer.invoke('context:create', data),
    get: (id: string) => ipcRenderer.invoke('context:get', id),
    update: (id: string, updates: any) => ipcRenderer.invoke('context:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('context:delete', id),
    list: (options?: {
      type?: string;
      tags?: string[];
      isActive?: boolean;
      autoInclude?: boolean;
      connectionId?: string;
      projectId?: string;
      query?: string;
    }) => ipcRenderer.invoke('context:list', options),
    
    // Context compilation for LLM
    compile: (options: {
      config: { maxTokens: number; reservedForResponse: number; reservedForConversation: number };
      connectionId?: string;
      projectId?: string;
      additionalContextIds?: string[];
      excludeIds?: string[];
    }) => ipcRenderer.invoke('context:compile', options),
    
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
    }) => ipcRenderer.invoke('context:create-schema', data),
    
    // Knowledge base
    importFile: (options?: { name?: string; tags?: string[]; chunkSize?: number }) => 
      ipcRenderer.invoke('context:import-file', options),
    importFilePath: (filePath: string, options?: { name?: string; tags?: string[]; chunkSize?: number }) => 
      ipcRenderer.invoke('context:import-file-path', filePath, options),
    
    // Memory
    createMemory: (data: { conversationId: string; summary: string; keyFacts: string[] }) => 
      ipcRenderer.invoke('context:create-memory', data),
    
    // Statistics & utilities
    getStats: () => ipcRenderer.invoke('context:stats'),
    exportAll: () => ipcRenderer.invoke('context:export'),
    importJson: (options?: { overwrite?: boolean }) => ipcRenderer.invoke('context:import-json', options),
    getTemplates: () => ipcRenderer.invoke('context:get-templates'),
    
    // Toggles
    toggleActive: (id: string) => ipcRenderer.invoke('context:toggle-active', id),
    toggleAutoInclude: (id: string) => ipcRenderer.invoke('context:toggle-auto-include', id),
  },
});
