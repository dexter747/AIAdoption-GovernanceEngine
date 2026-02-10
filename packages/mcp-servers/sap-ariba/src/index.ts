import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

// Environment variables
const ARIBA_API_URL = process.env.ARIBA_API_URL || '';
const ARIBA_API_KEY = process.env.ARIBA_API_KEY || '';
const ARIBA_REALM = process.env.ARIBA_REALM || '';

let api: AxiosInstance | null = null;

function initConnection(): void {
  api = axios.create({
    baseURL: ARIBA_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'APIKey': ARIBA_API_KEY,
    },
    params: {
      realm: ARIBA_REALM,
    },
  });
}

const tools: Tool[] = [
  {
    name: 'get_purchase_orders',
    description: 'List purchase orders from SAP Ariba',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by PO status' },
        createdAfter: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        createdBefore: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
        pageToken: { type: 'string', description: 'Pagination token for next page' },
      },
    },
  },
  {
    name: 'get_purchase_requisitions',
    description: 'List purchase requisitions from SAP Ariba',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by requisition status' },
        createdAfter: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        createdBefore: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
        pageToken: { type: 'string', description: 'Pagination token for next page' },
      },
    },
  },
  {
    name: 'get_invoices',
    description: 'List invoices from SAP Ariba',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by invoice status' },
        createdAfter: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        createdBefore: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
        pageToken: { type: 'string', description: 'Pagination token for next page' },
      },
    },
  },
  {
    name: 'get_contracts',
    description: 'List contracts from SAP Ariba',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by contract status' },
        createdAfter: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        createdBefore: { type: 'string', description: 'Filter by creation date (ISO 8601)' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
        pageToken: { type: 'string', description: 'Pagination token for next page' },
      },
    },
  },
  {
    name: 'get_suppliers',
    description: 'List suppliers from SAP Ariba',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by supplier status' },
        searchQuery: { type: 'string', description: 'Search suppliers by name' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
        pageToken: { type: 'string', description: 'Pagination token for next page' },
      },
    },
  },
  {
    name: 'search_catalog',
    description: 'Search the SAP Ariba procurement catalog',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keyword' },
        category: { type: 'string', description: 'Filter by category' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
      required: ['query'],
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to SAP Ariba',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], description: 'HTTP method' },
        path: { type: 'string', description: 'API path (relative to base URL)' },
        data: { type: 'object', description: 'Request body for POST/PUT/PATCH' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'sap-ariba-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!api) {
    return { content: [{ type: 'text', text: 'Error: SAP Ariba connection not initialized. Check ARIBA_API_URL, ARIBA_API_KEY, and ARIBA_REALM.' }] };
  }

  try {
    switch (name) {
      case 'get_purchase_orders': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['status'] = args.status as string;
        if (args?.createdAfter) params['createdDateFrom'] = args.createdAfter as string;
        if (args?.createdBefore) params['createdDateTo'] = args.createdBefore as string;
        if (args?.pageSize) params['$top'] = args.pageSize as number;
        if (args?.pageToken) params['$skiptoken'] = args.pageToken as string;
        const response = await api.get('/procurement/v2/purchaseOrders', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_purchase_requisitions': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['status'] = args.status as string;
        if (args?.createdAfter) params['createdDateFrom'] = args.createdAfter as string;
        if (args?.createdBefore) params['createdDateTo'] = args.createdBefore as string;
        if (args?.pageSize) params['$top'] = args.pageSize as number;
        if (args?.pageToken) params['$skiptoken'] = args.pageToken as string;
        const response = await api.get('/procurement/v2/purchaseRequisitions', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_invoices': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['status'] = args.status as string;
        if (args?.createdAfter) params['createdDateFrom'] = args.createdAfter as string;
        if (args?.createdBefore) params['createdDateTo'] = args.createdBefore as string;
        if (args?.pageSize) params['$top'] = args.pageSize as number;
        if (args?.pageToken) params['$skiptoken'] = args.pageToken as string;
        const response = await api.get('/invoice/v2/invoices', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_contracts': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['status'] = args.status as string;
        if (args?.createdAfter) params['createdDateFrom'] = args.createdAfter as string;
        if (args?.createdBefore) params['createdDateTo'] = args.createdBefore as string;
        if (args?.pageSize) params['$top'] = args.pageSize as number;
        if (args?.pageToken) params['$skiptoken'] = args.pageToken as string;
        const response = await api.get('/contract/v2/contracts', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_suppliers': {
        const params: Record<string, string | number> = {};
        if (args?.status) params['status'] = args.status as string;
        if (args?.searchQuery) params['$search'] = args.searchQuery as string;
        if (args?.pageSize) params['$top'] = args.pageSize as number;
        if (args?.pageToken) params['$skiptoken'] = args.pageToken as string;
        const response = await api.get('/supplier/v2/suppliers', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'search_catalog': {
        const params: Record<string, string | number> = {
          '$search': args?.query as string,
        };
        if (args?.category) params['category'] = args.category as string;
        if (args?.pageSize) params['$top'] = args.pageSize as number;
        const response = await api.get('/catalog/v2/items', { params });
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
  console.error('SAP Ariba MCP Server running on stdio');
}

main().catch(console.error);
