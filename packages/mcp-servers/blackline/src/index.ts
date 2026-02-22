import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.BLACKLINE_API_URL || '';
const ACCESS_TOKEN = process.env.BLACKLINE_ACCESS_TOKEN || '';

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
    description: 'Retrieve accounts from BlackLine',
    inputSchema: {
      type: 'object',
      properties: {
        accountGroup: { type: 'string', description: 'Account group filter' },
        status: { type: 'string', description: 'Account status filter' },
      },
    },
  },
  {
    name: 'get_reconciliations',
    description: 'Retrieve reconciliations from BlackLine',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Account identifier' },
        period: { type: 'string', description: 'Reconciliation period (YYYY-MM)' },
        status: { type: 'string', description: 'Reconciliation status filter' },
      },
    },
  },
  {
    name: 'get_tasks',
    description: 'Retrieve close tasks from BlackLine',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', description: 'Close period (YYYY-MM)' },
        assignee: { type: 'string', description: 'Assigned user filter' },
        status: { type: 'string', description: 'Task status filter' },
      },
    },
  },
  {
    name: 'get_journal_entries',
    description: 'Retrieve journal entries from BlackLine',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', description: 'Period (YYYY-MM)' },
        accountId: { type: 'string', description: 'Account identifier' },
        status: { type: 'string', description: 'Entry status filter' },
      },
    },
  },
  {
    name: 'get_variances',
    description: 'Retrieve account variances from BlackLine',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', description: 'Period (YYYY-MM)' },
        threshold: { type: 'number', description: 'Variance threshold amount' },
        accountGroup: { type: 'string', description: 'Account group filter' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a raw API call to BlackLine',
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
  { name: 'blackline-mcp-server', version: '1.0.0' },
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
          text: 'BlackLine API connection not initialized. Check environment variables.',
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
        if (args?.accountGroup) params.accountGroup = args.accountGroup as string;
        if (args?.status) params.status = args.status as string;
        const response = await api.get('/accounts', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_reconciliations': {
        const params: Record<string, string> = {};
        if (args?.accountId) params.accountId = args.accountId as string;
        if (args?.period) params.period = args.period as string;
        if (args?.status) params.status = args.status as string;
        const response = await api.get('/reconciliations', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_tasks': {
        const params: Record<string, string> = {};
        if (args?.period) params.period = args.period as string;
        if (args?.assignee) params.assignee = args.assignee as string;
        if (args?.status) params.status = args.status as string;
        const response = await api.get('/tasks', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_journal_entries': {
        const params: Record<string, string> = {};
        if (args?.period) params.period = args.period as string;
        if (args?.accountId) params.accountId = args.accountId as string;
        if (args?.status) params.status = args.status as string;
        const response = await api.get('/journal-entries', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_variances': {
        const params: Record<string, string | number> = {};
        if (args?.period) params.period = args.period as string;
        if (args?.threshold) params.threshold = args.threshold as number;
        if (args?.accountGroup) params.accountGroup = args.accountGroup as string;
        const response = await api.get('/variances', { params });
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
    return { content: [{ type: 'text', text: `BlackLine API error: ${message}` }], isError: true };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('BlackLine MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
