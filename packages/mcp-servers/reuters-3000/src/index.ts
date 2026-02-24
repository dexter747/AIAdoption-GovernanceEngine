#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.REFINITIV_USERNAME) console.error('Warning: REFINITIV_USERNAME not set');
  if (!process.env.REFINITIV_PASSWORD) console.error('Warning: REFINITIV_PASSWORD not set');
  if (!process.env.REFINITIV_APP_KEY) console.error('Warning: REFINITIV_APP_KEY not set');

  api = axios.create({
    baseURL: process.env.REFINITIV_USERNAME || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.REFINITIV_USERNAME || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'get_quote',
    description: 'Get real-time quote',
    inputSchema: {
      type: 'object' as const,
      properties: { ric: { type: 'string', description: 'The ric' } },
      required: ['ric'],
    },
  },
  {
    name: 'get_historical',
    description: 'Get historical data',
    inputSchema: {
      type: 'object' as const,
      properties: { ric: { type: 'string', description: 'The ric' } },
      required: ['ric'],
    },
  },
  {
    name: 'search',
    description: 'Search instruments',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
      required: ['query'],
    },
  },
  {
    name: 'get_fundamentals',
    description: 'Get fundamental data',
    inputSchema: {
      type: 'object' as const,
      properties: { ric: { type: 'string', description: 'The ric' } },
      required: ['ric'],
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
    { name: 'reuters-3000-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'get_quote':
        return safeCall(() => api.get(`/data/pricing/v1/${a.ric}`));
      case 'get_historical':
        return safeCall(() =>
          api.get(`/data/historical-pricing/v1/views/interday-summaries/${a.ric}`)
        );
      case 'search':
        return safeCall(() => api.get(`/discovery/search/v1?query=${a.query}`));
      case 'get_fundamentals':
        return safeCall(() => api.get(`/data/fundamentals/v1/${a.ric}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Reuters 3000 / Refinitiv MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
