#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

const TOOLS: Tool[] = [
  { name: 'search_clients', description: 'Search clients/accounts', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'get_client', description: 'Get client details', inputSchema: { type: 'object', properties: { clientId: { type: 'string' } }, required: ['clientId'] } },
  { name: 'get_policies', description: 'Get client policies', inputSchema: { type: 'object', properties: { clientId: { type: 'string' } }, required: ['clientId'] } },
  { name: 'get_policy', description: 'Get policy details', inputSchema: { type: 'object', properties: { policyId: { type: 'string' } }, required: ['policyId'] } },
  { name: 'get_activities', description: 'Get activities/tasks', inputSchema: { type: 'object', properties: { clientId: { type: 'string' }, status: { type: 'string' } } } },
  { name: 'api_call', description: 'Generic Applied Epic API call', inputSchema: { type: 'object', properties: { endpoint: { type: 'string' }, method: { type: 'string' }, data: { type: 'object' } }, required: ['endpoint'] } },
];

const server = new Server({ name: 'applied-epic-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function initConnection() {
  const baseUrl = process.env.APPLIED_EPIC_URL;
  const token = process.env.APPLIED_EPIC_ACCESS_TOKEN || '';
  api = axios.create({ baseURL: `${baseUrl}/api/v1`, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
  console.error(`Connected to Applied Epic: ${baseUrl}`);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!api) throw new Error('Not connected');
  try {
    switch (name) {
      case 'search_clients': { const r = await api.get('/clients', { params: { search: (args as any).query } }); return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] }; }
      case 'get_client': { const r = await api.get(`/clients/${(args as any).clientId}`); return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] }; }
      case 'get_policies': { const r = await api.get(`/clients/${(args as any).clientId}/policies`); return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] }; }
      case 'get_policy': { const r = await api.get(`/policies/${(args as any).policyId}`); return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] }; }
      case 'get_activities': { const r = await api.get('/activities', { params: args as any }); return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] }; }
      case 'api_call': {
        const method = ((args as any).method || 'GET').toLowerCase();
        const r = await (api as any)[method]((args as any).endpoint, method !== 'get' ? (args as any).data : undefined);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Applied Epic Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Applied Epic MCP Server running on stdio');
}

main();
