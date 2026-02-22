#!/usr/bin/env node

/**
 * MariaDB MCP Server (MySQL-compatible)
 * Provides Model Context Protocol interface for MariaDB databases
 * MariaDB is MySQL-compatible, so we use the same mysql2 driver
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import mysql from 'mysql2/promise';

// MariaDB connection (using MySQL driver)
let connection: mysql.Connection | null = null;

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'query',
    description: 'Execute a SQL query on the MariaDB database',
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
    name: 'mariadb-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize MariaDB connection
async function initConnection() {
  const connectionString = process.env.MARIADB_CONNECTION_STRING;

  if (!connectionString) {
    // Parse individual env vars
    connection = await mysql.createConnection({
      host: process.env.MARIADB_HOST || 'localhost',
      port: parseInt(process.env.MARIADB_PORT || '3306'),
      user: process.env.MARIADB_USER || 'root',
      password: process.env.MARIADB_PASSWORD || '',
      database: process.env.MARIADB_DATABASE,
      ssl: process.env.MARIADB_SSL === 'true' ? {} : undefined,
    });
  } else {
    // Use connection string
    connection = await mysql.createConnection(connectionString);
  }

  console.error('Connected to MariaDB');
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async request => {
  if (!connection) {
    await initConnection();
  }

  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'query': {
        const sql = (args as any).sql;
        const [rows] = await connection!.execute(sql);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(rows, null, 2),
            },
          ],
        };
      }

      case 'list_tables': {
        const [rows] = await connection!.execute('SHOW TABLES');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(rows, null, 2),
            },
          ],
        };
      }

      case 'describe_table': {
        const table = (args as any).table;
        const [rows] = await connection!.execute(`DESCRIBE ${table}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(rows, null, 2),
            },
          ],
        };
      }

      case 'show_databases': {
        const [rows] = await connection!.execute('SHOW DATABASES');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(rows, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MariaDB MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
