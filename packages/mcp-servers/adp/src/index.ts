import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

// Environment variables
const ADP_CLIENT_ID = process.env.ADP_CLIENT_ID || '';
const ADP_CLIENT_SECRET = process.env.ADP_CLIENT_SECRET || '';
const ADP_TOKEN_URL = process.env.ADP_TOKEN_URL || 'https://accounts.adp.com/auth/oauth/v2/token';
const ADP_API_URL = process.env.ADP_API_URL || 'https://api.adp.com';

let api: AxiosInstance | null = null;
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', ADP_CLIENT_ID);
  params.append('client_secret', ADP_CLIENT_SECRET);

  const response = await axios.post(ADP_TOKEN_URL, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return accessToken!;
}

async function initConnection(): Promise<AxiosInstance> {
  if (api) return api;

  const token = await getAccessToken();
  api = axios.create({
    baseURL: ADP_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use(async (config) => {
    const freshToken = await getAccessToken();
    config.headers.Authorization = `Bearer ${freshToken}`;
    return config;
  });

  return api;
}

const tools: Tool[] = [
  {
    name: 'get_workers',
    description: 'List or search ADP workers. Optionally filter by name or department.',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term for worker name' },
        top: { type: 'number', description: 'Number of results to return (default 25)' },
        skip: { type: 'number', description: 'Number of results to skip for pagination' },
      },
    },
  },
  {
    name: 'get_worker',
    description: 'Get a specific ADP worker by their Associate OID (worker ID).',
    inputSchema: {
      type: 'object',
      properties: {
        worker_id: { type: 'string', description: 'The Associate OID of the worker' },
      },
      required: ['worker_id'],
    },
  },
  {
    name: 'get_payroll_data',
    description: 'Get payroll summary data. Can filter by date range or worker.',
    inputSchema: {
      type: 'object',
      properties: {
        worker_id: { type: 'string', description: 'Optional worker ID to filter payroll data' },
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      },
    },
  },
  {
    name: 'get_time_off',
    description: 'Get time-off requests. Optionally filter by worker or status.',
    inputSchema: {
      type: 'object',
      properties: {
        worker_id: { type: 'string', description: 'Optional worker ID to filter' },
        status: { type: 'string', description: 'Filter by status (e.g., pending, approved, denied)' },
      },
    },
  },
  {
    name: 'get_org_chart',
    description: 'Get organizational structure/chart data.',
    inputSchema: {
      type: 'object',
      properties: {
        department: { type: 'string', description: 'Optional department to filter org chart' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a generic API call to ADP. Use for endpoints not covered by other tools.',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE)', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        path: { type: 'string', description: 'API path (e.g., /hr/v2/workers)' },
        body: { type: 'object', description: 'Request body for POST/PUT requests' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'adp-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const client = await initConnection();

  try {
    let result: unknown;

    switch (name) {
      case 'get_workers': {
        const params: Record<string, string | number> = {};
        if (args?.search) params['$search'] = args.search as string;
        if (args?.top) params['$top'] = args.top as number;
        if (args?.skip) params['$skip'] = args.skip as number;
        const response = await client.get('/hr/v2/workers', { params });
        result = response.data;
        break;
      }

      case 'get_worker': {
        const response = await client.get(`/hr/v2/workers/${args!.worker_id}`);
        result = response.data;
        break;
      }

      case 'get_payroll_data': {
        const params: Record<string, string> = {};
        if (args?.start_date) params['startDate'] = args.start_date as string;
        if (args?.end_date) params['endDate'] = args.end_date as string;
        const path = args?.worker_id
          ? `/payroll/v1/workers/${args.worker_id}/pay-distributions`
          : '/payroll/v1/pay-distributions';
        const response = await client.get(path, { params });
        result = response.data;
        break;
      }

      case 'get_time_off': {
        const params: Record<string, string> = {};
        if (args?.status) params['status'] = args.status as string;
        const path = args?.worker_id
          ? `/time/v2/workers/${args.worker_id}/time-off-requests`
          : '/time/v2/time-off-requests';
        const response = await client.get(path, { params });
        result = response.data;
        break;
      }

      case 'get_org_chart': {
        const params: Record<string, string> = {};
        if (args?.department) params['department'] = args.department as string;
        const response = await client.get('/hr/v2/organization-departments', { params });
        result = response.data;
        break;
      }

      case 'api_call': {
        const response = await client.request({
          method: args!.method as string,
          url: args!.path as string,
          data: args?.body,
          params: args?.params,
        });
        result = response.data;
        break;
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ADP MCP server running on stdio');
}

main().catch(console.error);
