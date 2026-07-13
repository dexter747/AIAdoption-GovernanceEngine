#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.CLOSE_API_KEY) console.error('Warning: CLOSE_API_KEY not set');

  api = axios.create({
    baseURL: 'https://api.close.com/api/v1',
    auth: {
      username: process.env.CLOSE_API_KEY || '',
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
    name: 'list_leads',
    description: 'List leads',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_lead',
    description: 'Get lead details',
    inputSchema: {
      type: 'object' as const,
      properties: { leadId: { type: 'string', description: 'The leadId' } },
      required: ['leadId'],
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
    name: 'list_opportunities',
    description: 'List opportunities',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'search',
    description: 'Search leads',
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
    { name: 'close-crm-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_leads':
        return safeCall(() => api.get(`/lead`));
      case 'get_lead':
        return safeCall(() => api.get(`/lead/${a.leadId}`));
      case 'list_contacts':
        return safeCall(() => api.get(`/contact`));
      case 'list_opportunities':
        return safeCall(() => api.get(`/opportunity`));
      case 'search':
        return safeCall(() => api.get(`/lead/?query=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Close CRM MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
