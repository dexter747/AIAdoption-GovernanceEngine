#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.JUMPCLOUD_API_KEY) console.error('Warning: JUMPCLOUD_API_KEY not set');

  api = axios.create({
    baseURL: process.env.JUMPCLOUD_API_KEY || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.JUMPCLOUD_API_KEY || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_users',
    description: 'List system users',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_user',
    description: 'Get user details',
    inputSchema: {
      type: 'object' as const,
      properties: { userId: { type: 'string', description: 'The userId' } },
      required: ['userId'],
    },
  },
  {
    name: 'list_systems',
    description: 'List systems',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_groups',
    description: 'List user groups',
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
    { name: 'jumpcloud-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_users':
        return safeCall(() => api.get(`/systemusers`));
      case 'get_user':
        return safeCall(() => api.get(`/systemusers/${a.userId}`));
      case 'list_systems':
        return safeCall(() => api.get(`/systems`));
      case 'list_groups':
        return safeCall(() => api.get(`/v2/usergroups`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('JumpCloud MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
