#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.WRIKE_ACCESS_TOKEN) console.error('Warning: WRIKE_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: process.env.WRIKE_ACCESS_TOKEN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.WRIKE_ACCESS_TOKEN || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_folders',
    description: 'List folders and projects',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_folder',
    description: 'Get folder details',
    inputSchema: {
      type: 'object' as const,
      properties: { folderId: { type: 'string', description: 'The folderId' } },
      required: ['folderId'],
    },
  },
  {
    name: 'list_tasks',
    description: 'List tasks',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_task',
    description: 'Get task details',
    inputSchema: {
      type: 'object' as const,
      properties: { taskId: { type: 'string', description: 'The taskId' } },
      required: ['taskId'],
    },
  },
  {
    name: 'create_task',
    description: 'Create a new task in a folder',
    inputSchema: {
      type: 'object' as const,
      properties: {
        folderId: { type: 'string', description: 'The folderId' },
        title: { type: 'string', description: 'The title' },
        description: { type: 'string', description: 'The description' },
        status: { type: 'string', description: 'The status' },
        dates: { type: 'string', description: 'The dates' },
      },
      required: ['folderId'],
    },
  },
  {
    name: 'update_task',
    description: 'Update a task',
    inputSchema: {
      type: 'object' as const,
      properties: {
        taskId: { type: 'string', description: 'The taskId' },
        title: { type: 'string', description: 'The title' },
        description: { type: 'string', description: 'The description' },
        status: { type: 'string', description: 'The status' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'search',
    description: 'Search tasks, folders, and projects',
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
    { name: 'wrike-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_folders':
        return safeCall(() => api.get(`/folders`));
      case 'get_folder':
        return safeCall(() => api.get(`/folders/${a.folderId}`));
      case 'list_tasks':
        return safeCall(() => api.get(`/tasks`));
      case 'get_task':
        return safeCall(() => api.get(`/tasks/${a.taskId}`));
      case 'create_task':
        return safeCall(() =>
          api.post(`/folders/${a.folderId}/tasks`, {
            title: a.title,
            description: a.description,
            status: a.status,
            dates: a.dates,
          })
        );
      case 'update_task':
        return safeCall(() =>
          api.put(`/tasks/${a.taskId}`, {
            title: a.title,
            description: a.description,
            status: a.status,
          })
        );
      case 'search':
        return safeCall(() => api.get(`/tasks?title=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Wrike MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
