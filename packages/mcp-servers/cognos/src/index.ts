#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.COGNOS_BASE_URL) console.error('Warning: COGNOS_BASE_URL not set');
  if (!process.env.COGNOS_NAMESPACE) console.error('Warning: COGNOS_NAMESPACE not set');
  if (!process.env.COGNOS_USERNAME) console.error('Warning: COGNOS_USERNAME not set');
  if (!process.env.COGNOS_PASSWORD) console.error('Warning: COGNOS_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.COGNOS_BASE_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.COGNOS_BASE_URL || ''}`,
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
    name: 'run_report',
    description: 'Run a report',
    inputSchema: {
      type: 'object' as const,
      properties: { reportId: { type: 'string', description: 'The reportId' } },
      required: ['reportId'],
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
    { name: 'cognos-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_reports':
        return safeCall(() => api.get(`/content`));
      case 'get_report':
        return safeCall(() => api.get(`/content/${a.reportId}`));
      case 'run_report':
        return safeCall(() => api.post(`/reports/${a.reportId}/run`, {}));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('IBM Cognos MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
