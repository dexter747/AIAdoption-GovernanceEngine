import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.BLUEYONDER_API_URL || '';
const ACCESS_TOKEN = process.env.BLUEYONDER_ACCESS_TOKEN || '';

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
    name: 'get_demand_forecast',
    description: 'Get demand forecast data from Blue Yonder',
    inputSchema: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'Filter by SKU' },
        horizon: { type: 'string', description: 'Forecast horizon (e.g. 7d, 30d, 90d)' },
        location: { type: 'string', description: 'Filter by location' },
      },
    },
  },
  {
    name: 'get_inventory',
    description: 'Get inventory data from Blue Yonder',
    inputSchema: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'Filter by SKU' },
        location: { type: 'string', description: 'Filter by location' },
        status: { type: 'string', description: 'Filter by inventory status' },
      },
    },
  },
  {
    name: 'get_orders',
    description: 'Get orders from Blue Yonder',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by order status' },
        limit: { type: 'number', description: 'Maximum number of orders to return' },
      },
    },
  },
  {
    name: 'get_fulfillment_plans',
    description: 'Get fulfillment plans from Blue Yonder',
    inputSchema: {
      type: 'object',
      properties: {
        order_id: { type: 'string', description: 'Filter by order ID' },
        status: { type: 'string', description: 'Filter by plan status' },
      },
    },
  },
  {
    name: 'get_supply_plan',
    description: 'Get supply plan data from Blue Yonder',
    inputSchema: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'Filter by SKU' },
        horizon: { type: 'string', description: 'Planning horizon' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to Blue Yonder',
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
  { name: 'blue-yonder', version: '1.0.0' },
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
      case 'get_demand_forecast': {
        const params: Record<string, unknown> = {};
        if (args?.sku) params.sku = args.sku;
        if (args?.horizon) params.horizon = args.horizon;
        if (args?.location) params.location = args.location;
        const r = await client.get('/demand-forecast', { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'get_inventory': {
        const params: Record<string, unknown> = {};
        if (args?.sku) params.sku = args.sku;
        if (args?.location) params.location = args.location;
        if (args?.status) params.status = args.status;
        const r = await client.get('/inventory', { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'get_orders': {
        const params: Record<string, unknown> = {};
        if (args?.status) params.status = args.status;
        if (args?.limit) params.limit = args.limit;
        const r = await client.get('/orders', { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'get_fulfillment_plans': {
        const params: Record<string, unknown> = {};
        if (args?.order_id) params.order_id = args.order_id;
        if (args?.status) params.status = args.status;
        const r = await client.get('/fulfillment-plans', { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'get_supply_plan': {
        const params: Record<string, unknown> = {};
        if (args?.sku) params.sku = args.sku;
        if (args?.horizon) params.horizon = args.horizon;
        const r = await client.get('/supply-plan', { params });
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
  console.error('Blue Yonder MCP server running on stdio');
}

main().catch(console.error);
