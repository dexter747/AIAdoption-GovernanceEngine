#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.BROADCOM_BASE_URL) console.error('Warning: BROADCOM_BASE_URL not set');
  if (!process.env.BROADCOM_API_KEY) console.error('Warning: BROADCOM_API_KEY not set');

  api = axios.create({
    baseURL: `${process.env.BROADCOM_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.BROADCOM_API_KEY}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_devices',
    description: 'List devices',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_device',
    description: 'Get device details',
    inputSchema: {
      type: 'object' as const,
      properties: { deviceId: { type: 'string', description: 'The deviceId' } },
      required: ['deviceId'],
    },
  },
  {
    name: 'list_alerts',
    description: 'List alerts',
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
    { name: 'broadcom-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_devices':
        return safeCall(() => api.get(`/devices`));
      case 'get_device':
        return safeCall(() => api.get(`/devices/${a.deviceId}`));
      case 'list_alerts':
        return safeCall(() => api.get(`/alerts`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Broadcom MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
