import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

// Environment variables
const PREDIX_API_URL = process.env.PREDIX_API_URL || '';
const PREDIX_ACCESS_TOKEN = process.env.PREDIX_ACCESS_TOKEN || '';
const PREDIX_ZONE_ID = process.env.PREDIX_ZONE_ID || '';

let api: AxiosInstance | null = null;

function initConnection(): void {
  api = axios.create({
    baseURL: PREDIX_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${PREDIX_ACCESS_TOKEN}`,
      'Predix-Zone-Id': PREDIX_ZONE_ID,
    },
  });
}

const tools: Tool[] = [
  {
    name: 'get_assets',
    description: 'List assets from GE Predix Asset service',
    inputSchema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'Filter expression for assets' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
        fields: { type: 'string', description: 'Comma-separated fields to return' },
      },
    },
  },
  {
    name: 'get_asset',
    description: 'Get a single asset by ID from GE Predix',
    inputSchema: {
      type: 'object',
      properties: {
        assetId: { type: 'string', description: 'The asset ID or URI' },
      },
      required: ['assetId'],
    },
  },
  {
    name: 'get_timeseries_data',
    description: 'Query time series data from GE Predix Time Series service',
    inputSchema: {
      type: 'object',
      properties: {
        tags: { type: 'array', items: { type: 'string' }, description: 'Tag names to query' },
        start: { type: 'string', description: 'Start time (ISO 8601 or epoch ms)' },
        end: { type: 'string', description: 'End time (ISO 8601 or epoch ms)' },
        limit: { type: 'number', description: 'Maximum number of data points', default: 1000 },
        order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order', default: 'desc' },
      },
      required: ['tags', 'start'],
    },
  },
  {
    name: 'get_alerts',
    description: 'List alerts from GE Predix',
    inputSchema: {
      type: 'object',
      properties: {
        severity: { type: 'string', description: 'Filter by severity level' },
        status: { type: 'string', description: 'Filter by alert status' },
        assetId: { type: 'string', description: 'Filter by asset ID' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'get_events',
    description: 'List events from GE Predix Event service',
    inputSchema: {
      type: 'object',
      properties: {
        assetId: { type: 'string', description: 'Filter by asset ID' },
        eventType: { type: 'string', description: 'Filter by event type' },
        startTime: { type: 'string', description: 'Start time filter (ISO 8601)' },
        endTime: { type: 'string', description: 'End time filter (ISO 8601)' },
        pageSize: { type: 'number', description: 'Number of results per page', default: 50 },
      },
    },
  },
  {
    name: 'run_analytics',
    description: 'Execute an analytics pipeline or model in GE Predix',
    inputSchema: {
      type: 'object',
      properties: {
        analyticId: { type: 'string', description: 'The analytic catalog entry ID' },
        inputData: { type: 'object', description: 'Input data for the analytic' },
      },
      required: ['analyticId'],
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to GE Predix',
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
  { name: 'ge-predix-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!api) {
    return { content: [{ type: 'text', text: 'Error: Predix connection not initialized. Check PREDIX_API_URL, PREDIX_ACCESS_TOKEN, and PREDIX_ZONE_ID.' }] };
  }

  try {
    switch (name) {
      case 'get_assets': {
        const params: Record<string, string | number> = {};
        if (args?.filter) params['filter'] = args.filter as string;
        if (args?.pageSize) params['pageSize'] = args.pageSize as number;
        if (args?.fields) params['fields'] = args.fields as string;
        const response = await api.get('/asset', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_asset': {
        const response = await api.get(`/asset/${args?.assetId}`);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_timeseries_data': {
        const body: any = {
          start: args?.start,
          tags: (args?.tags as string[]).map((tag: string) => ({
            name: tag,
            order: args?.order || 'desc',
            limit: args?.limit || 1000,
          })),
        };
        if (args?.end) body.end = args.end;
        const response = await api.post('/v1/datapoints', body);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_alerts': {
        const params: Record<string, string | number> = {};
        if (args?.severity) params['severity'] = args.severity as string;
        if (args?.status) params['status'] = args.status as string;
        if (args?.assetId) params['assetId'] = args.assetId as string;
        if (args?.pageSize) params['pageSize'] = args.pageSize as number;
        const response = await api.get('/alerts', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_events': {
        const params: Record<string, string | number> = {};
        if (args?.assetId) params['assetId'] = args.assetId as string;
        if (args?.eventType) params['eventType'] = args.eventType as string;
        if (args?.startTime) params['startTime'] = args.startTime as string;
        if (args?.endTime) params['endTime'] = args.endTime as string;
        if (args?.pageSize) params['pageSize'] = args.pageSize as number;
        const response = await api.get('/events', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'run_analytics': {
        const body = {
          analyticId: args?.analyticId,
          inputData: args?.inputData || {},
        };
        const response = await api.post(`/analytics/runtime/${args?.analyticId}`, body);
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
  console.error('GE Predix MCP Server running on stdio');
}

main().catch(console.error);
