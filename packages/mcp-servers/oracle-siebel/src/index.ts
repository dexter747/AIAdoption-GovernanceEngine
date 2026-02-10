import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

const SIEBEL_URL = process.env.SIEBEL_URL || '';
const SIEBEL_USERNAME = process.env.SIEBEL_USERNAME || '';
const SIEBEL_PASSWORD = process.env.SIEBEL_PASSWORD || '';

const BASE_URL = `${SIEBEL_URL}/siebel/v1.0`;

function createClient(): AxiosInstance {
  return axios.create({
    baseURL: BASE_URL,
    auth: {
      username: SIEBEL_USERNAME,
      password: SIEBEL_PASSWORD,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
}

const server = new Server(
  {
    name: 'oracle-siebel',
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
        name: 'query_business_component',
        description:
          'Query a Siebel Business Component with optional filters. Returns matching records from the specified business object and component.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            businessObject: {
              type: 'string',
              description: 'The Siebel Business Object name (e.g., "Account", "Contact")',
            },
            businessComponent: {
              type: 'string',
              description: 'The Siebel Business Component name',
            },
            searchSpec: {
              type: 'string',
              description: 'Siebel search specification filter (e.g., "[Last Name] = \'Smith\'")',
            },
            fields: {
              type: 'string',
              description: 'Comma-separated list of fields to return',
            },
            pageSize: {
              type: 'number',
              description: 'Number of records to return (default: 20)',
            },
          },
          required: ['businessObject', 'businessComponent'],
        },
      },
      {
        name: 'get_record',
        description:
          'Get a single record by ID from a Siebel Business Component.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            businessObject: {
              type: 'string',
              description: 'The Siebel Business Object name',
            },
            businessComponent: {
              type: 'string',
              description: 'The Siebel Business Component name',
            },
            recordId: {
              type: 'string',
              description: 'The unique record ID (Row Id)',
            },
            fields: {
              type: 'string',
              description: 'Comma-separated list of fields to return',
            },
          },
          required: ['businessObject', 'businessComponent', 'recordId'],
        },
      },
      {
        name: 'create_record',
        description:
          'Create a new record in a Siebel Business Component.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            businessObject: {
              type: 'string',
              description: 'The Siebel Business Object name',
            },
            businessComponent: {
              type: 'string',
              description: 'The Siebel Business Component name',
            },
            data: {
              type: 'object',
              description: 'Field-value pairs for the new record',
              additionalProperties: true,
            },
          },
          required: ['businessObject', 'businessComponent', 'data'],
        },
      },
      {
        name: 'update_record',
        description:
          'Update an existing record in a Siebel Business Component.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            businessObject: {
              type: 'string',
              description: 'The Siebel Business Object name',
            },
            businessComponent: {
              type: 'string',
              description: 'The Siebel Business Component name',
            },
            recordId: {
              type: 'string',
              description: 'The unique record ID (Row Id) to update',
            },
            data: {
              type: 'object',
              description: 'Field-value pairs to update',
              additionalProperties: true,
            },
          },
          required: ['businessObject', 'businessComponent', 'recordId', 'data'],
        },
      },
      {
        name: 'list_business_objects',
        description:
          'List available Siebel Business Objects and their components.',
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
        name: 'search_records',
        description:
          'Search records across a Siebel Business Component using a search expression.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            businessObject: {
              type: 'string',
              description: 'The Siebel Business Object name',
            },
            businessComponent: {
              type: 'string',
              description: 'The Siebel Business Component name',
            },
            searchExpr: {
              type: 'string',
              description: 'Search expression to find matching records',
            },
            fields: {
              type: 'string',
              description: 'Comma-separated list of fields to return',
            },
            pageSize: {
              type: 'number',
              description: 'Number of records to return (default: 20)',
            },
          },
          required: ['businessObject', 'businessComponent', 'searchExpr'],
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
      case 'query_business_component': {
        const { businessObject, businessComponent, searchSpec, fields, pageSize } = args as {
          businessObject: string;
          businessComponent: string;
          searchSpec?: string;
          fields?: string;
          pageSize?: number;
        };

        const params: Record<string, string | number> = {};
        if (searchSpec) params.searchspec = searchSpec;
        if (fields) params.fields = fields;
        if (pageSize) params.PageSize = pageSize;

        const response = await client.get(
          `/data/${businessObject}/${businessComponent}`,
          { params }
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case 'get_record': {
        const { businessObject, businessComponent, recordId, fields } = args as {
          businessObject: string;
          businessComponent: string;
          recordId: string;
          fields?: string;
        };

        const params: Record<string, string> = {};
        if (fields) params.fields = fields;

        const response = await client.get(
          `/data/${businessObject}/${businessComponent}/${recordId}`,
          { params }
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case 'create_record': {
        const { businessObject, businessComponent, data } = args as {
          businessObject: string;
          businessComponent: string;
          data: Record<string, unknown>;
        };

        const response = await client.post(
          `/data/${businessObject}/${businessComponent}`,
          data
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case 'update_record': {
        const { businessObject, businessComponent, recordId, data } = args as {
          businessObject: string;
          businessComponent: string;
          recordId: string;
          data: Record<string, unknown>;
        };

        const response = await client.put(
          `/data/${businessObject}/${businessComponent}/${recordId}`,
          data
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case 'list_business_objects': {
        const { filter } = args as { filter?: string };

        const params: Record<string, string> = {};
        if (filter) params.searchspec = `[Name] LIKE '${filter}*'`;

        const response = await client.get('/data/Repository Business Object/Business Object', {
          params,
        });

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case 'search_records': {
        const { businessObject, businessComponent, searchExpr, fields, pageSize } = args as {
          businessObject: string;
          businessComponent: string;
          searchExpr: string;
          fields?: string;
          pageSize?: number;
        };

        const params: Record<string, string | number> = {
          searchspec: searchExpr,
        };
        if (fields) params.fields = fields;
        if (pageSize) params.PageSize = pageSize;

        const response = await client.get(
          `/data/${businessObject}/${businessComponent}`,
          { params }
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
  console.error('Oracle Siebel MCP server running on stdio');
}

main().catch(console.error);
