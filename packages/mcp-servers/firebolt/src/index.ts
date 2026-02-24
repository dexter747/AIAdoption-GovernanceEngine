#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.FIREBOLT_CLIENT_ID) console.error('Warning: FIREBOLT_CLIENT_ID not set');
  if (!process.env.FIREBOLT_CLIENT_SECRET) console.error('Warning: FIREBOLT_CLIENT_SECRET not set');
  if (!process.env.FIREBOLT_DATABASE) console.error('Warning: FIREBOLT_DATABASE not set');
  if (!process.env.FIREBOLT_ENGINE) console.error('Warning: FIREBOLT_ENGINE not set');

  api = axios.create({
    baseURL: process.env.FIREBOLT_CLIENT_ID || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.FIREBOLT_CLIENT_ID || ''}`,
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
    name: 'list_tables',
    description: 'List all tables',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'describe_table',
    description: 'Get table schema',
    inputSchema: {
      type: 'object' as const,
      properties: { tableName: { type: 'string', description: 'The tableName' } },
      required: ['tableName'],
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
    { name: 'firebolt-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'query':
        return safeCall(() => api.get(`/query`));
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
  console.error('Firebolt MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
