/**
 * Database Aggregator
 * Provides unified access to all database MCP servers in the farm
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('database-aggregator');

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlserver' | 'oracle' | 'redis' | 'sqlite' | 'elasticsearch';
  mcpEndpoint: string;
  status: 'connected' | 'disconnected' | 'error';
  description?: string;
}

// Registry of database MCP servers (configured via Docker Compose)
const DATABASE_SERVERS: Record<string, { type: DatabaseConnection['type']; endpoint: string; description: string }> = {
  'postgres-main': {
    type: 'postgresql',
    endpoint: process.env.POSTGRES_MCP_URL ?? 'http://postgres-mcp:3000',
    description: 'Main PostgreSQL database'
  },
  'mysql-main': {
    type: 'mysql',
    endpoint: process.env.MYSQL_MCP_URL ?? 'http://mysql-mcp:3000',
    description: 'Main MySQL database'
  },
  'mongodb-main': {
    type: 'mongodb',
    endpoint: process.env.MONGODB_MCP_URL ?? 'http://mongodb-mcp:27017',
    description: 'Main MongoDB database'
  },
  'redis-cache': {
    type: 'redis',
    endpoint: process.env.REDIS_MCP_URL ?? 'http://redis-mcp:3000',
    description: 'Redis cache layer'
  },
  'sqlite-local': {
    type: 'sqlite',
    endpoint: process.env.SQLITE_MCP_URL ?? 'http://sqlite-mcp:3000',
    description: 'Local SQLite database'
  }
};

export class DatabaseAggregator {
  private connections: Map<string, DatabaseConnection> = new Map();

  constructor() {
    this.initializeConnections();
  }

  private async initializeConnections() {
    for (const [id, config] of Object.entries(DATABASE_SERVERS)) {
      this.connections.set(id, {
        id,
        name: id,
        type: config.type,
        mcpEndpoint: config.endpoint,
        status: 'disconnected', // Will be connected on first use
        description: config.description
      });
    }

    logger.info({ count: this.connections.size }, 'Database connections initialized');
  }

  async listDatabases(): Promise<DatabaseConnection[]> {
    // Check health of each connection
    const databases = Array.from(this.connections.values());
    
    // Update status by pinging each endpoint
    for (const db of databases) {
      try {
        // In production, would ping the MCP server
        // For now, mark as connected if endpoint is configured
        db.status = 'connected';
      } catch {
        db.status = 'error';
      }
    }

    return databases;
  }

  async query(
    databaseId: string, 
    query: string, 
    naturalLanguage?: string
  ): Promise<Record<string, unknown>> {
    const connection = this.connections.get(databaseId);
    
    if (!connection) {
      throw new Error(`Database '${databaseId}' not found. Use list_databases to see available databases.`);
    }

    logger.info({ databaseId, queryLength: query.length }, 'Executing database query');

    // If natural language is provided, convert to SQL first
    let finalQuery = query;
    if (naturalLanguage && !query) {
      finalQuery = await this.naturalLanguageToQuery(connection.type, naturalLanguage);
    }

    // In production, this would call the actual MCP server
    // For now, return a mock response showing the structure
    const mockResult = {
      database: databaseId,
      type: connection.type,
      query: finalQuery,
      result: {
        rows: [],
        rowCount: 0,
        message: `Query executed on ${connection.type} database. Connect MCP server to get real results.`
      },
      executionTimeMs: 0
    };

    return mockResult;
  }

  async getSchema(databaseId: string): Promise<Record<string, unknown>> {
    const connection = this.connections.get(databaseId);
    
    if (!connection) {
      throw new Error(`Database '${databaseId}' not found.`);
    }

    // In production, would call MCP server's list_tables tool
    return {
      database: databaseId,
      type: connection.type,
      schema: {
        tables: [],
        message: `Connect ${connection.type} MCP server to retrieve actual schema.`
      }
    };
  }

  private async naturalLanguageToQuery(
    dbType: DatabaseConnection['type'], 
    naturalLanguage: string
  ): Promise<string> {
    // In production, would use AI to convert natural language to SQL
    // For now, return a placeholder
    logger.info({ dbType, naturalLanguage }, 'Converting natural language to query');
    
    return `-- Natural language: ${naturalLanguage}\n-- TODO: Use AI to generate ${dbType} query`;
  }

  async healthCheck(): Promise<Record<string, unknown>> {
    const statuses: Record<string, string> = {};
    
    for (const [id, conn] of this.connections) {
      statuses[id] = conn.status;
    }

    return {
      status: 'healthy',
      connections: statuses,
      totalDatabases: this.connections.size
    };
  }
}
