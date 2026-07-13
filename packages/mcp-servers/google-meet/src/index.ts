#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.GOOGLE_ACCESS_TOKEN) console.error('Warning: GOOGLE_ACCESS_TOKEN not set');

  api = axios.create({
    baseURL: 'https://www.googleapis.com/calendar/v3',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_events',
    description: 'List calendar events',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_event',
    description: 'Get event details',
    inputSchema: {
      type: 'object' as const,
      properties: { eventId: { type: 'string', description: 'The eventId' } },
      required: ['eventId'],
    },
  },
  {
    name: 'create_meeting',
    description: 'Create a meeting with Google Meet link',
    inputSchema: {
      type: 'object' as const,
      properties: {
        summary: { type: 'string', description: 'The summary' },
        start: { type: 'string', description: 'The start' },
        end: { type: 'string', description: 'The end' },
        attendees: { type: 'string', description: 'The attendees' },
      },
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
    { name: 'google-meet-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_events':
        return safeCall(() => api.get(`/calendars/primary/events`));
      case 'get_event':
        return safeCall(() => api.get(`/calendars/primary/events/${a.eventId}`));
      case 'create_meeting':
        return safeCall(() =>
          api.post(`/calendars/primary/events`, {
            summary: a.summary,
            start: a.start,
            end: a.end,
            attendees: a.attendees,
          })
        );
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Google Meet MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
