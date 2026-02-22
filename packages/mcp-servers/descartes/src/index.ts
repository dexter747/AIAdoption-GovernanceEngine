import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.DESCARTES_API_URL || '';
const API_KEY = process.env.DESCARTES_API_KEY || '';

let api: AxiosInstance | null = null;

function initConnection(): AxiosInstance {
  if (!api) {
    api = axios.create({
      baseURL: API_URL,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }
  return api;
}

const tools: Tool[] = [
  {
    name: 'get_shipments',
    description: 'Get shipments from Descartes Logistics',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by shipment status' },
        carrier: { type: 'string', description: 'Filter by carrier' },
        limit: { type: 'number', description: 'Maximum number of shipments to return' },
      },
    },
  },
  {
    name: 'track_shipment',
    description: 'Track a specific shipment by tracking number',
    inputSchema: {
      type: 'object',
      properties: {
        tracking_number: { type: 'string', description: 'The shipment tracking number' },
      },
      required: ['tracking_number'],
    },
  },
  {
    name: 'get_routes',
    description: 'Get route information from Descartes',
    inputSchema: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: 'Filter by origin location' },
        destination: { type: 'string', description: 'Filter by destination location' },
        status: { type: 'string', description: 'Filter by route status' },
      },
    },
  },
  {
    name: 'get_carriers',
    description: 'Get carrier information from Descartes',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Filter by carrier name' },
        mode: { type: 'string', description: 'Filter by transport mode (air, ocean, ground)' },
      },
    },
  },
  {
    name: 'get_customs_data',
    description: 'Get customs and compliance data from Descartes',
    inputSchema: {
      type: 'object',
      properties: {
        shipment_id: { type: 'string', description: 'Filter by shipment ID' },
        country: { type: 'string', description: 'Filter by country code' },
        status: { type: 'string', description: 'Filter by customs status' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to Descartes',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, PUT, DELETE)',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
        },
        path: { type: 'string', description: 'API endpoint path' },
        body: { type: 'object', description: 'Request body for POST/PUT requests' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server({ name: 'descartes', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;
  const client = initConnection();

  try {
    switch (name) {
      case 'get_shipments': {
        const params: Record<string, unknown> = {};
        if (args?.status) params.status = args.status;
        if (args?.carrier) params.carrier = args.carrier;
        if (args?.limit) params.limit = args.limit;
        const r = await client.get('/shipments', { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'track_shipment': {
        const r = await client.get(`/shipments/${args?.tracking_number}/tracking`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'get_routes': {
        const params: Record<string, unknown> = {};
        if (args?.origin) params.origin = args.origin;
        if (args?.destination) params.destination = args.destination;
        if (args?.status) params.status = args.status;
        const r = await client.get('/routes', { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'get_carriers': {
        const params: Record<string, unknown> = {};
        if (args?.name) params.name = args.name;
        if (args?.mode) params.mode = args.mode;
        const r = await client.get('/carriers', { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }

      case 'get_customs_data': {
        const params: Record<string, unknown> = {};
        if (args?.shipment_id) params.shipment_id = args.shipment_id;
        if (args?.country) params.country = args.country;
        if (args?.status) params.status = args.status;
        const r = await client.get('/customs', { params });
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
        return {
          content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Descartes MCP server running on stdio');
}

main().catch(console.error);
