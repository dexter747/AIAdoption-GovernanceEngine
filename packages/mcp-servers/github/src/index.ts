#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.GITHUB_TOKEN) console.error('Warning: GITHUB_TOKEN not set');

  api = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
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
      properties: {},
    },
  },
  {
    name: 'get_repo',
    description: 'Get repository details',
    inputSchema: {
      type: 'object' as const,
      properties: {
        owner: { type: 'string', description: 'The owner' },
        repo: { type: 'string', description: 'The repo' },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'list_issues',
    description: 'List issues',
    inputSchema: {
      type: 'object' as const,
      properties: {
        owner: { type: 'string', description: 'The owner' },
        repo: { type: 'string', description: 'The repo' },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'list_prs',
    description: 'List pull requests',
    inputSchema: {
      type: 'object' as const,
      properties: {
        owner: { type: 'string', description: 'The owner' },
        repo: { type: 'string', description: 'The repo' },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'search_code',
    description: 'Search code',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
      required: ['query'],
    },
  },
  {
    name: 'search_issues',
    description: 'Search issues and PRs',
    inputSchema: {
      type: 'object' as const,
      properties: { query: { type: 'string', description: 'The query' } },
      required: ['query'],
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
    { name: 'github-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_repos':
        return safeCall(() => api.get(`/user/repos`));
      case 'get_repo':
        return safeCall(() => api.get(`/repos/${a.owner}/${a.repo}`));
      case 'list_issues':
        return safeCall(() => api.get(`/repos/${a.owner}/${a.repo}/issues`));
      case 'list_prs':
        return safeCall(() => api.get(`/repos/${a.owner}/${a.repo}/pulls`));
      case 'search_code':
        return safeCall(() => api.get(`/search/code?q=${a.query}`));
      case 'search_issues':
        return safeCall(() => api.get(`/search/issues?q=${a.query}`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GitHub MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
