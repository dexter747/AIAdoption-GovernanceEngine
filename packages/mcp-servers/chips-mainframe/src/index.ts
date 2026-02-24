#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.CHIPS_HOST) console.error('Warning: CHIPS_HOST not set');
  if (!process.env.CHIPS_PORT) console.error('Warning: CHIPS_PORT not set');
  if (!process.env.CHIPS_USERNAME) console.error('Warning: CHIPS_USERNAME not set');
  if (!process.env.CHIPS_PASSWORD) console.error('Warning: CHIPS_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.CHIPS_HOST || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.CHIPS_HOST || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_messages',
    description: 'List CHIPS messages',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_message',
    description: 'Get message details',
    inputSchema: {
      type: 'object' as const,
      properties: { messageId: { type: 'string', description: 'The messageId' } },
      required: ['messageId'],
    },
  },
  {
    name: 'list_participants',
    description: 'List participants',
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
    { name: 'chips-mainframe-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_messages':
        return safeCall(() => api.get(`/messages`));
      case 'get_message':
        return safeCall(() => api.get(`/messages/${a.messageId}`));
      case 'list_participants':
        return safeCall(() => api.get(`/participants`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('CHIPS Mainframe MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
