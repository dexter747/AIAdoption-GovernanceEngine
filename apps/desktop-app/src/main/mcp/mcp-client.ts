/**
 * MCP Client - Real implementation using @modelcontextprotocol/sdk
 * Spawns MCP servers as child processes and communicates via stdio
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { EventEmitter } from 'events';

interface MCPServerConfig {
  id: string;
  type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'sqlserver';
  connectionString: string;
  name: string;
}

interface MCPClientInstance {
  id: string;
  client: Client;
  transport: StdioClientTransport;
  config: MCPServerConfig;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  tools: any[];
}

/**
 * MCP Client Manager
 * Manages multiple MCP server connections
 */
export class MCPClientManager extends EventEmitter {
  private clients: Map<string, MCPClientInstance> = new Map();
  
  // Map of database types to their MCP server packages
  private serverPackages: Record<string, { 
    command: string; 
    args: string[];
    envKey: string;
  }> = {
    postgresql: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      envKey: 'POSTGRES_CONNECTION_STRING'
    },
    sqlite: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite'],
      envKey: 'SQLITE_DB_PATH'
    },
    mysql: {
      command: 'npx',
      args: ['-y', '@benborla/mcp-server-mysql'],
      envKey: 'MYSQL_CONNECTION_STRING'
    },
    // SQL Server MCP
    sqlserver: {
      command: 'npx',
      args: ['-y', '@azure-samples/mssql-mcp-server'],
      envKey: 'MSSQL_CONNECTION_STRING'
    }
  };

  constructor() {
    super();
  }

  /**
   * Connect to a database via MCP server
   */
  async connect(config: MCPServerConfig): Promise<MCPClientInstance> {
    const { id, type, connectionString, name } = config;

    // Check if already connected
    if (this.clients.has(id)) {
      const existing = this.clients.get(id)!;
      if (existing.status === 'connected') {
        return existing;
      }
      // Disconnect existing and reconnect
      await this.disconnect(id);
    }

    const serverConfig = this.serverPackages[type];
    if (!serverConfig) {
      throw new Error(`Unsupported database type: ${type}. Supported: ${Object.keys(this.serverPackages).join(', ')}`);
    }

    console.log(`[MCP] Starting ${type} MCP server for "${name}"...`);

    // Create instance placeholder
    const instance: MCPClientInstance = {
      id,
      client: null as any,
      transport: null as any,
      config,
      status: 'connecting',
      tools: []
    };
    this.clients.set(id, instance);

    try {
      // Create environment with connection string
      const env: Record<string, string> = {
        ...Object.fromEntries(
          Object.entries(process.env).filter(([_, v]) => v !== undefined) as [string, string][]
        ),
        [serverConfig.envKey]: connectionString
      };

      console.log(`[MCP] Spawning: ${serverConfig.command} ${serverConfig.args.join(' ')}`);
      
      // Create MCP client with stdio transport
      // StdioClientTransport spawns the process internally
      const transport = new StdioClientTransport({
        command: serverConfig.command,
        args: serverConfig.args,
        env,
        stderr: 'pipe' // Capture stderr for debugging
      });

      instance.transport = transport;

      const client = new Client({
        name: `ai-nexus-${type}-client`,
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      instance.client = client;

      // Connect the client (this starts the process)
      await client.connect(transport);
      
      console.log(`[MCP] Connected to ${type} server for "${name}"`);

      // List available tools
      const toolsResponse = await client.listTools();
      instance.tools = toolsResponse.tools || [];
      
      console.log(`[MCP] Available tools for ${id}:`, instance.tools.map(t => t.name));

      instance.status = 'connected';
      this.emit('connected', { id, tools: instance.tools });

      return instance;

    } catch (error: any) {
      console.error(`[MCP] Failed to connect ${id}:`, error);
      instance.status = 'error';
      
      // Clean up
      if (instance.transport) {
        try {
          await instance.transport.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      this.clients.delete(id);
      throw error;
    }
  }

  /**
   * Disconnect from an MCP server
   */
  async disconnect(id: string): Promise<void> {
    const instance = this.clients.get(id);
    if (!instance) {
      return;
    }

    console.log(`[MCP] Disconnecting ${id}...`);

    try {
      // Close the client connection
      if (instance.client) {
        await instance.client.close();
      }
    } catch (error) {
      console.error(`[MCP] Error closing client for ${id}:`, error);
    }

    try {
      // Close the transport (this kills the spawned process)
      if (instance.transport) {
        await instance.transport.close();
      }
    } catch (error) {
      console.error(`[MCP] Error closing transport for ${id}:`, error);
    }

    this.clients.delete(id);
    this.emit('disconnected', { id });
    
    console.log(`[MCP] Disconnected ${id}`);
  }

  /**
   * Execute a tool on an MCP server
   */
  async callTool(connectionId: string, toolName: string, args: Record<string, any>): Promise<any> {
    const instance = this.clients.get(connectionId);
    if (!instance) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    if (instance.status !== 'connected') {
      throw new Error(`Connection ${connectionId} is not connected (status: ${instance.status})`);
    }

    console.log(`[MCP] Calling tool ${toolName} on ${connectionId} with args:`, args);

    try {
      const result = await instance.client.callTool({
        name: toolName,
        arguments: args
      });

      console.log(`[MCP] Tool ${toolName} result:`, result);
      return result;

    } catch (error: any) {
      console.error(`[MCP] Tool ${toolName} failed:`, error);
      throw error;
    }
  }

  /**
   * Execute a database query via MCP
   */
  async query(connectionId: string, sql: string): Promise<any> {
    const instance = this.clients.get(connectionId);
    if (!instance) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    // Find the appropriate query tool
    const queryTool = instance.tools.find(t => 
      t.name === 'query' || 
      t.name === 'execute_query' || 
      t.name === 'run_query' ||
      t.name === 'read_query'
    );

    if (!queryTool) {
      throw new Error(`No query tool found for connection ${connectionId}. Available tools: ${instance.tools.map(t => t.name).join(', ')}`);
    }

    return this.callTool(connectionId, queryTool.name, { query: sql, sql });
  }

  /**
   * List tables in a database
   */
  async listTables(connectionId: string): Promise<any> {
    const instance = this.clients.get(connectionId);
    if (!instance) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    // Find list tables tool
    const listTool = instance.tools.find(t => 
      t.name === 'list_tables' || 
      t.name === 'get_tables' ||
      t.name === 'describe_tables'
    );

    if (listTool) {
      return this.callTool(connectionId, listTool.name, {});
    }

    // Fallback: use query
    const type = instance.config.type;
    let sql = '';
    
    switch (type) {
      case 'postgresql':
        sql = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
        break;
      case 'mysql':
        sql = `SHOW TABLES`;
        break;
      case 'sqlite':
        sql = `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`;
        break;
      case 'sqlserver':
        sql = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME`;
        break;
      default:
        throw new Error(`list_tables not supported for ${type}`);
    }

    return this.query(connectionId, sql);
  }

  /**
   * Get schema for a table
   */
  async getTableSchema(connectionId: string, tableName: string): Promise<any> {
    const instance = this.clients.get(connectionId);
    if (!instance) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    // Find describe tool
    const describeTool = instance.tools.find(t => 
      t.name === 'describe_table' || 
      t.name === 'get_schema' ||
      t.name === 'table_schema'
    );

    if (describeTool) {
      return this.callTool(connectionId, describeTool.name, { table_name: tableName, table: tableName });
    }

    // Fallback: use query
    const type = instance.config.type;
    let sql = '';
    
    switch (type) {
      case 'postgresql':
        sql = `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY ordinal_position`;
        break;
      case 'mysql':
        sql = `DESCRIBE ${tableName}`;
        break;
      case 'sqlite':
        sql = `PRAGMA table_info(${tableName})`;
        break;
      case 'sqlserver':
        sql = `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`;
        break;
      default:
        throw new Error(`get_table_schema not supported for ${type}`);
    }

    return this.query(connectionId, sql);
  }

  /**
   * Get available tools for a connection
   */
  getTools(connectionId: string): any[] {
    const instance = this.clients.get(connectionId);
    return instance?.tools || [];
  }

  /**
   * Get all tools across all connections (for AI function calling)
   */
  getAllToolsForAI(): any[] {
    const tools: any[] = [];
    
    for (const [id, instance] of this.clients.entries()) {
      if (instance.status !== 'connected') continue;
      
      for (const tool of instance.tools) {
        tools.push({
          type: 'function',
          function: {
            name: `${id}_${tool.name}`,
            description: `[${instance.config.name}] ${tool.description || tool.name}`,
            parameters: tool.inputSchema || { type: 'object', properties: {} }
          }
        });
      }
    }
    
    return tools;
  }

  /**
   * Get status of all connections
   */
  getStatus(): Record<string, { 
    status: string; 
    type: string;
    name: string;
    toolCount: number;
  }> {
    const status: Record<string, any> = {};
    
    for (const [id, instance] of this.clients.entries()) {
      status[id] = {
        status: instance.status,
        type: instance.config.type,
        name: instance.config.name,
        toolCount: instance.tools.length
      };
    }
    
    return status;
  }

  /**
   * Check if a connection is ready
   */
  isConnected(connectionId: string): boolean {
    const instance = this.clients.get(connectionId);
    return instance?.status === 'connected';
  }

  /**
   * Disconnect all connections
   */
  async disconnectAll(): Promise<void> {
    const ids = Array.from(this.clients.keys());
    await Promise.all(ids.map(id => this.disconnect(id)));
  }
}

// Export singleton instance
export const mcpClient = new MCPClientManager();

export default mcpClient;
