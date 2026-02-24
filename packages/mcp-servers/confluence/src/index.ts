#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.CONFLUENCE_BASE_URL) console.error('Warning: CONFLUENCE_BASE_URL not set');
  if (!process.env.CONFLUENCE_USERNAME) console.error('Warning: CONFLUENCE_USERNAME not set');
  if (!process.env.CONFLUENCE_API_TOKEN) console.error('Warning: CONFLUENCE_API_TOKEN not set');

  api = axios.create({
    baseURL: process.env.CONFLUENCE_BASE_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.CONFLUENCE_BASE_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_spaces',
    description: 'List all spaces',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_space',
    description: 'Get space details',
    inputSchema: {
      type: 'object' as const,
      properties: { spaceKey: { type: 'string', description: 'The spaceKey' } },
      required: ['spaceKey'],
    },
  },
  {
    name: 'list_pages',
    description: 'List pages in a space',
    inputSchema: {
      type: 'object' as const,
      properties: { spaceKey: { type: 'string', description: 'The spaceKey' } },
      required: ['spaceKey'],
    },
  },
  {
    name: 'get_page',
    description: 'Get page content',
    inputSchema: {
      type: 'object' as const,
      properties: { pageId: { type: 'string', description: 'The pageId' } },
      required: ['pageId'],
    },
  },
  {
    name: 'search',
    description: 'Search content',
    inputSchema: {
      type: 'object' as const,
      properties: { cql: { type: 'string', description: 'The cql' } },
      required: ['cql'],
    },
  },
  {
    name: 'create_page',
    description: 'Create a new page',
    inputSchema: {
      type: 'object' as const,
      properties: {
        spaceKey: { type: 'string', description: 'The spaceKey' },
        title: { type: 'string', description: 'The title' },
        body: { type: 'string', description: 'The body' },
      },
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
    { name: 'confluence-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_spaces':
        return safeCall(() => api.get(`/space`));
      case 'get_space':
        return safeCall(() => api.get(`/space/${a.spaceKey}`));
      case 'list_pages':
        return safeCall(() => api.get(`/space/${a.spaceKey}/content/page`));
      case 'get_page':
        return safeCall(() => api.get(`/content/${a.pageId}?expand=body.storage`));
      case 'search':
        return safeCall(() => api.get(`/content/search?cql=${a.cql}`));
      case 'create_page':
        return safeCall(() =>
          api.post(`/content`, { spaceKey: a.spaceKey, title: a.title, body: a.body })
        );
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Confluence MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
