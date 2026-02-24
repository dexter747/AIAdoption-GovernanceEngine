#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.QLIK_TENANT_URL) console.error('Warning: QLIK_TENANT_URL not set');
  if (!process.env.QLIK_API_KEY) console.error('Warning: QLIK_API_KEY not set');

  api = axios.create({
    baseURL: process.env.QLIK_TENANT_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.QLIK_TENANT_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_apps',
    description: 'List apps',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_app',
    description: 'Get app details',
    inputSchema: {
      type: 'object' as const,
      properties: { appId: { type: 'string', description: 'The appId' } },
      required: ['appId'],
    },
  },
  {
    name: 'list_spaces',
    description: 'List spaces',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_items',
    description: 'List items',
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
    { name: 'qlik-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_apps':
        return safeCall(() => api.get(`/apps`));
      case 'get_app':
        return safeCall(() => api.get(`/apps/${a.appId}`));
      case 'list_spaces':
        return safeCall(() => api.get(`/spaces`));
      case 'list_items':
        return safeCall(() => api.get(`/items`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Qlik Sense MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
