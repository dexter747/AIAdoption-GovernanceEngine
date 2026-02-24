#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.T24_BASE_URL) console.error('Warning: T24_BASE_URL not set');
  if (!process.env.T24_USERNAME) console.error('Warning: T24_USERNAME not set');
  if (!process.env.T24_PASSWORD) console.error('Warning: T24_PASSWORD not set');

  api = axios.create({
    baseURL: `${process.env.T24_BASE_URL}/api/v1.0.0`,
    auth: {
      username: process.env.T24_USERNAME || '',
      password: process.env.T24_PASSWORD || '',
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
    name: 'list_customers',
    description: 'List customers',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_customer',
    description: 'Get customer details',
    inputSchema: {
      type: 'object' as const,
      properties: { customerId: { type: 'string', description: 'The customerId' } },
      required: ['customerId'],
    },
  },
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
    { name: 'temenos-t24-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_customers':
        return safeCall(() => api.get(`/party/customers`));
      case 'get_customer':
        return safeCall(() => api.get(`/party/customers/${a.customerId}`));
      case 'list_accounts':
        return safeCall(() => api.get(`/holdings/accounts`));
      case 'get_account':
        return safeCall(() => api.get(`/holdings/accounts/${a.accountId}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Temenos T24 MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
