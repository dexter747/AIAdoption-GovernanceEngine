#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.BIGCOMMERCE_STORE_HASH) console.error('Warning: BIGCOMMERCE_STORE_HASH not set');
  if (!process.env.BIGCOMMERCE_ACCESS_TOKEN)
    console.error('Warning: BIGCOMMERCE_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: process.env.BIGCOMMERCE_STORE_HASH || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.BIGCOMMERCE_STORE_HASH || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_products',
    description: 'List products',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_product',
    description: 'Get product details',
    inputSchema: {
      type: 'object' as const,
      properties: { productId: { type: 'string', description: 'The productId' } },
      required: ['productId'],
    },
  },
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
    name: 'list_customers',
    description: 'List customers',
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
    { name: 'bigcommerce-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_products':
        return safeCall(() => api.get(`/catalog/products`));
      case 'get_product':
        return safeCall(() => api.get(`/catalog/products/${a.productId}`));
      case 'list_orders':
        return safeCall(() => api.get(`/orders`));
      case 'get_order':
        return safeCall(() => api.get(`/orders/${a.orderId}`));
      case 'list_customers':
        return safeCall(() => api.get(`/customers`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('BigCommerce MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
