#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.FRONTARENA_BASE_URL) console.error('Warning: FRONTARENA_BASE_URL not set');
  if (!process.env.FRONTARENA_USERNAME) console.error('Warning: FRONTARENA_USERNAME not set');
  if (!process.env.FRONTARENA_PASSWORD) console.error('Warning: FRONTARENA_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.FRONTARENA_BASE_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.FRONTARENA_BASE_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_instruments',
    description: 'List instruments',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_instrument',
    description: 'Get instrument details',
    inputSchema: {
      type: 'object' as const,
      properties: { instrumentId: { type: 'string', description: 'The instrumentId' } },
      required: ['instrumentId'],
    },
  },
  {
    name: 'list_trades',
    description: 'List trades',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_portfolio',
    description: 'Get portfolio',
    inputSchema: {
      type: 'object' as const,
      properties: { portfolioId: { type: 'string', description: 'The portfolioId' } },
      required: ['portfolioId'],
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
    { name: 'frontarena-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_instruments':
        return safeCall(() => api.get(`/instruments`));
      case 'get_instrument':
        return safeCall(() => api.get(`/instruments/${a.instrumentId}`));
      case 'list_trades':
        return safeCall(() => api.get(`/trades`));
      case 'get_portfolio':
        return safeCall(() => api.get(`/portfolios/${a.portfolioId}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('FrontArena MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
