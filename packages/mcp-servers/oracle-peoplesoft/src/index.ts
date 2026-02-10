import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

const PEOPLESOFT_URL = process.env.PEOPLESOFT_URL || '';
const PEOPLESOFT_USERNAME = process.env.PEOPLESOFT_USERNAME || '';
const PEOPLESOFT_PASSWORD = process.env.PEOPLESOFT_PASSWORD || '';

function createClient(): AxiosInstance {
  return axios.create({
    baseURL: PEOPLESOFT_URL,
    auth: {
      username: PEOPLESOFT_USERNAME,
      password: PEOPLESOFT_PASSWORD,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
}

const server = new Server(
  {
    name: 'oracle-peoplesoft',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query_component',
        description:
          'Query a PeopleSoft Component Interface with optional parameters. Returns matching records.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            componentName: {
              type: 'string',
              description: 'The Component Interface name (e.g., "CI_PERSONAL_DATA")',
            },
            queryParams: {
              type: 'object',
              description: 'Key-value pairs for query parameters / filters',
              additionalProperties: true,
            },
            fields: {
              type: 'string',
              description: 'Comma-separated list of fields to return',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of records to return (default: 20)',
            },
          },
          required: ['componentName'],
        },
      },
      {
        name: 'get_record',
        description:
          'Get a single record by key from a PeopleSoft Component Interface.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            componentName: {
              type: 'string',
              description: 'The Component Interface name',
            },
            keys: {
              type: 'object',
              description: 'Key field-value pairs to identify the record',
              additionalProperties: true,
            },
            fields: {
              type: 'string',
              description: 'Comma-separated list of fields to return',
            },
          },
          required: ['componentName', 'keys'],
        },
      },
      {
        name: 'create_record',
        description:
          'Create a new record via a PeopleSoft Component Interface.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            componentName: {
              type: 'string',
              description: 'The Component Interface name',
            },
            data: {
              type: 'object',
              description: 'Field-value pairs for the new record',
              additionalProperties: true,
            },
          },
          required: ['componentName', 'data'],
        },
      },
      {
        name: 'update_record',
        description:
          'Update an existing record via a PeopleSoft Component Interface.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            componentName: {
              type: 'string',
              description: 'The Component Interface name',
            },
            keys: {
              type: 'object',
              description: 'Key field-value pairs to identify the record to update',
              additionalProperties: true,
            },
            data: {
              type: 'object',
              description: 'Field-value pairs to update',
              additionalProperties: true,
            },
          },
          required: ['componentName', 'keys', 'data'],
        },
      },
      {
        name: 'list_components',
        description:
          'List available PeopleSoft Component Interfaces.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            filter: {
              type: 'string',
              description: 'Optional filter to narrow down results by name',
            },
          },
          required: [],
        },
      },
      {
        name: 'run_query',
        description:
          'Run a PeopleSoft Query by name with optional parameters.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            queryName: {
              type: 'string',
              description: 'The PeopleSoft Query name to execute',
            },
            isPublic: {
              type: 'boolean',
              description: 'Whether this is a public query (true) or private query (false). Default: true',
            },
            params: {
              type: 'object',
              description: 'Query bind parameters as key-value pairs',
              additionalProperties: true,
            },
            limit: {
              type: 'number',
              description: 'Maximum number of rows to return (default: 100)',
            },
          },
          required: ['queryName'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const client = createClient();

  try {
    switch (name) {
      case 'query_component': {
        const { componentName, queryParams, fields, limit } = args as {
          componentName: string;
          queryParams?: Record<string, unknown>;
          fields?: string;
          limit?: number;
        };

        const params: Record<string, unknown> = { ...queryParams };
        if (fields) params.fields = fields;
        if (limit) params.limit = limit;

        const response = await client.get(
          `/PSIGW/RESTListeningConnector/PSFT_CS/${componentName}`,
          { params }
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case 'get_record': {
        const { componentName, keys, fields } = args as {
          componentName: string;
          keys: Record<string, unknown>;
          fields?: string;
        };

        const keyPath = Object.values(keys).join('/');
        const params: Record<string, string> = {};
        if (fields) params.fields = fields;

        const response = await client.get(
          `/PSIGW/RESTListeningConnector/PSFT_CS/${componentName}/${keyPath}`,
          { params }
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case 'create_record': {
        const { componentName, data } = args as {
          componentName: string;
          data: Record<string, unknown>;
        };

        const response = await client.post(
          `/PSIGW/RESTListeningConnector/PSFT_CS/${componentName}`,
          data
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case 'update_record': {
        const { componentName, keys, data } = args as {
          componentName: string;
          keys: Record<string, unknown>;
          data: Record<string, unknown>;
        };

        const keyPath = Object.values(keys).join('/');

        const response = await client.put(
          `/PSIGW/RESTListeningConnector/PSFT_CS/${componentName}/${keyPath}`,
          data
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case 'list_components': {
        const { filter } = args as { filter?: string };

        const response = await client.get(
          '/PSIGW/RESTListeningConnector/PSFT_CS',
          { params: filter ? { filter } : {} }
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case 'run_query': {
        const { queryName, isPublic, params, limit } = args as {
          queryName: string;
          isPublic?: boolean;
          params?: Record<string, unknown>;
          limit?: number;
        };

        const queryType = isPublic !== false ? 'public' : 'private';
        const queryParams: Record<string, unknown> = { ...params };
        if (limit) queryParams.limit = limit;

        const response = await client.get(
          `/PSIGW/RESTListeningConnector/PSFT_CS/query/${queryType}/${queryName}`,
          { params: queryParams }
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
        };
      }

      default:
        return {
          content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const axiosErr = error as { response?: { status?: number; data?: unknown } };
    const detail = axiosErr.response
      ? `HTTP ${axiosErr.response.status}: ${JSON.stringify(axiosErr.response.data)}`
      : errMsg;

    return {
      content: [{ type: 'text' as const, text: `Error: ${detail}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Oracle PeopleSoft MCP server running on stdio');
}

main().catch(console.error);
