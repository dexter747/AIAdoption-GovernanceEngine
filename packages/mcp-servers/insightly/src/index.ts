#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.INSIGHTLY_API_KEY) console.error('Warning: INSIGHTLY_API_KEY not set');

  api = axios.create({
    baseURL: 'https://api.insightly.com/v3.1',
    auth: {
      username: process.env.INSIGHTLY_API_KEY || '',
      password: 'x',
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
    name: 'list_opportunities',
    description: 'List opportunities',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_projects',
    description: 'List projects',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'search',
    description: 'Search across entities',
    inputSchema: {
      type: 'object' as const,
      properties: {
        field: { type: 'string', description: 'The field' },
        value: { type: 'string', description: 'The value' },
      },
      required: ['field', 'value'],
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
    { name: 'insightly-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_contacts':
        return safeCall(() => api.get(`/Contacts`));
      case 'get_contact':
        return safeCall(() => api.get(`/Contacts/${a.contactId}`));
      case 'list_opportunities':
        return safeCall(() => api.get(`/Opportunities`));
      case 'list_projects':
        return safeCall(() => api.get(`/Projects`));
      case 'search':
        return safeCall(() =>
          api.get(`/Contacts/Search?field_name=${a.field}&field_value=${a.value}`)
        );
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Insightly MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
