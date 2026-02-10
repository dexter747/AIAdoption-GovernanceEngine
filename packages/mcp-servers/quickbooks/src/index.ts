import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;
let realmId: string;

function initConnection(): void {
  const accessToken = process.env.QUICKBOOKS_ACCESS_TOKEN;
  realmId = process.env.QUICKBOOKS_REALM_ID || '';
  const apiUrl = process.env.QUICKBOOKS_API_URL || 'https://quickbooks.api.intuit.com';

  if (!accessToken || !realmId) {
    throw new Error('QUICKBOOKS_ACCESS_TOKEN and QUICKBOOKS_REALM_ID environment variables are required');
  }

  api = axios.create({
    baseURL: `${apiUrl}/v3/company/${realmId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

const tools: Tool[] = [
  {
    name: 'query',
    description: 'Execute a QuickBooks Online SQL-like query (e.g., "SELECT * FROM Invoice WHERE TotalAmt > 100")',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'QBO SQL-like query string' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_customers',
    description: 'List customers from QuickBooks Online',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: { type: 'number', description: 'Maximum number of results', default: 100 },
        startPosition: { type: 'number', description: 'Starting position for pagination', default: 1 },
        where: { type: 'string', description: 'Optional WHERE clause (e.g., "Active = true")' },
      },
    },
  },
  {
    name: 'get_invoices',
    description: 'List invoices from QuickBooks Online',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: { type: 'number', description: 'Maximum number of results', default: 100 },
        startPosition: { type: 'number', description: 'Starting position for pagination', default: 1 },
        where: { type: 'string', description: 'Optional WHERE clause (e.g., "Balance > 0")' },
      },
    },
  },
  {
    name: 'get_payments',
    description: 'List payments from QuickBooks Online',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: { type: 'number', description: 'Maximum number of results', default: 100 },
        startPosition: { type: 'number', description: 'Starting position for pagination', default: 1 },
        where: { type: 'string', description: 'Optional WHERE clause' },
      },
    },
  },
  {
    name: 'get_accounts',
    description: 'Get chart of accounts from QuickBooks Online',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: { type: 'number', description: 'Maximum number of results', default: 100 },
        startPosition: { type: 'number', description: 'Starting position for pagination', default: 1 },
        accountType: { type: 'string', description: 'Filter by account type (e.g., "Bank", "Expense")' },
      },
    },
  },
  {
    name: 'get_bills',
    description: 'List bills from QuickBooks Online',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: { type: 'number', description: 'Maximum number of results', default: 100 },
        startPosition: { type: 'number', description: 'Starting position for pagination', default: 1 },
        where: { type: 'string', description: 'Optional WHERE clause' },
      },
    },
  },
  {
    name: 'get_profit_loss_report',
    description: 'Get Profit and Loss report from QuickBooks Online',
    inputSchema: {
      type: 'object',
      properties: {
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        accounting_method: { type: 'string', description: 'Accrual or Cash', default: 'Accrual' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom QuickBooks Online API call',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE)', default: 'GET' },
        endpoint: { type: 'string', description: 'API endpoint path (e.g., /query, /invoice/1)' },
        data: { type: 'object', description: 'Request body for POST/PUT requests' },
      },
      required: ['endpoint'],
    },
  },
];

function buildQuery(entity: string, args: Record<string, unknown>): string {
  const maxResults = args.maxResults || 100;
  const startPosition = args.startPosition || 1;
  let query = `SELECT * FROM ${entity}`;
  if (args.where) query += ` WHERE ${args.where}`;
  if (args.accountType) query += ` WHERE AccountType = '${args.accountType}'`;
  query += ` MAXRESULTS ${maxResults} STARTPOSITION ${startPosition}`;
  return query;
}

async function handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'query': {
      const response = await api.get('/query', {
        params: { query: args.query },
      });
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_customers': {
      const query = buildQuery('Customer', args);
      const response = await api.get('/query', { params: { query } });
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_invoices': {
      const query = buildQuery('Invoice', args);
      const response = await api.get('/query', { params: { query } });
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_payments': {
      const query = buildQuery('Payment', args);
      const response = await api.get('/query', { params: { query } });
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_accounts': {
      const query = buildQuery('Account', args);
      const response = await api.get('/query', { params: { query } });
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_bills': {
      const query = buildQuery('Bill', args);
      const response = await api.get('/query', { params: { query } });
      return JSON.stringify(response.data, null, 2);
    }
    case 'get_profit_loss_report': {
      const params: Record<string, unknown> = {
        accounting_method: args.accounting_method || 'Accrual',
      };
      if (args.start_date) params.start_date = args.start_date;
      if (args.end_date) params.end_date = args.end_date;
      const response = await api.get('/reports/ProfitAndLoss', { params });
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
    { name: 'quickbooks-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
  console.error('QuickBooks MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
