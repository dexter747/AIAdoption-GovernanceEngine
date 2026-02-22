#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from 'redis';

// Redis MCP Server - Provides tools to interact with Redis databases
const server = new Server(
  {
    name: 'redis-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Redis client instance
let redisClient: ReturnType<typeof createClient> | null = null;

// Initialize Redis connection
async function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = createClient({
    url,
    socket: {
      connectTimeout: 10000,
      reconnectStrategy: retries => Math.min(retries * 100, 3000),
    },
  });

  redisClient.on('error', err => console.error('Redis Client Error:', err));

  await redisClient.connect();
  console.error('Connected to Redis:', url);

  return redisClient;
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'redis_get',
        description: 'Get value of a key from Redis',
        inputSchema: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Key to retrieve' },
          },
          required: ['key'],
        },
      },
      {
        name: 'redis_set',
        description: 'Set a key-value pair in Redis',
        inputSchema: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Key to set' },
            value: { type: 'string', description: 'Value to store' },
            ttl: { type: 'number', description: 'Time to live in seconds (optional)' },
          },
          required: ['key', 'value'],
        },
      },
      {
        name: 'redis_del',
        description: 'Delete one or more keys',
        inputSchema: {
          type: 'object',
          properties: {
            keys: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of keys to delete',
            },
          },
          required: ['keys'],
        },
      },
      {
        name: 'redis_keys',
        description: 'Find all keys matching a pattern',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Pattern to match (e.g., user:*, *)',
              default: '*',
            },
          },
        },
      },
      {
        name: 'redis_hgetall',
        description: 'Get all fields and values in a hash',
        inputSchema: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Hash key' },
          },
          required: ['key'],
        },
      },
      {
        name: 'redis_info',
        description: 'Get Redis server information',
        inputSchema: {
          type: 'object',
          properties: {
            section: { type: 'string', description: 'Info section (server, memory, stats, etc.)' },
          },
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    const client = await getRedisClient();

    switch (name) {
      case 'redis_get': {
        const value = await client.get((args as any).key);
        return {
          content: [
            {
              type: 'text',
              text: value !== null ? value : 'Key not found',
            },
          ],
        };
      }

      case 'redis_set': {
        const { key, value, ttl } = args as any;
        if (ttl) {
          await client.setEx(key, ttl, value);
        } else {
          await client.set(key, value);
        }
        return {
          content: [
            {
              type: 'text',
              text: `Successfully set key: ${key}`,
            },
          ],
        };
      }

      case 'redis_del': {
        const count = await client.del((args as any).keys);
        return {
          content: [
            {
              type: 'text',
              text: `Deleted ${count} key(s)`,
            },
          ],
        };
      }

      case 'redis_keys': {
        const pattern = (args as any)?.pattern || '*';
        const keys = await client.keys(pattern);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(keys, null, 2),
            },
          ],
        };
      }

      case 'redis_hgetall': {
        const hash = await client.hGetAll((args as any).key);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(hash, null, 2),
            },
          ],
        };
      }

      case 'redis_info': {
        const section = (args as any)?.section;
        const info = await client.info(section);
        return {
          content: [
            {
              type: 'text',
              text: info,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Redis MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
