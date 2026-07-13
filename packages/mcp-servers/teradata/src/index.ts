#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.TERADATA_HOST) console.error('Warning: TERADATA_HOST not set');
  if (!process.env.TERADATA_USER) console.error('Warning: TERADATA_USER not set');
  if (!process.env.TERADATA_PASSWORD) console.error('Warning: TERADATA_PASSWORD not set');

  api = axios.create({
    baseURL: 'http://localhost',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'query',
    description: 'Execute a SQL query',
    inputSchema: {
      type: 'object' as const,
      properties: { sql: { type: 'string', description: 'The sql' } },
    },
  },
  {
    name: 'list_databases',
    description: 'List all databases',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_tables',
    description: 'List tables in a database',
    inputSchema: {
      type: 'object' as const,
      properties: { database: { type: 'string', description: 'The database' } },
      required: ['database'],
    },
  },
  {
    name: 'describe_table',
    description: 'Get table schema',
    inputSchema: {
      type: 'object' as const,
      properties: {
        database: { type: 'string', description: 'The database' },
        table: { type: 'string', description: 'The table' },
      },
      required: ['database', 'table'],
    },
  },
];

async function safeCall(
  fn: () => Promise<any>
): Promise<{ content: { type: 'text'; text: string }[] }> {
  try {
    const response = await fn();
    return { content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }] };
  } catch (err: any) {
    const msg = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
    return { content: [{ type: 'text' as const, text: `Error: ${msg}` }] };
  }
}

async function main(): Promise<void> {
  initConnection();

  const server = new Server(
    { name: 'teradata-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'query':
        return safeCall(() => api.get(`/query`));
      case 'list_databases':
        return safeCall(() => api.get(`/list_databases`));
      case 'list_tables':
        return safeCall(() => api.get(`/list_tables`));
      case 'describe_table':
        return safeCall(() => api.get(`/describe_table`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Teradata MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
