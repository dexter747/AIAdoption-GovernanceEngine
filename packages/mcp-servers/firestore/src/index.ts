#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.FIRESTORE_PROJECT_ID) console.error('Warning: FIRESTORE_PROJECT_ID not set');
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS)
    console.error('Warning: GOOGLE_APPLICATION_CREDENTIALS not set');

  api = axios.create({
    baseURL: `https://firestore.googleapis.com/v1/projects/${process.env.FIRESTORE_PROJECT_ID}/databases/(default)/documents`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.FIRESTORE_PROJECT_ID}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_collections',
    description: 'List collections',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_documents',
    description: 'List documents in a collection',
    inputSchema: {
      type: 'object' as const,
      properties: { collection: { type: 'string', description: 'The collection' } },
      required: ['collection'],
    },
  },
  {
    name: 'get_document',
    description: 'Get document by path',
    inputSchema: {
      type: 'object' as const,
      properties: { documentPath: { type: 'string', description: 'The documentPath' } },
      required: ['documentPath'],
    },
  },
  {
    name: 'query',
    description: 'Run a structured query',
    inputSchema: {
      type: 'object' as const,
      properties: { structuredQuery: { type: 'string', description: 'The structuredQuery' } },
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
    { name: 'firestore-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_collections':
        return safeCall(() => api.post(`/:listCollections`, {}));
      case 'list_documents':
        return safeCall(() => api.get(`/${a.collection}`));
      case 'get_document':
        return safeCall(() => api.get(`/${a.documentPath}`));
      case 'query':
        return safeCall(() => api.post(`/:runQuery`, { structuredQuery: a.structuredQuery }));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Google Firestore MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
