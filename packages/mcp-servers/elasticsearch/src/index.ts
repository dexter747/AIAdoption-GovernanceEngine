#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@elastic/elasticsearch';

// Elasticsearch MCP Server
const server = new Server(
  {
    name: 'elasticsearch-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Elasticsearch client instance
let esClient: Client | null = null;

// Initialize Elasticsearch connection
async function getElasticsearchClient() {
  if (esClient) {
    return esClient;
  }

  const node = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
  const username = process.env.ELASTICSEARCH_USERNAME;
  const password = process.env.ELASTICSEARCH_PASSWORD;

  esClient = new Client({
    node,
    auth: username && password ? { username, password } : undefined,
  });

  const info = await esClient.info();
  console.error('Connected to Elasticsearch:', info.version.number);

  return esClient;
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'es_search',
        description: 'Search documents in an Elasticsearch index',
        inputSchema: {
          type: 'object',
          properties: {
            index: { type: 'string', description: 'Index name' },
            query: { type: 'object', description: 'Elasticsearch query DSL' },
            size: { type: 'number', description: 'Number of results', default: 10 },
          },
          required: ['index', 'query'],
        },
      },
      {
        name: 'es_get',
        description: 'Get a document by ID',
        inputSchema: {
          type: 'object',
          properties: {
            index: { type: 'string', description: 'Index name' },
            id: { type: 'string', description: 'Document ID' },
          },
          required: ['index', 'id'],
        },
      },
      {
        name: 'es_list_indices',
        description: 'List all indices',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'es_index_stats',
        description: 'Get statistics for an index',
        inputSchema: {
          type: 'object',
          properties: {
            index: { type: 'string', description: 'Index name' },
          },
          required: ['index'],
        },
      },
      {
        name: 'es_mapping',
        description: 'Get mapping for an index',
        inputSchema: {
          type: 'object',
          properties: {
            index: { type: 'string', description: 'Index name' },
          },
          required: ['index'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    const client = await getElasticsearchClient();

    switch (name) {
      case 'es_search': {
        const { index, query, size = 10 } = args as any;
        const result = await client.search({
          index,
          body: { query },
          size,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.hits, null, 2),
            },
          ],
        };
      }

      case 'es_get': {
        const { index, id } = args as any;
        const result = await client.get({
          index,
          id,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result._source, null, 2),
            },
          ],
        };
      }

      case 'es_list_indices': {
        const result = await client.cat.indices({ format: 'json' });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'es_index_stats': {
        const { index } = args as any;
        const result = await client.indices.stats({ index });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.indices[index], null, 2),
            },
          ],
        };
      }

      case 'es_mapping': {
        const { index } = args as any;
        const result = await client.indices.getMapping({ index });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
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
  console.error('Elasticsearch MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
