#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.NOTION_API_KEY) console.error('Warning: NOTION_API_KEY not set');

  api = axios.create({
    baseURL: process.env.NOTION_API_KEY || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.NOTION_API_KEY || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'search',
    description: 'Search pages and databases',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
    },
  },
  {
    name: 'get_page',
    description: 'Get a page by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { pageId: { type: 'string', description: 'The pageId' } },
      required: ['pageId'],
    },
  },
  {
    name: 'get_database',
    description: 'Get a database by ID',
    inputSchema: {
      type: 'object' as const,
      properties: { databaseId: { type: 'string', description: 'The databaseId' } },
      required: ['databaseId'],
    },
  },
  {
    name: 'query_database',
    description: 'Query a database with filters',
    inputSchema: {
      type: 'object' as const,
      properties: {
        databaseId: { type: 'string', description: 'The databaseId' },
        filter: { type: 'string', description: 'The filter' },
        sorts: { type: 'string', description: 'The sorts' },
      },
      required: ['databaseId'],
    },
  },
  {
    name: 'create_page',
    description: 'Create a new page',
    inputSchema: {
      type: 'object' as const,
      properties: {
        parent: { type: 'string', description: 'The parent' },
        properties: { type: 'string', description: 'The properties' },
        children: { type: 'string', description: 'The children' },
      },
    },
  },
  {
    name: 'update_page',
    description: 'Update page properties',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pageId: { type: 'string', description: 'The pageId' },
        properties: { type: 'string', description: 'The properties' },
      },
      required: ['pageId'],
    },
  },
  {
    name: 'get_block_children',
    description: 'Get child blocks of a block',
    inputSchema: {
      type: 'object' as const,
      properties: { blockId: { type: 'string', description: 'The blockId' } },
      required: ['blockId'],
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
    { name: 'notion-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'search':
        return safeCall(() => api.post(`/search`, { query: a.query }));
      case 'get_page':
        return safeCall(() => api.get(`/pages/${a.pageId}`));
      case 'get_database':
        return safeCall(() => api.get(`/databases/${a.databaseId}`));
      case 'query_database':
        return safeCall(() =>
          api.post(`/databases/${a.databaseId}/query`, { filter: a.filter, sorts: a.sorts })
        );
      case 'create_page':
        return safeCall(() =>
          api.post(`/pages`, { parent: a.parent, properties: a.properties, children: a.children })
        );
      case 'update_page':
        return safeCall(() => api.patch(`/pages/${a.pageId}`, { properties: a.properties }));
      case 'get_block_children':
        return safeCall(() => api.get(`/blocks/${a.blockId}/children`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Notion MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
