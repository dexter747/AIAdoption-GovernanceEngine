import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.FIS_API_URL || '';
const API_KEY = process.env.FIS_API_KEY || '';
const CLIENT_ID = process.env.FIS_CLIENT_ID || '';
const CLIENT_SECRET = process.env.FIS_CLIENT_SECRET || '';

let api: AxiosInstance | null = null;

async function initConnection(): Promise<void> {
  if (api) return;
  api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'x-client-id': CLIENT_ID,
      'x-client-secret': CLIENT_SECRET,
    },
  });
}

const tools: Tool[] = [
  {
    name: 'get_accounts',
    description: 'Retrieve bank accounts from FIS',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'Customer identifier' },
        accountType: { type: 'string', description: 'Filter by account type' },
      },
    },
  },
  {
    name: 'get_transactions',
    description: 'Retrieve transactions for an account from FIS',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Account identifier' },
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        limit: { type: 'number', description: 'Max results to return' },
      },
      required: ['accountId'],
    },
  },
  {
    name: 'get_payments',
    description: 'Retrieve payments from FIS',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Account identifier' },
        status: { type: 'string', description: 'Payment status filter' },
      },
    },
  },
  {
    name: 'process_payment',
    description: 'Process a payment through FIS',
    inputSchema: {
      type: 'object',
      properties: {
        fromAccountId: { type: 'string', description: 'Source account' },
        toAccountId: { type: 'string', description: 'Destination account' },
        amount: { type: 'number', description: 'Payment amount' },
        currency: { type: 'string', description: 'Currency code (e.g. USD)' },
        memo: { type: 'string', description: 'Payment memo/description' },
      },
      required: ['fromAccountId', 'toAccountId', 'amount', 'currency'],
    },
  },
  {
    name: 'get_statements',
    description: 'Retrieve account statements from FIS',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Account identifier' },
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      },
      required: ['accountId'],
    },
  },
  {
    name: 'api_call',
    description: 'Make a raw API call to FIS',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'HTTP method',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        },
        path: { type: 'string', description: 'API path' },
        body: { type: 'object', description: 'Request body' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'fis-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  await initConnection();
  if (!api) {
    return {
      content: [
        { type: 'text', text: 'FIS API connection not initialized. Check environment variables.' },
      ],
      isError: true,
    };
  }

  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_accounts': {
        const params: Record<string, string> = {};
        if (args?.customerId) params.customerId = args.customerId as string;
        if (args?.accountType) params.accountType = args.accountType as string;
        const response = await api.get('/accounts', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_transactions': {
        const accountId = args?.accountId as string;
        const params: Record<string, string | number> = {};
        if (args?.startDate) params.startDate = args.startDate as string;
        if (args?.endDate) params.endDate = args.endDate as string;
        if (args?.limit) params.limit = args.limit as number;
        const response = await api.get(`/accounts/${accountId}/transactions`, { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_payments': {
        const params: Record<string, string> = {};
        if (args?.accountId) params.accountId = args.accountId as string;
        if (args?.status) params.status = args.status as string;
        const response = await api.get('/payments', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'process_payment': {
        const body = {
          fromAccountId: args?.fromAccountId,
          toAccountId: args?.toAccountId,
          amount: args?.amount,
          currency: args?.currency,
          memo: args?.memo || '',
        };
        const response = await api.post('/payments', body);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_statements': {
        const accountId = args?.accountId as string;
        const params: Record<string, string> = {};
        if (args?.startDate) params.startDate = args.startDate as string;
        if (args?.endDate) params.endDate = args.endDate as string;
        const response = await api.get(`/accounts/${accountId}/statements`, { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'api_call': {
        const method = (args?.method as string).toLowerCase();
        const path = args?.path as string;
        const response = await api.request({
          method,
          url: path,
          data: args?.body,
          params: args?.params,
        });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error: any) {
    const message = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    return { content: [{ type: 'text', text: `FIS API error: ${message}` }], isError: true };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('FIS MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
