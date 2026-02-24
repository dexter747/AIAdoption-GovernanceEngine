#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.CREATIO_BASE_URL) console.error('Warning: CREATIO_BASE_URL not set');
  if (!process.env.CREATIO_USERNAME) console.error('Warning: CREATIO_USERNAME not set');
  if (!process.env.CREATIO_PASSWORD) console.error('Warning: CREATIO_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.CREATIO_BASE_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.CREATIO_BASE_URL || ''}`,
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
    name: 'list_accounts',
    description: 'List accounts',
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
    name: 'get_record',
    description: 'Get a record by ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        entity: { type: 'string', description: 'The entity' },
        guid: { type: 'string', description: 'The guid' },
      },
      required: ['entity', 'guid'],
    },
  },
  {
    name: 'search',
    description: 'Search records',
    inputSchema: {
      type: 'object' as const,
      properties: {
        entity: { type: 'string', description: 'The entity' },
        query: { type: 'string', description: 'The query' },
      },
      required: ['entity', 'query'],
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
    { name: 'creatio-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_contacts':
        return safeCall(() => api.get(`/Contact`));
      case 'list_accounts':
        return safeCall(() => api.get(`/Account`));
      case 'list_opportunities':
        return safeCall(() => api.get(`/Opportunity`));
      case 'get_record':
        return safeCall(() => api.get(`/${a.entity}(${a.guid})`));
      case 'search':
        return safeCall(() => api.get(`/${a.entity}?$filter=contains(Name,'${a.query}')`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Creatio MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
