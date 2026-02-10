import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  const storeUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!storeUrl || !accessToken) {
    throw new Error('SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN environment variables are required');
  }

  api = axios.create({
    baseURL: `${storeUrl}/admin/api/2024-01`,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });
}

const tools: Tool[] = [
  {
    name: 'get_products',
    description: 'List all products from the Shopify store',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of products to return (max 250)', default: 50 },
        page_info: { type: 'string', description: 'Cursor for pagination' },
      },
    },
  },
  {
    name: 'get_product',
    description: 'Get a single product by ID',
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'The product ID' },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'get_orders',
    description: 'List orders from the Shopify store',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of orders to return (max 250)', default: 50 },
        status: { type: 'string', description: 'Order status filter (open, closed, cancelled, any)', default: 'any' },
        page_info: { type: 'string', description: 'Cursor for pagination' },
      },
    },
  },
  {
    name: 'get_order',
    description: 'Get a single order by ID',
    inputSchema: {
      type: 'object',
      properties: {
        order_id: { type: 'string', description: 'The order ID' },
      },
      required: ['order_id'],
    },
  },
  {
    name: 'get_customers',
    description: 'List customers from the Shopify store',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of customers to return (max 250)', default: 50 },
        page_info: { type: 'string', description: 'Cursor for pagination' },
      },
    },
  },
  {
    name: 'get_customer',
    description: 'Get a single customer by ID',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: { type: 'string', description: 'The customer ID' },
      },
      required: ['customer_id'],
    },
  },
  {
    name: 'get_inventory',
    description: 'Get inventory levels for the store',
    inputSchema: {
      type: 'object',
      properties: {
        location_id: { type: 'string', description: 'Location ID to filter inventory' },
        limit: { type: 'number', description: 'Number of results to return', default: 50 },
      },
    },
  },
  {
    name: 'search_products',
    description: 'Search products by title or other criteria',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query string' },
        limit: { type: 'number', description: 'Number of results to return', default: 50 },
      },
      required: ['query'],
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom Shopify Admin API call',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE)', default: 'GET' },
        endpoint: { type: 'string', description: 'API endpoint path (e.g., /products.json)' },
        data: { type: 'object', description: 'Request body for POST/PUT requests' },
      },
      required: ['endpoint'],
    },
  },
];

async function handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'get_products': {
      const params: Record<string, unknown> = { limit: args.limit || 50 };
      if (args.page_info) params.page_info = args.page_info;
      const response = await api.get('/products.json', { params });
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_product': {
      const response = await api.get(`/products/${args.product_id}.json`);
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_orders': {
      const params: Record<string, unknown> = { limit: args.limit || 50, status: args.status || 'any' };
      if (args.page_info) params.page_info = args.page_info;
      const response = await api.get('/orders.json', { params });
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_order': {
      const response = await api.get(`/orders/${args.order_id}.json`);
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_customers': {
      const params: Record<string, unknown> = { limit: args.limit || 50 };
      if (args.page_info) params.page_info = args.page_info;
      const response = await api.get('/customers.json', { params });
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_customer': {
      const response = await api.get(`/customers/${args.customer_id}.json`);
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_inventory': {
      const params: Record<string, unknown> = { limit: args.limit || 50 };
      if (args.location_id) params.location_ids = args.location_id;
      const response = await api.get('/inventory_levels.json', { params });
      return JSON.stringify(response.data, null, 2);
    }
    case 'search_products': {
      const params: Record<string, unknown> = { title: args.query, limit: args.limit || 50 };
      const response = await api.get('/products.json', { params });
      return JSON.stringify(response.data, null, 2);
    }
    case 'api_call': {
      const method = ((args.method as string) || 'GET').toLowerCase();
      const response = await (api as any)[method](args.endpoint, args.data || undefined);
      return JSON.stringify(response.data, null, 2);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function main(): Promise<void> {
  initConnection();

  const server = new Server(
    { name: 'shopify-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      const result = await handleToolCall(name, args as Record<string, unknown>);
      return {
        content: [{ type: 'text' as const, text: result }],
      };
    } catch (err: any) {
      const error = err as Error;
      return {
        content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Shopify MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
