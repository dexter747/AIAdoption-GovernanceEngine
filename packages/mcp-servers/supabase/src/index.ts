#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.SUPABASE_URL) console.error('Warning: SUPABASE_URL not set');
  if (!process.env.SUPABASE_SERVICE_KEY) console.error('Warning: SUPABASE_SERVICE_KEY not set');

  api = axios.create({
    baseURL: `${process.env.SUPABASE_URL}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      apikey: `${process.env.SUPABASE_SERVICE_KEY}`,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'query',
    description: 'Execute a SQL query via RPC',
    inputSchema: {
      type: 'object' as const,
      properties: { sql: { type: 'string', description: 'The sql' } },
    },
  },
  {
    name: 'list_tables',
    description: 'List tables',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_rows',
    description: 'Get rows from a table',
    inputSchema: {
      type: 'object' as const,
      properties: { table: { type: 'string', description: 'The table' } },
      required: ['table'],
    },
  },
  {
    name: 'insert_row',
    description: 'Insert a row',
    inputSchema: {
      type: 'object' as const,
      properties: {
        table: { type: 'string', description: 'The table' },
        data: { type: 'string', description: 'The data' },
      },
      required: ['table'],
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
    { name: 'supabase-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'query':
        return safeCall(() => api.post(`/rest/v1/rpc/query`, { sql: a.sql }));
      case 'list_tables':
        return safeCall(() => api.get(`/rest/v1/`));
      case 'get_rows':
        return safeCall(() => api.get(`/rest/v1/${a.table}`));
      case 'insert_row':
        return safeCall(() => api.post(`/rest/v1/${a.table}`, { data: a.data }));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Supabase MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
