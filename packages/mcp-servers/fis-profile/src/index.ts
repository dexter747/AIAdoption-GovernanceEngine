#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.FIS_PROFILE_BASE_URL) console.error('Warning: FIS_PROFILE_BASE_URL not set');
  if (!process.env.FIS_PROFILE_USERNAME) console.error('Warning: FIS_PROFILE_USERNAME not set');
  if (!process.env.FIS_PROFILE_PASSWORD) console.error('Warning: FIS_PROFILE_PASSWORD not set');

  api = axios.create({
    baseURL: `${process.env.FIS_PROFILE_BASE_URL}/api/v1`,
    auth: {
      username: process.env.FIS_PROFILE_USERNAME || '',
      password: process.env.FIS_PROFILE_PASSWORD || '',
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
    name: 'get_account',
    description: 'Get account information',
    inputSchema: {
      type: 'object' as const,
      properties: { accountId: { type: 'string', description: 'The accountId' } },
      required: ['accountId'],
    },
  },
  {
    name: 'list_transactions',
    description: 'List transactions',
    inputSchema: {
      type: 'object' as const,
      properties: { accountId: { type: 'string', description: 'The accountId' } },
      required: ['accountId'],
    },
  },
  {
    name: 'get_customer',
    description: 'Get customer profile',
    inputSchema: {
      type: 'object' as const,
      properties: { customerId: { type: 'string', description: 'The customerId' } },
      required: ['customerId'],
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
    { name: 'fis-profile-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'get_account':
        return safeCall(() => api.get(`/accounts/${a.accountId}`));
      case 'list_transactions':
        return safeCall(() => api.get(`/accounts/${a.accountId}/transactions`));
      case 'get_customer':
        return safeCall(() => api.get(`/customers/${a.customerId}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('FIS Profile MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
