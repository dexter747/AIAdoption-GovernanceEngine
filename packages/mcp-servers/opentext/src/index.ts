#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.OPENTEXT_BASE_URL) console.error('Warning: OPENTEXT_BASE_URL not set');
  if (!process.env.OPENTEXT_USERNAME) console.error('Warning: OPENTEXT_USERNAME not set');
  if (!process.env.OPENTEXT_PASSWORD) console.error('Warning: OPENTEXT_PASSWORD not set');

  api = axios.create({
    baseURL: `${process.env.OPENTEXT_BASE_URL}/api/v2`,
    auth: {
      username: process.env.OPENTEXT_USERNAME || '',
      password: process.env.OPENTEXT_PASSWORD || '',
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
    name: 'list_nodes',
    description: 'List content nodes',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_node',
    description: 'Get node details',
    inputSchema: {
      type: 'object' as const,
      properties: { nodeId: { type: 'string', description: 'The nodeId' } },
      required: ['nodeId'],
    },
  },
  {
    name: 'search',
    description: 'Search content',
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
    { name: 'opentext-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_nodes':
        return safeCall(() => api.get(`/nodes`));
      case 'get_node':
        return safeCall(() => api.get(`/nodes/${a.nodeId}`));
      case 'search':
        return safeCall(() => api.get(`/search?where_name=contains_${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('OpenText MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
