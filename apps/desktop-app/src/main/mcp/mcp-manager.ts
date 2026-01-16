/**
 * MCP (Model Context Protocol) Connection Manager
 * Manages connections to database systems via MCP servers
 */

import { ConnectionConfig, LegacySystemType } from '@shared/types';
import Store from 'electron-store';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface MCPConnection {
  id: string;
  name: string;
  type: LegacySystemType;
  config: ConnectionConfig;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
  error?: string;
  mcpServerType: 'docker' | 'npm' | 'custom';
  mcpServerInfo?: {
    image?: string; // Docker image
    package?: string; // npm package
    containerId?: string; // Running Docker container
    processId?: number; // npm process
  };
}

export class MCPConnectionManager {
  private store: Store<{ connections: MCPConnection[] }>;
  private connections: Map<string, MCPConnection> = new Map();

  // Available MCP servers (official and community)
  private mcpServers: Record<LegacySystemType, {
    type: 'docker' | 'npm';
    image?: string;
    package?: string;
    available: boolean;
  }> = {
    postgresql: {
      type: 'npm',
      package: '@modelcontextprotocol/server-postgres',
      available: true,
    },
    mysql: {
      type: 'docker',
      image: 'mysql-mcp-server:latest', // Community or custom
      available: true,
    },
    oracle: {
      type: 'docker',
      image: 'oracle-mcp-server:latest',
      available: true,
    },
    sqlserver: {
      type: 'docker',
      image: 'sqlserver-mcp-server:latest',
      available: true,
    },
    'sap-hana': {
      type: 'custom',
      available: false, // Needs custom implementation
    },
    mongodb: {
      type: 'docker',
      image: 'mongodb-mcp-server:latest',
      available: true,
    },
    salesforce: {
      type: 'npm',
      package: '@modelcontextprotocol/server-salesforce',
      available: false, // To be implemented
    },
    servicenow: {
      type: 'custom',
      available: false,
    },
    jira: {
      type: 'npm',
      package: 'mcp-server-jira', // Community package
      available: true,
    },
    zendesk: {
      type: 'custom',
      available: false,
    },
  };

  constructor() {
    this.store = new Store({
      name: 'mcp-connections',
      defaults: {
        connections: [],
      },
    });

    this.loadConnections();
  }

  private loadConnections() {
    const saved = this.store.get('connections', []);
    saved.forEach(conn => {
      this.connections.set(conn.id, conn);
    });
  }

  private saveConnections() {
    const connections = Array.from(this.connections.values());
    this.store.set('connections', connections);
  }

  // Add new MCP connection
  async addConnection(config: ConnectionConfig): Promise<MCPConnection> {
    const id = crypto.randomUUID();
    const serverInfo = this.mcpServers[config.type];

    if (!serverInfo.available) {
      throw new Error(`MCP server for ${config.type} is not available yet`);
    }

    const connection: MCPConnection = {
      id,
      name: config.name,
      type: config.type,
      config,
      enabled: false,
      status: 'disconnected',
      mcpServerType: serverInfo.type,
      mcpServerInfo: {
        image: serverInfo.image,
        package: serverInfo.package,
      },
    };

    this.connections.set(id, connection);
    this.saveConnections();

    return connection;
  }

