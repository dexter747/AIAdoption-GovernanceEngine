#!/usr/bin/env node

/**
 * SQL Server MCP Server
 * Provides Model Context Protocol interface for Microsoft SQL Server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Connection, Request, TYPES } from 'tedious';

// SQL Server connection
let connection: Connection | null = null;

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'query',
    description: 'Execute a T-SQL query on SQL Server',
    inputSchema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'T-SQL query to execute',
        },
      },
      required: ['sql'],
    },
  },
  {
    name: 'list_tables',
    description: 'List all tables in the current database',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'describe_table',
    description: 'Get the schema of a specific table',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Name of the table to describe',
        },
      },
      required: ['table'],
    },
  },
  {
    name: 'list_databases',
    description: 'List all databases on the server',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: 'sqlserver-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize SQL Server connection
async function initConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    const config = {
      server: process.env.SQLSERVER_HOST || 'localhost',
      authentication: {
        type: 'default' as const,
        options: {
          userName: process.env.SQLSERVER_USER || 'sa',
          password: process.env.SQLSERVER_PASSWORD || '',
        },
      },
      options: {
        database: process.env.SQLSERVER_DATABASE,
        port: parseInt(process.env.SQLSERVER_PORT || '1433'),
        encrypt: process.env.SQLSERVER_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQLSERVER_TRUST_CERT !== 'false',
      },
    };

    connection = new Connection(config);

    connection.on('connect', (err) => {
      if (err) {
        reject(err);
      } else {
        console.error('Connected to SQL Server');
        resolve();
      }
    });

    connection.connect();
  });
}

// Execute query
function executeQuery(sql: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (!connection) {
      reject(new Error('Not connected to SQL Server'));
      return;
    }

    const rows: any[] = [];
    const request = new Request(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });

    request.on('row', (columns) => {
      const row: any = {};
      columns.forEach((column) => {
        row[column.metadata.colName] = column.value;
      });
      rows.push(row);
    });

    connection.execSql(request);
  });
}

// Tool handlers
async function handleQuery(sql: string) {
  try {
    const rows = await executeQuery(sql);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(rows, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleListTables() {
  const sql = `
    SELECT TABLE_SCHEMA, TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_SCHEMA, TABLE_NAME
  `;
  return handleQuery(sql);
}

async function handleDescribeTable(tableName: string) {
  const sql = `
    SELECT 
      COLUMN_NAME,
      DATA_TYPE,
      CHARACTER_MAXIMUM_LENGTH,
      IS_NULLABLE,
      COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = '${tableName.replace(/'/g, "''")}'
    ORDER BY ORDINAL_POSITION
  `;
  return handleQuery(sql);
}

async function handleListDatabases() {
  const sql = 'SELECT name FROM sys.databases WHERE name NOT IN (\'master\', \'tempdb\', \'model\', \'msdb\')';
  return handleQuery(sql);
}

// Register request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'query':
      return handleQuery((args as any).sql);
    case 'list_tables':
      return handleListTables();
    case 'describe_table':
      return handleDescribeTable((args as any).table);
    case 'list_databases':
      return handleListDatabases();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  try {
    await initConnection();
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('SQL Server MCP Server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Cleanup on exit
process.on('SIGINT', () => {
  if (connection) {
    connection.close();
  }
  process.exit(0);
});

main();
