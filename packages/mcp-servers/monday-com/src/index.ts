#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.MONDAY_API_TOKEN) console.error('Warning: MONDAY_API_TOKEN not set');

  api = axios.create({
    baseURL: process.env.MONDAY_API_TOKEN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.MONDAY_API_TOKEN || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_boards',
    description: 'List all boards',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_board',
    description: 'Get board details with groups and items',
    inputSchema: {
      type: 'object' as const,
      properties: { boardId: { type: 'string', description: 'The boardId' } },
      required: ['boardId'],
    },
  },
  {
    name: 'list_items',
    description: 'List items in a board',
    inputSchema: {
      type: 'object' as const,
      properties: { boardId: { type: 'string', description: 'The boardId' } },
      required: ['boardId'],
    },
  },
  {
    name: 'get_item',
    description: 'Get item details',
    inputSchema: {
      type: 'object' as const,
      properties: { itemId: { type: 'string', description: 'The itemId' } },
      required: ['itemId'],
    },
  },
  {
    name: 'create_item',
    description: 'Create a new item',
    inputSchema: {
      type: 'object' as const,
      properties: {
        boardId: { type: 'string', description: 'The boardId' },
        groupId: { type: 'string', description: 'The groupId' },
        itemName: { type: 'string', description: 'The itemName' },
        columnValues: { type: 'string', description: 'The columnValues' },
      },
    },
  },
  {
    name: 'update_item',
    description: 'Update an item',
    inputSchema: {
      type: 'object' as const,
      properties: {
        boardId: { type: 'string', description: 'The boardId' },
        itemId: { type: 'string', description: 'The itemId' },
        columnValues: { type: 'string', description: 'The columnValues' },
      },
    },
  },
  {
    name: 'search_items',
    description: 'Search items across boards',
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
    { name: 'monday-com-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_boards':
        return safeCall(() => api.get(`/list_boards`));
      case 'get_board':
        return safeCall(() => api.get(`/get_board`));
      case 'list_items':
        return safeCall(() => api.get(`/list_items`));
      case 'get_item':
        return safeCall(() => api.get(`/get_item`));
      case 'create_item':
        return safeCall(() => api.get(`/create_item`));
      case 'update_item':
        return safeCall(() => api.get(`/update_item`));
      case 'search_items':
        return safeCall(() => api.get(`/search_items`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Monday.com MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
