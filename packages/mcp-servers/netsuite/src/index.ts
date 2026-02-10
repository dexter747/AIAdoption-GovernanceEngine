#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import OAuth from 'oauth-1.0a';
import CryptoJS from 'crypto-js';

let api: AxiosInstance | null = null;
let oauth: OAuth | null = null;
let tokenData: { key: string; secret: string } | null = null;

const TOOLS: Tool[] = [
  { name: 'suiteql', description: 'Execute a SuiteQL query', inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'SuiteQL query' }, limit: { type: 'number' }, offset: { type: 'number' } }, required: ['query'] } },
  { name: 'get_record', description: 'Get a NetSuite record', inputSchema: { type: 'object', properties: { type: { type: 'string', description: 'Record type (e.g., customer, salesOrder)' }, id: { type: 'string' }, fields: { type: 'array', items: { type: 'string' } } }, required: ['type', 'id'] } },
  { name: 'search_records', description: 'Search records', inputSchema: { type: 'object', properties: { type: { type: 'string' }, filters: { type: 'array' }, columns: { type: 'array', items: { type: 'string' } } }, required: ['type'] } },
  { name: 'create_record', description: 'Create a new record', inputSchema: { type: 'object', properties: { type: { type: 'string' }, data: { type: 'object' } }, required: ['type', 'data'] } },
  { name: 'update_record', description: 'Update an existing record', inputSchema: { type: 'object', properties: { type: { type: 'string' }, id: { type: 'string' }, data: { type: 'object' } }, required: ['type', 'id', 'data'] } },
  { name: 'list_record_types', description: 'List available record types', inputSchema: { type: 'object', properties: {} } },
];

const server = new Server({ name: 'netsuite-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

function getAuthHeader(url: string, method: string): string {
  if (!oauth || !tokenData) throw new Error('OAuth not configured');
  const authData = oauth.authorize({ url, method }, tokenData);
  return oauth.toHeader(authData).Authorization;
}

async function initConnection() {
  const accountId = process.env.NETSUITE_ACCOUNT_ID;
  const consumerKey = process.env.NETSUITE_CONSUMER_KEY || '';
  const consumerSecret = process.env.NETSUITE_CONSUMER_SECRET || '';
  const tokenKey = process.env.NETSUITE_TOKEN_ID || '';
  const tokenSecret = process.env.NETSUITE_TOKEN_SECRET || '';

  oauth = new OAuth({
    consumer: { key: consumerKey, secret: consumerSecret },
    signature_method: 'HMAC-SHA256',
    hash_function(baseString: string, key: string) {
      return CryptoJS.HmacSHA256(baseString, key).toString(CryptoJS.enc.Base64);
    },
  });
  tokenData = { key: tokenKey, secret: tokenSecret };

  const baseURL = `https://${accountId?.replace('_', '-')}.suitetalk.api.netsuite.com/services/rest`;
  api = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } });

  api.interceptors.request.use((config) => {
    const url = `${config.baseURL}${config.url}`;
    config.headers.Authorization = getAuthHeader(url, config.method?.toUpperCase() || 'GET');
    return config;
  });

  console.error(`Connected to NetSuite account: ${accountId}`);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!api) throw new Error('Not connected');
  try {
    switch (name) {
      case 'suiteql': {
        const r = await api.post('/query/v1/suiteql', { q: (args as any).query }, {
          params: { limit: (args as any).limit || 100, offset: (args as any).offset || 0 },
          headers: { 'Prefer': 'transient' },
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify({ count: r.data.count, items: r.data.items, hasMore: r.data.hasMore }, null, 2) }] };
      }
      case 'get_record': {
        const fields = (args as any).fields?.length ? `?fields=${(args as any).fields.join(',')}` : '';
        const r = await api.get(`/record/v1/${(args as any).type}/${(args as any).id}${fields}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'search_records': {
        const r = await api.get(`/record/v1/${(args as any).type}`, { params: { limit: 50 } });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'create_record': {
        const r = await api.post(`/record/v1/${(args as any).type}`, (args as any).data);
        return { content: [{ type: 'text' as const, text: JSON.stringify({ success: true, id: r.headers.location }, null, 2) }] };
      }
      case 'update_record': {
        await api.patch(`/record/v1/${(args as any).type}/${(args as any).id}`, (args as any).data);
        return { content: [{ type: 'text' as const, text: 'Record updated successfully' }] };
      }
      case 'list_record_types': {
        const r = await api.get('/record/v1/metadata-catalog/');
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    const msg = error.response?.data?.['o:errorDetails'] || error.response?.data?.title || error.message;
    return { content: [{ type: 'text' as const, text: `NetSuite Error: ${JSON.stringify(msg)}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NetSuite MCP Server running on stdio');
}

main();
