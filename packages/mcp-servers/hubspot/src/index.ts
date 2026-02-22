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
    name: 'search_contacts',
    description: 'Search CRM contacts',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        properties: { type: 'array', items: { type: 'string' } },
        limit: { type: 'number' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_contact',
    description: 'Get contact by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        properties: { type: 'array', items: { type: 'string' } },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_companies',
    description: 'Search companies',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' }, limit: { type: 'number' } },
      required: ['query'],
    },
  },
  {
    name: 'get_company',
    description: 'Get company details',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  },
  {
    name: 'search_deals',
    description: 'Search deals',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' }, limit: { type: 'number' } },
      required: ['query'],
    },
  },
  {
    name: 'get_deal',
    description: 'Get deal details',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  },
  {
    name: 'create_contact',
    description: 'Create a contact',
    inputSchema: {
      type: 'object',
      properties: { properties: { type: 'object' } },
      required: ['properties'],
    },
  },
  {
    name: 'create_deal',
    description: 'Create a deal',
    inputSchema: {
      type: 'object',
      properties: { properties: { type: 'object' } },
      required: ['properties'],
    },
  },
  {
    name: 'get_pipelines',
    description: 'Get deal pipelines',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'crm_search',
    description: 'Generic CRM object search',
    inputSchema: {
      type: 'object',
      properties: {
        objectType: { type: 'string' },
        filterGroups: { type: 'array' },
        properties: { type: 'array', items: { type: 'string' } },
        limit: { type: 'number' },
      },
      required: ['objectType'],
    },
  },
];

const server = new Server(
  { name: 'hubspot-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

async function initConnection() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_API_KEY;
  api = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  console.error('Connected to HubSpot');
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;
  if (!api) throw new Error('Not connected');
  try {
    switch (name) {
      case 'search_contacts': {
        const r = await api.post('/crm/v3/objects/contacts/search', {
          query: (args as any).query,
          properties: (args as any).properties || [
            'firstname',
            'lastname',
            'email',
            'phone',
            'company',
          ],
          limit: (args as any).limit || 20,
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_contact': {
        const props = (
          (args as any).properties || ['firstname', 'lastname', 'email', 'phone', 'company']
        ).join(',');
        const r = await api.get(`/crm/v3/objects/contacts/${(args as any).id}`, {
          params: { properties: props },
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'search_companies': {
        const r = await api.post('/crm/v3/objects/companies/search', {
          query: (args as any).query,
          limit: (args as any).limit || 20,
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_company': {
        const r = await api.get(`/crm/v3/objects/companies/${(args as any).id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'search_deals': {
        const r = await api.post('/crm/v3/objects/deals/search', {
          query: (args as any).query,
          limit: (args as any).limit || 20,
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_deal': {
        const r = await api.get(`/crm/v3/objects/deals/${(args as any).id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'create_contact': {
        const r = await api.post('/crm/v3/objects/contacts', {
          properties: (args as any).properties,
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'create_deal': {
        const r = await api.post('/crm/v3/objects/deals', { properties: (args as any).properties });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'get_pipelines': {
        const r = await api.get('/crm/v3/pipelines/deals');
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      case 'crm_search': {
        const r = await api.post(`/crm/v3/objects/${(args as any).objectType}/search`, {
          filterGroups: (args as any).filterGroups || [],
          properties: (args as any).properties,
          limit: (args as any).limit || 20,
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `HubSpot Error: ${error.response?.data?.message || error.message}`,
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
  console.error('HubSpot MCP Server running on stdio');
}

main();