  // Enable MCP connection (start server and connect)
  async enableConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    try {
      if (connection.mcpServerType === 'docker') {
        await this.startDockerMCPServer(connection);
      } else if (connection.mcpServerType === 'npm') {
        await this.startNpmMCPServer(connection);
      }

      connection.enabled = true;
      connection.status = 'connected';
      connection.lastConnected = new Date();
      connection.error = undefined;

      this.saveConnections();
    } catch (error: any) {
      connection.status = 'error';
      connection.error = error.message;
      throw error;
    }
  }

  // Disable MCP connection (stop server)
  async disableConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    try {
      if (connection.mcpServerType === 'docker' && connection.mcpServerInfo?.containerId) {
        await this.stopDockerContainer(connection.mcpServerInfo.containerId);
      } else if (connection.mcpServerType === 'npm' && connection.mcpServerInfo?.processId) {
        process.kill(connection.mcpServerInfo.processId);
      }

      connection.enabled = false;
      connection.status = 'disconnected';
      connection.mcpServerInfo = {
        ...connection.mcpServerInfo,
        containerId: undefined,
        processId: undefined,
      };

      this.saveConnections();
    } catch (error: any) {
      connection.error = error.message;
      throw error;
    }
  }

  // Start Docker-based MCP server
  private async startDockerMCPServer(connection: MCPConnection): Promise<void> {
    const { image } = connection.mcpServerInfo!;
    const { config } = connection;

    // Check if Docker is available
    try {
      await execAsync('docker --version');
    } catch {
      throw new Error('Docker is not installed or not running');
    }

    // Pull image if not exists
    try {
      await execAsync(`docker pull ${image}`);
    } catch (error: any) {
      throw new Error(`Failed to pull Docker image: ${error.message}`);
    }

    // Build connection string based on type
    let connectionString = '';
    if (connection.type === 'postgresql') {
      connectionString = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    } else if (connection.type === 'mysql') {
      connectionString = `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    }

    // Start container
    const containerName = `mcp-${connection.type}-${connection.id.substring(0, 8)}`;
    const cmd = `docker run -d --name ${containerName} -e CONNECTION_STRING="${connectionString}" ${image}`;

    try {
      const { stdout } = await execAsync(cmd);
      const containerId = stdout.trim();
      connection.mcpServerInfo!.containerId = containerId;
    } catch (error: any) {
      throw new Error(`Failed to start Docker container: ${error.message}`);
    }
  }

  // Start npm-based MCP server
  private async startNpmMCPServer(connection: MCPConnection): Promise<void> {
    const { package: packageName } = connection.mcpServerInfo!;
    
    // Check if package is installed
    try {
      await execAsync(`npm list -g ${packageName}`);
    } catch {
      // Install if not present
      console.log(`Installing ${packageName}...`);
      await execAsync(`npm install -g ${packageName}`);
    }

    // Start MCP server as child process
    // This is a placeholder - actual implementation would use child_process.spawn
    // and maintain the process reference
    console.log(`Starting npm MCP server: ${packageName}`);
  }

  // Stop Docker container
  private async stopDockerContainer(containerId: string): Promise<void> {
    try {
      await execAsync(`docker stop ${containerId}`);
      await execAsync(`docker rm ${containerId}`);
    } catch (error: any) {
      console.error(`Failed to stop container: ${error.message}`);
    }
  }

  // Test MCP connection
  async testConnection(id: string): Promise<boolean> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // TODO: Implement actual MCP connection test
    // This would involve sending a test query via MCP protocol
    return true;
  }

  // Get all connections
  getAllConnections(): MCPConnection[] {
    return Array.from(this.connections.values());
  }

  // Get connection by ID
  getConnection(id: string): MCPConnection | undefined {
    return this.connections.get(id);
  }

  // Update connection
  async updateConnection(id: string, updates: Partial<ConnectionConfig>): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // If connection is enabled, disable it first
    if (connection.enabled) {
      await this.disableConnection(id);
    }

    connection.config = { ...connection.config, ...updates };
    if (updates.name) {
      connection.name = updates.name;
    }

    this.saveConnections();
  }

  // Delete connection
  async deleteConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Disable if enabled
    if (connection.enabled) {
      await this.disableConnection(id);
    }

    this.connections.delete(id);
    this.saveConnections();
  }

  // Get available MCP server types
  getAvailableMCPServers(): Record<LegacySystemType, {
    available: boolean;
    type: 'docker' | 'npm' | 'custom';
    status: string;
  }> {
    const result: any = {};
    for (const [type, info] of Object.entries(this.mcpServers)) {
      result[type] = {
        available: info.available,
        type: info.type,
        status: info.available
          ? `Ready (${info.type})`
          : 'Coming soon',
      };
    }
    return result;
  }

  // Check if Docker is available
  async checkDockerAvailable(): Promise<boolean> {
    try {
      await execAsync('docker --version');
      return true;
    } catch {
      return false;
    }
  }
}

export const mcpConnectionManager = new MCPConnectionManager();
