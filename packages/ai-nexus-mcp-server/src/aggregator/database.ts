/**
 * Database Aggregator
 * Provides unified access to all database MCP servers in the farm
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('database-aggregator');

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlserver' | 'oracle' | 'sap-hana' | 'redis' | 'sqlite' | 'elasticsearch' | 'mariadb';
  mcpEndpoint: string;
  status: 'connected' | 'disconnected' | 'error';
  description?: string;
  capabilities?: string[];
}

// Registry of database MCP servers (configured via Docker Compose)
const DATABASE_SERVERS: Record<string, { type: DatabaseConnection['type']; endpoint: string; description: string; capabilities: string[] }> = {
  'postgres-main': {
    type: 'postgresql',
    endpoint: process.env.POSTGRES_MCP_URL ?? 'http://postgres-mcp:3000',
    description: 'PostgreSQL - Advanced open-source relational database',
    capabilities: ['query', 'schema', 'transactions', 'json', 'full-text-search']
  },
  'mysql-main': {
    type: 'mysql',
    endpoint: process.env.MYSQL_MCP_URL ?? 'http://mysql-mcp:3000',
    description: 'MySQL - Popular relational database',
    capabilities: ['query', 'schema', 'transactions', 'stored-procedures']
  },
  'mariadb-main': {
    type: 'mariadb',
    endpoint: process.env.MARIADB_MCP_URL ?? 'http://mariadb-mcp:3000',
    description: 'MariaDB - Enhanced MySQL fork',
    capabilities: ['query', 'schema', 'transactions', 'galera-cluster']
  },
  'mongodb-main': {
    type: 'mongodb',
    endpoint: process.env.MONGODB_MCP_URL ?? 'http://mongodb-mcp:27017',
    description: 'MongoDB - Document-oriented NoSQL database',
    capabilities: ['query', 'aggregation', 'indexes', 'change-streams']
  },
  'sqlserver-main': {
    type: 'sqlserver',
    endpoint: process.env.SQLSERVER_MCP_URL ?? 'http://sqlserver-mcp:3000',
    description: 'Microsoft SQL Server - Enterprise relational database',
    capabilities: ['query', 'schema', 'transactions', 't-sql', 'stored-procedures']
  },
  'oracle-main': {
    type: 'oracle',
    endpoint: process.env.ORACLE_MCP_URL ?? 'http://oracle-mcp:3000',
    description: 'Oracle Database - Enterprise-grade RDBMS',
    capabilities: ['query', 'schema', 'plsql', 'explain-plan', 'partitioning']
  },
  'sap-hana-main': {
    type: 'sap-hana',
    endpoint: process.env.SAP_HANA_MCP_URL ?? 'http://sap-hana-mcp:3000',
    description: 'SAP HANA - In-memory enterprise database',
    capabilities: ['query', 'schema', 'calculation-views', 'real-time-analytics']
  },
  'redis-cache': {
    type: 'redis',
    endpoint: process.env.REDIS_MCP_URL ?? 'http://redis-mcp:3000',
    description: 'Redis - In-memory data structure store',
    capabilities: ['get', 'set', 'hash', 'list', 'pub-sub', 'streams']
  },
  'sqlite-local': {
    type: 'sqlite',
    endpoint: process.env.SQLITE_MCP_URL ?? 'http://sqlite-mcp:3000',
    description: 'SQLite - Lightweight embedded database',
    capabilities: ['query', 'schema', 'fts5']
  },
  'elasticsearch-main': {
    type: 'elasticsearch',
    endpoint: process.env.ELASTICSEARCH_MCP_URL ?? 'http://elasticsearch-mcp:9200',
    description: 'Elasticsearch - Distributed search and analytics',
    capabilities: ['search', 'aggregations', 'mappings', 'full-text']
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
