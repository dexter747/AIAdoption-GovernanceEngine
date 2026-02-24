#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.DROPBOX_ACCESS_TOKEN) console.error('Warning: DROPBOX_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: process.env.DROPBOX_ACCESS_TOKEN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_folder',
    description: 'List files in a folder',
    inputSchema: {
      type: 'object' as const,
      properties: { path: { type: 'string', description: 'The path' } },
    },
  },
  {
    name: 'get_metadata',
    description: 'Get file or folder metadata',
    inputSchema: {
      type: 'object' as const,
      properties: { path: { type: 'string', description: 'The path' } },
    },
  },
  {
    name: 'search',
    description: 'Search for files',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
    },
  },
  {
    name: 'list_members',
    description: 'List team members',
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
    { name: 'dropbox-business-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_folder':
        return safeCall(() => api.post(`/files/list_folder`, { path: a.path }));
      case 'get_metadata':
        return safeCall(() => api.post(`/files/get_metadata`, { path: a.path }));
      case 'search':
        return safeCall(() => api.post(`/files/search_v2`, { query: a.query }));
      case 'list_members':
        return safeCall(() => api.post(`/team/members/list_v2`, {}));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Dropbox Business MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
