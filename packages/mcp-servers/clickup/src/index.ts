#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.CLICKUP_API_TOKEN) console.error('Warning: CLICKUP_API_TOKEN not set');

  api = axios.create({
    baseURL: process.env.CLICKUP_API_TOKEN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.CLICKUP_API_TOKEN || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_workspaces',
    description: 'List all workspaces (teams)',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_spaces',
    description: 'List spaces in a workspace',
    inputSchema: {
      type: 'object' as const,
      properties: { teamId: { type: 'string', description: 'The teamId' } },
      required: ['teamId'],
    },
  },
  {
    name: 'list_folders',
    description: 'List folders in a space',
    inputSchema: {
      type: 'object' as const,
      properties: { spaceId: { type: 'string', description: 'The spaceId' } },
      required: ['spaceId'],
    },
  },
  {
    name: 'list_lists',
    description: 'List lists in a folder',
    inputSchema: {
      type: 'object' as const,
      properties: { folderId: { type: 'string', description: 'The folderId' } },
      required: ['folderId'],
    },
  },
  {
    name: 'list_tasks',
    description: 'List tasks in a list',
    inputSchema: {
      type: 'object' as const,
      properties: { listId: { type: 'string', description: 'The listId' } },
      required: ['listId'],
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
    description: 'Create a new task',
    inputSchema: {
      type: 'object' as const,
      properties: {
        listId: { type: 'string', description: 'The listId' },
        name: { type: 'string', description: 'The name' },
        description: { type: 'string', description: 'The description' },
        assignees: { type: 'string', description: 'The assignees' },
        priority: { type: 'string', description: 'The priority' },
        due_date: { type: 'string', description: 'The due_date' },
      },
      required: ['listId'],
    },
  },
  {
    name: 'update_task',
    description: 'Update a task',
    inputSchema: {
      type: 'object' as const,
      properties: {
        taskId: { type: 'string', description: 'The taskId' },
        name: { type: 'string', description: 'The name' },
        description: { type: 'string', description: 'The description' },
        status: { type: 'string', description: 'The status' },
        priority: { type: 'string', description: 'The priority' },
      },
      required: ['taskId'],
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
    { name: 'clickup-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_workspaces':
        return safeCall(() => api.get(`/team`));
      case 'list_spaces':
        return safeCall(() => api.get(`/team/${a.teamId}/space`));
      case 'list_folders':
        return safeCall(() => api.get(`/space/${a.spaceId}/folder`));
      case 'list_lists':
        return safeCall(() => api.get(`/folder/${a.folderId}/list`));
      case 'list_tasks':
        return safeCall(() => api.get(`/list/${a.listId}/task`));
      case 'get_task':
        return safeCall(() => api.get(`/task/${a.taskId}`));
      case 'create_task':
        return safeCall(() =>
          api.post(`/list/${a.listId}/task`, {
            name: a.name,
            description: a.description,
            assignees: a.assignees,
            priority: a.priority,
            due_date: a.due_date,
          })
        );
      case 'update_task':
        return safeCall(() =>
          api.put(`/task/${a.taskId}`, {
            name: a.name,
            description: a.description,
            status: a.status,
            priority: a.priority,
          })
        );
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ClickUp MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
