#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.POWERBI_ACCESS_TOKEN) console.error('Warning: POWERBI_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: 'https://api.powerbi.com/v1.0/myorg',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.POWERBI_ACCESS_TOKEN}`,
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
    name: 'list_reports',
    description: 'List reports',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_datasets',
    description: 'List datasets',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'execute_query',
    description: 'Execute a DAX query',
    inputSchema: {
      type: 'object' as const,
      properties: {
        datasetId: { type: 'string', description: 'The datasetId' },
        query: { type: 'string', description: 'The query' },
      },
      required: ['datasetId'],
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
    { name: 'power-bi-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_dashboards':
        return safeCall(() => api.get(`/dashboards`));
      case 'list_reports':
        return safeCall(() => api.get(`/reports`));
      case 'list_datasets':
        return safeCall(() => api.get(`/datasets`));
      case 'execute_query':
        return safeCall(() =>
          api.post(`/datasets/${a.datasetId}/executeQueries`, { query: a.query })
        );
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Power BI MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
