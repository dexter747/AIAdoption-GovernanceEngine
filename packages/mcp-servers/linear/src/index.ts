#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.LINEAR_API_KEY) console.error('Warning: LINEAR_API_KEY not set');

  api = axios.create({
    baseURL: 'https://api.linear.app',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `${process.env.LINEAR_API_KEY}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_issues',
    description: 'List issues with optional filters',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_issue',
    description: 'Get issue details',
    inputSchema: {
      type: 'object' as const,
      properties: { issueId: { type: 'string', description: 'The issueId' } },
      required: ['issueId'],
    },
  },
  {
    name: 'create_issue',
    description: 'Create a new issue',
    inputSchema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'The title' },
        description: { type: 'string', description: 'The description' },
        teamId: { type: 'string', description: 'The teamId' },
        assigneeId: { type: 'string', description: 'The assigneeId' },
        priority: { type: 'string', description: 'The priority' },
      },
    },
  },
  {
    name: 'update_issue',
    description: 'Update an issue',
    inputSchema: {
      type: 'object' as const,
      properties: {
        issueId: { type: 'string', description: 'The issueId' },
        title: { type: 'string', description: 'The title' },
        description: { type: 'string', description: 'The description' },
        stateId: { type: 'string', description: 'The stateId' },
        priority: { type: 'string', description: 'The priority' },
      },
      required: ['issueId'],
    },
  },
  {
    name: 'list_projects',
    description: 'List all projects',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_teams',
    description: 'List all teams',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'search_issues',
    description: 'Search issues by query',
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
    { name: 'linear-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_issues':
        return safeCall(() => api.get(`/list_issues`));
      case 'get_issue':
        return safeCall(() => api.get(`/get_issue`));
      case 'create_issue':
        return safeCall(() => api.get(`/create_issue`));
      case 'update_issue':
        return safeCall(() => api.get(`/update_issue`));
      case 'list_projects':
        return safeCall(() => api.get(`/list_projects`));
      case 'list_teams':
        return safeCall(() => api.get(`/list_teams`));
      case 'search_issues':
        return safeCall(() => api.get(`/search_issues`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Linear MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
