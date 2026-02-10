#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

const TOOLS: Tool[] = [
  { name: 'query_baq', description: 'Execute a BAQ (Business Activity Query)', inputSchema: { type: 'object', properties: { baqId: { type: 'string' }, params: { type: 'object' } }, required: ['baqId'] } },
  { name: 'get_service', description: 'Call an Epicor business object service', inputSchema: { type: 'object', properties: { service: { type: 'string', description: 'Service name (e.g., Erp.BO.CustomerSvc)' }, method: { type: 'string' }, params: { type: 'object' } }, required: ['service', 'method'] } },
  { name: 'get_record', description: 'Get a record by primary key', inputSchema: { type: 'object', properties: { service: { type: 'string' }, id: { type: 'string' } }, required: ['service', 'id'] } },
  { name: 'list_records', description: 'List records with OData filtering', inputSchema: { type: 'object', properties: { service: { type: 'string' }, filter: { type: 'string' }, select: { type: 'string' }, top: { type: 'number' } }, required: ['service'] } },
  { name: 'create_record', description: 'Create a new record', inputSchema: { type: 'object', properties: { service: { type: 'string' }, data: { type: 'object' } }, required: ['service', 'data'] } },
  { name: 'update_record', description: 'Update a record', inputSchema: { type: 'object', properties: { service: { type: 'string' }, data: { type: 'object' } }, required: ['service', 'data'] } },
];

const server = new Server({ name: 'epicor-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function initConnection() {
  const baseUrl = process.env.EPICOR_URL; // e.g., https://server/EpicorERPServer
  const apiKey = process.env.EPICOR_API_KEY;
  const username = process.env.EPICOR_USERNAME;
  const password = process.env.EPICOR_PASSWORD;
  const company = process.env.EPICOR_COMPANY || 'EPIC06';

  api = axios.create({
    baseURL: `${baseUrl}/api/v2`,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || '',
      'CallSettings': JSON.stringify({ Company: company }),
    },
    auth: apiKey ? undefined : { username: username || '', password: password || '' },
  });
  console.error(`Connected to Epicor: ${baseUrl}`);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!api) throw new Error('Not connected');
  try {
    switch (name) {
      case 'query_baq': {
        const r = await api.get(`/odata/BaqSvc/${(args as any).baqId}`, { params: (args as any).params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_service': {
        const r = await api.post(`/odata/${(args as any).service}/${(args as any).method}`, (args as any).params || {});
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_record': {
        const r = await api.get(`/odata/${(args as any).service}('${(args as any).id}')`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'list_records': {
        const params: any = {};
        if ((args as any).filter) params['$filter'] = (args as any).filter;
        if ((args as any).select) params['$select'] = (args as any).select;
        if ((args as any).top) params['$top'] = (args as any).top;
        const r = await api.get(`/odata/${(args as any).service}`, { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'create_record': {
        const r = await api.post(`/odata/${(args as any).service}`, (args as any).data);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'update_record': {
        const r = await api.patch(`/odata/${(args as any).service}`, (args as any).data);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Epicor Error: ${error.response?.data?.ErrorMessage || error.message}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Epicor MCP Server running on stdio');
}

main();
