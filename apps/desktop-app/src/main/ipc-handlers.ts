import { ipcMain } from 'electron';
import { ConnectionManager } from './data/connection-manager';
import { AIRouter } from './ai/ai-router';
import { LicenseManager } from './license/license-manager';
import { SettingsManager } from './data/settings-manager';
import { mcpConnectionManager } from './mcp/mcp-manager';
import { mcpClient } from './mcp/mcp-client';
import { chatHistoryManager } from './chat/chat-history-manager';
import { expressClient } from './api/express-client';
import { app, shell } from 'electron';

const connectionManager = new ConnectionManager();
const aiRouter = new AIRouter();
const licenseManager = new LicenseManager();
const settingsManager = new SettingsManager();

// Connection handlers
ipcMain.handle('connection:test', async (_event, config) => {
  return await connectionManager.testConnection(config);
});

ipcMain.handle('connection:connect', async (_event, config) => {
  return await connectionManager.connect(config);
});

ipcMain.handle('connection:disconnect', async (_event, id) => {
  return await connectionManager.disconnect(id);
});

ipcMain.handle('connection:list', async () => {
  return await connectionManager.listConnections();
});

// AI handlers
ipcMain.handle('ai:query', async (_event, prompt, options) => {
  return await aiRouter.query(prompt, options);
});

ipcMain.handle('ai:get-models', async () => {
  return await aiRouter.getAvailableModels();
});

ipcMain.handle('ai:get-cost', async () => {
  return await aiRouter.getTotalCost();
});

// License handlers
ipcMain.handle('license:validate', async (_event, key) => {
  return await licenseManager.validate(key);
});

ipcMain.handle('license:get', async () => {
  return await licenseManager.getLicense();
});

ipcMain.handle('license:refresh', async () => {
  return await licenseManager.refreshValidation();
});

// Settings handlers
ipcMain.handle('settings:get', async (_event, key) => {
  return await settingsManager.get(key);
});

ipcMain.handle('settings:set', async (_event, key, value) => {
  return await settingsManager.set(key, value);
});

ipcMain.handle('settings:get-all', async () => {
  return await settingsManager.getAll();
});

// System handlers
ipcMain.handle('system:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('system:check-updates', async () => {
  // Auto-updater logic will go here
  return { available: false };
});

ipcMain.handle('system:open-external', async (_event, url) => {
  await shell.openExternal(url);
  return true;
});
// =============================================================================
// MCP CONNECTION HANDLERS
// =============================================================================

ipcMain.handle('mcp:add-connection', async (_event, config) => {
  return await mcpConnectionManager.addConnection(config);
});

ipcMain.handle('mcp:enable-connection', async (_event, id) => {
  return await mcpConnectionManager.enableConnection(id);
});

ipcMain.handle('mcp:disable-connection', async (_event, id) => {
  return await mcpConnectionManager.disableConnection(id);
});

ipcMain.handle('mcp:test-connection', async (_event, id) => {
  return await mcpConnectionManager.testConnection(id);
});

ipcMain.handle('mcp:get-all-connections', async () => {
  return mcpConnectionManager.getAllConnections();
});

ipcMain.handle('mcp:get-connection', async (_event, id) => {
  return mcpConnectionManager.getConnection(id);
});

ipcMain.handle('mcp:update-connection', async (_event, id, updates) => {
  return await mcpConnectionManager.updateConnection(id, updates);
});

ipcMain.handle('mcp:delete-connection', async (_event, id) => {
  return await mcpConnectionManager.deleteConnection(id);
});

ipcMain.handle('mcp:get-available-servers', async () => {
  return mcpConnectionManager.getAvailableMCPServers();
});

ipcMain.handle('mcp:check-docker', async () => {
  return await mcpConnectionManager.checkDockerAvailable();
});

// =============================================================================
// MCP CLIENT HANDLERS (Real MCP SDK Implementation)
// =============================================================================

