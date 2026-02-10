import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

async function initConnection(): Promise<void> {
  const baseURL = process.env.CGI_API_URL;
  const token = process.env.CGI_ACCESS_TOKEN;

  if (!baseURL || !token) {
    throw new Error('CGI_API_URL and CGI_ACCESS_TOKEN environment variables are required');
  }

  api = axios.create({
    baseURL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
}

const TOOLS: Tool[] = [
  {
    name: 'get_accounts',
    description: 'Retrieve chart of accounts or specific account details from CGI Advantage/Momentum',
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Specific account ID to retrieve (optional)' },
        fund: { type: 'string', description: 'Filter by fund code' },
        department: { type: 'string', description: 'Filter by department code' },
        fiscal_year: { type: 'string', description: 'Fiscal year to query' },
      },
    },
  },
  {
    name: 'get_budget',
    description: 'Retrieve budget information including appropriations, allocations, and remaining balances',
    inputSchema: {
      type: 'object',
      properties: {
        budget_id: { type: 'string', description: 'Specific budget ID' },
        fund: { type: 'string', description: 'Filter by fund code' },
        department: { type: 'string', description: 'Filter by department' },
        fiscal_year: { type: 'string', description: 'Fiscal year' },
        status: { type: 'string', description: 'Budget status filter' },
      },
    },
  },
  {
    name: 'get_purchase_orders',
    description: 'Retrieve purchase orders from CGI Advantage/Momentum',
    inputSchema: {
      type: 'object',
      properties: {
        po_number: { type: 'string', description: 'Specific PO number' },
        vendor_id: { type: 'string', description: 'Filter by vendor ID' },
        status: { type: 'string', description: 'PO status (open, closed, pending)' },
        date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      },
    },
  },
  {
    name: 'get_vendors',
    description: 'Retrieve vendor/supplier information',
    inputSchema: {
      type: 'object',
      properties: {
        vendor_id: { type: 'string', description: 'Specific vendor ID' },
        name: { type: 'string', description: 'Search by vendor name' },
        status: { type: 'string', description: 'Vendor status filter' },
      },
    },
  },
  {
    name: 'get_payments',
    description: 'Retrieve payment and disbursement records',
    inputSchema: {
      type: 'object',
      properties: {
        payment_id: { type: 'string', description: 'Specific payment ID' },
        vendor_id: { type: 'string', description: 'Filter by vendor' },
        date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        status: { type: 'string', description: 'Payment status' },
      },
    },
  },
  {
    name: 'get_grants',
    description: 'Retrieve grant management information including awards, drawdowns, and compliance',
    inputSchema: {
      type: 'object',
      properties: {
        grant_id: { type: 'string', description: 'Specific grant ID' },
        agency: { type: 'string', description: 'Granting agency' },
        status: { type: 'string', description: 'Grant status' },
        fiscal_year: { type: 'string', description: 'Fiscal year' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to CGI Advantage/Momentum',
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
  { name: 'cgi-momentum', version: '1.0.0' },
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
      case 'get_accounts': {
        const endpoint = args?.account_id ? `/accounts/${args.account_id}` : '/accounts';
        const params: Record<string, string> = {};
        if (args?.fund) params.fund = args.fund as string;
        if (args?.department) params.department = args.department as string;
        if (args?.fiscal_year) params.fiscal_year = args.fiscal_year as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'get_budget': {
        const endpoint = args?.budget_id ? `/budgets/${args.budget_id}` : '/budgets';
        const params: Record<string, string> = {};
        if (args?.fund) params.fund = args.fund as string;
        if (args?.department) params.department = args.department as string;
        if (args?.fiscal_year) params.fiscal_year = args.fiscal_year as string;
        if (args?.status) params.status = args.status as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'get_purchase_orders': {
        const endpoint = args?.po_number ? `/purchase-orders/${args.po_number}` : '/purchase-orders';
        const params: Record<string, string> = {};
        if (args?.vendor_id) params.vendor_id = args.vendor_id as string;
        if (args?.status) params.status = args.status as string;
        if (args?.date_from) params.date_from = args.date_from as string;
        if (args?.date_to) params.date_to = args.date_to as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'get_vendors': {
        const endpoint = args?.vendor_id ? `/vendors/${args.vendor_id}` : '/vendors';
        const params: Record<string, string> = {};
        if (args?.name) params.name = args.name as string;
        if (args?.status) params.status = args.status as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'get_payments': {
        const endpoint = args?.payment_id ? `/payments/${args.payment_id}` : '/payments';
        const params: Record<string, string> = {};
        if (args?.vendor_id) params.vendor_id = args.vendor_id as string;
        if (args?.date_from) params.date_from = args.date_from as string;
        if (args?.date_to) params.date_to = args.date_to as string;
        if (args?.status) params.status = args.status as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'get_grants': {
        const endpoint = args?.grant_id ? `/grants/${args.grant_id}` : '/grants';
        const params: Record<string, string> = {};
        if (args?.agency) params.agency = args.agency as string;
        if (args?.status) params.status = args.status as string;
        if (args?.fiscal_year) params.fiscal_year = args.fiscal_year as string;
        response = await api!.get(endpoint, { params });
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
  console.error('CGI Advantage/Momentum MCP server running on stdio');
}

main().catch(console.error);
