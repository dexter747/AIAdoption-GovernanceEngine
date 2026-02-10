import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.MANHATTAN_API_URL || '';
const ACCESS_TOKEN = process.env.MANHATTAN_ACCESS_TOKEN || '';

let api: AxiosInstance | null = null;

function initConnection(): AxiosInstance {
  if (!api) {
    api = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  }
  return api;
}

const tools: Tool[] = [
  {
    name: 'get_orders',
    description: 'Get a list of orders from Manhattan Associates WMS/OMS',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by order status' },
        limit: { type: 'number', description: 'Maximum number of orders to return' },
      },
    },
  },
  {
    name: 'get_order',
    description: 'Get details of a specific order by ID',
    inputSchema: {
      type: 'object',
      properties: {
        order_id: { type: 'string', description: 'The order ID' },
      },
      required: ['order_id'],
    },
  },
  {
    name: 'get_inventory',
    description: 'Get inventory levels from Manhattan Associates',
    inputSchema: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'Filter by SKU' },
        location: { type: 'string', description: 'Filter by warehouse location' },
      },
    },
  },
  {
    name: 'get_shipments',
    description: 'Get shipment information from Manhattan Associates',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by shipment status' },
        limit: { type: 'number', description: 'Maximum number of shipments to return' },
      },
    },
  },
  {
    name: 'get_locations',
    description: 'Get warehouse locations from Manhattan Associates',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Filter by location type' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to Manhattan Associates',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE)', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        path: { type: 'string', description: 'API endpoint path' },
        body: { type: 'object', description: 'Request body for POST/PUT requests' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'manhattan-associates', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const client = initConnection();

  try {
    switch (name) {
      case 'get_orders': {
        const params: Record<string, unknown> = {};
        if (args?.status) params.status = args.status;
        if (args?.limit) params.limit = args.limit;
        const r = await client.get('/orders', { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'get_order': {
        const r = await client.get(`/orders/${args?.order_id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'get_inventory': {
        const params: Record<string, unknown> = {};
        if (args?.sku) params.sku = args.sku;
        if (args?.location) params.location = args.location;
        const r = await client.get('/inventory', { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'get_shipments': {
        const params: Record<string, unknown> = {};
        if (args?.status) params.status = args.status;
        if (args?.limit) params.limit = args.limit;
        const r = await client.get('/shipments', { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'get_locations': {
        const params: Record<string, unknown> = {};
        if (args?.type) params.type = args.type;
        const r = await client.get('/locations', { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'api_call': {
        const r = await client.request({
          method: (args?.method as string) || 'GET',
          url: args?.path as string,
          data: args?.body,
          params: args?.params,
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Manhattan Associates MCP server running on stdio');
}

main().catch(console.error);
