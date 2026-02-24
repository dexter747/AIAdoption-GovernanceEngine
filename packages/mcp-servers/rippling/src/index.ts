#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.RIPPLING_API_KEY) console.error('Warning: RIPPLING_API_KEY not set');

  api = axios.create({
    baseURL: 'https://api.rippling.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.RIPPLING_API_KEY}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_employees',
    description: 'List employees',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_employee',
    description: 'Get employee details',
    inputSchema: {
      type: 'object' as const,
      properties: { employeeId: { type: 'string', description: 'The employeeId' } },
      required: ['employeeId'],
    },
  },
  {
    name: 'list_departments',
    description: 'List departments',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_groups',
    description: 'List groups',
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
    { name: 'rippling-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_employees':
        return safeCall(() => api.get(`/platform/api/employees`));
      case 'get_employee':
        return safeCall(() => api.get(`/platform/api/employees/${a.employeeId}`));
      case 'list_departments':
        return safeCall(() => api.get(`/platform/api/departments`));
      case 'list_groups':
        return safeCall(() => api.get(`/platform/api/groups`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Rippling MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
