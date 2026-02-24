#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.CAPSULE_ACCESS_TOKEN) console.error('Warning: CAPSULE_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: 'https://api.capsulecrm.com/api/v2',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.CAPSULE_ACCESS_TOKEN}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_parties',
    description: 'List people and organisations',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_party',
    description: 'Get party details',
    inputSchema: {
      type: 'object' as const,
      properties: { partyId: { type: 'string', description: 'The partyId' } },
      required: ['partyId'],
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
    name: 'list_cases',
    description: 'List cases',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'search',
    description: 'Search parties',
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
    { name: 'capsule-crm-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_parties':
        return safeCall(() => api.get(`/parties`));
      case 'get_party':
        return safeCall(() => api.get(`/parties/${a.partyId}`));
      case 'list_opportunities':
        return safeCall(() => api.get(`/opportunities`));
      case 'list_cases':
        return safeCall(() => api.get(`/kases`));
      case 'search':
        return safeCall(() => api.get(`/parties/search?q=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Capsule CRM MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
