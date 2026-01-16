import { ipcMain } from 'electron';
import { ConnectionManager } from './data/connection-manager';
import { AIRouter } from './ai/ai-router';
import { LicenseManager } from './license/license-manager';
import { SettingsManager } from './data/settings-manager';
import { mcpConnectionManager } from './mcp/mcp-manager';
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

ipcMain.handle('express:get-user-api-keys', async (_event, userId) => {
  return await expressClient.getUserApiKeys(userId);
});

ipcMain.handle('express:add-user-api-key', async (_event, userId, provider, apiKey, keyName) => {
  return await expressClient.addUserApiKey(userId, provider, apiKey, keyName);
});

ipcMain.handle('express:get-usage', async (_event, userId, options) => {
  return await expressClient.getUsage(userId, options);
});

ipcMain.handle('express:log-usage', async (_event, data) => {
  return await expressClient.logUsage(data);
});

ipcMain.handle('express:get-subscription', async (_event, userId) => {
  return await expressClient.getSubscription(userId);
});

ipcMain.handle('express:set-auth', async (_event, userId, licenseKey) => {
  return expressClient.setAuth(userId, licenseKey);
});

ipcMain.handle('express:update-config', async (_event, config) => {
  return expressClient.updateConfig(config);
});