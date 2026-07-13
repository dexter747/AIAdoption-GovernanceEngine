#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.COPPER_API_KEY) console.error('Warning: COPPER_API_KEY not set');
  if (!process.env.COPPER_EMAIL) console.error('Warning: COPPER_EMAIL not set');

  api = axios.create({
    baseURL: 'https://api.copper.com/developer_api/v1',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-PW-AccessToken': `${process.env.COPPER_API_KEY}`,
      'X-PW-Application': 'developer_api',
      'X-PW-UserEmail': `${process.env.COPPER_EMAIL}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_leads',
    description: 'List leads',
    inputSchema: {
      type: 'object' as const,
      properties: {},
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
    name: 'list_opportunities',
    description: 'List opportunities',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'search',
    description: 'Search across entities',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
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
    { name: 'copper-crm-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_leads':
        return safeCall(() => api.post(`/leads/search`, {}));
      case 'list_people':
        return safeCall(() => api.post(`/people/search`, {}));
      case 'list_opportunities':
        return safeCall(() => api.post(`/opportunities/search`, {}));
      case 'search':
        return safeCall(() => api.post(`/search`, { query: a.query }));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Copper CRM MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
