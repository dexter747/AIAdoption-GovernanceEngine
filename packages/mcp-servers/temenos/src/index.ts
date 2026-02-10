import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.TEMENOS_API_URL || '';
const USERNAME = process.env.TEMENOS_USERNAME || '';
const PASSWORD = process.env.TEMENOS_PASSWORD || '';

let api: AxiosInstance | null = null;

async function initConnection(): Promise<void> {
  if (api) return;
  const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
  api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
    },
  });
}

const tools: Tool[] = [
  {
    name: 'get_customers',
    description: 'Retrieve a list of customers from Temenos T24',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number' },
        size: { type: 'number', description: 'Page size' },
        sector: { type: 'string', description: 'Customer sector filter' },
      },
    },
  },
  {
    name: 'get_customer',
    description: 'Retrieve a specific customer by ID from Temenos T24',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'Customer identifier' },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'get_accounts',
    description: 'Retrieve accounts from Temenos T24',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'Customer identifier' },
        accountType: { type: 'string', description: 'Account type filter' },
      },
    },
  },
  {
    name: 'get_transactions',
    description: 'Retrieve transactions for an account from Temenos T24',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Account identifier' },
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        limit: { type: 'number', description: 'Max results to return' },
      },
      required: ['accountId'],
    },
  },
  {
    name: 'get_products',
    description: 'Retrieve available banking products from Temenos T24',
    inputSchema: {
      type: 'object',
      properties: {
        productGroup: { type: 'string', description: 'Product group filter' },
        currency: { type: 'string', description: 'Currency code filter' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a raw API call to Temenos T24',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'HTTP method', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
        path: { type: 'string', description: 'API path' },
        body: { type: 'object', description: 'Request body' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'temenos-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  await initConnection();
  if (!api) {
    return { content: [{ type: 'text', text: 'Temenos API connection not initialized. Check environment variables.' }], isError: true };
  }

  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_customers': {
        const params: Record<string, string | number> = {};
        if (args?.page) params.page = args.page as number;
        if (args?.size) params.size = args.size as number;
        if (args?.sector) params.sector = args.sector as string;
        const response = await api.get('/party/customers', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_customer': {
        const customerId = args?.customerId as string;
        const response = await api.get(`/party/customers/${customerId}`);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_accounts': {
        const params: Record<string, string> = {};
        if (args?.customerId) params.customerId = args.customerId as string;
        if (args?.accountType) params.accountType = args.accountType as string;
        const response = await api.get('/holdings/accounts', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_transactions': {
        const accountId = args?.accountId as string;
        const params: Record<string, string | number> = {};
        if (args?.startDate) params.startDate = args.startDate as string;
        if (args?.endDate) params.endDate = args.endDate as string;
        if (args?.limit) params.limit = args.limit as number;
        const response = await api.get(`/holdings/accounts/${accountId}/transactions`, { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_products': {
        const params: Record<string, string> = {};
        if (args?.productGroup) params.productGroup = args.productGroup as string;
        if (args?.currency) params.currency = args.currency as string;
        const response = await api.get('/reference/products', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'api_call': {
        const method = (args?.method as string).toLowerCase();
        const path = args?.path as string;
        const response = await api.request({
          method,
          url: path,
          data: args?.body,
          params: args?.params,
        });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error: any) {
    const message = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    return { content: [{ type: 'text', text: `Temenos API error: ${message}` }], isError: true };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Temenos MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
