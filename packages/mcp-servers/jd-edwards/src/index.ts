#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;
let authToken: string = '';

const TOOLS: Tool[] = [
  { name: 'call_orchestration', description: 'Call a JDE orchestration', inputSchema: { type: 'object', properties: { name: { type: 'string', description: 'Orchestration name' }, inputs: { type: 'object' } }, required: ['name'] } },
  { name: 'data_request', description: 'Execute a data request', inputSchema: { type: 'object', properties: { table: { type: 'string', description: 'Table name (e.g., F0101)' }, fields: { type: 'array', items: { type: 'string' } }, filter: { type: 'object' }, maxRecords: { type: 'number' } }, required: ['table'] } },
  { name: 'form_request', description: 'Submit a form service request', inputSchema: { type: 'object', properties: { application: { type: 'string' }, form: { type: 'string' }, action: { type: 'string' }, data: { type: 'object' } }, required: ['application', 'form'] } },
  { name: 'batch_formrequest', description: 'Submit batch form requests', inputSchema: { type: 'object', properties: { requests: { type: 'array', items: { type: 'object' } } }, required: ['requests'] } },
  { name: 'get_media_objects', description: 'Get media objects for a record', inputSchema: { type: 'object', properties: { moStructure: { type: 'string' }, moKey: { type: 'string' } }, required: ['moStructure', 'moKey'] } },
];

const server = new Server({ name: 'jd-edwards-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function initConnection() {
  const baseUrl = process.env.JDE_AIS_URL; // e.g., https://jde-server:port/jderest/v3
  const username = process.env.JDE_USERNAME || '';
  const password = process.env.JDE_PASSWORD || '';
  const environment = process.env.JDE_ENVIRONMENT || 'JDV920';

  const r = await axios.post(`${baseUrl}/tokenrequest`, { username, password, environment, deviceName: 'AINexusMCP' });
  authToken = r.data.userInfo?.token || '';

  api = axios.create({
    baseURL: baseUrl,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
  });
  console.error(`Connected to JD Edwards: ${baseUrl}`);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!api) throw new Error('Not connected');
  try {
    switch (name) {
      case 'call_orchestration': {
        const r = await api.post('/orchestrator', { name: (args as any).name, inputs: (args as any).inputs || {} });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'data_request': {
        const body: any = { tableName: (args as any).table, targetType: 'table', dataServiceType: 'BROWSE', maxRecords: (args as any).maxRecords || 50 };
        if ((args as any).fields) body.outputFields = (args as any).fields.map((f: string) => ({ field: f }));
        if ((args as any).filter) body.query = (args as any).filter;
        const r = await api.post('/dataservice', body);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'form_request': {
        const body = { formName: (args as any).form, applicationName: (args as any).application, action: (args as any).action || 'read', formServiceAction: (args as any).action || 'R', data: (args as any).data || {} };
        const r = await api.post('/formservice', body);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'batch_formrequest': {
        const r = await api.post('/batchformservice', { formRequests: (args as any).requests });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_media_objects': {
        const r = await api.get(`/mediaobject/${(args as any).moStructure}/${(args as any).moKey}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `JDE Error: ${error.response?.data?.message || error.message}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('JD Edwards MCP Server running on stdio');
}

main();
