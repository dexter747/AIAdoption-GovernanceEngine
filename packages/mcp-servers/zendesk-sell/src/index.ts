#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.ZENDESK_SELL_ACCESS_TOKEN)
    console.error('Warning: ZENDESK_SELL_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: process.env.ZENDESK_SELL_ACCESS_TOKEN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.ZENDESK_SELL_ACCESS_TOKEN || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_leads',
    description: 'List leads',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_deals',
    description: 'List deals',
    inputSchema: {
      type: 'object' as const,
      properties: {},
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
    name: 'get_deal',
    description: 'Get deal details',
    inputSchema: {
      type: 'object' as const,
      properties: { dealId: { type: 'string', description: 'The dealId' } },
      required: ['dealId'],
    },
  },
  {
    name: 'search',
    description: 'Search across entities',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
      required: ['query'],
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
    { name: 'zendesk-sell-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_leads':
        return safeCall(() => api.get(`/leads`));
      case 'list_deals':
        return safeCall(() => api.get(`/deals`));
      case 'list_contacts':
        return safeCall(() => api.get(`/contacts`));
      case 'get_deal':
        return safeCall(() => api.get(`/deals/${a.dealId}`));
      case 'search':
        return safeCall(() => api.get(`/leads?name=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Zendesk Sell MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
