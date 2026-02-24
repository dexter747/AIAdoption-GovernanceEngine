#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.ASANA_ACCESS_TOKEN) console.error('Warning: ASANA_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: 'https://app.asana.com/api/1.0',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.ASANA_ACCESS_TOKEN}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_workspaces',
    description: 'List all workspaces',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_projects',
    description: 'List projects in a workspace',
    inputSchema: {
      type: 'object' as const,
      properties: { workspaceId: { type: 'string', description: 'The workspaceId' } },
      required: ['workspaceId'],
    },
  },
  {
    name: 'get_project',
    description: 'Get project details',
    inputSchema: {
      type: 'object' as const,
      properties: { projectId: { type: 'string', description: 'The projectId' } },
      required: ['projectId'],
    },
  },
  {
    name: 'list_tasks',
    description: 'List tasks in a project',
    inputSchema: {
      type: 'object' as const,
      properties: { projectId: { type: 'string', description: 'The projectId' } },
      required: ['projectId'],
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
        name: { type: 'string', description: 'The name' },
        notes: { type: 'string', description: 'The notes' },
        projectId: { type: 'string', description: 'The projectId' },
        assignee: { type: 'string', description: 'The assignee' },
        due_on: { type: 'string', description: 'The due_on' },
      },
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
        notes: { type: 'string', description: 'The notes' },
        completed: { type: 'string', description: 'The completed' },
        due_on: { type: 'string', description: 'The due_on' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'search_tasks',
    description: 'Search tasks in a workspace',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspaceId: { type: 'string', description: 'The workspaceId' },
        query: { type: 'string', description: 'The query' },
      },
      required: ['workspaceId', 'query'],
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
    { name: 'asana-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_workspaces':
        return safeCall(() => api.get(`/workspaces`));
      case 'list_projects':
        return safeCall(() => api.get(`/workspaces/${a.workspaceId}/projects`));
      case 'get_project':
        return safeCall(() => api.get(`/projects/${a.projectId}`));
      case 'list_tasks':
        return safeCall(() => api.get(`/projects/${a.projectId}/tasks`));
      case 'get_task':
        return safeCall(() => api.get(`/tasks/${a.taskId}`));
      case 'create_task':
        return safeCall(() =>
          api.post(`/tasks`, {
            name: a.name,
            notes: a.notes,
            projectId: a.projectId,
            assignee: a.assignee,
            due_on: a.due_on,
          })
        );
      case 'update_task':
        return safeCall(() =>
          api.put(`/tasks/${a.taskId}`, {
            name: a.name,
            notes: a.notes,
            completed: a.completed,
            due_on: a.due_on,
          })
        );
      case 'search_tasks':
        return safeCall(() => api.get(`/workspaces/${a.workspaceId}/tasks/search?text=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Asana MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
