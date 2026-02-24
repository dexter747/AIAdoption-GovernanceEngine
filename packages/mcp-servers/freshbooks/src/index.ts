#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.FRESHBOOKS_ACCESS_TOKEN)
    console.error('Warning: FRESHBOOKS_ACCESS_TOKEN not set');
  if (!process.env.FRESHBOOKS_ACCOUNT_ID) console.error('Warning: FRESHBOOKS_ACCOUNT_ID not set');

  api = axios.create({
    baseURL: process.env.FRESHBOOKS_ACCESS_TOKEN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.FRESHBOOKS_ACCESS_TOKEN || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_invoices',
    description: 'List invoices',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_invoice',
    description: 'Get invoice details',
    inputSchema: {
      type: 'object' as const,
      properties: { invoiceId: { type: 'string', description: 'The invoiceId' } },
      required: ['invoiceId'],
    },
  },
  {
    name: 'list_clients',
    description: 'List clients',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_expenses',
    description: 'List expenses',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_payments',
    description: 'List payments',
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
    { name: 'freshbooks-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_invoices':
        return safeCall(() => api.get(`/invoices/invoices`));
      case 'get_invoice':
        return safeCall(() => api.get(`/invoices/invoices/${a.invoiceId}`));
      case 'list_clients':
        return safeCall(() => api.get(`/users/clients`));
      case 'list_expenses':
        return safeCall(() => api.get(`/expenses/expenses`));
      case 'list_payments':
        return safeCall(() => api.get(`/payments/payments`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('FreshBooks MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
