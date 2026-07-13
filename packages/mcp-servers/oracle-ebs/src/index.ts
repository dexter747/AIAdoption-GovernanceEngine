#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.ORACLE_EBS_BASE_URL) console.error('Warning: ORACLE_EBS_BASE_URL not set');
  if (!process.env.ORACLE_EBS_USERNAME) console.error('Warning: ORACLE_EBS_USERNAME not set');
  if (!process.env.ORACLE_EBS_PASSWORD) console.error('Warning: ORACLE_EBS_PASSWORD not set');

  api = axios.create({
    baseURL: `${process.env.ORACLE_EBS_BASE_URL}/webservices/rest`,
    auth: {
      username: process.env.ORACLE_EBS_USERNAME || '',
      password: process.env.ORACLE_EBS_PASSWORD || '',
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
    name: 'list_modules',
    description: 'List EBS modules',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'query',
    description: 'Query a module',
    inputSchema: {
      type: 'object' as const,
      properties: {
        module: { type: 'string', description: 'The module' },
        filters: { type: 'string', description: 'The filters' },
      },
      required: ['module'],
    },
  },
  {
    name: 'get_record',
    description: 'Get record by ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        module: { type: 'string', description: 'The module' },
        recordId: { type: 'string', description: 'The recordId' },
      },
      required: ['module', 'recordId'],
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
    { name: 'oracle-ebs-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_modules':
        return safeCall(() => api.get(`/modules`));
      case 'query':
        return safeCall(() => api.post(`/${a.module}/query`, { filters: a.filters }));
      case 'get_record':
        return safeCall(() => api.get(`/${a.module}/${a.recordId}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Oracle E-Business Suite MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
