#!/usr/bin/env node

/**
 * MongoDB MCP Server
 * Provides Model Context Protocol interface for MongoDB databases
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { MongoClient, Db } from 'mongodb';

// MongoDB connection
let client: MongoClient | null = null;
let db: Db | null = null;

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'find',
    description: 'Find documents in a MongoDB collection',
    inputSchema: {
      type: 'object',
      properties: {
        collection: {
          type: 'string',
          description: 'Name of the collection',
        },
        query: {
          type: 'object',
          description: 'MongoDB query filter (JSON)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of documents to return',
          default: 10,
        },
      },
      required: ['collection', 'query'],
    },
  },
  {
    name: 'aggregate',
    description: 'Execute an aggregation pipeline',
    inputSchema: {
      type: 'object',
      properties: {
        collection: {
          type: 'string',
          description: 'Name of the collection',
        },
        pipeline: {
          type: 'array',
          description: 'Aggregation pipeline stages',
        },
      },
      required: ['collection', 'pipeline'],
    },
  },
  {
    name: 'list_collections',
    description: 'List all collections in the current database',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'count_documents',
    description: 'Count documents matching a query',
    inputSchema: {
      type: 'object',
      properties: {
        collection: {
          type: 'string',
          description: 'Name of the collection',
        },
        query: {
          type: 'object',
          description: 'MongoDB query filter (JSON)',
        },
      },
      required: ['collection', 'query'],
    },
  },
  {
    name: 'get_indexes',
    description: 'Get indexes for a collection',
    inputSchema: {
      type: 'object',
      properties: {
        collection: {
          type: 'string',
          description: 'Name of the collection',
        },
      },
      required: ['collection'],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: 'mongodb-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize MongoDB connection
async function initConnection() {
  const connectionString = process.env.MONGODB_URI || process.env.MONGODB_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error('MONGODB_URI or MONGODB_CONNECTION_STRING environment variable required');
  }

  client = new MongoClient(connectionString);
  await client.connect();

  // Extract database name from connection string or use env var
  const dbName = process.env.MONGODB_DATABASE || new URL(connectionString).pathname.slice(1);
  db = client.db(dbName);

  console.error('Connected to MongoDB');
}

// Tool handlers
async function handleFind(collection: string, query: any, limit: number = 10) {
  if (!db) throw new Error('Not connected to MongoDB');

  try {
    const results = await db.collection(collection).find(query).limit(limit).toArray();
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleAggregate(collection: string, pipeline: any[]) {
  if (!db) throw new Error('Not connected to MongoDB');

  try {
    const results = await db.collection(collection).aggregate(pipeline).toArray();
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleListCollections() {
  if (!db) throw new Error('Not connected to MongoDB');

  const collections = await db.listCollections().toArray();
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          collections.map(c => c.name),
          null,
          2
        ),
      },
    ],
  };
}

async function handleCountDocuments(collection: string, query: any) {
  if (!db) throw new Error('Not connected to MongoDB');

  const count = await db.collection(collection).countDocuments(query);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ count }, null, 2),
      },
    ],
  };
}

async function handleGetIndexes(collection: string) {
  if (!db) throw new Error('Not connected to MongoDB');

  const indexes = await db.collection(collection).indexes();
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(indexes, null, 2),
      },
    ],
  };
}

// Register request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'find':
      return handleFind((args as any).collection, (args as any).query, (args as any).limit);
    case 'aggregate':
      return handleAggregate((args as any).collection, (args as any).pipeline);
    case 'list_collections':
      return handleListCollections();
    case 'count_documents':
      return handleCountDocuments((args as any).collection, (args as any).query);
    case 'get_indexes':
      return handleGetIndexes((args as any).collection);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  try {
    await initConnection();

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('MongoDB MCP Server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Cleanup on exit
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
  }
  process.exit(0);
});

main();
