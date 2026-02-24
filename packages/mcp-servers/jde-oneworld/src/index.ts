#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.JDE_BASE_URL) console.error('Warning: JDE_BASE_URL not set');
  if (!process.env.JDE_USERNAME) console.error('Warning: JDE_USERNAME not set');
  if (!process.env.JDE_PASSWORD) console.error('Warning: JDE_PASSWORD not set');

  api = axios.create({
    baseURL: `${process.env.JDE_BASE_URL}/jderest/v3`,
    auth: {
      username: process.env.JDE_USERNAME || '',
      password: process.env.JDE_PASSWORD || '',
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
    name: 'query',
    description: 'Execute a query',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tableName: { type: 'string', description: 'The tableName' },
        outputFields: { type: 'string', description: 'The outputFields' },
        query: { type: 'string', description: 'The query' },
      },
    },
  },
  {
    name: 'list_tables',
    description: 'List available tables',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_address_book',
    description: 'Get address book entries',
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
    { name: 'jde-oneworld-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'query':
        return safeCall(() =>
          api.post(`/dataservice`, {
            tableName: a.tableName,
            outputFields: a.outputFields,
            query: a.query,
          })
        );
      case 'list_tables':
        return safeCall(() => api.get(`/tables`));
      case 'get_address_book':
        return safeCall(() => api.post(`/dataservice`, {}));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('JD Edwards OneWorld MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
