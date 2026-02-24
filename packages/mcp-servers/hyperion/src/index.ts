#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.HYPERION_BASE_URL) console.error('Warning: HYPERION_BASE_URL not set');
  if (!process.env.HYPERION_USERNAME) console.error('Warning: HYPERION_USERNAME not set');
  if (!process.env.HYPERION_PASSWORD) console.error('Warning: HYPERION_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.HYPERION_BASE_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.HYPERION_BASE_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_applications',
    description: 'List applications',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_dimensions',
    description: 'List dimensions',
    inputSchema: {
      type: 'object' as const,
      properties: { app: { type: 'string', description: 'The app' } },
      required: ['app'],
    },
  },
  {
    name: 'get_members',
    description: 'Get dimension members',
    inputSchema: {
      type: 'object' as const,
      properties: {
        app: { type: 'string', description: 'The app' },
        dimension: { type: 'string', description: 'The dimension' },
      },
      required: ['app', 'dimension'],
    },
  },
  {
    name: 'run_report',
    description: 'Run a report',
    inputSchema: {
      type: 'object' as const,
      properties: {
        app: { type: 'string', description: 'The app' },
        report: { type: 'string', description: 'The report' },
      },
      required: ['app', 'report'],
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
    { name: 'hyperion-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_applications':
        return safeCall(() => api.get(`/applications`));
      case 'list_dimensions':
        return safeCall(() => api.get(`/applications/${a.app}/dimensions`));
      case 'get_members':
        return safeCall(() => api.get(`/applications/${a.app}/dimensions/${a.dimension}/members`));
      case 'run_report':
        return safeCall(() => api.get(`/applications/${a.app}/reports/${a.report}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Oracle Hyperion MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
