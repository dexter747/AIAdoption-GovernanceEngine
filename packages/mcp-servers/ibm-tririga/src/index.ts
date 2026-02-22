import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

// Environment variables
const TRIRIGA_URL = process.env.TRIRIGA_URL || '';
const TRIRIGA_USERNAME = process.env.TRIRIGA_USERNAME || '';
const TRIRIGA_PASSWORD = process.env.TRIRIGA_PASSWORD || '';

let api: AxiosInstance | null = null;

function initConnection(): void {
  api = axios.create({
    baseURL: `${TRIRIGA_URL}/oslc`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    auth: {
      username: TRIRIGA_USERNAME,
      password: TRIRIGA_PASSWORD,
    },
  });
}

const tools: Tool[] = [
  {
    name: 'get_buildings',
    description: 'List buildings from IBM TRIRIGA',
    inputSchema: {
      type: 'object',
      properties: {
        select: { type: 'string', description: 'Comma-separated fields to return' },
        where: { type: 'string', description: 'OSLC where clause filter' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'get_spaces',
    description: 'List spaces from IBM TRIRIGA',
    inputSchema: {
      type: 'object',
      properties: {
        buildingId: { type: 'string', description: 'Filter by building ID' },
        select: { type: 'string', description: 'Comma-separated fields to return' },
        where: { type: 'string', description: 'OSLC where clause filter' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'get_work_tasks',
    description: 'List work tasks from IBM TRIRIGA',
    inputSchema: {
      type: 'object',
      properties: {
        select: { type: 'string', description: 'Comma-separated fields to return' },
        where: { type: 'string', description: 'OSLC where clause filter' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'get_leases',
    description: 'List leases from IBM TRIRIGA',
    inputSchema: {
      type: 'object',
      properties: {
        select: { type: 'string', description: 'Comma-separated fields to return' },
        where: { type: 'string', description: 'OSLC where clause filter' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'get_reservations',
    description: 'List reservations from IBM TRIRIGA',
    inputSchema: {
      type: 'object',
      properties: {
        select: { type: 'string', description: 'Comma-separated fields to return' },
        where: { type: 'string', description: 'OSLC where clause filter' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'get_projects',
    description: 'List projects from IBM TRIRIGA',
    inputSchema: {
      type: 'object',
      properties: {
        select: { type: 'string', description: 'Comma-separated fields to return' },
        where: { type: 'string', description: 'OSLC where clause filter' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to IBM TRIRIGA',
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
  { name: 'ibm-tririga-mcp-server', version: '1.0.0' },
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
          text: 'Error: TRIRIGA connection not initialized. Check TRIRIGA_URL and credentials.',
        },
      ],
    };
  }

  try {
    switch (name) {
      case 'get_buildings': {
        const params: Record<string, string | number> = {};
        if (args?.select) params['oslc.select'] = args.select as string;
        if (args?.where) params['oslc.where'] = args.where as string;
        if (args?.pageSize) params['oslc.pageSize'] = args.pageSize as number;
        const response = await api.get('/so/triBuilding', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_spaces': {
        const params: Record<string, string | number> = {};
        if (args?.select) params['oslc.select'] = args.select as string;
        if (args?.where) params['oslc.where'] = args.where as string;
        if (args?.buildingId) params['oslc.where'] = `triBuilding=${args.buildingId}`;
        if (args?.pageSize) params['oslc.pageSize'] = args.pageSize as number;
        const response = await api.get('/so/triSpace', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_work_tasks': {
        const params: Record<string, string | number> = {};
        if (args?.select) params['oslc.select'] = args.select as string;
        if (args?.where) params['oslc.where'] = args.where as string;
        if (args?.pageSize) params['oslc.pageSize'] = args.pageSize as number;
        const response = await api.get('/so/triWorkTask', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_leases': {
        const params: Record<string, string | number> = {};
        if (args?.select) params['oslc.select'] = args.select as string;
        if (args?.where) params['oslc.where'] = args.where as string;
        if (args?.pageSize) params['oslc.pageSize'] = args.pageSize as number;
        const response = await api.get('/so/triLease', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_reservations': {
        const params: Record<string, string | number> = {};
        if (args?.select) params['oslc.select'] = args.select as string;
        if (args?.where) params['oslc.where'] = args.where as string;
        if (args?.pageSize) params['oslc.pageSize'] = args.pageSize as number;
        const response = await api.get('/so/triReservation', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_projects': {
        const params: Record<string, string | number> = {};
        if (args?.select) params['oslc.select'] = args.select as string;
        if (args?.where) params['oslc.where'] = args.where as string;
        if (args?.pageSize) params['oslc.pageSize'] = args.pageSize as number;
        const response = await api.get('/so/triProject', { params });
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
  console.error('IBM TRIRIGA MCP Server running on stdio');
}

main().catch(console.error);
