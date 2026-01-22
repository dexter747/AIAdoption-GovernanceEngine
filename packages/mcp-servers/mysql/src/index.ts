#!/usr/bin/env node

/**
 * MySQL MCP Server
 * Provides Model Context Protocol interface for MySQL databases
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import mysql from 'mysql2/promise';

// MySQL connection
let connection: mysql.Connection | null = null;

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'query',
    description: 'Execute a SQL query on the MySQL database',
    inputSchema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'SQL query to execute',
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
    name: 'show_databases',
    description: 'List all databases',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: 'mysql-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize MySQL connection
async function initConnection() {
  const connectionString = process.env.MYSQL_CONNECTION_STRING;
  
  if (!connectionString) {
    // Parse individual env vars
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE,
      ssl: process.env.MYSQL_SSL === 'true' ? {} : undefined,
    });
  } else {
    // Use connection string
    connection = await mysql.createConnection(connectionString);
  }
  
  console.error('Connected to MySQL');
}

// Tool handlers
async function handleQuery(sql: string) {
  if (!connection) throw new Error('Not connected to MySQL');
  
  try {
    const [rows] = await connection.query(sql);
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
  if (!connection) throw new Error('Not connected to MySQL');
  
  const [rows] = await connection.query(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()'
  );
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(rows, null, 2),
      },
    ],
  };
}

async function handleDescribeTable(tableName: string) {
  if (!connection) throw new Error('Not connected to MySQL');
  
  const [rows] = await connection.query(`DESCRIBE ${mysql.escapeId(tableName)}`);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(rows, null, 2),
      },
    ],
  };
}

async function handleShowDatabases() {
  if (!connection) throw new Error('Not connected to MySQL');
  
  const [rows] = await connection.query('SHOW DATABASES');
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(rows, null, 2),
      },
    ],
  };
}

// Register request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'query':
      return handleQuery((args as any).sql as string);
    case 'list_tables':
      return handleListTables();
    case 'describe_table':
      return handleDescribeTable((args as any).table as string);
    case 'show_databases':
      return handleShowDatabases();
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
    
    console.error('MySQL MCP Server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
