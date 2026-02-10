#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

const TOOLS: Tool[] = [
  { name: 'get_policies', description: 'Get insurance policies', inputSchema: { type: 'object', properties: { policyNumber: { type: 'string' }, filter: { type: 'string' } } } },
  { name: 'get_policy', description: 'Get policy details', inputSchema: { type: 'object', properties: { policyId: { type: 'string' } }, required: ['policyId'] } },
  { name: 'get_claims', description: 'Get claims', inputSchema: { type: 'object', properties: { policyId: { type: 'string' }, status: { type: 'string' } } } },
  { name: 'get_claim', description: 'Get claim details', inputSchema: { type: 'object', properties: { claimId: { type: 'string' } }, required: ['claimId'] } },
  { name: 'get_billing', description: 'Get billing information', inputSchema: { type: 'object', properties: { accountId: { type: 'string' } }, required: ['accountId'] } },
  { name: 'api_call', description: 'Generic Duck Creek API call', inputSchema: { type: 'object', properties: { endpoint: { type: 'string' }, method: { type: 'string', enum: ['GET', 'POST', 'PUT'] }, data: { type: 'object' } }, required: ['endpoint'] } },
];

const server = new Server({ name: 'duck-creek-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function initConnection() {
  const baseUrl = process.env.DUCKCREEK_API_URL;
  const token = process.env.DUCKCREEK_ACCESS_TOKEN || '';
  api = axios.create({ baseURL: baseUrl, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
  console.error(`Connected to Duck Creek: ${baseUrl}`);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!api) throw new Error('Not connected');
  try {
    switch (name) {
      case 'get_policies': { const r = await api.get('/policies', { params: args as any }); return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] }; }
      case 'get_policy': { const r = await api.get(`/policies/${(args as any).policyId}`); return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] }; }
      case 'get_claims': { const r = await api.get('/claims', { params: args as any }); return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] }; }
      case 'get_claim': { const r = await api.get(`/claims/${(args as any).claimId}`); return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] }; }
      case 'get_billing': { const r = await api.get(`/billing/accounts/${(args as any).accountId}`); return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] }; }
      case 'api_call': {
        const method = ((args as any).method || 'GET').toLowerCase();
        const r = await (api as any)[method]((args as any).endpoint, method !== 'get' ? (args as any).data : undefined);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Duck Creek Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Duck Creek MCP Server running on stdio');
}

main();
