#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import oracledb from 'oracledb';

let connection: any = null;

const server = new Server(
  { name: 'oracle-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

async function initConnection() {
  const config = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING || `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`,
  };
  connection = await oracledb.getConnection(config);
  console.error('Connected to Oracle');
}

async function executeQuery(sql: string) {
  if (!connection) throw new Error('Not connected');
  try {
    const result = await connection.execute(sql);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.rows, null, 2) }],
    };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'query',
      description: 'Execute SQL query',
      inputSchema: { type: 'object', properties: { sql: { type: 'string' } }, required: ['sql'] },
    },
    {
      name: 'list_tables',
      description: 'List all tables',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === 'query') return executeQuery((args as any).sql);
  if (name === 'list_tables') return executeQuery('SELECT table_name FROM user_tables ORDER BY table_name');
  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Oracle MCP Server running');
}

main();
