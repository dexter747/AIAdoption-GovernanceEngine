#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

const TOOLS: Tool[] = [
  {
    name: 'query_odata',
    description: 'Query SuccessFactors OData entities',
    inputSchema: {
      type: 'object',
      properties: {
        entity: { type: 'string', description: 'Entity set name (e.g., User, EmpEmployment)' },
        filter: { type: 'string' },
        select: { type: 'string' },
        top: { type: 'number' },
        expand: { type: 'string' },
      },
      required: ['entity'],
    },
  },
  {
    name: 'get_employee',
    description: 'Get employee details',
    inputSchema: {
      type: 'object',
      properties: { userId: { type: 'string' }, select: { type: 'string' } },
      required: ['userId'],
    },
  },
  {
    name: 'search_employees',
    description: 'Search employees',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' }, top: { type: 'number' } },
      required: ['query'],
    },
  },
  {
    name: 'get_org_structure',
    description: 'Get organizational structure',
    inputSchema: { type: 'object', properties: { departmentId: { type: 'string' } } },
  },
  {
    name: 'get_time_off',
    description: 'Get employee time-off data',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
      },
      required: ['userId'],
    },
  },
  {
    name: 'get_goals',
    description: 'Get employee goals',
    inputSchema: {
      type: 'object',
      properties: { userId: { type: 'string' } },
      required: ['userId'],
    },
  },
  {
    name: 'list_entities',
    description: 'List available OData entities',
    inputSchema: { type: 'object', properties: {} },
  },
];

const server = new Server(
  { name: 'sap-successfactors-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

async function initConnection() {
  const baseUrl = process.env.SF_API_URL; // e.g., https://apiXXX.successfactors.com
  const companyId = process.env.SF_COMPANY_ID;
  const username = process.env.SF_USERNAME;
  const password = process.env.SF_PASSWORD;

  api = axios.create({
    baseURL: `${baseUrl}/odata/v2`,
    auth: { username: `${username}@${companyId}`, password: password || '' },
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  });
  console.error(`Connected to SAP SuccessFactors: ${baseUrl}`);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;
  if (!api) throw new Error('Not connected');
  try {
    switch (name) {
      case 'query_odata': {
        const params: any = { $format: 'json' };
        if ((args as any).filter) params['$filter'] = (args as any).filter;
        if ((args as any).select) params['$select'] = (args as any).select;
        if ((args as any).top) params['$top'] = (args as any).top;
        if ((args as any).expand) params['$expand'] = (args as any).expand;
        const r = await api.get(`/${(args as any).entity}`, { params });
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify(r.data.d?.results || r.data.d, null, 2) },
          ],
        };
      }
      case 'get_employee': {
        const params: any = { $format: 'json' };
        if ((args as any).select) params['$select'] = (args as any).select;
        const r = await api.get(`/User('${(args as any).userId}')`, { params });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data.d, null, 2) }] };
      }
      case 'search_employees': {
        const r = await api.get('/User', {
          params: {
            $format: 'json',
            $filter: `substringof('${(args as any).query}', defaultFullName)`,
            $top: (args as any).top || 20,
            $select: 'userId,defaultFullName,email,department,title',
          },
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(r.data.d?.results, null, 2) }],
        };
      }
      case 'get_org_structure': {
        const filter = (args as any).departmentId
          ? `departmentId eq '${(args as any).departmentId}'`
          : '';
        const r = await api.get('/FODepartment', {
          params: { $format: 'json', $filter: filter || undefined, $top: 50 },
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(r.data.d?.results, null, 2) }],
        };
      }
      case 'get_time_off': {
        const r = await api.get('/EmployeeTime', {
          params: { $format: 'json', $filter: `userId eq '${(args as any).userId}'`, $top: 50 },
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(r.data.d?.results, null, 2) }],
        };
      }
      case 'get_goals': {
        const r = await api.get('/Goal_1', {
          params: { $format: 'json', $filter: `userId eq '${(args as any).userId}'`, $top: 50 },
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(r.data.d?.results, null, 2) }],
        };
      }
      case 'list_entities': {
        const r = await api.get('/$metadata');
        return {
          content: [
            {
              type: 'text' as const,
              text: 'Metadata retrieved. Common entities: User, EmpEmployment, EmpJob, PerPersonal, FODepartment, Goal_1, EmployeeTime, EmpCompensation',
            },
          ],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `SF Error: ${error.response?.data?.error?.message?.value || error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SAP SuccessFactors MCP Server running on stdio');
}

main();
