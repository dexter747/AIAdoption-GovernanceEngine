#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.ZOHO_ACCESS_TOKEN) console.error('Warning: ZOHO_ACCESS_TOKEN not set');
  if (!process.env.ZOHO_API_DOMAIN) console.error('Warning: ZOHO_API_DOMAIN not set');

  api = axios.create({
    baseURL: process.env.ZOHO_API_DOMAIN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.ZOHO_ACCESS_TOKEN || ''}`,
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
    name: 'update_record',
    description: 'Update a record',
    inputSchema: {
      type: 'object' as const,
      properties: {
        module: { type: 'string', description: 'The module' },
        recordId: { type: 'string', description: 'The recordId' },
        data: { type: 'string', description: 'The data' },
      },
      required: ['module', 'recordId'],
    },
  },
  {
    name: 'search_records',
    description: 'Search records in a module',
    inputSchema: {
      type: 'object' as const,
      properties: {
        module: { type: 'string', description: 'The module' },
        criteria: { type: 'string', description: 'The criteria' },
      },
      required: ['module', 'criteria'],
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
    { name: 'zoho-crm-mcp-server', version: '1.0.0' },
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
      case 'update_record':
        return safeCall(() => api.put(`/${a.module}/${a.recordId}`, { data: a.data }));
      case 'search_records':
        return safeCall(() => api.get(`/${a.module}/search?criteria=${a.criteria}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Zoho CRM MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
