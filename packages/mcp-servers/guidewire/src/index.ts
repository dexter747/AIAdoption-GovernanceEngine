#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let apiPC: AxiosInstance | null = null;
let apiCC: AxiosInstance | null = null;
let apiBC: AxiosInstance | null = null;

const TOOLS: Tool[] = [
  { name: 'search_policies', description: 'Search insurance policies (PolicyCenter)', inputSchema: { type: 'object', properties: { policyNumber: { type: 'string' }, accountNumber: { type: 'string' }, insuredName: { type: 'string' } } } },
  { name: 'get_policy', description: 'Get policy details', inputSchema: { type: 'object', properties: { policyId: { type: 'string' } }, required: ['policyId'] } },
  { name: 'search_claims', description: 'Search claims (ClaimCenter)', inputSchema: { type: 'object', properties: { claimNumber: { type: 'string' }, policyNumber: { type: 'string' }, status: { type: 'string' } } } },
  { name: 'get_claim', description: 'Get claim details', inputSchema: { type: 'object', properties: { claimId: { type: 'string' } }, required: ['claimId'] } },
  { name: 'search_accounts', description: 'Search billing accounts (BillingCenter)', inputSchema: { type: 'object', properties: { accountNumber: { type: 'string' }, accountName: { type: 'string' } } } },
  { name: 'get_account', description: 'Get account details', inputSchema: { type: 'object', properties: { accountId: { type: 'string' } }, required: ['accountId'] } },
  { name: 'cloud_api', description: 'Generic Guidewire Cloud API call', inputSchema: { type: 'object', properties: { center: { type: 'string', enum: ['pc', 'cc', 'bc'] }, endpoint: { type: 'string' }, method: { type: 'string', enum: ['GET', 'POST', 'PATCH'] }, data: { type: 'object' } }, required: ['center', 'endpoint'] } },
];

const server = new Server({ name: 'guidewire-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function initConnection() {
  const headers = { 'Authorization': `Bearer ${process.env.GUIDEWIRE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' };
  if (process.env.GUIDEWIRE_PC_URL) apiPC = axios.create({ baseURL: `${process.env.GUIDEWIRE_PC_URL}/rest/common/v1`, headers });
  if (process.env.GUIDEWIRE_CC_URL) apiCC = axios.create({ baseURL: `${process.env.GUIDEWIRE_CC_URL}/rest/common/v1`, headers });
  if (process.env.GUIDEWIRE_BC_URL) apiBC = axios.create({ baseURL: `${process.env.GUIDEWIRE_BC_URL}/rest/common/v1`, headers });
  console.error('Connected to Guidewire InsuranceSuite');
}

function getApi(center: string) {
  if (center === 'pc' && apiPC) return apiPC;
  if (center === 'cc' && apiCC) return apiCC;
  if (center === 'bc' && apiBC) return apiBC;
  throw new Error(`${center} API not configured`);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'search_policies': {
        const api = getApi('pc');
        const r = await api.get('/policies', { params: args as any });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_policy': {
        const api = getApi('pc');
        const r = await api.get(`/policies/${(args as any).policyId}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'search_claims': {
        const api = getApi('cc');
        const r = await api.get('/claims', { params: args as any });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_claim': {
        const api = getApi('cc');
        const r = await api.get(`/claims/${(args as any).claimId}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'search_accounts': {
        const api = getApi('bc');
        const r = await api.get('/accounts', { params: args as any });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_account': {
        const api = getApi('bc');
        const r = await api.get(`/accounts/${(args as any).accountId}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'cloud_api': {
        const api = getApi((args as any).center);
        const method = ((args as any).method || 'GET').toLowerCase();
        const r = await (api as any)[method]((args as any).endpoint, method !== 'get' ? (args as any).data : { params: (args as any).data });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Guidewire Error: ${error.response?.data?.userMessage || error.message}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Guidewire MCP Server running on stdio');
}

main();
