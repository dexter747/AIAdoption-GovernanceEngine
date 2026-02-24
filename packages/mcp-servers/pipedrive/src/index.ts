#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.PIPEDRIVE_API_TOKEN) console.error('Warning: PIPEDRIVE_API_TOKEN not set');
  if (!process.env.PIPEDRIVE_DOMAIN) console.error('Warning: PIPEDRIVE_DOMAIN not set');

  api = axios.create({
    baseURL: process.env.PIPEDRIVE_DOMAIN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.PIPEDRIVE_API_TOKEN || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_deals',
    description: 'List all deals',
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
    name: 'list_persons',
    description: 'List all contacts',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_organizations',
    description: 'List all organizations',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'create_deal',
    description: 'Create a new deal',
    inputSchema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'The title' },
        value: { type: 'string', description: 'The value' },
        person_id: { type: 'string', description: 'The person_id' },
        org_id: { type: 'string', description: 'The org_id' },
      },
    },
  },
  {
    name: 'search',
    description: 'Search across items',
    inputSchema: {
      type: 'object' as const,
      properties: { term: { type: 'string', description: 'The term' } },
      required: ['term'],
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
    { name: 'pipedrive-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_deals':
        return safeCall(() => api.get(`/deals`));
      case 'get_deal':
        return safeCall(() => api.get(`/deals/${a.dealId}`));
      case 'list_persons':
        return safeCall(() => api.get(`/persons`));
      case 'list_organizations':
        return safeCall(() => api.get(`/organizations`));
      case 'create_deal':
        return safeCall(() =>
          api.post(`/deals`, {
            title: a.title,
            value: a.value,
            person_id: a.person_id,
            org_id: a.org_id,
          })
        );
      case 'search':
        return safeCall(() => api.get(`/itemSearch?term=${a.term}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Pipedrive MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
