#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'servicenow-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function makeRequest(endpoint: string) {
  const baseUrl = process.env.SERVICENOW_INSTANCE_URL;
  const auth = Buffer.from(`${process.env.SERVICENOW_USERNAME}:${process.env.SERVICENOW_PASSWORD}`).toString('base64');
  
  const response = await fetch(`${baseUrl}/api/now/${endpoint}`, {
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' }
  });
  return response.json();
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'query_table', description: 'Query ServiceNow table', inputSchema: { type: 'object', properties: { table: { type: 'string' }, query: { type: 'string' } }, required: ['table'] } },
    { name: 'get_incident', description: 'Get incident by ID', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    if (name === 'query_table') {
      const data = await makeRequest(`table/${(args as any).table}?sysparm_query=${(args as any).query || ''}`);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data.result, null, 2) }] };
    }
    if (name === 'get_incident') {
      const data = await makeRequest(`table/incident/${(args as any).id}`);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data.result, null, 2) }] };
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ServiceNow MCP Server running');
}
main();
