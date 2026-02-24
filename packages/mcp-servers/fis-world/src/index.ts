#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.FIS_WORLD_BASE_URL) console.error('Warning: FIS_WORLD_BASE_URL not set');
  if (!process.env.FIS_WORLD_USERNAME) console.error('Warning: FIS_WORLD_USERNAME not set');
  if (!process.env.FIS_WORLD_PASSWORD) console.error('Warning: FIS_WORLD_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.FIS_WORLD_BASE_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.FIS_WORLD_BASE_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_accounts',
    description: 'List accounts',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_account',
    description: 'Get account details',
    inputSchema: {
      type: 'object' as const,
      properties: { accountId: { type: 'string', description: 'The accountId' } },
      required: ['accountId'],
    },
  },
  {
    name: 'list_loans',
    description: 'List loans',
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
    { name: 'fis-world-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_accounts':
        return safeCall(() => api.get(`/accounts`));
      case 'get_account':
        return safeCall(() => api.get(`/accounts/${a.accountId}`));
      case 'list_loans':
        return safeCall(() => api.get(`/loans`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('FIS World MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
