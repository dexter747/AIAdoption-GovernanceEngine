#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.BLOOMBERG_HOST) console.error('Warning: BLOOMBERG_HOST not set');
  if (!process.env.BLOOMBERG_PORT) console.error('Warning: BLOOMBERG_PORT not set');

  api = axios.create({
    baseURL: `http://${process.env.BLOOMBERG_HOST}:${process.env.BLOOMBERG_PORT}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'get_security_data',
    description: 'Get security reference data',
    inputSchema: {
      type: 'object' as const,
      properties: {
        securities: { type: 'string', description: 'The securities' },
        fields: { type: 'string', description: 'The fields' },
      },
      required: ['securities', 'fields'],
    },
  },
  {
    name: 'get_historical_data',
    description: 'Get historical data',
    inputSchema: {
      type: 'object' as const,
      properties: {
        security: { type: 'string', description: 'The security' },
        fields: { type: 'string', description: 'The fields' },
        startDate: { type: 'string', description: 'The startDate' },
        endDate: { type: 'string', description: 'The endDate' },
      },
      required: ['security', 'fields', 'startDate', 'endDate'],
    },
  },
  {
    name: 'get_intraday_data',
    description: 'Get intraday tick data',
    inputSchema: {
      type: 'object' as const,
      properties: {
        security: { type: 'string', description: 'The security' },
        eventType: { type: 'string', description: 'The eventType' },
        startDateTime: { type: 'string', description: 'The startDateTime' },
        endDateTime: { type: 'string', description: 'The endDateTime' },
      },
      required: ['security', 'eventType', 'startDateTime', 'endDateTime'],
    },
  },
  {
    name: 'search_securities',
    description: 'Search for securities',
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
    { name: 'bloomberg-terminal-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'get_security_data':
        return safeCall(() => api.get(`/get_security_data`));
      case 'get_historical_data':
        return safeCall(() => api.get(`/get_historical_data`));
      case 'get_intraday_data':
        return safeCall(() => api.get(`/get_intraday_data`));
      case 'search_securities':
        return safeCall(() => api.get(`/search_securities`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Bloomberg Terminal MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
