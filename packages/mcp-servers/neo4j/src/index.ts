#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import neo4j, { Driver } from 'neo4j-driver';

let driver: Driver | null = null;

const TOOLS: Tool[] = [
  { name: 'query', description: 'Execute a Cypher query', inputSchema: { type: 'object', properties: { cypher: { type: 'string', description: 'Cypher query' }, params: { type: 'object', description: 'Query parameters' } }, required: ['cypher'] } },
  { name: 'list_labels', description: 'List all node labels', inputSchema: { type: 'object', properties: {} } },
  { name: 'list_relationship_types', description: 'List all relationship types', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_schema', description: 'Get database schema visualization', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_indexes', description: 'List all indexes', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_constraints', description: 'List all constraints', inputSchema: { type: 'object', properties: {} } },
];

const server = new Server({ name: 'neo4j-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function initConnection() {
  const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
  const user = process.env.NEO4J_USER || 'neo4j';
  const password = process.env.NEO4J_PASSWORD || '';
  driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  await driver.verifyConnectivity();
  console.error('Connected to Neo4j');
}

async function runCypher(cypher: string, params?: Record<string, any>) {
  if (!driver) throw new Error('Not connected');
  const session = driver.session();
  try {
    const result = await session.run(cypher, params || {});
    return result.records.map(r => r.toObject());
  } finally {
    await session.close();
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'query': {
        const rows = await runCypher((args as any).cypher, (args as any).params);
        return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
      }
      case 'list_labels': {
        const rows = await runCypher('CALL db.labels()');
        return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
      }
      case 'list_relationship_types': {
        const rows = await runCypher('CALL db.relationshipTypes()');
        return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
      }
      case 'get_schema': {
        const rows = await runCypher('CALL db.schema.visualization()');
        return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
      }
      case 'get_indexes': {
        const rows = await runCypher('SHOW INDEXES');
        return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
      }
      case 'get_constraints': {
        const rows = await runCypher('SHOW CONSTRAINTS');
        return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
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
  console.error('Neo4j MCP Server running on stdio');
}

main();
