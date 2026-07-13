#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.OKTA_DOMAIN) console.error('Warning: OKTA_DOMAIN not set');
  if (!process.env.OKTA_API_TOKEN) console.error('Warning: OKTA_API_TOKEN not set');

  api = axios.create({
    baseURL: `https://${process.env.OKTA_DOMAIN}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_users',
    description: 'List users',
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
    name: 'list_groups',
    description: 'List groups',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_apps',
    description: 'List applications',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'search_users',
    description: 'Search users',
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
    { name: 'okta-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_users':
        return safeCall(() => api.get(`/users`));
      case 'get_user':
        return safeCall(() => api.get(`/users/${a.userId}`));
      case 'list_groups':
        return safeCall(() => api.get(`/groups`));
      case 'list_apps':
        return safeCall(() => api.get(`/apps`));
      case 'search_users':
        return safeCall(() => api.get(`/users?search=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Okta MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
