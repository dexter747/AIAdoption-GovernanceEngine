#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.SAP_R2_HOST) console.error('Warning: SAP_R2_HOST not set');
  if (!process.env.SAP_R2_SYSNR) console.error('Warning: SAP_R2_SYSNR not set');
  if (!process.env.SAP_R2_CLIENT) console.error('Warning: SAP_R2_CLIENT not set');
  if (!process.env.SAP_R2_USERNAME) console.error('Warning: SAP_R2_USERNAME not set');
  if (!process.env.SAP_R2_PASSWORD) console.error('Warning: SAP_R2_PASSWORD not set');

  api = axios.create({
    baseURL: `http://${process.env.SAP_R2_HOST}`,
    auth: {
      username: process.env.SAP_R2_USERNAME || '',
      password: process.env.SAP_R2_PASSWORD || '',
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
    name: 'call_rfc',
    description: 'Call an RFC function',
    inputSchema: {
      type: 'object' as const,
      properties: {
        functionName: { type: 'string', description: 'The functionName' },
        params: { type: 'string', description: 'The params' },
      },
    },
  },
  {
    name: 'list_tables',
    description: 'List database tables',
    inputSchema: {
      type: 'object' as const,
      properties: { pattern: { type: 'string', description: 'The pattern' } },
    },
  },
  {
    name: 'read_table',
    description: 'Read table data',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tableName: { type: 'string', description: 'The tableName' },
        fields: { type: 'string', description: 'The fields' },
        filter: { type: 'string', description: 'The filter' },
      },
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
    { name: 'sap-r2-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'call_rfc':
        return safeCall(() => api.get(`/call_rfc`));
      case 'list_tables':
        return safeCall(() => api.get(`/list_tables`));
      case 'read_table':
        return safeCall(() => api.get(`/read_table`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SAP R/2 MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
