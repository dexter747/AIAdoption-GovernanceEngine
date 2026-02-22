import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.FINASTRA_API_URL || '';
const ACCESS_TOKEN = process.env.FINASTRA_ACCESS_TOKEN || '';

let api: AxiosInstance | null = null;

async function initConnection(): Promise<void> {
  if (api) return;
  api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
}

const tools: Tool[] = [
  {
    name: 'get_accounts',
    description: 'Retrieve accounts from Finastra',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'Customer identifier' },
        accountType: { type: 'string', description: 'Filter by account type' },
      },
    },
  },
  {
    name: 'get_loans',
    description: 'Retrieve loan information from Finastra',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'Customer identifier' },
        loanId: { type: 'string', description: 'Specific loan identifier' },
        status: { type: 'string', description: 'Loan status filter' },
      },
    },
  },
  {
    name: 'get_payments',
    description: 'Retrieve payment records from Finastra',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Account identifier' },
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        status: { type: 'string', description: 'Payment status filter' },
      },
    },
  },
  {
    name: 'get_trades',
    description: 'Retrieve trade records from Finastra',
    inputSchema: {
      type: 'object',
      properties: {
        portfolioId: { type: 'string', description: 'Portfolio identifier' },
        tradeType: { type: 'string', description: 'Type of trade' },
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      },
    },
  },
  {
    name: 'get_positions',
    description: 'Retrieve current positions from Finastra',
    inputSchema: {
      type: 'object',
      properties: {
        portfolioId: { type: 'string', description: 'Portfolio identifier' },
        instrumentType: { type: 'string', description: 'Instrument type filter' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a raw API call to Finastra',
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
  { name: 'finastra-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  await initConnection();
  if (!api) {
    return {
      content: [
        {
          type: 'text',
          text: 'Finastra API connection not initialized. Check environment variables.',
        },
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

      case 'get_loans': {
        const params: Record<string, string> = {};
        if (args?.customerId) params.customerId = args.customerId as string;
        if (args?.loanId) params.loanId = args.loanId as string;
        if (args?.status) params.status = args.status as string;
        const response = await api.get('/loans', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_payments': {
        const params: Record<string, string> = {};
        if (args?.accountId) params.accountId = args.accountId as string;
        if (args?.startDate) params.startDate = args.startDate as string;
        if (args?.endDate) params.endDate = args.endDate as string;
        if (args?.status) params.status = args.status as string;
        const response = await api.get('/payments', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_trades': {
        const params: Record<string, string> = {};
        if (args?.portfolioId) params.portfolioId = args.portfolioId as string;
        if (args?.tradeType) params.tradeType = args.tradeType as string;
        if (args?.startDate) params.startDate = args.startDate as string;
        if (args?.endDate) params.endDate = args.endDate as string;
        const response = await api.get('/trades', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_positions': {
        const params: Record<string, string> = {};
        if (args?.portfolioId) params.portfolioId = args.portfolioId as string;
        if (args?.instrumentType) params.instrumentType = args.instrumentType as string;
        const response = await api.get('/positions', { params });
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
    return { content: [{ type: 'text', text: `Finastra API error: ${message}` }], isError: true };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Finastra MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
