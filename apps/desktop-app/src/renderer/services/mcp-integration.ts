/**
 * MCP Integration Service
 * 
 * This is the central service that connects:
 * 1. MCP Client (connects to databases via MCP servers)
 * 2. Backend WebSocket (receives AI tool execution requests)
 * 
 * Flow:
 * User adds database connection -> MCP Client connects -> Tools registered with backend
 * AI asks question -> Backend sends tool request -> MCP executes -> Result returned
 */

import { BackendWebSocket, createBackendWebSocket, ToolExecutionRequest } from './backend-websocket';

interface MCPConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: Array<{ name: string; description: string; inputSchema: any }>;
}

interface MCPIntegrationConfig {
  backendUrl: string;
  deviceId: string;
}

class MCPIntegrationService {
  private backendWs: BackendWebSocket | null = null;
  private connections: Map<string, MCPConnection> = new Map();
  private _authToken: string | null = null;
  private _config: MCPIntegrationConfig | null = null;
  
  get authToken(): string | null { return this._authToken; }
  get config(): MCPIntegrationConfig | null { return this._config; }
  
  /**
   * Initialize the MCP integration service
   */
  async initialize(config: MCPIntegrationConfig, authToken: string): Promise<void> {
    this._config = config;
    this._authToken = authToken;
    
    // Create and connect WebSocket to backend
    this.backendWs = createBackendWebSocket(config.backendUrl, config.deviceId);
    
    // Set up event handlers
    this.setupWebSocketHandlers();
    
    // Connect to backend
    await this.backendWs.connect(authToken);
    
    console.log('[MCP Integration] Initialized');
  }
  
