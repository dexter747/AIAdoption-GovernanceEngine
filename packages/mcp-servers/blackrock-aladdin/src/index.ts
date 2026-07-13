#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.ALADDIN_BASE_URL) console.error('Warning: ALADDIN_BASE_URL not set');
  if (!process.env.ALADDIN_API_KEY) console.error('Warning: ALADDIN_API_KEY not set');

  api = axios.create({
    baseURL: `${process.env.ALADDIN_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.ALADDIN_API_KEY}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_portfolios',
    description: 'List portfolios',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_portfolio',
    description: 'Get portfolio details',
    inputSchema: {
      type: 'object' as const,
      properties: { portfolioId: { type: 'string', description: 'The portfolioId' } },
      required: ['portfolioId'],
    },
  },
  {
    name: 'get_risk_analytics',
    description: 'Get risk analytics',
    inputSchema: {
      type: 'object' as const,
      properties: { portfolioId: { type: 'string', description: 'The portfolioId' } },
      required: ['portfolioId'],
    },
  },
  {
    name: 'get_exposures',
    description: 'Get portfolio exposures',
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
    { name: 'blackrock-aladdin-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_portfolios':
        return safeCall(() => api.get(`/portfolios`));
      case 'get_portfolio':
        return safeCall(() => api.get(`/portfolios/${a.portfolioId}`));
      case 'get_risk_analytics':
        return safeCall(() => api.get(`/risk/analytics/${a.portfolioId}`));
      case 'get_exposures':
        return safeCall(() => api.get(`/portfolios/${a.portfolioId}/exposures`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('BlackRock Aladdin MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
