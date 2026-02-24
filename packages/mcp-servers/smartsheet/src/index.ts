#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.SMARTSHEET_ACCESS_TOKEN)
    console.error('Warning: SMARTSHEET_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: process.env.SMARTSHEET_ACCESS_TOKEN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.SMARTSHEET_ACCESS_TOKEN || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_sheets',
    description: 'List all sheets',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_sheet',
    description: 'Get sheet with rows and columns',
    inputSchema: {
      type: 'object' as const,
      properties: { sheetId: { type: 'string', description: 'The sheetId' } },
      required: ['sheetId'],
    },
  },
  {
    name: 'list_rows',
    description: 'List rows in a sheet',
    inputSchema: {
      type: 'object' as const,
      properties: { sheetId: { type: 'string', description: 'The sheetId' } },
      required: ['sheetId'],
    },
  },
  {
    name: 'add_row',
    description: 'Add a row to a sheet',
    inputSchema: {
      type: 'object' as const,
      properties: {
        sheetId: { type: 'string', description: 'The sheetId' },
        cells: { type: 'string', description: 'The cells' },
      },
      required: ['sheetId'],
    },
  },
  {
    name: 'update_row',
    description: 'Update a row in a sheet',
    inputSchema: {
      type: 'object' as const,
      properties: {
        sheetId: { type: 'string', description: 'The sheetId' },
        rowId: { type: 'string', description: 'The rowId' },
        cells: { type: 'string', description: 'The cells' },
      },
      required: ['sheetId'],
    },
  },
  {
    name: 'search',
    description: 'Search across all sheets',
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
    { name: 'smartsheet-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_sheets':
        return safeCall(() => api.get(`/sheets`));
      case 'get_sheet':
        return safeCall(() => api.get(`/sheets/${a.sheetId}`));
      case 'list_rows':
        return safeCall(() => api.get(`/sheets/${a.sheetId}/rows`));
      case 'add_row':
        return safeCall(() => api.post(`/sheets/${a.sheetId}/rows`, { cells: a.cells }));
      case 'update_row':
        return safeCall(() =>
          api.put(`/sheets/${a.sheetId}/rows`, { rowId: a.rowId, cells: a.cells })
        );
      case 'search':
        return safeCall(() => api.get(`/search?query=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Smartsheet MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
