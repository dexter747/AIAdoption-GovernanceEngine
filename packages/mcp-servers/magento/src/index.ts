import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  const magentoUrl = process.env.MAGENTO_URL;
  const accessToken = process.env.MAGENTO_ACCESS_TOKEN;

  if (!magentoUrl || !accessToken) {
    throw new Error('MAGENTO_URL and MAGENTO_ACCESS_TOKEN environment variables are required');
  }

  api = axios.create({
    baseURL: `${magentoUrl}/rest/V1`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
}

const tools: Tool[] = [
  {
    name: 'get_products',
    description: 'List products from the Magento store',
    inputSchema: {
      type: 'object',
      properties: {
        pageSize: { type: 'number', description: 'Number of products per page', default: 20 },
        currentPage: { type: 'number', description: 'Current page number', default: 1 },
      },
    },
  },
  {
    name: 'get_product',
    description: 'Get a single product by SKU',
    inputSchema: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'The product SKU' },
      },
      required: ['sku'],
    },
  },
  {
    name: 'search_products',
    description: 'Search products using Magento searchCriteria',
    inputSchema: {
      type: 'object',
      properties: {
        field: {
          type: 'string',
          description: 'Field to search on (e.g., name, sku)',
          default: 'name',
        },
        value: { type: 'string', description: 'Search value' },
        condition_type: {
          type: 'string',
          description: 'Condition type (eq, like, gt, lt, etc.)',
          default: 'like',
        },
        pageSize: { type: 'number', description: 'Results per page', default: 20 },
        currentPage: { type: 'number', description: 'Current page number', default: 1 },
      },
      required: ['value'],
    },
  },
  {
    name: 'get_orders',
    description: 'List orders from the Magento store',
    inputSchema: {
      type: 'object',
      properties: {
        pageSize: { type: 'number', description: 'Number of orders per page', default: 20 },
        currentPage: { type: 'number', description: 'Current page number', default: 1 },
        status: { type: 'string', description: 'Filter by order status' },
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
    description: 'List customers from the Magento store',
    inputSchema: {
      type: 'object',
      properties: {
        pageSize: { type: 'number', description: 'Number of customers per page', default: 20 },
        currentPage: { type: 'number', description: 'Current page number', default: 1 },
      },
    },
  },
  {
    name: 'get_categories',
    description: 'Get the category tree from the Magento store',
    inputSchema: {
      type: 'object',
      properties: {
        rootCategoryId: { type: 'number', description: 'Root category ID', default: 1 },
        depth: { type: 'number', description: 'Depth of category tree to return' },
      },
    },
  },
  {
    name: 'get_inventory',
    description: 'Get stock/inventory information for a product SKU',
    inputSchema: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'The product SKU' },
      },
      required: ['sku'],
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom Magento REST API call',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, PUT, DELETE)',
          default: 'GET',
        },
        endpoint: { type: 'string', description: 'API endpoint path (e.g., /products)' },
        data: { type: 'object', description: 'Request body for POST/PUT requests' },
      },
      required: ['endpoint'],
    },
  },
];

async function handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'get_products': {
      const pageSize = args.pageSize || 20;
      const currentPage = args.currentPage || 1;
      const response = await api.get(
        `/products?searchCriteria[pageSize]=${pageSize}&searchCriteria[currentPage]=${currentPage}`
      );
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_product': {
      const response = await api.get(`/products/${encodeURIComponent(args.sku as string)}`);
      return JSON.stringify(response.data, null, 2);
    }
    case 'search_products': {
      const field = args.field || 'name';
      const conditionType = args.condition_type || 'like';
      const value = conditionType === 'like' ? `%${args.value}%` : args.value;
      const pageSize = args.pageSize || 20;
      const currentPage = args.currentPage || 1;
      const response = await api.get(
        `/products?searchCriteria[filterGroups][0][filters][0][field]=${field}` +
          `&searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(value as string)}` +
          `&searchCriteria[filterGroups][0][filters][0][conditionType]=${conditionType}` +
          `&searchCriteria[pageSize]=${pageSize}&searchCriteria[currentPage]=${currentPage}`
      );
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_orders': {
      let url = `/orders?searchCriteria[pageSize]=${args.pageSize || 20}&searchCriteria[currentPage]=${args.currentPage || 1}`;
      if (args.status) {
        url +=
          `&searchCriteria[filterGroups][0][filters][0][field]=status` +
          `&searchCriteria[filterGroups][0][filters][0][value]=${args.status}` +
          `&searchCriteria[filterGroups][0][filters][0][conditionType]=eq`;
      }
      const response = await api.get(url);
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_order': {
      const response = await api.get(`/orders/${args.order_id}`);
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_customers': {
      const pageSize = args.pageSize || 20;
      const currentPage = args.currentPage || 1;
      const response = await api.get(
        `/customers/search?searchCriteria[pageSize]=${pageSize}&searchCriteria[currentPage]=${currentPage}`
      );
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_categories': {
      const rootId = args.rootCategoryId || 1;
      let url = `/categories?rootCategoryId=${rootId}`;
      if (args.depth) url += `&depth=${args.depth}`;
      const response = await api.get(url);
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_inventory': {
      const response = await api.get(`/stockItems/${encodeURIComponent(args.sku as string)}`);
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
    { name: 'magento-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
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
  console.error('Magento MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
