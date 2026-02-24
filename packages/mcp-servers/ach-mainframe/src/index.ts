#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.ACH_HOST) console.error('Warning: ACH_HOST not set');
  if (!process.env.ACH_PORT) console.error('Warning: ACH_PORT not set');
  if (!process.env.ACH_USERNAME) console.error('Warning: ACH_USERNAME not set');
  if (!process.env.ACH_PASSWORD) console.error('Warning: ACH_PASSWORD not set');

  api = axios.create({
    baseURL: `http://${process.env.ACH_HOST}:${process.env.ACH_PORT}`,
    auth: {
      username: process.env.ACH_USERNAME || '',
      password: process.env.ACH_PASSWORD || '',
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_batches',
    description: 'List ACH batches',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_batch',
    description: 'Get batch details',
    inputSchema: {
      type: 'object' as const,
      properties: { batchId: { type: 'string', description: 'The batchId' } },
      required: ['batchId'],
    },
  },
  {
    name: 'list_transactions',
    description: 'List transactions',
    inputSchema: {
      type: 'object' as const,
      properties: {},
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
    { name: 'ach-mainframe-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_batches':
        return safeCall(() => api.get(`/batches`));
      case 'get_batch':
        return safeCall(() => api.get(`/batches/${a.batchId}`));
      case 'list_transactions':
        return safeCall(() => api.get(`/transactions`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ACH Mainframe MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
