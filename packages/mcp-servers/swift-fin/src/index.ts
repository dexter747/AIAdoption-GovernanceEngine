#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.SWIFT_BASE_URL) console.error('Warning: SWIFT_BASE_URL not set');
  if (!process.env.SWIFT_API_KEY) console.error('Warning: SWIFT_API_KEY not set');
  if (!process.env.SWIFT_CERTIFICATE) console.error('Warning: SWIFT_CERTIFICATE not set');

  api = axios.create({
    baseURL: `${process.env.SWIFT_BASE_URL}/swift/v1`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.SWIFT_API_KEY}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_messages',
    description: 'List SWIFT messages',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_message',
    description: 'Get message details',
    inputSchema: {
      type: 'object' as const,
      properties: { messageId: { type: 'string', description: 'The messageId' } },
      required: ['messageId'],
    },
  },
  {
    name: 'send_message',
    description: 'Send a SWIFT message',
    inputSchema: {
      type: 'object' as const,
      properties: {
        messageType: { type: 'string', description: 'The messageType' },
        sender: { type: 'string', description: 'The sender' },
        receiver: { type: 'string', description: 'The receiver' },
        content: { type: 'string', description: 'The content' },
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
    { name: 'swift-fin-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_messages':
        return safeCall(() => api.get(`/messages`));
      case 'get_message':
        return safeCall(() => api.get(`/messages/${a.messageId}`));
      case 'send_message':
        return safeCall(() =>
          api.post(`/messages`, {
            messageType: a.messageType,
            sender: a.sender,
            receiver: a.receiver,
            content: a.content,
          })
        );
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SWIFT Financial Messaging MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
