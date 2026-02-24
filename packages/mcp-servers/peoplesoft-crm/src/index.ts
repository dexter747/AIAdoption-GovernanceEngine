#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.PEOPLESOFT_CRM_BASE_URL)
    console.error('Warning: PEOPLESOFT_CRM_BASE_URL not set');
  if (!process.env.PEOPLESOFT_CRM_USERNAME)
    console.error('Warning: PEOPLESOFT_CRM_USERNAME not set');
  if (!process.env.PEOPLESOFT_CRM_PASSWORD)
    console.error('Warning: PEOPLESOFT_CRM_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.PEOPLESOFT_CRM_BASE_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.PEOPLESOFT_CRM_BASE_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_customers',
    description: 'List customers',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_customer',
    description: 'Get customer details',
    inputSchema: {
      type: 'object' as const,
      properties: { customerId: { type: 'string', description: 'The customerId' } },
      required: ['customerId'],
    },
  },
  {
    name: 'list_cases',
    description: 'List support cases',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'search',
    description: 'Search records',
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
    { name: 'peoplesoft-crm-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_customers':
        return safeCall(() => api.get(`/customers`));
      case 'get_customer':
        return safeCall(() => api.get(`/customers/${a.customerId}`));
      case 'list_cases':
        return safeCall(() => api.get(`/cases`));
      case 'search':
        return safeCall(() => api.get(`/customers?searchCriteria=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('PeopleSoft CRM MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
