#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import pg from 'pg';

const { Pool } = pg;
let pool: pg.Pool | null = null;

const TOOLS: Tool[] = [
  {
    name: 'query',
    description: 'Execute a SQL query on the PostgreSQL database',
    inputSchema: {
      type: 'object',
      properties: {
        sql: { type: 'string', description: 'SQL query to execute' },
        params: { type: 'array', description: 'Query parameters', items: { type: 'string' } },
      },
      required: ['sql'],
    },
  },
  {
    name: 'list_tables',
    description: 'List all tables in the current schema',
    inputSchema: {
      type: 'object',
      properties: { schema: { type: 'string', description: 'Schema name (default: public)' } },
    },
  },
  {
    name: 'describe_table',
    description: 'Get column details for a table',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        schema: { type: 'string', description: 'Schema name' },
      },
      required: ['table'],
    },
  },
  {
    name: 'list_schemas',
    description: 'List all schemas in the database',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_databases',
    description: 'List all databases on the server',
    inputSchema: { type: 'object', properties: {} },
  },
];

const server = new Server(
  { name: 'postgresql-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

async function initConnection() {
  const connectionString = process.env.POSTGRES_CONNECTION_STRING;
  if (connectionString) {
    pool = new Pool({ connectionString });
  } else {
    pool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432'),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'postgres',
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
    });
  }
  const client = await pool.connect();
  client.release();
  console.error('Connected to PostgreSQL');
}

async function handleQuery(sql: string, params?: string[]) {
  if (!pool) throw new Error('Not connected');
  try {
    const result = await pool.query(sql, params);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              rows: result.rows,
              rowCount: result.rowCount,
              fields: result.fields?.map((f: any) => f.name),
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function handleListTables(schema: string = 'public') {
  if (!pool) throw new Error('Not connected');
  const result = await pool.query(
    `SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name`,
    [schema]
  );
  return { content: [{ type: 'text' as const, text: JSON.stringify(result.rows, null, 2) }] };
}

async function handleDescribeTable(table: string, schema: string = 'public') {
  if (!pool) throw new Error('Not connected');
  const result = await pool.query(
    `SELECT column_name, data_type, is_nullable, column_default, character_maximum_length FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position`,
    [schema, table]
  );
  return { content: [{ type: 'text' as const, text: JSON.stringify(result.rows, null, 2) }] };
}

async function handleListSchemas() {
  if (!pool) throw new Error('Not connected');
  const result = await pool.query(
    `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema') ORDER BY schema_name`
  );
  return { content: [{ type: 'text' as const, text: JSON.stringify(result.rows, null, 2) }] };
}

async function handleListDatabases() {
  if (!pool) throw new Error('Not connected');
  const result = await pool.query(
    `SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname`
  );
  return { content: [{ type: 'text' as const, text: JSON.stringify(result.rows, null, 2) }] };
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;
  switch (name) {
    case 'query':
      return handleQuery((args as any).sql, (args as any).params);
    case 'list_tables':
      return handleListTables((args as any).schema);
    case 'describe_table':
      return handleDescribeTable((args as any).table, (args as any).schema);
    case 'list_schemas':
      return handleListSchemas();
    case 'list_databases':
      return handleListDatabases();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  try {
    await initConnection();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('PostgreSQL MCP Server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
