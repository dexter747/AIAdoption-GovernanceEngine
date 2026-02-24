#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.ZOOM_ACCESS_TOKEN) console.error('Warning: ZOOM_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: process.env.ZOOM_ACCESS_TOKEN || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.ZOOM_ACCESS_TOKEN || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_meetings',
    description: 'List scheduled meetings',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_meeting',
    description: 'Get meeting details',
    inputSchema: {
      type: 'object' as const,
      properties: { meetingId: { type: 'string', description: 'The meetingId' } },
      required: ['meetingId'],
    },
  },
  {
    name: 'create_meeting',
    description: 'Create a new meeting',
    inputSchema: {
      type: 'object' as const,
      properties: {
        topic: { type: 'string', description: 'The topic' },
        type: { type: 'string', description: 'The type' },
        start_time: { type: 'string', description: 'The start_time' },
        duration: { type: 'string', description: 'The duration' },
        agenda: { type: 'string', description: 'The agenda' },
      },
    },
  },
  {
    name: 'list_recordings',
    description: 'List cloud recordings',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_users',
    description: 'List account users',
    inputSchema: {
      type: 'object' as const,
      properties: {},
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
    { name: 'zoom-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_meetings':
        return safeCall(() => api.get(`/users/me/meetings`));
      case 'get_meeting':
        return safeCall(() => api.get(`/meetings/${a.meetingId}`));
      case 'create_meeting':
        return safeCall(() =>
          api.post(`/users/me/meetings`, {
            topic: a.topic,
            type: a.type,
            start_time: a.start_time,
            duration: a.duration,
            agenda: a.agenda,
          })
        );
      case 'list_recordings':
        return safeCall(() => api.get(`/users/me/recordings`));
      case 'list_users':
        return safeCall(() => api.get(`/users`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Zoom MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
