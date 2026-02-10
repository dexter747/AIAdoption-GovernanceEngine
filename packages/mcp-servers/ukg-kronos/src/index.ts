import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

// Environment variables
const UKG_API_URL = process.env.UKG_API_URL || '';
const UKG_USERNAME = process.env.UKG_USERNAME || '';
const UKG_PASSWORD = process.env.UKG_PASSWORD || '';
const UKG_API_KEY = process.env.UKG_API_KEY || '';

let api: AxiosInstance | null = null;

async function initConnection(): Promise<AxiosInstance> {
  if (api) return api;

  const basicAuth = Buffer.from(`${UKG_USERNAME}:${UKG_PASSWORD}`).toString('base64');

  api = axios.create({
    baseURL: UKG_API_URL,
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Api-Key': UKG_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  return api;
}

const tools: Tool[] = [
  {
    name: 'get_employees',
    description: 'List or search UKG/Kronos employees. Optionally filter by name or department.',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term for employee name' },
        page_size: { type: 'number', description: 'Number of results per page (default 25)' },
        page: { type: 'number', description: 'Page number for pagination' },
        department: { type: 'string', description: 'Filter by department' },
      },
    },
  },
  {
    name: 'get_employee',
    description: 'Get a specific employee by their ID.',
    inputSchema: {
      type: 'object',
      properties: {
        employee_id: { type: 'string', description: 'The employee ID' },
      },
      required: ['employee_id'],
    },
  },
  {
    name: 'get_timecards',
    description: 'Get timecard data for employees. Can filter by date range or employee.',
    inputSchema: {
      type: 'object',
      properties: {
        employee_id: { type: 'string', description: 'Optional employee ID to filter timecards' },
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      },
    },
  },
  {
    name: 'get_schedules',
    description: 'Get employee schedules. Optionally filter by employee or date range.',
    inputSchema: {
      type: 'object',
      properties: {
        employee_id: { type: 'string', description: 'Optional employee ID to filter' },
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      },
    },
  },
  {
    name: 'get_accruals',
    description: 'Get PTO/leave accrual balances for employees.',
    inputSchema: {
      type: 'object',
      properties: {
        employee_id: { type: 'string', description: 'Optional employee ID to filter accruals' },
        accrual_code: { type: 'string', description: 'Filter by accrual code (e.g., VAC, SICK, PTO)' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a generic API call to UKG/Kronos. Use for endpoints not covered by other tools.',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE)', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        path: { type: 'string', description: 'API path (e.g., /api/v1/commons/persons)' },
        body: { type: 'object', description: 'Request body for POST/PUT requests' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'ukg-kronos-mcp-server', version: '1.0.0' },
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
      case 'get_employees': {
        const params: Record<string, string | number> = {};
        if (args?.search) params['search'] = args.search as string;
        if (args?.page_size) params['page_size'] = args.page_size as number;
        if (args?.page) params['page'] = args.page as number;
        if (args?.department) params['department'] = args.department as string;
        const response = await client.get('/api/v1/commons/persons', { params });
        result = response.data;
        break;
      }

      case 'get_employee': {
        const response = await client.get(`/api/v1/commons/persons/${args!.employee_id}`);
        result = response.data;
        break;
      }

      case 'get_timecards': {
        const params: Record<string, string> = {};
        if (args?.start_date) params['start_date'] = args.start_date as string;
        if (args?.end_date) params['end_date'] = args.end_date as string;
        const path = args?.employee_id
          ? `/api/v1/timekeeping/timecards?employee_id=${args.employee_id}`
          : '/api/v1/timekeeping/timecards';
        const response = await client.get(path, { params });
        result = response.data;
        break;
      }

      case 'get_schedules': {
        const params: Record<string, string> = {};
        if (args?.start_date) params['start_date'] = args.start_date as string;
        if (args?.end_date) params['end_date'] = args.end_date as string;
        const path = args?.employee_id
          ? `/api/v1/scheduling/schedules?employee_id=${args.employee_id}`
          : '/api/v1/scheduling/schedules';
        const response = await client.get(path, { params });
        result = response.data;
        break;
      }

      case 'get_accruals': {
        const params: Record<string, string> = {};
        if (args?.accrual_code) params['accrual_code'] = args.accrual_code as string;
        const path = args?.employee_id
          ? `/api/v1/timekeeping/accruals?employee_id=${args.employee_id}`
          : '/api/v1/timekeeping/accruals';
        const response = await client.get(path, { params });
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
  console.error('UKG/Kronos MCP server running on stdio');
}

main().catch(console.error);
