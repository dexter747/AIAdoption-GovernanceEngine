#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.STARBURST_HOST) console.error('Warning: STARBURST_HOST not set');
  if (!process.env.STARBURST_USER) console.error('Warning: STARBURST_USER not set');
  if (!process.env.STARBURST_PASSWORD) console.error('Warning: STARBURST_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.STARBURST_HOST || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.STARBURST_HOST || ''}`,
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
    name: 'list_catalogs',
    description: 'List catalogs',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_schemas',
    description: 'List schemas in a catalog',
    inputSchema: {
      type: 'object' as const,
      properties: { catalog: { type: 'string', description: 'The catalog' } },
      required: ['catalog'],
    },
  },
  {
    name: 'list_tables',
    description: 'List tables in a schema',
    inputSchema: {
      type: 'object' as const,
      properties: {
        catalog: { type: 'string', description: 'The catalog' },
        schema: { type: 'string', description: 'The schema' },
      },
      required: ['catalog', 'schema'],
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
    { name: 'starburst-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'query':
        return safeCall(() => api.get(`/query`));
      case 'list_catalogs':
        return safeCall(() => api.get(`/list_catalogs`));
      case 'list_schemas':
        return safeCall(() => api.get(`/list_schemas`));
      case 'list_tables':
        return safeCall(() => api.get(`/list_tables`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Starburst MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
