#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.DEEL_API_TOKEN) console.error('Warning: DEEL_API_TOKEN not set');

  api = axios.create({
    baseURL: 'https://api.deel.com/rest/v2',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.DEEL_API_TOKEN}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_contracts',
    description: 'List contracts',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_contract',
    description: 'Get contract details',
    inputSchema: {
      type: 'object' as const,
      properties: { contractId: { type: 'string', description: 'The contractId' } },
      required: ['contractId'],
    },
  },
  {
    name: 'list_people',
    description: 'List people',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_invoices',
    description: 'List invoices',
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
    { name: 'deel-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_contracts':
        return safeCall(() => api.get(`/contracts`));
      case 'get_contract':
        return safeCall(() => api.get(`/contracts/${a.contractId}`));
      case 'list_people':
        return safeCall(() => api.get(`/people`));
      case 'list_invoices':
        return safeCall(() => api.get(`/invoices`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Deel MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
