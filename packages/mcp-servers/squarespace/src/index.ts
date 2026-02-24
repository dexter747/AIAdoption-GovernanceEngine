#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.SQUARESPACE_API_KEY) console.error('Warning: SQUARESPACE_API_KEY not set');

  api = axios.create({
    baseURL: process.env.SQUARESPACE_API_KEY || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.SQUARESPACE_API_KEY || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_orders',
    description: 'List orders',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_order',
    description: 'Get order details',
    inputSchema: {
      type: 'object' as const,
      properties: { orderId: { type: 'string', description: 'The orderId' } },
      required: ['orderId'],
    },
  },
  {
    name: 'list_products',
    description: 'List products',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_inventory',
    description: 'List inventory',
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
    { name: 'squarespace-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_orders':
        return safeCall(() => api.get(`/commerce/orders`));
      case 'get_order':
        return safeCall(() => api.get(`/commerce/orders/${a.orderId}`));
      case 'list_products':
        return safeCall(() => api.get(`/commerce/products`));
      case 'list_inventory':
        return safeCall(() => api.get(`/commerce/inventory`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Squarespace MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
