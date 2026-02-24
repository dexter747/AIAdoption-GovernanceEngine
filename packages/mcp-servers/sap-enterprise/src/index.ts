#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.SAP_BASE_URL) console.error('Warning: SAP_BASE_URL not set');
  if (!process.env.SAP_USERNAME) console.error('Warning: SAP_USERNAME not set');
  if (!process.env.SAP_PASSWORD) console.error('Warning: SAP_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.SAP_BASE_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.SAP_BASE_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'query',
    description: 'Execute OData query',
    inputSchema: {
      type: 'object' as const,
      properties: {
        service: { type: 'string', description: 'The service' },
        entity: { type: 'string', description: 'The entity' },
      },
      required: ['service', 'entity'],
    },
  },
  {
    name: 'get_entity',
    description: 'Get entity by key',
    inputSchema: {
      type: 'object' as const,
      properties: {
        service: { type: 'string', description: 'The service' },
        entity: { type: 'string', description: 'The entity' },
        key: { type: 'string', description: 'The key' },
      },
      required: ['service', 'entity', 'key'],
    },
  },
  {
    name: 'list_services',
    description: 'List available OData services',
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
    { name: 'sap-enterprise-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'query':
        return safeCall(() => api.get(`/${a.service}/${a.entity}`));
      case 'get_entity':
        return safeCall(() => api.get(`/${a.service}/${a.entity}('${a.key}')`));
      case 'list_services':
        return safeCall(() => api.get(`/`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SAP Enterprise MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
