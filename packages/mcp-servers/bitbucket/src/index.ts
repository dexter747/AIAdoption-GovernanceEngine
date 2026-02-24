#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.BITBUCKET_USERNAME) console.error('Warning: BITBUCKET_USERNAME not set');
  if (!process.env.BITBUCKET_APP_PASSWORD) console.error('Warning: BITBUCKET_APP_PASSWORD not set');

  api = axios.create({
    baseURL: process.env.BITBUCKET_USERNAME || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.BITBUCKET_USERNAME || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_repos',
    description: 'List repositories',
    inputSchema: {
      type: 'object' as const,
      properties: { workspace: { type: 'string', description: 'The workspace' } },
      required: ['workspace'],
    },
  },
  {
    name: 'get_repo',
    description: 'Get repository details',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace' },
        repoSlug: { type: 'string', description: 'The repoSlug' },
      },
      required: ['workspace', 'repoSlug'],
    },
  },
  {
    name: 'list_prs',
    description: 'List pull requests',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace' },
        repoSlug: { type: 'string', description: 'The repoSlug' },
      },
      required: ['workspace', 'repoSlug'],
    },
  },
  {
    name: 'list_issues',
    description: 'List issues',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace' },
        repoSlug: { type: 'string', description: 'The repoSlug' },
      },
      required: ['workspace', 'repoSlug'],
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
    { name: 'bitbucket-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_repos':
        return safeCall(() => api.get(`/repositories/${a.workspace}`));
      case 'get_repo':
        return safeCall(() => api.get(`/repositories/${a.workspace}/${a.repoSlug}`));
      case 'list_prs':
        return safeCall(() => api.get(`/repositories/${a.workspace}/${a.repoSlug}/pullrequests`));
      case 'list_issues':
        return safeCall(() => api.get(`/repositories/${a.workspace}/${a.repoSlug}/issues`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Bitbucket MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
