#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.SUGARCRM_BASE_URL) console.error('Warning: SUGARCRM_BASE_URL not set');
  if (!process.env.SUGARCRM_USERNAME) console.error('Warning: SUGARCRM_USERNAME not set');
  if (!process.env.SUGARCRM_PASSWORD) console.error('Warning: SUGARCRM_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.SUGARCRM_BASE_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.SUGARCRM_BASE_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_records',
    description: 'List records from a module',
    inputSchema: {
      type: 'object' as const,
      properties: { module: { type: 'string', description: 'The module' } },
      required: ['module'],
    },
  },
  {
    name: 'get_record',
    description: 'Get a record by ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        module: { type: 'string', description: 'The module' },
        recordId: { type: 'string', description: 'The recordId' },
      },
      required: ['module', 'recordId'],
    },
  },
  {
    name: 'create_record',
    description: 'Create a new record',
    inputSchema: {
      type: 'object' as const,
      properties: {
        module: { type: 'string', description: 'The module' },
        data: { type: 'string', description: 'The data' },
      },
      required: ['module'],
    },
  },
  {
    name: 'search',
    description: 'Global search',
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
    { name: 'sugarcrm-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_records':
        return safeCall(() => api.get(`/${a.module}`));
      case 'get_record':
        return safeCall(() => api.get(`/${a.module}/${a.recordId}`));
      case 'create_record':
        return safeCall(() => api.post(`/${a.module}`, { data: a.data }));
      case 'search':
        return safeCall(() => api.get(`/globalsearch?q=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SugarCRM MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
