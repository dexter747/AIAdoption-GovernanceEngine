#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.DATABRICKS_HOST) console.error('Warning: DATABRICKS_HOST not set');
  if (!process.env.DATABRICKS_TOKEN) console.error('Warning: DATABRICKS_TOKEN not set');
  if (!process.env.DATABRICKS_WAREHOUSE_ID)
    console.error('Warning: DATABRICKS_WAREHOUSE_ID not set');

  api = axios.create({
    baseURL: `https://${process.env.DATABRICKS_HOST}/api/2.0`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.DATABRICKS_TOKEN}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'query',
    description: 'Execute a SQL query',
    inputSchema: {
      type: 'object' as const,
      properties: { sql: { type: 'string', description: 'The sql' } },
    },
  },
  {
    name: 'list_catalogs',
    description: 'List catalogs',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_schemas',
    description: 'List schemas',
    inputSchema: {
      type: 'object' as const,
      properties: { catalog: { type: 'string', description: 'The catalog' } },
      required: ['catalog'],
    },
  },
  {
    name: 'list_tables',
    description: 'List tables',
    inputSchema: {
      type: 'object' as const,
      properties: {
        catalog: { type: 'string', description: 'The catalog' },
        schema: { type: 'string', description: 'The schema' },
      },
      required: ['catalog', 'schema'],
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
    { name: 'databricks-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'query':
        return safeCall(() => api.post(`/sql/statements`, { sql: a.sql }));
      case 'list_catalogs':
        return safeCall(() => api.get(`/unity-catalog/catalogs`));
      case 'list_schemas':
        return safeCall(() => api.get(`/unity-catalog/schemas?catalog_name=${a.catalog}`));
      case 'list_tables':
        return safeCall(() =>
          api.get(`/unity-catalog/tables?catalog_name=${a.catalog}&schema_name=${a.schema}`)
        );
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Databricks MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
