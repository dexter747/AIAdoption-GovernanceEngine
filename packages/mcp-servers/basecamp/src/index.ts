#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.BASECAMP_ACCESS_TOKEN) console.error('Warning: BASECAMP_ACCESS_TOKEN not set');
  if (!process.env.BASECAMP_ACCOUNT_ID) console.error('Warning: BASECAMP_ACCOUNT_ID not set');

  api = axios.create({
    baseURL: process.env.BASECAMP_ACCESS_TOKEN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.BASECAMP_ACCESS_TOKEN || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_projects',
    description: 'List all projects',
    inputSchema: {
      type: 'object' as const,
      properties: {},
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
    name: 'list_todolists',
    description: 'List to-do lists in a project',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectId: { type: 'string', description: 'The projectId' },
        todosetId: { type: 'string', description: 'The todosetId' },
      },
      required: ['projectId', 'todosetId'],
    },
  },
  {
    name: 'list_todos',
    description: 'List to-dos in a to-do list',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectId: { type: 'string', description: 'The projectId' },
        todolistId: { type: 'string', description: 'The todolistId' },
      },
      required: ['projectId', 'todolistId'],
    },
  },
  {
    name: 'create_todo',
    description: 'Create a to-do',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectId: { type: 'string', description: 'The projectId' },
        todolistId: { type: 'string', description: 'The todolistId' },
        content: { type: 'string', description: 'The content' },
        description: { type: 'string', description: 'The description' },
        assignee_ids: { type: 'string', description: 'The assignee_ids' },
        due_on: { type: 'string', description: 'The due_on' },
      },
      required: ['projectId', 'todolistId'],
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
    { name: 'basecamp-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_projects':
        return safeCall(() => api.get(`/projects.json`));
      case 'get_project':
        return safeCall(() => api.get(`/projects/${a.projectId}.json`));
      case 'list_todolists':
        return safeCall(() =>
          api.get(`/buckets/${a.projectId}/todosets/${a.todosetId}/todolists.json`)
        );
      case 'list_todos':
        return safeCall(() =>
          api.get(`/buckets/${a.projectId}/todolists/${a.todolistId}/todos.json`)
        );
      case 'create_todo':
        return safeCall(() =>
          api.post(`/buckets/${a.projectId}/todolists/${a.todolistId}/todos.json`, {
            content: a.content,
            description: a.description,
            assignee_ids: a.assignee_ids,
            due_on: a.due_on,
          })
        );
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Basecamp MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
