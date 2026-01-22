#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import jsforce from 'jsforce';

let conn: any = null;

const server = new Server(
  { name: 'salesforce-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

async function initConnection() {
  conn = new jsforce.Connection({
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
    accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
  });
  
  // If using username/password instead
  if (process.env.SALESFORCE_USERNAME && process.env.SALESFORCE_PASSWORD) {
    await conn.login(process.env.SALESFORCE_USERNAME, process.env.SALESFORCE_PASSWORD);
  }
  
  console.error('Connected to Salesforce');
}

async function querySalesforce(soql: string) {
  if (!conn) throw new Error('Not connected');
  try {
    const result = await conn.query(soql);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result.records, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function listObjects() {
  if (!conn) throw new Error('Not connected');
  const metadata = await conn.describeGlobal();
  const objects = metadata.sobjects.map((obj: any) => ({
    name: obj.name,
    label: obj.label,
    queryable: obj.queryable,
  }));
  return { content: [{ type: 'text' as const, text: JSON.stringify(objects, null, 2) }] };
}

async function describeObject(objectName: string) {
  if (!conn) throw new Error('Not connected');
  const metadata = await conn.sobject(objectName).describe();
  return { content: [{ type: 'text' as const, text: JSON.stringify(metadata.fields, null, 2) }] };
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'query',
      description: 'Execute SOQL query',
      inputSchema: { type: 'object', properties: { soql: { type: 'string' } }, required: ['soql'] },
    },
    {
      name: 'list_objects',
      description: 'List all Salesforce objects',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'describe_object',
      description: 'Get fields for an object',
      inputSchema: { type: 'object', properties: { object: { type: 'string' } }, required: ['object'] },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === 'query') return querySalesforce((args as any).soql);
  if (name === 'list_objects') return listObjects();
  if (name === 'describe_object') return describeObject((args as any).object);
  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Salesforce MCP Server running');
}

main();
