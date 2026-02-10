import { ipcMain, dialog } from 'electron';
import { ConnectionManager } from './data/connection-manager';
import { AIRouter } from './ai/ai-router';
import { LicenseManager } from './license/license-manager';
import { SettingsManager } from './data/settings-manager';
import { mcpConnectionManager } from './mcp/mcp-manager';
import { mcpClient } from './mcp/mcp-client';
import { chatHistoryManager } from './chat/chat-history-manager';
import { contextManager, ContextType, ContextSearchOptions, ContextWindowConfig } from './context/context-manager';
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
    
    // Auto-generate schema context after successful connection
    try {
      console.log(`[IPC] Auto-generating schema context for "${config.name}"...`);
      
      // Get list of tables
      const tablesResult = await mcpClient.listTables(config.id);
      if (tablesResult && Array.isArray(tablesResult)) {
        const tables: Array<{
          name: string;
          schema?: string;
          columns: Array<{
            name: string;
            type: string;
            nullable: boolean;
            primaryKey?: boolean;
            foreignKey?: { table: string; column: string };
          }>;
        }> = [];

        for (const table of tablesResult.slice(0, 50)) { // Limit to 50 tables
          try {
            const schemaResult = await mcpClient.getTableSchema(config.id, table.name || table);
            if (schemaResult && schemaResult.columns) {
              tables.push({
                name: table.name || table,
                schema: table.schema,
                columns: schemaResult.columns.map((col: any) => ({
                  name: col.name || col.column_name,
                  type: col.type || col.data_type,
                  nullable: col.nullable !== false && col.is_nullable !== 'NO',
                  primaryKey: col.primaryKey || col.is_primary_key,
                  foreignKey: col.foreignKey,
                })),
              });
            }
          } catch (tableErr) {
            // Skip tables that fail
          }
        }

        if (tables.length > 0) {
          contextManager.createDatabaseSchemaContext({
            connectionId: config.id,
            connectionName: config.name,
            tables,
          });
          console.log(`[IPC] Schema context created: ${tables.length} tables for "${config.name}"`);
        }
      }
    } catch (schemaErr) {
      console.warn('[IPC] Auto-schema generation failed (non-critical):', schemaErr);
    }
    
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

