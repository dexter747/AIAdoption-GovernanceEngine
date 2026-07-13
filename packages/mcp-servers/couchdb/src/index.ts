#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import Nano from 'nano';

let nano: Nano.ServerScope | null = null;

const TOOLS: Tool[] = [
  {
    name: 'list_databases',
    description: 'List all databases',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_document',
    description: 'Get a document by ID',
    inputSchema: {
      type: 'object',
      properties: { database: { type: 'string' }, id: { type: 'string' } },
      required: ['database', 'id'],
    },
  },
  {
    name: 'query_view',
    description: 'Query a CouchDB view',
    inputSchema: {
      type: 'object',
      properties: {
        database: { type: 'string' },
        design: { type: 'string' },
        view: { type: 'string' },
        params: { type: 'object' },
      },
      required: ['database', 'design', 'view'],
    },
  },
  {
    name: 'find',
    description: 'Run a Mango query',
    inputSchema: {
      type: 'object',
      properties: {
        database: { type: 'string' },
        selector: { type: 'object' },
        fields: { type: 'array', items: { type: 'string' } },
        limit: { type: 'number' },
      },
      required: ['database', 'selector'],
    },
  },
  {
    name: 'create_document',
    description: 'Create a document',
    inputSchema: {
      type: 'object',
      properties: { database: { type: 'string' }, document: { type: 'object' } },
      required: ['database', 'document'],
    },
  },
  {
    name: 'db_info',
    description: 'Get database info',
    inputSchema: {
      type: 'object',
      properties: { database: { type: 'string' } },
      required: ['database'],
    },
  },
];

const server = new Server(
  { name: 'couchdb-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

async function initConnection() {
  const url = process.env.COUCHDB_URL || 'http://localhost:5984';
  nano = Nano(url);
  const info = await nano.db.list();
  console.error(`Connected to CouchDB, ${info.length} databases found`);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;
  if (!nano) throw new Error('Not connected');
  try {
    switch (name) {
      case 'list_databases': {
        const dbs = await nano.db.list();
        return { content: [{ type: 'text' as const, text: JSON.stringify(dbs, null, 2) }] };
      }
      case 'get_document': {
        const db = nano.db.use((args as any).database);
        const doc = await db.get((args as any).id);
        return { content: [{ type: 'text' as const, text: JSON.stringify(doc, null, 2) }] };
      }
      case 'query_view': {
        const db = nano.db.use((args as any).database);
        const result = await db.view(
          (args as any).design,
          (args as any).view,
          (args as any).params || {}
        );
        return { content: [{ type: 'text' as const, text: JSON.stringify(result.rows, null, 2) }] };
      }
      case 'find': {
        const db = nano.db.use((args as any).database);
        const result = await db.find({
          selector: (args as any).selector,
          fields: (args as any).fields,
          limit: (args as any).limit || 25,
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result.docs, null, 2) }] };
      }
      case 'create_document': {
        const db = nano.db.use((args as any).database);
        const result = await db.insert((args as any).document);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
      case 'db_info': {
        const info = await nano.db.get((args as any).database);
        return { content: [{ type: 'text' as const, text: JSON.stringify(info, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('CouchDB MCP Server running on stdio');
}

main();
