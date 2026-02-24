#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.BRIO_BASE_URL) console.error('Warning: BRIO_BASE_URL not set');
  if (!process.env.BRIO_USERNAME) console.error('Warning: BRIO_USERNAME not set');
  if (!process.env.BRIO_PASSWORD) console.error('Warning: BRIO_PASSWORD not set');

  api = axios.create({
    baseURL: `${process.env.BRIO_BASE_URL}/api`,
    auth: {
      username: process.env.BRIO_USERNAME || '',
      password: process.env.BRIO_PASSWORD || '',
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_reports',
    description: 'List reports',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_report',
    description: 'Get report details',
    inputSchema: {
      type: 'object' as const,
      properties: { reportId: { type: 'string', description: 'The reportId' } },
      required: ['reportId'],
    },
  },
  {
    name: 'run_query',
    description: 'Run a query',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
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
    { name: 'brio-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_reports':
        return safeCall(() => api.get(`/reports`));
      case 'get_report':
        return safeCall(() => api.get(`/reports/${a.reportId}`));
      case 'run_query':
        return safeCall(() => api.post(`/queries`, { query: a.query }));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Brio (Hyperion Intelligence) MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
