#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.LOOKER_BASE_URL) console.error('Warning: LOOKER_BASE_URL not set');
  if (!process.env.LOOKER_CLIENT_ID) console.error('Warning: LOOKER_CLIENT_ID not set');
  if (!process.env.LOOKER_CLIENT_SECRET) console.error('Warning: LOOKER_CLIENT_SECRET not set');

  api = axios.create({
    baseURL: process.env.LOOKER_BASE_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.LOOKER_BASE_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_dashboards',
    description: 'List dashboards',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_dashboard',
    description: 'Get dashboard details',
    inputSchema: {
      type: 'object' as const,
      properties: { dashboardId: { type: 'string', description: 'The dashboardId' } },
      required: ['dashboardId'],
    },
  },
  {
    name: 'list_looks',
    description: 'List looks',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'run_query',
    description: 'Run a query',
    inputSchema: {
      type: 'object' as const,
      properties: {
        model: { type: 'string', description: 'The model' },
        view: { type: 'string', description: 'The view' },
        fields: { type: 'string', description: 'The fields' },
        filters: { type: 'string', description: 'The filters' },
      },
    },
  },
  {
    name: 'list_models',
    description: 'List LookML models',
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
    { name: 'looker-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_dashboards':
        return safeCall(() => api.get(`/dashboards`));
      case 'get_dashboard':
        return safeCall(() => api.get(`/dashboards/${a.dashboardId}`));
      case 'list_looks':
        return safeCall(() => api.get(`/looks`));
      case 'run_query':
        return safeCall(() =>
          api.post(`/queries/run/json`, {
            model: a.model,
            view: a.view,
            fields: a.fields,
            filters: a.filters,
          })
        );
      case 'list_models':
        return safeCall(() => api.get(`/lookml_models`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Looker MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
