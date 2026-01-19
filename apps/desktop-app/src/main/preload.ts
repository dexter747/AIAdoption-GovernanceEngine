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
    onSuccess: (callback: (data: any) => void) => {
      ipcRenderer.on('auth:success', (_event, data) => callback(data));
    },
    onError: (callback: (error: string) => void) => {
      ipcRenderer.on('auth:error', (_event, error) => callback(error));
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

  // MCP Connection API
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
    getUserApiKeys: (userId: string) => ipcRenderer.invoke('express:get-user-api-keys', userId),
    addUserApiKey: (userId: string, provider: string, apiKey: string, keyName?: string) => 
      ipcRenderer.invoke('express:add-user-api-key', userId, provider, apiKey, keyName),
    getUsage: (userId: string, options?: any) => ipcRenderer.invoke('express:get-usage', userId, options),
    logUsage: (data: any) => ipcRenderer.invoke('express:log-usage', data),
    getSubscription: (userId: string) => ipcRenderer.invoke('express:get-subscription', userId),
    setAuth: (userId: string, licenseKey: string) => ipcRenderer.invoke('express:set-auth', userId, licenseKey),
    updateConfig: (config: any) => ipcRenderer.invoke('express:update-config', config),
  },
});
