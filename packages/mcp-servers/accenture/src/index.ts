#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.ACCENTURE_BASE_URL) console.error('Warning: ACCENTURE_BASE_URL not set');
  if (!process.env.ACCENTURE_API_KEY) console.error('Warning: ACCENTURE_API_KEY not set');

  api = axios.create({
    baseURL: `${process.env.ACCENTURE_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Key': `${process.env.ACCENTURE_API_KEY}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_projects',
    description: 'List projects',
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
    name: 'list_resources',
    description: 'List resources',
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
    { name: 'accenture-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_projects':
        return safeCall(() => api.get(`/projects`));
      case 'get_project':
        return safeCall(() => api.get(`/projects/${a.projectId}`));
      case 'list_resources':
        return safeCall(() => api.get(`/resources`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Accenture MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