// Generate schema context for a database connection
ipcMain.handle('mcp:generate-schema-context', async (_event, connectionId: string, connectionName: string) => {
  try {
    // Get list of tables
    const tablesResult = await mcpClient.listTables(connectionId);
    if (!tablesResult || !Array.isArray(tablesResult)) {
      return { success: false, error: 'Failed to get tables' };
    }

    // Get schema for each table
    const tables: Array<{
      name: string;
      schema?: string;
      columns: Array<{
        name: string;
        type: string;
        nullable: boolean;
        primaryKey?: boolean;
        foreignKey?: { table: string; column: string };
      }>;
    }> = [];

    for (const table of tablesResult) {
      try {
        const schemaResult = await mcpClient.getTableSchema(connectionId, table.name || table);
        if (schemaResult && schemaResult.columns) {
          tables.push({
            name: table.name || table,
            schema: table.schema,
            columns: schemaResult.columns.map((col: any) => ({
              name: col.name || col.column_name,
              type: col.type || col.data_type,
              nullable: col.nullable !== false && col.is_nullable !== 'NO',
              primaryKey: col.primaryKey || col.is_primary_key,
              foreignKey: col.foreignKey,
            })),
          });
        }
      } catch (tableErr) {
        console.warn(`Failed to get schema for table ${table.name || table}:`, tableErr);
      }
    }

    if (tables.length === 0) {
      return { success: false, error: 'No table schemas found' };
    }

    // Create database schema context
    const context = contextManager.createDatabaseSchemaContext({
      connectionId,
      connectionName,
      tables,
    });

    return { success: true, context };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
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

// Auto-license: check subscription and get license without manual key input
ipcMain.handle('express:get-auto-license', async () => {
  try {
    return await expressClient.getAutoLicense();
  } catch (error: any) {
    console.error('Auto-license check failed:', error.message);
    return { valid: true, tier: 'free', features: ['basic_chat'] };
  }
});

// User API Keys (BYOK)
ipcMain.handle('express:get-providers-list', async () => {
  try {
    return await expressClient.getProvidersList();
  } catch (error: any) {
    console.error('Failed to fetch providers list:', error.message);
    return [];
  }
});

ipcMain.handle('express:get-user-api-keys', async () => {
  try {
    return await expressClient.getUserApiKeys();
  } catch (error: any) {
    console.error('Failed to fetch user API keys:', error.message);
    return [];
  }
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

// =====================================
// Modern UI Handlers - For new frontend pages
// =====================================

// User connections (combines MCP + Database connections)
ipcMain.handle('user:get-connections', async () => {
  try {
    const mcpConnections = await mcpConnectionManager.getAllConnections();
    const dbConnections = await expressClient.getUserConnections();
    
    // Merge and format for UI
    const allConnections = [
      ...mcpConnections.map((conn: any) => ({
        id: conn.id,
        name: conn.name,
        type: conn.type || 'unknown',
        host: conn.config?.host,
        port: conn.config?.port,
        database: conn.config?.database,
        status: conn.enabled ? 'connected' : 'disconnected',
        lastConnected: conn.lastUsed,
        createdAt: conn.createdAt,
        encrypted: true,
      })),
      ...(dbConnections || []).map((conn: any) => ({
        id: conn.id,
        name: conn.name,
        type: conn.connectionType,
        host: conn.config?.host,
        port: conn.config?.port,
        database: conn.config?.database,
        status: conn.status || 'disconnected',
        lastConnected: conn.lastConnected,
        createdAt: conn.createdAt,
        encrypted: conn.config?.encrypted || false,
      })),
    ];
    
    return allConnections;
  } catch (error) {
    console.error('Failed to get user connections:', error);
    return [];
  }
});

ipcMain.handle('connection:test-by-id', async (_event, connectionId) => {
  try {
    // Try MCP connection first
    const mcpConn = await mcpConnectionManager.getConnection(connectionId);
    if (mcpConn) {
      const result = await mcpConnectionManager.testConnection(connectionId);
      return result;
    }
    
    // Try database connection
    const dbResult = await expressClient.testUserConnection(connectionId);
    return dbResult;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('connection:delete', async (_event, connectionId) => {
  try {
    // Try both managers
    await mcpConnectionManager.deleteConnection(connectionId);
    await expressClient.deleteUserConnection(connectionId);
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to delete connection: ${error.message}`);
  }
});

// Chat sessions
ipcMain.handle('chat:get-sessions', async () => {
  try {
    const conversations = await chatHistoryManager.getAllConversations({ limit: 50 });
    return conversations.map((conv: any) => ({
      id: conv.id,
      title: conv.title || 'New Chat',
      messages: conv.messages || [],
      createdAt: conv.createdAt,
      updatedAt: conv.lastMessageAt,
      model: conv.metadata?.model,
    }));
  } catch (error) {
    console.error('Failed to get chat sessions:', error);
    return [];
  }
});

ipcMain.handle('ai:chat', async (_event, params) => {
  try {
    const { messages, model, stream, connectionId } = params;
    
    // Use AI router for chat - includes context compilation
    // @ts-ignore - conversationHistory not in AIQueryOptions type yet
    const response = await aiRouter.query(messages[messages.length - 1].content, {
      model,
      connectionId,
      conversationHistory: messages.slice(0, -1),
      stream: stream || false,
    } as any);
    
    return response;
  } catch (error: any) {
    throw new Error(`Chat failed: ${error.message}`);
  }
});

ipcMain.handle('mcp:query-with-ai', async (_event, params) => {
  try {
    const { connectionId, query, model } = params;
    
    // Execute query via MCP
    const result = await mcpClient.query(connectionId, query);
    
    // Optionally enhance with AI if model specified
    if (model && result.rows) {
      // Include compiled contexts (especially the database schema) for better AI analysis
      const aiResponse = await aiRouter.query(
        `Analyze this database query result:\nQuery: ${query}\nResults: ${JSON.stringify(result.rows, null, 2)}`,
        { 
          model,
          connectionId,  // This triggers inclusion of schema context
        }
      );
      return {
        ...result,
        // @ts-ignore - text property exists at runtime
        aiAnalysis: aiResponse.response || aiResponse.text,
      };
    }
    
    return result;
  } catch (error: any) {
    throw new Error(`MCP query failed: ${error.message}`);
  }
});

ipcMain.handle('chat:save-session', async (_event, session) => {
  try {
    if (session.id) {
      // Update existing
      // @ts-ignore - updateConversation accepts any updates
      await chatHistoryManager.updateConversation(session.id, {
        title: session.title,
        messages: session.messages,
      } as any);
      return { success: true, id: session.id };
    } else {
      // Create new
      // @ts-ignore - createConversation accepts additional fields
      const conv = await chatHistoryManager.createConversation({
        title: session.title || 'New Chat',
        provider: 'openai',
        model: session.model || 'gpt-4',
      } as any);
      return { success: true, id: conv.id };
    }
  } catch (error: any) {
    throw new Error(`Failed to save chat session: ${error.message}`);
  }
});

// Subscription & payments
ipcMain.handle('subscription:get', async () => {
  try {
    const userId = await settingsManager.get('userId');
    if (!userId) {
      return {
        plan: 'trial',
        status: 'active',
        features: ['Basic features', '100 queries/month'],
        billingPeriod: { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      };
    }
    
    const subscription = await expressClient.getSubscription(userId);
    return subscription || {
      plan: 'trial',
      status: 'active',
      features: [],
      billingPeriod: { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    };
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return null;
  }
});

ipcMain.handle('payments:get-history', async () => {
  try {
    const userId = await settingsManager.get('userId');
    if (!userId) return [];
    
    // @ts-ignore - getUsage accepts includePayments option
    const usage = await expressClient.getUsage(userId, { includePayments: true } as any);
    return usage?.payments || [];
  } catch (error) {
    console.error('Failed to get payment history:', error);
    return [];
  }
});

ipcMain.handle('payments:create-checkout', async (_event, params) => {
  try {
    // In development, use local landing site; in production, use the production URL
    const isDev = process.env.NODE_ENV !== 'production' || !app.isPackaged;
    const baseUrl = isDev 
      ? (process.env.LANDING_SITE_URL || 'http://localhost:3000')
      : (process.env.LANDING_SITE_URL || 'https://ainexus.com');
    const checkoutUrl = `${baseUrl}/subscribe?plan=${params.plan}`;
    shell.openExternal(checkoutUrl);
    return { success: true, checkoutUrl };
  } catch (error: any) {
    throw new Error(`Failed to create checkout: ${error.message}`);
  }
});

ipcMain.handle('subscription:cancel', async () => {
  try {
    const userId = await settingsManager.get('userId');
    if (!userId) throw new Error('User not authenticated');
    
    // TODO: Implement cancel subscription via API
    console.log('Cancelling subscription for user:', userId);
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
});

ipcMain.handle('subscription:reactivate', async () => {
  try {
    const userId = await settingsManager.get('userId');
    if (!userId) throw new Error('User not authenticated');
    
    // TODO: Implement reactivate subscription via API
    console.log('Reactivating subscription for user:', userId);
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to reactivate subscription: ${error.message}`);
  }
});

// User profile & preferences
ipcMain.handle('user:get-profile', async () => {
  try {
    // Try stored profile first
    const profile = await settingsManager.get('userProfile');
    if (profile) {
      // Proxy Google avatar through Express to avoid 429
      if (profile.avatar && profile.avatar.includes('googleusercontent.com')) {
        const expressUrl = expressClient?.getBaseUrl?.() || 'http://localhost:5500';
        profile.avatar = `${expressUrl}/api/avatar/proxy?url=${encodeURIComponent(profile.avatar)}`;
      }
      return profile;
    }

    // Try to get from auth data
    const authData = await settingsManager.get('authData');
    if (authData?.user) {
      let avatar = authData.user.image || '';
      // Proxy Google avatar through Express to avoid 429
      if (avatar && avatar.includes('googleusercontent.com')) {
        const expressUrl = expressClient?.getBaseUrl?.() || 'http://localhost:5500';
        avatar = `${expressUrl}/api/avatar/proxy?url=${encodeURIComponent(avatar)}`;
      }
      return {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.name || '',
        avatar,
        role: 'user',
        createdAt: new Date(),
      };
    }

    // No authenticated user
    return null;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
});

ipcMain.handle('user:get-preferences', async () => {
  try {
    const preferences = await settingsManager.get('userPreferences');
    return preferences || {
      theme: 'system',
      language: 'en',
      notifications: { email: true, desktop: true, newFeatures: true },
      defaultModel: 'gpt-4o-mini',
      autoSave: true,
    };
  } catch (error) {
    console.error('Failed to get preferences:', error);
    return null;
  }
});

ipcMain.handle('user:update-profile', async (_event, profile) => {
  try {
    await settingsManager.set('userProfile', profile);
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
});

ipcMain.handle('user:update-preferences', async (_event, preferences) => {
  try {
    await settingsManager.set('userPreferences', preferences);
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to update preferences: ${error.message}`);
  }
});

ipcMain.handle('user:upload-avatar', async (_event, formData) => {
  try {
    // Generate a text-based avatar as placeholder until real upload is implemented
    const name = formData.name || 'User';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`;
    
    // Save to profile
    const profile = await settingsManager.get('userProfile') || {};
    (profile as any).avatar = avatarUrl;
    await settingsManager.set('userProfile', profile);
    
    return { url: avatarUrl };
  } catch (error: any) {
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }
});

// API Keys management
ipcMain.handle('api-keys:get-all', async () => {
  try {
    const apiKeys = await expressClient.getUserApiKeys();
    return apiKeys || [];
  } catch (error) {
    console.error('Failed to get API keys:', error);
    return [];
  }
});

ipcMain.handle('api-keys:add', async (_event, key) => {
  try {
    const result = await expressClient.addUserApiKey(
      key.provider,
      key.keyValue,
      key.keyName
    );
    return result;
  } catch (error: any) {
    throw new Error(`Failed to add API key: ${error.message}`);
  }
});

ipcMain.handle('api-keys:update', async (_event, key) => {
  try {
    // @ts-ignore - updateUserApiKey accepts keyName
    await expressClient.updateUserApiKey(key.id, {
      key_name: key.keyName,
      api_key: key.keyValue,
      is_active: key.isActive,
    } as any);
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to update API key: ${error.message}`);
  }
});

ipcMain.handle('api-keys:delete', async (_event, keyId) => {
  try {
    await expressClient.deleteUserApiKey(keyId);
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to delete API key: ${error.message}`);
  }
});

// =============================================================================
// LLM CONTEXT MANAGEMENT HANDLERS
// =============================================================================

// Initialize default contexts on first load
contextManager.initializeDefaults();

// Create a new context
ipcMain.handle('context:create', async (_event, data: {
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
}) => {
  try {
    return contextManager.create(data);
  } catch (error: any) {
    throw new Error(`Failed to create context: ${error.message}`);
  }
});

// Get a context by ID
ipcMain.handle('context:get', async (_event, id: string) => {
  return contextManager.get(id);
});

// Update a context
ipcMain.handle('context:update', async (_event, id: string, updates: any) => {
  try {
    const updated = contextManager.update(id, updates);
    if (!updated) throw new Error('Context not found');
    return updated;
  } catch (error: any) {
    throw new Error(`Failed to update context: ${error.message}`);
  }
});

// Delete a context
ipcMain.handle('context:delete', async (_event, id: string) => {
  try {
    const success = contextManager.delete(id);
    if (!success) throw new Error('Context not found');
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to delete context: ${error.message}`);
  }
});

// List contexts with filtering
ipcMain.handle('context:list', async (_event, options?: ContextSearchOptions) => {
  return contextManager.list(options);
});

// Compile contexts for LLM context window
ipcMain.handle('context:compile', async (_event, options: {
  config: ContextWindowConfig;
  connectionId?: string;
  projectId?: string;
  additionalContextIds?: string[];
  excludeIds?: string[];
}) => {
  return contextManager.compile(options);
});

// Create database schema context
ipcMain.handle('context:create-schema', async (_event, data: {
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
}) => {
  try {
    return contextManager.createDatabaseSchemaContext(data);
  } catch (error: any) {
    throw new Error(`Failed to create schema context: ${error.message}`);
  }
});

// Import knowledge file with file picker
ipcMain.handle('context:import-file', async (_event, options?: {
  name?: string;
  tags?: string[];
  chunkSize?: number;
}) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Text Files', extensions: ['txt', 'md', 'json', 'csv', 'sql'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, contexts: [] };
    }
    
    const contexts = contextManager.importKnowledgeFile(result.filePaths[0], options);
    return { canceled: false, contexts };
  } catch (error: any) {
    throw new Error(`Failed to import file: ${error.message}`);
  }
});

// Import knowledge from provided file path
ipcMain.handle('context:import-file-path', async (_event, filePath: string, options?: {
  name?: string;
  tags?: string[];
  chunkSize?: number;
}) => {
  try {
    const contexts = contextManager.importKnowledgeFile(filePath, options);
    return contexts;
  } catch (error: any) {
    throw new Error(`Failed to import file: ${error.message}`);
  }
});

// Create memory summary
ipcMain.handle('context:create-memory', async (_event, data: {
  conversationId: string;
  summary: string;
  keyFacts: string[];
}) => {
  try {
    return contextManager.createMemorySummary(data);
  } catch (error: any) {
    throw new Error(`Failed to create memory summary: ${error.message}`);
  }
});

// Get context statistics
ipcMain.handle('context:stats', async () => {
  return contextManager.getStats();
});

// Export all contexts
ipcMain.handle('context:export', async () => {
  try {
    const json = contextManager.exportAll();
    const result = await dialog.showSaveDialog({
      defaultPath: 'llm-contexts.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    
    if (!result.canceled && result.filePath) {
      const fs = require('fs');
      fs.writeFileSync(result.filePath, json);
      return { success: true, path: result.filePath };
    }
    return { canceled: true };
  } catch (error: any) {
    throw new Error(`Failed to export contexts: ${error.message}`);
  }
});

// Import contexts from JSON
ipcMain.handle('context:import-json', async (_event, options?: { overwrite?: boolean }) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, count: 0 };
    }
    
    const fs = require('fs');
    const json = fs.readFileSync(result.filePaths[0], 'utf-8');
    const count = contextManager.importFromJson(json, options);
    return { canceled: false, count };
  } catch (error: any) {
    throw new Error(`Failed to import contexts: ${error.message}`);
  }
});

// Get default templates
ipcMain.handle('context:get-templates', async () => {
  return contextManager.getDefaultTemplates();
});

// Toggle context active state
ipcMain.handle('context:toggle-active', async (_event, id: string) => {
  const context = contextManager.get(id);
  if (!context) throw new Error('Context not found');
  return contextManager.update(id, { isActive: !context.isActive });
});

// Toggle context auto-include
ipcMain.handle('context:toggle-auto-include', async (_event, id: string) => {
  const context = contextManager.get(id);
  if (!context) throw new Error('Context not found');
  return contextManager.update(id, { autoInclude: !context.autoInclude });
});

