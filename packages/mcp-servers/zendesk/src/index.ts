#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Zendesk MCP Server
const server = new Server(
  {
    name: 'zendesk-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const ZENDESK_SUBDOMAIN = process.env.ZENDESK_SUBDOMAIN || '';
const ZENDESK_EMAIL = process.env.ZENDESK_EMAIL || '';
const ZENDESK_API_TOKEN = process.env.ZENDESK_API_TOKEN || '';
const BASE_URL = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2`;

async function zendeskRequest(endpoint: string, options: RequestInit = {}) {
  const auth = Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString('base64');
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Zendesk API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'zendesk_list_tickets',
        description: 'List support tickets',
        inputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string', description: 'Filter by status (new, open, pending, solved, closed)' },
            limit: { type: 'number', description: 'Number of tickets to return', default: 25 },
          },
        },
      },
      {
        name: 'zendesk_get_ticket',
        description: 'Get ticket details by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Ticket ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'zendesk_search',
        description: 'Search tickets using Zendesk query syntax',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query (e.g., "status:open priority:high")' },
          },
          required: ['query'],
        },
      },
      {
        name: 'zendesk_list_users',
        description: 'List users',
        inputSchema: {
          type: 'object',
          properties: {
            role: { type: 'string', description: 'Filter by role (end-user, agent, admin)' },
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
      case 'zendesk_list_tickets': {
        const { status, limit = 25 } = args as any;
        let endpoint = `/tickets.json?per_page=${limit}`;
        if (status) {
          endpoint = `/search.json?query=type:ticket status:${status}&per_page=${limit}`;
        }
        const result = await zendeskRequest(endpoint);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.tickets || result.results, null, 2),
            },
          ],
        };
      }
      
      case 'zendesk_get_ticket': {
        const { id } = args as any;
        const result = await zendeskRequest(`/tickets/${id}.json`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.ticket, null, 2),
            },
          ],
        };
      }
      
      case 'zendesk_search': {
        const { query } = args as any;
        const result = await zendeskRequest(`/search.json?query=${encodeURIComponent(query)}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.results, null, 2),
            },
          ],
        };
      }
      
      case 'zendesk_list_users': {
        const { role } = args as any;
        let endpoint = '/users.json';
        if (role) {
          endpoint = `/search.json?query=type:user role:${role}`;
        }
        const result = await zendeskRequest(endpoint);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.users || result.results, null, 2),
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
  console.error('Zendesk MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
