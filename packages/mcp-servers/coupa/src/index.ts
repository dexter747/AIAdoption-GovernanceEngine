import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

// Environment variables
const COUPA_URL = process.env.COUPA_URL || '';
const COUPA_API_KEY = process.env.COUPA_API_KEY || '';
const COUPA_CLIENT_ID = process.env.COUPA_CLIENT_ID || '';
const COUPA_CLIENT_SECRET = process.env.COUPA_CLIENT_SECRET || '';

let api: AxiosInstance | null = null;

async function initConnection(): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (COUPA_API_KEY) {
    headers['X-COUPA-API-KEY'] = COUPA_API_KEY;
  } else if (COUPA_CLIENT_ID && COUPA_CLIENT_SECRET) {
    // OAuth2 client credentials flow
    const tokenResponse = await axios.post(`${COUPA_URL}/oauth2/token`, {
      grant_type: 'client_credentials',
      client_id: COUPA_CLIENT_ID,
      client_secret: COUPA_CLIENT_SECRET,
      scope: 'core.common.read',
    });
    headers['Authorization'] = `Bearer ${tokenResponse.data.access_token}`;
  }

  api = axios.create({
    baseURL: `${COUPA_URL}/api`,
    headers,
  });
}

const tools: Tool[] = [
  {
    name: 'get_purchase_orders',
    description: 'List purchase orders from Coupa',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by PO status' },
        createdAfter: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        createdBefore: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        limit: { type: 'number', description: 'Number of results to return', default: 50 },
        offset: { type: 'number', description: 'Offset for pagination', default: 0 },
      },
    },
  },
  {
    name: 'get_invoices',
    description: 'List invoices from Coupa',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by invoice status' },
        createdAfter: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        createdBefore: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        limit: { type: 'number', description: 'Number of results to return', default: 50 },
        offset: { type: 'number', description: 'Offset for pagination', default: 0 },
      },
    },
  },
  {
    name: 'get_suppliers',
    description: 'List suppliers from Coupa',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Filter by supplier name' },
        status: { type: 'string', description: 'Filter by supplier status' },
        limit: { type: 'number', description: 'Number of results to return', default: 50 },
        offset: { type: 'number', description: 'Offset for pagination', default: 0 },
      },
    },
  },
  {
    name: 'get_contracts',
    description: 'List contracts from Coupa',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by contract status' },
        createdAfter: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        createdBefore: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        limit: { type: 'number', description: 'Number of results to return', default: 50 },
        offset: { type: 'number', description: 'Offset for pagination', default: 0 },
      },
    },
  },
  {
    name: 'get_requisitions',
    description: 'List requisitions from Coupa',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by requisition status' },
        createdAfter: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        createdBefore: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        limit: { type: 'number', description: 'Number of results to return', default: 50 },
        offset: { type: 'number', description: 'Offset for pagination', default: 0 },
      },
    },
  },
  {
    name: 'get_expenses',
    description: 'List expense reports from Coupa',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by expense status' },
        createdAfter: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        createdBefore: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        limit: { type: 'number', description: 'Number of results to return', default: 50 },
        offset: { type: 'number', description: 'Offset for pagination', default: 0 },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to Coupa',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], description: 'HTTP method' },
        path: { type: 'string', description: 'API path (relative to /api)' },
        data: { type: 'object', description: 'Request body for POST/PUT/PATCH' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'coupa-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!api) {
    return { content: [{ type: 'text', text: 'Error: Coupa connection not initialized. Check COUPA_URL and API key or OAuth credentials.' }] };
  }

  try {
    switch (name) {
      case 'get_purchase_orders': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['status'] = args.status as string;
        if (args?.createdAfter) params['created-at[gt_or_eq]'] = args.createdAfter as string;
        if (args?.createdBefore) params['created-at[lt_or_eq]'] = args.createdBefore as string;
        if (args?.limit) params['limit'] = args.limit as number;
        if (args?.offset) params['offset'] = args.offset as number;
        const response = await api.get('/purchase_orders', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_invoices': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['status'] = args.status as string;
        if (args?.createdAfter) params['created-at[gt_or_eq]'] = args.createdAfter as string;
        if (args?.createdBefore) params['created-at[lt_or_eq]'] = args.createdBefore as string;
        if (args?.limit) params['limit'] = args.limit as number;
        if (args?.offset) params['offset'] = args.offset as number;
        const response = await api.get('/invoices', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_suppliers': {
        const params: Record<string, string | number> = {};
        if (args?.name) params['name'] = args.name as string;
        if (args?.status) params['status'] = args.status as string;
        if (args?.limit) params['limit'] = args.limit as number;
        if (args?.offset) params['offset'] = args.offset as number;
        const response = await api.get('/suppliers', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_contracts': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['status'] = args.status as string;
        if (args?.createdAfter) params['created-at[gt_or_eq]'] = args.createdAfter as string;
        if (args?.createdBefore) params['created-at[lt_or_eq]'] = args.createdBefore as string;
        if (args?.limit) params['limit'] = args.limit as number;
        if (args?.offset) params['offset'] = args.offset as number;
        const response = await api.get('/contracts', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_requisitions': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['status'] = args.status as string;
        if (args?.createdAfter) params['created-at[gt_or_eq]'] = args.createdAfter as string;
        if (args?.createdBefore) params['created-at[lt_or_eq]'] = args.createdBefore as string;
        if (args?.limit) params['limit'] = args.limit as number;
        if (args?.offset) params['offset'] = args.offset as number;
        const response = await api.get('/requisitions', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_expenses': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['status'] = args.status as string;
        if (args?.createdAfter) params['created-at[gt_or_eq]'] = args.createdAfter as string;
        if (args?.createdBefore) params['created-at[lt_or_eq]'] = args.createdBefore as string;
        if (args?.limit) params['limit'] = args.limit as number;
        if (args?.offset) params['offset'] = args.offset as number;
        const response = await api.get('/expense_reports', { params });
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
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Coupa MCP Server running on stdio');
}

main().catch(console.error);
