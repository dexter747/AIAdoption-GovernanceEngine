import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

async function initConnection(): Promise<void> {
  const baseURL = process.env.TYLER_API_URL;
  const apiKey = process.env.TYLER_API_KEY;

  if (!baseURL || !apiKey) {
    throw new Error('TYLER_API_URL and TYLER_API_KEY environment variables are required');
  }

  api = axios.create({
    baseURL,
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
}

const TOOLS: Tool[] = [
  {
    name: 'get_citizens',
    description: 'Retrieve citizen records from Tyler Technologies platform',
    inputSchema: {
      type: 'object',
      properties: {
        citizen_id: { type: 'string', description: 'Specific citizen ID' },
        name: { type: 'string', description: 'Search by citizen name' },
        email: { type: 'string', description: 'Search by email address' },
        address: { type: 'string', description: 'Search by address' },
      },
    },
  },
  {
    name: 'get_permits',
    description: 'Retrieve permit records (building, zoning, business permits)',
    inputSchema: {
      type: 'object',
      properties: {
        permit_id: { type: 'string', description: 'Specific permit ID' },
        type: { type: 'string', description: 'Permit type (building, zoning, business)' },
        status: { type: 'string', description: 'Permit status (pending, approved, denied, expired)' },
        applicant: { type: 'string', description: 'Applicant name' },
        date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      },
    },
  },
  {
    name: 'get_cases',
    description: 'Retrieve case records (code enforcement, complaints, service requests)',
    inputSchema: {
      type: 'object',
      properties: {
        case_id: { type: 'string', description: 'Specific case ID' },
        type: { type: 'string', description: 'Case type' },
        status: { type: 'string', description: 'Case status (open, closed, in_progress)' },
        assigned_to: { type: 'string', description: 'Assigned officer/department' },
        date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      },
    },
  },
  {
    name: 'get_payments',
    description: 'Retrieve payment and billing records',
    inputSchema: {
      type: 'object',
      properties: {
        payment_id: { type: 'string', description: 'Specific payment ID' },
        citizen_id: { type: 'string', description: 'Filter by citizen' },
        type: { type: 'string', description: 'Payment type (tax, utility, fee, fine)' },
        status: { type: 'string', description: 'Payment status' },
        date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      },
    },
  },
  {
    name: 'get_assessments',
    description: 'Retrieve property assessment and appraisal records',
    inputSchema: {
      type: 'object',
      properties: {
        parcel_id: { type: 'string', description: 'Parcel/property ID' },
        address: { type: 'string', description: 'Property address' },
        owner: { type: 'string', description: 'Property owner name' },
        tax_year: { type: 'string', description: 'Tax/assessment year' },
      },
    },
  },
  {
    name: 'search_records',
    description: 'Search across all record types in Tyler Technologies platform',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query string' },
        record_type: { type: 'string', description: 'Filter by record type (citizen, permit, case, payment, assessment)' },
        limit: { type: 'number', description: 'Maximum results to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
      required: ['query'],
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to Tyler Technologies platform',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE)', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        endpoint: { type: 'string', description: 'API endpoint path' },
        params: { type: 'object', description: 'Query parameters' },
        body: { type: 'object', description: 'Request body for POST/PUT' },
      },
      required: ['method', 'endpoint'],
    },
  },
];

const server = new Server(
  { name: 'tyler-technologies', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!api) {
    await initConnection();
  }

  try {
    let response;

    switch (name) {
      case 'get_citizens': {
        const endpoint = args?.citizen_id ? `/citizens/${args.citizen_id}` : '/citizens';
        const params: Record<string, string> = {};
        if (args?.name) params.name = args.name as string;
        if (args?.email) params.email = args.email as string;
        if (args?.address) params.address = args.address as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'get_permits': {
        const endpoint = args?.permit_id ? `/permits/${args.permit_id}` : '/permits';
        const params: Record<string, string> = {};
        if (args?.type) params.type = args.type as string;
        if (args?.status) params.status = args.status as string;
        if (args?.applicant) params.applicant = args.applicant as string;
        if (args?.date_from) params.date_from = args.date_from as string;
        if (args?.date_to) params.date_to = args.date_to as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'get_cases': {
        const endpoint = args?.case_id ? `/cases/${args.case_id}` : '/cases';
        const params: Record<string, string> = {};
        if (args?.type) params.type = args.type as string;
        if (args?.status) params.status = args.status as string;
        if (args?.assigned_to) params.assigned_to = args.assigned_to as string;
        if (args?.date_from) params.date_from = args.date_from as string;
        if (args?.date_to) params.date_to = args.date_to as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'get_payments': {
        const endpoint = args?.payment_id ? `/payments/${args.payment_id}` : '/payments';
        const params: Record<string, string> = {};
        if (args?.citizen_id) params.citizen_id = args.citizen_id as string;
        if (args?.type) params.type = args.type as string;
        if (args?.status) params.status = args.status as string;
        if (args?.date_from) params.date_from = args.date_from as string;
        if (args?.date_to) params.date_to = args.date_to as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'get_assessments': {
        const endpoint = args?.parcel_id ? `/assessments/${args.parcel_id}` : '/assessments';
        const params: Record<string, string> = {};
        if (args?.address) params.address = args.address as string;
        if (args?.owner) params.owner = args.owner as string;
        if (args?.tax_year) params.tax_year = args.tax_year as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'search_records': {
        const params: Record<string, string | number> = { query: args?.query as string };
        if (args?.record_type) params.record_type = args.record_type as string;
        if (args?.limit) params.limit = args.limit as number;
        if (args?.offset) params.offset = args.offset as number;
        response = await api!.get('/search', { params });
        break;
      }

      case 'api_call': {
        const method = (args?.method as string || 'GET').toLowerCase();
        const endpoint = args?.endpoint as string;
        response = await api!.request({
          method,
          url: endpoint,
          params: args?.params as Record<string, unknown>,
          data: args?.body,
        });
        break;
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    const err = error as Error & { response?: { status: number; data: unknown } };
    return {
      content: [{
        type: 'text',
        text: `Error: ${err.message}${err.response ? `\nStatus: ${err.response.status}\nData: ${JSON.stringify(err.response.data)}` : ''}`,
      }],
      isError: true,
    };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Tyler Technologies MCP server running on stdio');
}

main().catch(console.error);
