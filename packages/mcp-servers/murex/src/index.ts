#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.MUREX_BASE_URL) console.error('Warning: MUREX_BASE_URL not set');
  if (!process.env.MUREX_USERNAME) console.error('Warning: MUREX_USERNAME not set');
  if (!process.env.MUREX_PASSWORD) console.error('Warning: MUREX_PASSWORD not set');

  api = axios.create({
    baseURL: `${process.env.MUREX_BASE_URL}/mx/api/v1`,
    auth: {
      username: process.env.MUREX_USERNAME || '',
      password: process.env.MUREX_PASSWORD || '',
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
    name: 'get_portfolio',
    description: 'Get portfolio positions',
    inputSchema: {
      type: 'object' as const,
      properties: { portfolioId: { type: 'string', description: 'The portfolioId' } },
      required: ['portfolioId'],
    },
  },
  {
    name: 'get_risk',
    description: 'Get risk metrics',
    inputSchema: {
      type: 'object' as const,
      properties: { scenarioId: { type: 'string', description: 'The scenarioId' } },
      required: ['scenarioId'],
    },
  },
  {
    name: 'search',
    description: 'Search trades',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
      required: ['query'],
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
    { name: 'murex-mcp-server', version: '1.0.0' },
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
      case 'get_portfolio':
        return safeCall(() => api.get(`/portfolios/${a.portfolioId}/positions`));
      case 'get_risk':
        return safeCall(() => api.get(`/risk/scenarios/${a.scenarioId}`));
      case 'search':
        return safeCall(() => api.get(`/trades/search?query=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Murex MX.3 MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
