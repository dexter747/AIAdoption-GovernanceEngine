#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;
let accessToken: string = '';

const TOOLS: Tool[] = [
  { name: 'query_entities', description: 'Query Dynamics 365 entities using OData', inputSchema: { type: 'object', properties: { entity: { type: 'string', description: 'Entity set name (e.g., accounts, contacts)' }, filter: { type: 'string', description: 'OData $filter expression' }, select: { type: 'string', description: 'Comma-separated fields to select' }, top: { type: 'number', description: 'Max records' }, orderby: { type: 'string' } }, required: ['entity'] } },
  { name: 'get_record', description: 'Get a specific record by ID', inputSchema: { type: 'object', properties: { entity: { type: 'string' }, id: { type: 'string' }, select: { type: 'string' } }, required: ['entity', 'id'] } },
  { name: 'create_record', description: 'Create a new record', inputSchema: { type: 'object', properties: { entity: { type: 'string' }, data: { type: 'object' } }, required: ['entity', 'data'] } },
  { name: 'update_record', description: 'Update an existing record', inputSchema: { type: 'object', properties: { entity: { type: 'string' }, id: { type: 'string' }, data: { type: 'object' } }, required: ['entity', 'id', 'data'] } },
  { name: 'delete_record', description: 'Delete a record', inputSchema: { type: 'object', properties: { entity: { type: 'string' }, id: { type: 'string' } }, required: ['entity', 'id'] } },
  { name: 'get_metadata', description: 'Get entity metadata/definitions', inputSchema: { type: 'object', properties: { entity: { type: 'string', description: 'Entity logical name (optional)' } } } },
  { name: 'execute_fetchxml', description: 'Execute a FetchXML query', inputSchema: { type: 'object', properties: { entity: { type: 'string' }, fetchxml: { type: 'string' } }, required: ['entity', 'fetchxml'] } },
];

const server = new Server({ name: 'dynamics365-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function getToken() {
  const tenantId = process.env.DYNAMICS365_TENANT_ID;
  const clientId = process.env.DYNAMICS365_CLIENT_ID;
  const clientSecret = process.env.DYNAMICS365_CLIENT_SECRET;
  const resource = process.env.DYNAMICS365_RESOURCE_URL;

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const resp = await axios.post(tokenUrl, new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId || '',
    client_secret: clientSecret || '',
    scope: `${resource}/.default`,
  }));
  return resp.data.access_token;
}

async function initConnection() {
  const baseUrl = process.env.DYNAMICS365_URL; // e.g., https://orgname.crm.dynamics.com
  accessToken = process.env.DYNAMICS365_ACCESS_TOKEN || await getToken();

  api = axios.create({
    baseURL: `${baseUrl}/api/data/v9.2`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Prefer': 'odata.include-annotations="*"',
    },
  });
  console.error(`Connected to Dynamics 365: ${baseUrl}`);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!api) throw new Error('Not connected');
  try {
    switch (name) {
      case 'query_entities': {
        const params: any = {};
        if ((args as any).filter) params['$filter'] = (args as any).filter;
        if ((args as any).select) params['$select'] = (args as any).select;
        if ((args as any).top) params['$top'] = (args as any).top;
        if ((args as any).orderby) params['$orderby'] = (args as any).orderby;
        const r = await api.get(`/${(args as any).entity}`, { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify({ count: r.data.value?.length, records: r.data.value }, null, 2) }] };
      }
      case 'get_record': {
        const params: any = {};
        if ((args as any).select) params['$select'] = (args as any).select;
        const r = await api.get(`/${(args as any).entity}(${(args as any).id})`, { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'create_record': {
        const r = await api.post(`/${(args as any).entity}`, (args as any).data);
        return { content: [{ type: 'text' as const, text: JSON.stringify({ success: true, id: r.headers['odata-entityid'] }, null, 2) }] };
      }
      case 'update_record': {
        await api.patch(`/${(args as any).entity}(${(args as any).id})`, (args as any).data);
        return { content: [{ type: 'text' as const, text: 'Record updated successfully' }] };
      }
      case 'delete_record': {
        await api.delete(`/${(args as any).entity}(${(args as any).id})`);
        return { content: [{ type: 'text' as const, text: 'Record deleted successfully' }] };
      }
      case 'get_metadata': {
        const entity = (args as any).entity;
        const url = entity ? `/EntityDefinitions(LogicalName='${entity}')` : '/EntityDefinitions?$select=LogicalName,DisplayName,EntitySetName';
        const r = await api.get(url);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'execute_fetchxml': {
        const fetchXml = encodeURIComponent((args as any).fetchxml);
        const r = await api.get(`/${(args as any).entity}?fetchXml=${fetchXml}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data.value, null, 2) }] };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    const msg = error.response?.data?.error?.message || error.message;
    return { content: [{ type: 'text' as const, text: `Dynamics 365 Error: ${msg}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Dynamics 365 MCP Server running on stdio');
}

main();
