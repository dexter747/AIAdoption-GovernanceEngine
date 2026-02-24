#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN)
    console.error('Warning: GOOGLE_WORKSPACE_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: 'https://www.googleapis.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_files',
    description: 'List Google Drive files',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_file',
    description: 'Get file metadata',
    inputSchema: {
      type: 'object' as const,
      properties: { fileId: { type: 'string', description: 'The fileId' } },
      required: ['fileId'],
    },
  },
  {
    name: 'list_users',
    description: 'List workspace users',
    inputSchema: {
      type: 'object' as const,
      properties: { domain: { type: 'string', description: 'The domain' } },
      required: ['domain'],
    },
  },
  {
    name: 'search_drive',
    description: 'Search files in Drive',
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
    { name: 'google-workspace-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_files':
        return safeCall(() => api.get(`/drive/v3/files`));
      case 'get_file':
        return safeCall(() => api.get(`/drive/v3/files/${a.fileId}`));
      case 'list_users':
        return safeCall(() => api.get(`/admin/directory/v1/users?domain=${a.domain}`));
      case 'search_drive':
        return safeCall(() => api.get(`/drive/v3/files?q=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Google Workspace MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
