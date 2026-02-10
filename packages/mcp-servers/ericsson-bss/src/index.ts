import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

function initConnection(): void {
  const baseURL = process.env.ERICSSON_BSS_URL;
  const token = process.env.ERICSSON_BSS_ACCESS_TOKEN;

  if (!baseURL || !token) {
    throw new Error('ERICSSON_BSS_URL and ERICSSON_BSS_ACCESS_TOKEN environment variables are required');
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
    name: 'get_subscribers',
    description: 'List subscribers from Ericsson BSS',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of subscribers to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
    },
  },
  {
    name: 'get_subscriber',
    description: 'Get a specific subscriber by ID from Ericsson BSS',
    inputSchema: {
      type: 'object',
      properties: {
        subscriberId: { type: 'string', description: 'The subscriber ID' },
      },
      required: ['subscriberId'],
    },
  },
  {
    name: 'get_usage',
    description: 'Get usage records for a subscriber from Ericsson BSS',
    inputSchema: {
      type: 'object',
      properties: {
        subscriberId: { type: 'string', description: 'The subscriber ID' },
        startDate: { type: 'string', description: 'Start date for usage query (ISO 8601)' },
        endDate: { type: 'string', description: 'End date for usage query (ISO 8601)' },
      },
      required: ['subscriberId'],
    },
  },
  {
    name: 'get_billing',
    description: 'Get billing information for a subscriber from Ericsson BSS',
    inputSchema: {
      type: 'object',
      properties: {
        subscriberId: { type: 'string', description: 'The subscriber ID' },
        period: { type: 'string', description: 'Billing period (e.g. 2024-01)' },
      },
      required: ['subscriberId'],
    },
  },
  {
    name: 'get_products',
    description: 'List available products from Ericsson BSS catalog',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filter by product category' },
      },
    },
  },
  {
    name: 'get_offers',
    description: 'List available offers from Ericsson BSS',
    inputSchema: {
      type: 'object',
      properties: {
        subscriberId: { type: 'string', description: 'Filter offers for a specific subscriber' },
        status: { type: 'string', description: 'Filter by offer status' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to Ericsson BSS',
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
  { name: 'ericsson-bss-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!api) initConnection();

  const { name, arguments: args } = request.params;

  try {
    let r;

    switch (name) {
      case 'get_subscribers':
        r = await api!.get('/subscribers', { params: { limit: args?.limit, offset: args?.offset } });
        break;
      case 'get_subscriber':
        r = await api!.get(`/subscribers/${args!.subscriberId}`);
        break;
      case 'get_usage':
        r = await api!.get(`/subscribers/${args!.subscriberId}/usage`, { params: { startDate: args?.startDate, endDate: args?.endDate } });
        break;
      case 'get_billing':
        r = await api!.get(`/subscribers/${args!.subscriberId}/billing`, { params: { period: args?.period } });
        break;
      case 'get_products':
        r = await api!.get('/products', { params: { category: args?.category } });
        break;
      case 'get_offers':
        r = await api!.get('/offers', { params: { subscriberId: args?.subscriberId, status: args?.status } });
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
  console.error('Ericsson BSS MCP server running on stdio');
}

main().catch(console.error);
