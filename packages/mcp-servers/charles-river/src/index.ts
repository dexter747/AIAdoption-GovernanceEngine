#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.CHARLES_RIVER_BASE_URL) console.error('Warning: CHARLES_RIVER_BASE_URL not set');
  if (!process.env.CHARLES_RIVER_API_KEY) console.error('Warning: CHARLES_RIVER_API_KEY not set');

  api = axios.create({
    baseURL: process.env.CHARLES_RIVER_BASE_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.CHARLES_RIVER_BASE_URL || ''}`,
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
    name: 'list_portfolios',
    description: 'List portfolios',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_compliance',
    description: 'Get compliance results',
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
    { name: 'charles-river-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_orders':
        return safeCall(() => api.get(`/orders`));
      case 'get_order':
        return safeCall(() => api.get(`/orders/${a.orderId}`));
      case 'list_portfolios':
        return safeCall(() => api.get(`/portfolios`));
      case 'get_compliance':
        return safeCall(() => api.get(`/compliance/results`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Charles River IMS MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
