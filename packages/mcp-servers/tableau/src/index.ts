#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.TABLEAU_SERVER_URL) console.error('Warning: TABLEAU_SERVER_URL not set');
  if (!process.env.TABLEAU_TOKEN_NAME) console.error('Warning: TABLEAU_TOKEN_NAME not set');
  if (!process.env.TABLEAU_TOKEN_SECRET) console.error('Warning: TABLEAU_TOKEN_SECRET not set');
  if (!process.env.TABLEAU_SITE_ID) console.error('Warning: TABLEAU_SITE_ID not set');

  api = axios.create({
    baseURL: process.env.TABLEAU_SERVER_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.TABLEAU_SERVER_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_workbooks',
    description: 'List workbooks',
    inputSchema: {
      type: 'object' as const,
      properties: { siteId: { type: 'string', description: 'The siteId' } },
      required: ['siteId'],
    },
  },
  {
    name: 'get_workbook',
    description: 'Get workbook details',
    inputSchema: {
      type: 'object' as const,
      properties: {
        siteId: { type: 'string', description: 'The siteId' },
        workbookId: { type: 'string', description: 'The workbookId' },
      },
      required: ['siteId', 'workbookId'],
    },
  },
  {
    name: 'list_views',
    description: 'List views',
    inputSchema: {
      type: 'object' as const,
      properties: { siteId: { type: 'string', description: 'The siteId' } },
      required: ['siteId'],
    },
  },
  {
    name: 'list_datasources',
    description: 'List data sources',
    inputSchema: {
      type: 'object' as const,
      properties: { siteId: { type: 'string', description: 'The siteId' } },
      required: ['siteId'],
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
    { name: 'tableau-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_workbooks':
        return safeCall(() => api.get(`/sites/${a.siteId}/workbooks`));
      case 'get_workbook':
        return safeCall(() => api.get(`/sites/${a.siteId}/workbooks/${a.workbookId}`));
      case 'list_views':
        return safeCall(() => api.get(`/sites/${a.siteId}/views`));
      case 'list_datasources':
        return safeCall(() => api.get(`/sites/${a.siteId}/datasources`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Tableau MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
