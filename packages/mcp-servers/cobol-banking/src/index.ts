#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.COBOL_HOST) console.error('Warning: COBOL_HOST not set');
  if (!process.env.COBOL_PORT) console.error('Warning: COBOL_PORT not set');
  if (!process.env.COBOL_USERNAME) console.error('Warning: COBOL_USERNAME not set');
  if (!process.env.COBOL_PASSWORD) console.error('Warning: COBOL_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.COBOL_HOST || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.COBOL_HOST || ''}`,
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
    name: 'list_transactions',
    description: 'List transactions',
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
    { name: 'cobol-banking-mcp-server', version: '1.0.0' },
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
      case 'list_transactions':
        return safeCall(() => api.get(`/accounts/${a.accountId}/transactions`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('COBOL Banking MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
