#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.SLACK_BOT_TOKEN) console.error('Warning: SLACK_BOT_TOKEN not set');

  api = axios.create({
    baseURL: 'https://slack.com/api',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_channels',
    description: 'List all channels',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_channel_history',
    description: 'Get messages from a channel',
    inputSchema: {
      type: 'object' as const,
      properties: { channelId: { type: 'string', description: 'The channelId' } },
      required: ['channelId'],
    },
  },
  {
    name: 'send_message',
    description: 'Send a message to a channel',
    inputSchema: {
      type: 'object' as const,
      properties: {
        channel: { type: 'string', description: 'The channel' },
        text: { type: 'string', description: 'The text' },
      },
    },
  },
  {
    name: 'search_messages',
    description: 'Search messages',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
      required: ['query'],
    },
  },
  {
    name: 'list_users',
    description: 'List workspace users',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_user',
    description: 'Get user profile',
    inputSchema: {
      type: 'object' as const,
      properties: { userId: { type: 'string', description: 'The userId' } },
      required: ['userId'],
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
    { name: 'slack-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_channels':
        return safeCall(() => api.get(`/conversations.list`));
      case 'get_channel_history':
        return safeCall(() => api.get(`/conversations.history?channel=${a.channelId}`));
      case 'send_message':
        return safeCall(() => api.post(`/chat.postMessage`, { channel: a.channel, text: a.text }));
      case 'search_messages':
        return safeCall(() => api.get(`/search.messages?query=${a.query}`));
      case 'list_users':
        return safeCall(() => api.get(`/users.list`));
      case 'get_user':
        return safeCall(() => api.get(`/users.info?user=${a.userId}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Slack MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
