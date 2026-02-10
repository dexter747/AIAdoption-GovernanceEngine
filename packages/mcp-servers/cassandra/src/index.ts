#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import cassandra from 'cassandra-driver';

let client: cassandra.Client | null = null;

const TOOLS: Tool[] = [
  { name: 'query', description: 'Execute a CQL query on Cassandra', inputSchema: { type: 'object', properties: { cql: { type: 'string', description: 'CQL query' }, params: { type: 'array', items: { type: 'string' } } }, required: ['cql'] } },
  { name: 'list_keyspaces', description: 'List all keyspaces', inputSchema: { type: 'object', properties: {} } },
  { name: 'list_tables', description: 'List tables in a keyspace', inputSchema: { type: 'object', properties: { keyspace: { type: 'string', description: 'Keyspace name' } }, required: ['keyspace'] } },
  { name: 'describe_table', description: 'Describe a table schema', inputSchema: { type: 'object', properties: { keyspace: { type: 'string' }, table: { type: 'string' } }, required: ['keyspace', 'table'] } },
];

const server = new Server({ name: 'cassandra-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function initConnection() {
  const contactPoints = (process.env.CASSANDRA_CONTACT_POINTS || 'localhost').split(',');
  client = new cassandra.Client({
    contactPoints,
    localDataCenter: process.env.CASSANDRA_DATACENTER || 'datacenter1',
    keyspace: process.env.CASSANDRA_KEYSPACE,
    credentials: process.env.CASSANDRA_USERNAME ? { username: process.env.CASSANDRA_USERNAME, password: process.env.CASSANDRA_PASSWORD || '' } : undefined,
  });
  await client.connect();
  console.error('Connected to Cassandra');
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!client) throw new Error('Not connected');
  try {
    switch (name) {
      case 'query': {
        const result = await client.execute((args as any).cql, (args as any).params, { prepare: true });
        return { content: [{ type: 'text' as const, text: JSON.stringify({ rows: result.rows, columns: result.columns?.map(c => c.name) }, null, 2) }] };
      }
      case 'list_keyspaces': {
        const result = await client.execute("SELECT keyspace_name FROM system_schema.keyspaces");
        return { content: [{ type: 'text' as const, text: JSON.stringify(result.rows, null, 2) }] };
      }
      case 'list_tables': {
        const result = await client.execute("SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?", [(args as any).keyspace]);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result.rows, null, 2) }] };
      }
      case 'describe_table': {
        const result = await client.execute("SELECT column_name, type, kind FROM system_schema.columns WHERE keyspace_name = ? AND table_name = ?", [(args as any).keyspace, (args as any).table]);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result.rows, null, 2) }] };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Cassandra MCP Server running on stdio');
}

main();
