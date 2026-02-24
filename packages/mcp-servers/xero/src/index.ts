#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.XERO_ACCESS_TOKEN) console.error('Warning: XERO_ACCESS_TOKEN not set');
  if (!process.env.XERO_TENANT_ID) console.error('Warning: XERO_TENANT_ID not set');

  api = axios.create({
    baseURL: process.env.XERO_ACCESS_TOKEN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.XERO_ACCESS_TOKEN || ''}`,
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
    name: 'list_contacts',
    description: 'List contacts',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_accounts',
    description: 'List chart of accounts',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_bank_transactions',
    description: 'List bank transactions',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_balance_sheet',
    description: 'Get balance sheet',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_profit_loss',
    description: 'Get profit and loss',
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
    { name: 'xero-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_invoices':
        return safeCall(() => api.get(`/Invoices`));
      case 'get_invoice':
        return safeCall(() => api.get(`/Invoices/${a.invoiceId}`));
      case 'list_contacts':
        return safeCall(() => api.get(`/Contacts`));
      case 'list_accounts':
        return safeCall(() => api.get(`/Accounts`));
      case 'list_bank_transactions':
        return safeCall(() => api.get(`/BankTransactions`));
      case 'get_balance_sheet':
        return safeCall(() => api.get(`/Reports/BalanceSheet`));
      case 'get_profit_loss':
        return safeCall(() => api.get(`/Reports/ProfitAndLoss`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Xero MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
