import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

// Environment variables
const AS400_HOST = process.env.AS400_HOST || '';
const AS400_USERNAME = process.env.AS400_USERNAME || '';
const AS400_PASSWORD = process.env.AS400_PASSWORD || '';
const AS400_DATABASE = process.env.AS400_DATABASE || '*SYSBAS';

let api: AxiosInstance | null = null;

function initConnection(): void {
  api = axios.create({
    baseURL: AS400_HOST,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    auth: {
      username: AS400_USERNAME,
      password: AS400_PASSWORD,
    },
  });
}

const tools: Tool[] = [
  {
    name: 'run_sql',
    description: 'Execute SQL statement via IBM i Access Services (ODBC/REST)',
    inputSchema: {
      type: 'object',
      properties: {
        sql: { type: 'string', description: 'SQL statement to execute' },
        library: { type: 'string', description: 'Library (schema) to set as current' },
        limit: { type: 'number', description: 'Maximum number of rows to return', default: 100 },
      },
      required: ['sql'],
    },
  },
  {
    name: 'list_libraries',
    description: 'List libraries (schemas) on the IBM i system',
    inputSchema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'Filter pattern (e.g., "MYLIB*")' },
      },
    },
  },
  {
    name: 'list_files',
    description: 'List physical files (tables) in a library',
    inputSchema: {
      type: 'object',
      properties: {
        library: { type: 'string', description: 'Library name to list files from' },
        filter: { type: 'string', description: 'Filter pattern for file names' },
      },
      required: ['library'],
    },
  },
  {
    name: 'call_program',
    description: 'Call an RPG/COBOL program on the IBM i system',
    inputSchema: {
      type: 'object',
      properties: {
        program: { type: 'string', description: 'Program name (e.g., MYLIB/MYPGM)' },
        library: { type: 'string', description: 'Library containing the program' },
        parameters: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string', description: 'Parameter value' },
              type: {
                type: 'string',
                description: 'Parameter type (char, dec, int)',
                default: 'char',
              },
              length: { type: 'number', description: 'Parameter length' },
              direction: { type: 'string', enum: ['in', 'out', 'inout'], default: 'in' },
            },
            required: ['value'],
          },
          description: 'Program parameters',
        },
      },
      required: ['program'],
    },
  },
  {
    name: 'data_queue_read',
    description: 'Read an entry from a data queue',
    inputSchema: {
      type: 'object',
      properties: {
        dataQueue: { type: 'string', description: 'Data queue name' },
        library: { type: 'string', description: 'Library containing the data queue' },
        wait: {
          type: 'number',
          description: 'Wait time in seconds (0 = no wait, -1 = indefinite)',
          default: 0,
        },
      },
      required: ['dataQueue', 'library'],
    },
  },
  {
    name: 'get_job_log',
    description: 'Get the job log for the current or specified job',
    inputSchema: {
      type: 'object',
      properties: {
        jobName: {
          type: 'string',
          description:
            'Job name (e.g., 123456/QUSER/JOBNAME). If omitted, returns current job log.',
        },
        limit: { type: 'number', description: 'Maximum number of log entries', default: 50 },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to IBM i Access Services',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          description: 'HTTP method',
        },
        path: { type: 'string', description: 'API path (relative to base URL)' },
        data: { type: 'object', description: 'Request body for POST/PUT/PATCH' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'as400-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  if (!api) {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: AS/400 connection not initialized. Check AS400_HOST, AS400_USERNAME, and AS400_PASSWORD.',
        },
      ],
    };
  }

  try {
    switch (name) {
      case 'run_sql': {
        const body: any = {
          sql: args?.sql as string,
          database: AS400_DATABASE,
        };
        if (args?.library) body.currentSchema = args.library as string;
        if (args?.limit) body.limit = args.limit as number;
        const response = await api.post('/sql', body);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'list_libraries': {
        const sql = args?.filter
          ? `SELECT SCHEMA_NAME, SCHEMA_TEXT FROM QSYS2.SYSSCHEMAS WHERE SCHEMA_NAME LIKE '${(args.filter as string).replace('*', '%')}'`
          : `SELECT SCHEMA_NAME, SCHEMA_TEXT FROM QSYS2.SYSSCHEMAS FETCH FIRST 100 ROWS ONLY`;
        const response = await api.post('/sql', { sql, database: AS400_DATABASE });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'list_files': {
        const library = args?.library as string;
        let sql = `SELECT TABLE_NAME, TABLE_TEXT, TABLE_TYPE FROM QSYS2.SYSTABLES WHERE TABLE_SCHEMA = '${library}'`;
        if (args?.filter) {
          sql += ` AND TABLE_NAME LIKE '${(args.filter as string).replace('*', '%')}'`;
        }
        sql += ' FETCH FIRST 200 ROWS ONLY';
        const response = await api.post('/sql', { sql, database: AS400_DATABASE });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'call_program': {
        const body: any = {
          program: args?.program as string,
        };
        if (args?.library) body.library = args.library as string;
        if (args?.parameters) body.parameters = args.parameters;
        const response = await api.post('/call', body);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'data_queue_read': {
        const body = {
          dataQueue: args?.dataQueue as string,
          library: args?.library as string,
          wait: (args?.wait as number) ?? 0,
        };
        const response = await api.post('/dtaq/read', body);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_job_log': {
        const params: Record<string, string | number> = {};
        if (args?.jobName) params['job'] = args.jobName as string;
        if (args?.limit) params['limit'] = args.limit as number;
        const response = await api.get('/joblog', { params });
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
  console.error('IBM AS/400 (IBM i) MCP Server running on stdio');
}

main().catch(console.error);
