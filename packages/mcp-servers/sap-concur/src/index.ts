import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

// Environment variables
const CONCUR_BASE_URL = process.env.CONCUR_BASE_URL || '';
const CONCUR_ACCESS_TOKEN = process.env.CONCUR_ACCESS_TOKEN || '';

let api: AxiosInstance | null = null;

async function initConnection(): Promise<AxiosInstance> {
  if (api) return api;

  api = axios.create({
    baseURL: `${CONCUR_BASE_URL}/api/v3.0`,
    headers: {
      Authorization: `Bearer ${CONCUR_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  return api;
}

const tools: Tool[] = [
  {
    name: 'get_reports',
    description: 'List expense reports. Optionally filter by status, date range, or user.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by report status (e.g., SUBMITTED, APPROVED, PAID)',
        },
        modified_after: {
          type: 'string',
          description: 'Filter reports modified after this date (YYYY-MM-DD)',
        },
        user: { type: 'string', description: 'Filter by user login ID or email' },
        limit: { type: 'number', description: 'Number of results to return (default 25)' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
    },
  },
  {
    name: 'get_report',
    description: 'Get a single expense report by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        report_id: { type: 'string', description: 'The expense report ID' },
      },
      required: ['report_id'],
    },
  },
  {
    name: 'get_expenses',
    description: 'Get expense line items. Optionally filter by report ID or date range.',
    inputSchema: {
      type: 'object',
      properties: {
        report_id: { type: 'string', description: 'Filter expenses by report ID' },
        modified_after: {
          type: 'string',
          description: 'Filter expenses modified after this date (YYYY-MM-DD)',
        },
        limit: { type: 'number', description: 'Number of results to return (default 25)' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
    },
  },
  {
    name: 'get_trips',
    description: 'Get travel bookings/trips. Optionally filter by date range or status.',
    inputSchema: {
      type: 'object',
      properties: {
        start_date: {
          type: 'string',
          description: 'Filter trips starting after this date (YYYY-MM-DD)',
        },
        end_date: {
          type: 'string',
          description: 'Filter trips ending before this date (YYYY-MM-DD)',
        },
        status: { type: 'string', description: 'Filter by trip status' },
        limit: { type: 'number', description: 'Number of results to return (default 25)' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
    },
  },
  {
    name: 'get_requests',
    description: 'Get travel requests. Optionally filter by status or user.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by request status (e.g., SUBMITTED, APPROVED)',
        },
        user: { type: 'string', description: 'Filter by user login ID or email' },
        modified_after: {
          type: 'string',
          description: 'Filter requests modified after this date (YYYY-MM-DD)',
        },
        limit: { type: 'number', description: 'Number of results to return (default 25)' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
    },
  },
  {
    name: 'api_call',
    description:
      'Make a generic API call to SAP Concur. Use for endpoints not covered by other tools.',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, PUT, DELETE)',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
        },
        path: { type: 'string', description: 'API path (e.g., /expense/v4/reports)' },
        body: { type: 'object', description: 'Request body for POST/PUT requests' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'sap-concur-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;
  const client = await initConnection();

  try {
    let result: unknown;

    switch (name) {
      case 'get_reports': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['approvalStatusCode'] = args.status as string;
        if (args?.modified_after) params['modifiedDateAfter'] = args.modified_after as string;
        if (args?.user) params['userDefinedDate'] = args.user as string;
        if (args?.limit) params['limit'] = args.limit as number;
        if (args?.offset) params['offset'] = args.offset as number;
        const response = await client.get('/expense/reports', { params });
        result = response.data;
        break;
      }

      case 'get_report': {
        const response = await client.get(`/expense/reports/${args!.report_id}`);
        result = response.data;
        break;
      }

      case 'get_expenses': {
        const params: Record<string, string | number> = {};
        if (args?.report_id) params['reportID'] = args.report_id as string;
        if (args?.modified_after) params['modifiedDateAfter'] = args.modified_after as string;
        if (args?.limit) params['limit'] = args.limit as number;
        if (args?.offset) params['offset'] = args.offset as number;
        const response = await client.get('/expense/entries', { params });
        result = response.data;
        break;
      }

      case 'get_trips': {
        const params: Record<string, string | number> = {};
        if (args?.start_date) params['startDateAfter'] = args.start_date as string;
        if (args?.end_date) params['endDateBefore'] = args.end_date as string;
        if (args?.status) params['status'] = args.status as string;
        if (args?.limit) params['limit'] = args.limit as number;
        if (args?.offset) params['offset'] = args.offset as number;
        const response = await client.get('/insights/trips', { params });
        result = response.data;
        break;
      }

      case 'get_requests': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['approvalStatusCode'] = args.status as string;
        if (args?.user) params['userLoginID'] = args.user as string;
        if (args?.modified_after) params['modifiedAfter'] = args.modified_after as string;
        if (args?.limit) params['limit'] = args.limit as number;
        if (args?.offset) params['offset'] = args.offset as number;
        const response = await client.get('/travelrequest/requests', { params });
        result = response.data;
        break;
      }

      case 'api_call': {
        const response = await client.request({
          method: args!.method as string,
          url: args!.path as string,
          data: args?.body,
          params: args?.params,
        });
        result = response.data;
        break;
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SAP Concur MCP server running on stdio');
}

main().catch(console.error);
