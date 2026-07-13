#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.MS_TEAMS_ACCESS_TOKEN) console.error('Warning: MS_TEAMS_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: 'https://graph.microsoft.com/v1.0',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.MS_TEAMS_ACCESS_TOKEN}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_teams',
    description: 'List all teams',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_channels',
    description: 'List channels in a team',
    inputSchema: {
      type: 'object' as const,
      properties: { teamId: { type: 'string', description: 'The teamId' } },
      required: ['teamId'],
    },
  },
  {
    name: 'get_messages',
    description: 'Get messages from a channel',
    inputSchema: {
      type: 'object' as const,
      properties: {
        teamId: { type: 'string', description: 'The teamId' },
        channelId: { type: 'string', description: 'The channelId' },
      },
      required: ['teamId', 'channelId'],
    },
  },
  {
    name: 'send_message',
    description: 'Send a message to a channel',
    inputSchema: {
      type: 'object' as const,
      properties: {
        teamId: { type: 'string', description: 'The teamId' },
        channelId: { type: 'string', description: 'The channelId' },
        content: { type: 'string', description: 'The content' },
      },
      required: ['teamId', 'channelId'],
    },
  },
  {
    name: 'list_members',
    description: 'List team members',
    inputSchema: {
      type: 'object' as const,
      properties: { teamId: { type: 'string', description: 'The teamId' } },
      required: ['teamId'],
    },
  },
  {
    name: 'search',
    description: 'Search messages across Teams',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
    },
  },
];

async function safeCall(
  fn: () => Promise<any>
): Promise<{ content: { type: 'text'; text: string }[] }> {
  try {
    const response = await fn();
    return { content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }] };
  } catch (err: any) {
    const msg = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
    return { content: [{ type: 'text' as const, text: `Error: ${msg}` }] };
  }
}

async function main(): Promise<void> {
  initConnection();

  const server = new Server(
    { name: 'ms-teams-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_teams':
        return safeCall(() => api.get(`/me/joinedTeams`));
      case 'list_channels':
        return safeCall(() => api.get(`/teams/${a.teamId}/channels`));
      case 'get_messages':
        return safeCall(() => api.get(`/teams/${a.teamId}/channels/${a.channelId}/messages`));
      case 'send_message':
        return safeCall(() =>
          api.post(`/teams/${a.teamId}/channels/${a.channelId}/messages`, { content: a.content })
        );
      case 'list_members':
        return safeCall(() => api.get(`/teams/${a.teamId}/members`));
      case 'search':
        return safeCall(() => api.post(`/search/query`, { query: a.query }));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Microsoft Teams MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