  /**
   * Set up WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    if (!this.backendWs) return;
    
    // Handle authentication success
    this.backendWs.on('authenticated', ({ userId, connectionId }) => {
      console.log('[MCP Integration] Authenticated with backend', { userId, connectionId });
      
      // Register any existing tools
      this.registerAllTools();
    });
    
    // Handle tool execution requests from AI
    this.backendWs.on('execute_tool', async (request: ToolExecutionRequest) => {
      console.log('[MCP Integration] Tool execution request:', request.toolName);
      
      try {
        const result = await this.executeToolLocally(request);
        this.backendWs?.sendToolResult(request.callId, result);
      } catch (err) {
        console.error('[MCP Integration] Tool execution failed:', err);
        this.backendWs?.sendToolResult(request.callId, null, (err as Error).message);
      }
    });
    
    // Handle disconnection
    this.backendWs.on('disconnected', () => {
      console.log('[MCP Integration] Disconnected from backend');
    });
    
    // Handle errors
    this.backendWs.on('error', (error) => {
      console.error('[MCP Integration] WebSocket error:', error);
    });
  }
  
  /**
   * Build a connection string from config
   */
  private buildConnectionString(type: string, config: Record<string, any>): string {
    if (config.connectionString) {
      return config.connectionString;
    }
    
    switch (type) {
      case 'postgresql':
        const ssl = config.ssl ? '?sslmode=require' : '';
        return `postgresql://${config.user || config.username}:${config.password}@${config.host}:${config.port || 5432}/${config.database}${ssl}`;
      case 'mysql':
      case 'mariadb':
        return `mysql://${config.user || config.username}:${config.password}@${config.host}:${config.port || 3306}/${config.database}`;
      case 'sqlite':
        return config.path || config.filePath || config.database;
      case 'mongodb':
        return config.connectionString || `mongodb://${config.host}:${config.port || 27017}/${config.database}`;
      case 'sqlserver':
        return `Server=${config.host},${config.port || 1433};Database=${config.database};User Id=${config.user || config.username};Password=${config.password};`;
      case 'oracle':
        return `${config.host}:${config.port || 1521}/${config.database}`;
      case 'redis':
        return config.url || `redis://${config.host}:${config.port || 6379}`;
      case 'elasticsearch':
        return config.url || `http://${config.host}:${config.port || 9200}`;
      case 'cassandra':
        return config.contactPoints || `${config.host}:${config.port || 9042}`;
      case 'neo4j':
        return config.uri || `bolt://${config.host}:${config.port || 7687}`;
      case 'couchdb':
        return config.url || `http://${config.host}:${config.port || 5984}`;
      default:
        // For REST API / enterprise systems, pass config as JSON
        if (config.host && config.database) {
          return `${type}://${config.user || config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
        }
        return JSON.stringify(config);
    }
  }
  
  /**
   * Add a database connection via MCP
   */
  async addConnection(
    id: string,
    name: string,
    type: MCPConnection['type'],
    connectionConfig: Record<string, any>
  ): Promise<MCPConnection> {
    console.log('[MCP Integration] Adding connection:', name, type);
    
    // Build connection string from config (legacy backward compat)
    const connectionString = this.buildConnectionString(type, connectionConfig);
    
    // Also pass raw connection params so the main process can set all env vars
    const connectionParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(connectionConfig)) {
      if (value !== undefined && value !== null && value !== '') {
        connectionParams[key] = String(value);
      }
    }
    
    // Use IPC to connect via main process MCP client
    const result = await window.electron.mcp.connect({ id, type, connectionString, name, connectionParams });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to connect');
    }
    
    // Get available tools from the connection
    const tools = await window.electron.mcp.getTools(id);
    
    const connection: MCPConnection = {
      id,
      name,
      type,
      status: 'connected',
      tools: tools || [],
    };
    
    this.connections.set(id, connection);
    
    // Register tools with backend
    this.registerAllTools();
    
    console.log('[MCP Integration] Connection added:', name, 'with', tools?.length || 0, 'tools');
    
    return connection;
  }
  
  /**
   * Remove a database connection
   */
  async removeConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) return;
    
    // Disconnect via main process
    await window.electron.mcp.disconnect(id);
    
    this.connections.delete(id);
    
    // Re-register tools (without the removed connection's tools)
    this.registerAllTools();
    
    console.log('[MCP Integration] Connection removed:', connection.name);
  }
  
  /**
   * Register all tools from all connections with the backend
   */
  private registerAllTools(): void {
    if (!this.backendWs?.isConnected()) {
      console.warn('[MCP Integration] Cannot register tools - not connected to backend');
      return;
    }
    
    // Collect all tools from all connections
    const allTools: Array<{ name: string; description: string; inputSchema: any; connectionId: string }> = [];
    
    for (const [connectionId, connection] of this.connections) {
      for (const tool of connection.tools) {
        allTools.push({
          ...tool,
          // Prefix tool name with connection ID to avoid conflicts
          name: `${connectionId}_${tool.name}`,
          connectionId,
        });
      }
    }
    
    this.backendWs.registerTools(allTools);
    
    console.log('[MCP Integration] Registered', allTools.length, 'tools with backend');
  }
  
  /**
   * Execute a tool locally via MCP
   */
  private async executeToolLocally(request: ToolExecutionRequest): Promise<any> {
    const { toolName, arguments: args } = request;
    
    // Parse connection ID from tool name (format: connectionId_toolName)
    const underscoreIndex = toolName.indexOf('_');
    if (underscoreIndex === -1) {
      throw new Error(`Invalid tool name format: ${toolName}`);
    }
    
    const connectionId = toolName.substring(0, underscoreIndex);
    const actualToolName = toolName.substring(underscoreIndex + 1);
    
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`No connection found for ID: ${connectionId}`);
    }
    
    if (connection.status !== 'connected') {
      throw new Error(`Connection ${connectionId} is not connected`);
    }
    
    // Execute via main process MCP client
    const result = await window.electron.mcp.callTool(connectionId, actualToolName, args);
    
    if (!result.success) {
      throw new Error(result.error || 'Tool execution failed');
    }
    
    return result.data;
  }
  
  /**
   * Get all connections
   */
  getConnections(): MCPConnection[] {
    return Array.from(this.connections.values());
  }
  
  /**
   * Get connection by ID
   */
  getConnection(id: string): MCPConnection | undefined {
    return this.connections.get(id);
  }
  
  /**
   * Get connection status
   */
  getStatus(): {
    backendConnected: boolean;
    connectionCount: number;
    totalTools: number;
  } {
    let totalTools = 0;
    for (const connection of this.connections.values()) {
      totalTools += connection.tools.length;
    }
    
    return {
      backendConnected: this.backendWs?.isConnected() || false,
      connectionCount: this.connections.size,
      totalTools,
    };
  }
  
  /**
   * Cleanup and disconnect
   */
  async cleanup(): Promise<void> {
    // Disconnect all MCP connections
    for (const [id] of this.connections) {
      await window.electron.mcp.disconnect(id);
    }
    this.connections.clear();
    
    // Disconnect WebSocket
    this.backendWs?.disconnect();
    this.backendWs = null;
    
    console.log('[MCP Integration] Cleaned up');
  }
}

// Export singleton instance
export const mcpIntegration = new MCPIntegrationService();

// Type declarations moved to types/electron.d.ts
