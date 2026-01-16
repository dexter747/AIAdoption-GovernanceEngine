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
});
