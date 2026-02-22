#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

const TOOLS: Tool[] = [
  {
    name: 'query_api',
    description: 'Query Infor CloudSuite ION API',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: { type: 'string', description: 'API endpoint path' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        params: { type: 'object' },
        data: { type: 'object' },
      },
      required: ['endpoint'],
    },
  },
  {
    name: 'get_data_lake',
    description: 'Query Infor Data Lake',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' }, limit: { type: 'number' } },
      required: ['query'],
    },
  },
  {
    name: 'list_bods',
    description: 'List Business Object Documents',
    inputSchema: {
      type: 'object',
      properties: {
        noun: { type: 'string', description: 'BOD noun (e.g., SalesOrder, PurchaseOrder)' },
      },
    },
  },
  {
    name: 'get_bod',
    description: 'Get a specific BOD',
    inputSchema: {
      type: 'object',
      properties: { noun: { type: 'string' }, id: { type: 'string' } },
      required: ['noun', 'id'],
    },
  },
  {
    name: 'process_bod',
    description: 'Process a BOD action',
    inputSchema: {
      type: 'object',
      properties: {
        verb: { type: 'string', description: 'e.g., Sync, Process, Confirm' },
        noun: { type: 'string' },
        data: { type: 'object' },
      },
      required: ['verb', 'noun', 'data'],
    },
  },
];

const server = new Server(
  { name: 'infor-cloudsuite-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

async function getOAuthToken(): Promise<string> {
  const tokenUrl = process.env.INFOR_TOKEN_URL || '';
  const r = await axios.post(
    tokenUrl,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.INFOR_CLIENT_ID || '',
      client_secret: process.env.INFOR_CLIENT_SECRET || '',
      scope: process.env.INFOR_SCOPE || '',
    })
  );
  return r.data.access_token;
}

async function initConnection() {
  const baseUrl = process.env.INFOR_API_URL;
  const token = process.env.INFOR_ACCESS_TOKEN || (await getOAuthToken());
  api = axios.create({
    baseURL: baseUrl,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  console.error(`Connected to Infor CloudSuite: ${baseUrl}`);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;
  if (!api) throw new Error('Not connected');
  try {
    switch (name) {
      case 'query_api': {
        const method = ((args as any).method || 'GET').toLowerCase();
        const r = await (api as any)[method](
          (args as any).endpoint,
          method === 'get' ? { params: (args as any).params } : (args as any).data
        );
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_data_lake': {
        const r = await api.post('/datalakeapi/v2/datalake/query', {
          query: (args as any).query,
          limit: (args as any).limit || 50,
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'list_bods': {
        const noun = (args as any).noun || '';
        const r = await api.get(`/ionapi/v2/bods/${noun}`, { params: { limit: 50 } });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_bod': {
        const r = await api.get(`/ionapi/v2/bods/${(args as any).noun}/${(args as any).id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'process_bod': {
        const r = await api.post(
          `/ionapi/v2/bods/${(args as any).verb}${(args as any).noun}`,
          (args as any).data
        );
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Infor Error: ${error.response?.data?.message || error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Infor CloudSuite MCP Server running on stdio');
}

main();
