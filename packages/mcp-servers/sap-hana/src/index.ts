#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import hana from '@sap/hana-client';

let connection: any = null;

const server = new Server(
  { name: 'sap-hana-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

async function initConnection() {
  const connOptions = {
    serverNode: `${process.env.SAP_HANA_HOST}:${process.env.SAP_HANA_PORT}`,
    uid: process.env.SAP_HANA_USER,
    pwd: process.env.SAP_HANA_PASSWORD,
    encrypt: process.env.SAP_HANA_ENCRYPT === 'true',
  };
  
  connection = hana.createConnection();
  await new Promise((resolve, reject) => {
    connection.connect(connOptions, (err: any) => {
      if (err) reject(err);
      else resolve(null);
    });
  });
  console.error('Connected to SAP HANA');
}

async function executeQuery(sql: string) {
  if (!connection) throw new Error('Not connected');
  try {
    const result: any = await new Promise((resolve, reject) => {
      connection.exec(sql, (err: any, rows: any) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'query',
      description: 'Execute SQL query on SAP HANA',
      inputSchema: { type: 'object', properties: { sql: { type: 'string' } }, required: ['sql'] },
    },
    {
      name: 'list_tables',
      description: 'List all tables in schema',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === 'query') return executeQuery((args as any).sql);
  if (name === 'list_tables') return executeQuery('SELECT TABLE_NAME FROM SYS.TABLES WHERE SCHEMA_NAME = CURRENT_SCHEMA ORDER BY TABLE_NAME');
  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SAP HANA MCP Server running');
}

main();
