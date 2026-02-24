#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.CALYPSO_BASE_URL) console.error('Warning: CALYPSO_BASE_URL not set');
  if (!process.env.CALYPSO_USERNAME) console.error('Warning: CALYPSO_USERNAME not set');
  if (!process.env.CALYPSO_PASSWORD) console.error('Warning: CALYPSO_PASSWORD not set');

  api = axios.create({
    baseURL: `${process.env.CALYPSO_BASE_URL}/calypso/api/v1`,
    auth: {
      username: process.env.CALYPSO_USERNAME || '',
      password: process.env.CALYPSO_PASSWORD || '',
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
    name: 'list_trades',
    description: 'List trades',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_trade',
    description: 'Get trade details',
    inputSchema: {
      type: 'object' as const,
      properties: { tradeId: { type: 'string', description: 'The tradeId' } },
      required: ['tradeId'],
    },
  },
  {
    name: 'get_positions',
    description: 'Get positions',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_market_data',
    description: 'Get market data',
    inputSchema: {
      type: 'object' as const,
      properties: { instrument: { type: 'string', description: 'The instrument' } },
      required: ['instrument'],
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
    { name: 'calypso-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_trades':
        return safeCall(() => api.get(`/trades`));
      case 'get_trade':
        return safeCall(() => api.get(`/trades/${a.tradeId}`));
      case 'get_positions':
        return safeCall(() => api.get(`/positions`));
      case 'get_market_data':
        return safeCall(() => api.get(`/marketdata/${a.instrument}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Calypso MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
