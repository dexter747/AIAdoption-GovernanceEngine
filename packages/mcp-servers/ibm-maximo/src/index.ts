import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

// Environment variables
const MAXIMO_URL = process.env.MAXIMO_URL || '';
const MAXIMO_API_KEY = process.env.MAXIMO_API_KEY || '';
const MAXIMO_USERNAME = process.env.MAXIMO_USERNAME || '';
const MAXIMO_PASSWORD = process.env.MAXIMO_PASSWORD || '';

let api: AxiosInstance | null = null;

function initConnection(): void {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (MAXIMO_API_KEY) {
    headers['apikey'] = MAXIMO_API_KEY;
  }

  const authConfig =
    MAXIMO_USERNAME && MAXIMO_PASSWORD && !MAXIMO_API_KEY
      ? { username: MAXIMO_USERNAME, password: MAXIMO_PASSWORD }
      : undefined;

  api = axios.create({
    baseURL: `${MAXIMO_URL}/maximo/oslc/os`,
    headers,
    auth: authConfig,
  });
}

const tools: Tool[] = [
  {
    name: 'get_assets',
    description: 'List assets from IBM Maximo',
    inputSchema: {
      type: 'object',
      properties: {
        select: { type: 'string', description: 'Comma-separated fields to return' },
        where: { type: 'string', description: 'Maximo where clause filter' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'get_asset',
    description: 'Get a single asset by ID from IBM Maximo',
    inputSchema: {
      type: 'object',
      properties: {
        assetId: { type: 'string', description: 'The asset ID' },
      },
      required: ['assetId'],
    },
  },
  {
    name: 'get_work_orders',
    description: 'List work orders from IBM Maximo',
    inputSchema: {
      type: 'object',
      properties: {
        select: { type: 'string', description: 'Comma-separated fields to return' },
        where: { type: 'string', description: 'Maximo where clause filter' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'get_work_order',
    description: 'Get a single work order by ID from IBM Maximo',
    inputSchema: {
      type: 'object',
      properties: {
        workOrderId: { type: 'string', description: 'The work order ID' },
      },
      required: ['workOrderId'],
    },
  },
  {
    name: 'get_service_requests',
    description: 'List service requests from IBM Maximo',
    inputSchema: {
      type: 'object',
      properties: {
        select: { type: 'string', description: 'Comma-separated fields to return' },
        where: { type: 'string', description: 'Maximo where clause filter' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'search_assets',
    description: 'Search assets in IBM Maximo by keyword',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keyword' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_locations',
    description: 'List locations from IBM Maximo',
    inputSchema: {
      type: 'object',
      properties: {
        select: { type: 'string', description: 'Comma-separated fields to return' },
        where: { type: 'string', description: 'Maximo where clause filter' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to IBM Maximo',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          description: 'HTTP method',
        },
        path: { type: 'string', description: 'API path (relative to base URL)' },
        data: { type: 'object', description: 'Request body for POST/PUT/PATCH' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'ibm-maximo-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  if (!api) {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: Maximo connection not initialized. Check MAXIMO_URL and credentials.',
        },
      ],
    };
  }

  try {
    switch (name) {
      case 'get_assets': {
        const params: Record<string, string | number> = {};
        if (args?.select) params['oslc.select'] = args.select as string;
        if (args?.where) params['oslc.where'] = args.where as string;
        if (args?.pageSize) params['oslc.pageSize'] = args.pageSize as number;
        const response = await api.get('/mxasset', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_asset': {
        const response = await api.get(`/mxasset/${args?.assetId}`);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_work_orders': {
        const params: Record<string, string | number> = {};
        if (args?.select) params['oslc.select'] = args.select as string;
        if (args?.where) params['oslc.where'] = args.where as string;
        if (args?.pageSize) params['oslc.pageSize'] = args.pageSize as number;
        const response = await api.get('/mxwo', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_work_order': {
        const response = await api.get(`/mxwo/${args?.workOrderId}`);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_service_requests': {
        const params: Record<string, string | number> = {};
        if (args?.select) params['oslc.select'] = args.select as string;
        if (args?.where) params['oslc.where'] = args.where as string;
        if (args?.pageSize) params['oslc.pageSize'] = args.pageSize as number;
        const response = await api.get('/mxsr', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'search_assets': {
        const params: Record<string, string | number> = {
          'oslc.searchTerms': args?.query as string,
        };
        if (args?.pageSize) params['oslc.pageSize'] = args.pageSize as number;
        const response = await api.get('/mxasset', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_locations': {
        const params: Record<string, string | number> = {};
        if (args?.select) params['oslc.select'] = args.select as string;
        if (args?.where) params['oslc.where'] = args.where as string;
        if (args?.pageSize) params['oslc.pageSize'] = args.pageSize as number;
        const response = await api.get('/mxlocation', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'api_call': {
        const response = await api.request({
          method: args?.method as string,
          url: args?.path as string,
          data: args?.data,
          params: args?.params,
        });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
    }
  } catch (error: any) {
    const message = error.response?.data
      ? JSON.stringify(error.response.data, null, 2)
      : error.message;
    return { content: [{ type: 'text', text: `Error: ${message}` }] };
  }
});

async function main(): Promise<void> {
  initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('IBM Maximo MCP Server running on stdio');
}

main().catch(console.error);
