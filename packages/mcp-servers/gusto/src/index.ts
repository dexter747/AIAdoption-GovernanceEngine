#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.GUSTO_ACCESS_TOKEN) console.error('Warning: GUSTO_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: process.env.GUSTO_ACCESS_TOKEN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.GUSTO_ACCESS_TOKEN || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_companies',
    description: 'List companies',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_employees',
    description: 'List employees',
    inputSchema: {
      type: 'object' as const,
      properties: { companyId: { type: 'string', description: 'The companyId' } },
      required: ['companyId'],
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
    name: 'list_payrolls',
    description: 'List payrolls',
    inputSchema: {
      type: 'object' as const,
      properties: { companyId: { type: 'string', description: 'The companyId' } },
      required: ['companyId'],
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
    { name: 'gusto-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_companies':
        return safeCall(() => api.get(`/companies`));
      case 'list_employees':
        return safeCall(() => api.get(`/companies/${a.companyId}/employees`));
      case 'get_employee':
        return safeCall(() => api.get(`/employees/${a.employeeId}`));
      case 'list_payrolls':
        return safeCall(() => api.get(`/companies/${a.companyId}/payrolls`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gusto MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
