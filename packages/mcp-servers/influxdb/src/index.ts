#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.INFLUXDB_URL) console.error('Warning: INFLUXDB_URL not set');
  if (!process.env.INFLUXDB_TOKEN) console.error('Warning: INFLUXDB_TOKEN not set');
  if (!process.env.INFLUXDB_ORG) console.error('Warning: INFLUXDB_ORG not set');

  api = axios.create({
    baseURL: process.env.INFLUXDB_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.INFLUXDB_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'query',
    description: 'Execute a Flux query',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
    },
  },
  {
    name: 'list_buckets',
    description: 'List buckets',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_measurements',
    description: 'List measurements in a bucket',
    inputSchema: {
      type: 'object' as const,
      properties: { bucket: { type: 'string', description: 'The bucket' } },
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
    { name: 'influxdb-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'query':
        return safeCall(() => api.post(`/api/v2/query?org=${ORG}`, { query: a.query }));
      case 'list_buckets':
        return safeCall(() => api.get(`/api/v2/buckets`));
      case 'list_measurements':
        return safeCall(() => api.post(`/api/v2/query?org=${ORG}`, { bucket: a.bucket }));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('InfluxDB MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
