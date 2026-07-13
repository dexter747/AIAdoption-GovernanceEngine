#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.KEAP_ACCESS_TOKEN) console.error('Warning: KEAP_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: 'https://api.infusionsoft.com/crm/rest/v1',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.KEAP_ACCESS_TOKEN}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_contacts',
    description: 'List contacts',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_contact',
    description: 'Get contact details',
    inputSchema: {
      type: 'object' as const,
      properties: { contactId: { type: 'string', description: 'The contactId' } },
      required: ['contactId'],
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
    name: 'search',
    description: 'Search contacts',
    inputSchema: {
      type: 'object' as const,
      properties: { email: { type: 'string', description: 'The email' } },
      required: ['email'],
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
    { name: 'keap-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_contacts':
        return safeCall(() => api.get(`/contacts`));
      case 'get_contact':
        return safeCall(() => api.get(`/contacts/${a.contactId}`));
      case 'list_orders':
        return safeCall(() => api.get(`/orders`));
      case 'search':
        return safeCall(() => api.get(`/contacts?email=${a.email}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Keap (Infusionsoft) MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
