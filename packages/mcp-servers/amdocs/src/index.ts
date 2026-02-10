import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

function initConnection(): void {
  const baseURL = process.env.AMDOCS_API_URL;
  const token = process.env.AMDOCS_ACCESS_TOKEN;

  if (!baseURL || !token) {
    throw new Error('AMDOCS_API_URL and AMDOCS_ACCESS_TOKEN environment variables are required');
  }

  api = axios.create({
    baseURL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

const tools: Tool[] = [
  {
    name: 'get_customers',
    description: 'List customers from Amdocs BSS/OSS',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of customers to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
    },
  },
  {
    name: 'get_customer',
    description: 'Get a specific customer by ID from Amdocs',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'The customer ID' },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'get_subscriptions',
    description: 'Get subscriptions for a customer from Amdocs',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'The customer ID' },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'get_orders',
    description: 'Get orders for a customer from Amdocs',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'The customer ID' },
        status: { type: 'string', description: 'Filter by order status' },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'get_products',
    description: 'List available products from Amdocs catalog',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filter by product category' },
      },
    },
  },
  {
    name: 'get_billing',
    description: 'Get billing information for a customer from Amdocs',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'The customer ID' },
        period: { type: 'string', description: 'Billing period (e.g. 2024-01)' },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to Amdocs BSS/OSS',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE)', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        path: { type: 'string', description: 'API path' },
        body: { type: 'object', description: 'Request body for POST/PUT' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'amdocs-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!api) initConnection();

  const { name, arguments: args } = request.params;

  try {
    let r;

    switch (name) {
      case 'get_customers':
        r = await api!.get('/customers', { params: { limit: args?.limit, offset: args?.offset } });
        break;
      case 'get_customer':
        r = await api!.get(`/customers/${args!.customerId}`);
        break;
      case 'get_subscriptions':
        r = await api!.get(`/customers/${args!.customerId}/subscriptions`);
        break;
      case 'get_orders':
        r = await api!.get(`/customers/${args!.customerId}/orders`, { params: { status: args?.status } });
        break;
      case 'get_products':
        r = await api!.get('/products', { params: { category: args?.category } });
        break;
      case 'get_billing':
        r = await api!.get(`/customers/${args!.customerId}/billing`, { params: { period: args?.period } });
        break;
      case 'api_call':
        r = await api!.request({ method: args!.method as string, url: args!.path as string, data: args?.body });
        break;
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }], isError: true };
    }

    return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Amdocs MCP server running on stdio');
}

main().catch(console.error);