// Connect to database via MCP
ipcMain.handle('mcp:client-connect', async (_event, config: {
  id: string;
  type: string;
  connectionString: string;
  name: string;
}) => {
  try {
    const result = await mcpClient.connect(config as any);
    return { 
      success: true, 
      tools: result.tools,
      status: result.status 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Disconnect MCP client
ipcMain.handle('mcp:client-disconnect', async (_event, connectionId: string) => {
  try {
    await mcpClient.disconnect(connectionId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Execute database query via MCP
ipcMain.handle('mcp:query', async (_event, connectionId: string, sql: string) => {
  try {
    const result = await mcpClient.query(connectionId, sql);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Call any MCP tool
ipcMain.handle('mcp:call-tool', async (_event, connectionId: string, toolName: string, args: any) => {
  try {
    const result = await mcpClient.callTool(connectionId, toolName, args);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// List tables in database
ipcMain.handle('mcp:list-tables', async (_event, connectionId: string) => {
  try {
    const result = await mcpClient.listTables(connectionId);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Get table schema
ipcMain.handle('mcp:get-table-schema', async (_event, connectionId: string, tableName: string) => {
  try {
    const result = await mcpClient.getTableSchema(connectionId, tableName);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Get available tools for a connection
ipcMain.handle('mcp:get-tools', async (_event, connectionId: string) => {
  return mcpClient.getTools(connectionId);
});

// Get all tools for AI function calling
ipcMain.handle('mcp:get-all-tools-for-ai', async () => {
  return mcpClient.getAllToolsForAI();
});

// Get MCP connection status
ipcMain.handle('mcp:get-status', async () => {
  return mcpClient.getStatus();
});

// Check if connection is ready
ipcMain.handle('mcp:is-connected', async (_event, connectionId: string) => {
  return mcpClient.isConnected(connectionId);
});

// Disconnect all MCP connections
ipcMain.handle('mcp:disconnect-all', async () => {
  await mcpClient.disconnectAll();
  return { success: true };
});

// =============================================================================
// CHAT HISTORY HANDLERS
// =============================================================================

ipcMain.handle('chat:create-conversation', async (_event, data) => {
  return chatHistoryManager.createConversation(data);
});

ipcMain.handle('chat:add-message', async (_event, conversationId, message) => {
  return chatHistoryManager.addMessage(conversationId, message);
});

ipcMain.handle('chat:get-conversation', async (_event, id) => {
  return chatHistoryManager.getConversation(id);
});

ipcMain.handle('chat:get-all-conversations', async (_event, options) => {
  return chatHistoryManager.getAllConversations(options);
});

ipcMain.handle('chat:update-conversation', async (_event, id, updates) => {
  return chatHistoryManager.updateConversation(id, updates);
});

ipcMain.handle('chat:delete-conversation', async (_event, id) => {
  return chatHistoryManager.deleteConversation(id);
});

ipcMain.handle('chat:clear-conversation', async (_event, id) => {
  return chatHistoryManager.clearConversation(id);
});

ipcMain.handle('chat:search-conversations', async (_event, query) => {
  return chatHistoryManager.searchConversations(query);
});

ipcMain.handle('chat:get-stats', async () => {
  return chatHistoryManager.getStats();
});

ipcMain.handle('chat:export-conversation', async (_event, id) => {
  return chatHistoryManager.exportConversation(id);
});

ipcMain.handle('chat:import-conversation', async (_event, json) => {
  return chatHistoryManager.importConversation(json);
});

ipcMain.handle('chat:toggle-pin', async (_event, id) => {
  return chatHistoryManager.togglePin(id);
});

ipcMain.handle('chat:toggle-archive', async (_event, id) => {
  return chatHistoryManager.toggleArchive(id);
});

ipcMain.handle('chat:get-recent', async (_event, limit) => {
  return chatHistoryManager.getRecentConversations(limit);
});

ipcMain.handle('chat:cleanup-old', async (_event, daysOld) => {
  return chatHistoryManager.cleanupOldConversations(daysOld);
});

// =============================================================================
// EXPRESS API HANDLERS
// =============================================================================

ipcMain.handle('express:check-health', async () => {
  return await expressClient.checkHealth();
});

ipcMain.handle('express:get-providers', async () => {
  return await expressClient.getAvailableProviders();
});

ipcMain.handle('express:query-ai', async (_event, request) => {
  return await expressClient.queryAI(request);
});

ipcMain.handle('express:validate-license', async (_event, licenseKey, deviceId, deviceInfo) => {
  return await expressClient.validateLicense(licenseKey, deviceId, deviceInfo);
});

// User API Keys (BYOK)
ipcMain.handle('express:get-providers-list', async () => {
  return await expressClient.getProvidersList();
});

ipcMain.handle('express:get-user-api-keys', async () => {
  return await expressClient.getUserApiKeys();
});

ipcMain.handle('express:get-user-api-key-by-provider', async (_event, provider) => {
  return await expressClient.getUserApiKeyByProvider(provider);
});

ipcMain.handle('express:add-user-api-key', async (_event, provider, apiKey, keyName, config) => {
  return await expressClient.addUserApiKey(provider, apiKey, keyName, config);
});

ipcMain.handle('express:update-user-api-key', async (_event, keyId, updates) => {
  return await expressClient.updateUserApiKey(keyId, updates);
});

ipcMain.handle('express:delete-user-api-key', async (_event, keyId) => {
  return await expressClient.deleteUserApiKey(keyId);
});

ipcMain.handle('express:test-user-api-key', async (_event, keyId) => {
  return await expressClient.testUserApiKey(keyId);
});

// User Database Connections
ipcMain.handle('express:get-connection-types', async () => {
  return await expressClient.getConnectionTypes();
});

ipcMain.handle('express:get-user-connections', async () => {
  return await expressClient.getUserConnections();
});

ipcMain.handle('express:get-user-connection', async (_event, connectionId) => {
  return await expressClient.getUserConnection(connectionId);
});

ipcMain.handle('express:add-user-connection', async (_event, name, connectionType, config, mcpServerType) => {
  return await expressClient.addUserConnection(name, connectionType, config, mcpServerType);
});

ipcMain.handle('express:update-user-connection', async (_event, connectionId, updates) => {
  return await expressClient.updateUserConnection(connectionId, updates);
});

ipcMain.handle('express:delete-user-connection', async (_event, connectionId) => {
  return await expressClient.deleteUserConnection(connectionId);
});

ipcMain.handle('express:test-user-connection', async (_event, connectionId) => {
  return await expressClient.testUserConnection(connectionId);
});

ipcMain.handle('express:start-mcp-server', async (_event, connectionId) => {
  return await expressClient.startMCPServer(connectionId);
});

// Usage & Subscriptions
ipcMain.handle('express:get-usage', async (_event, userId, options) => {
  return await expressClient.getUsage(userId, options);
});

ipcMain.handle('express:log-usage', async (_event, data) => {
  return await expressClient.logUsage(data);
});

ipcMain.handle('express:get-subscription', async (_event, userId) => {
  return await expressClient.getSubscription(userId);
});

// Auth
ipcMain.handle('express:set-auth', async (_event, userId, licenseKey, authToken) => {
  return expressClient.setAuth(userId, licenseKey, authToken);
});

ipcMain.handle('express:set-auth-token', async (_event, token) => {
  return expressClient.setAuthToken(token);
});

ipcMain.handle('express:update-config', async (_event, config) => {
  return expressClient.updateConfig(config);
});