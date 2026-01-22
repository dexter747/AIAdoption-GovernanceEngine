#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Workday MCP Server
const server = new Server(
  {
    name: 'workday-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const WORKDAY_TENANT = process.env.WORKDAY_TENANT || '';
const WORKDAY_USERNAME = process.env.WORKDAY_USERNAME || '';
const WORKDAY_PASSWORD = process.env.WORKDAY_PASSWORD || '';
const BASE_URL = `https://wd2-impl-services1.workday.com/ccx/service/${WORKDAY_TENANT}`;

async function workdayRequest(service: string, endpoint: string, options: RequestInit = {}) {
  const auth = Buffer.from(`${WORKDAY_USERNAME}:${WORKDAY_PASSWORD}`).toString('base64');
  
  const response = await fetch(`${BASE_URL}/${service}/v39.0${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Workday API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'workday_get_workers',
        description: 'Get list of workers (employees)',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of workers to return', default: 100 },
          },
        },
      },
      {
        name: 'workday_get_worker',
        description: 'Get worker details by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Worker ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'workday_get_organizations',
        description: 'Get organizational units',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'Organization type (Company, Department, etc.)' },
          },
        },
      },
      {
        name: 'workday_get_job_postings',
        description: 'Get open job postings',
        inputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string', description: 'Posting status (Open, Closed)', default: 'Open' },
          },
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'workday_get_workers': {
        const { limit = 100 } = args as any;
        const result = await workdayRequest('Human_Resources', `/Workers?limit=${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      
      case 'workday_get_worker': {
        const { id } = args as any;
        const result = await workdayRequest('Human_Resources', `/Workers/${id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      
      case 'workday_get_organizations': {
        const { type } = args as any;
        let endpoint = '/Organizations';
        if (type) {
          endpoint += `?type=${encodeURIComponent(type)}`;
        }
        const result = await workdayRequest('Human_Resources', endpoint);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      
      case 'workday_get_job_postings': {
        const { status = 'Open' } = args as any;
        const result = await workdayRequest('Recruiting', `/Job_Postings?status=${status}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
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
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Workday MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
