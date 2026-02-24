#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.JENKINS_URL) console.error('Warning: JENKINS_URL not set');
  if (!process.env.JENKINS_USER) console.error('Warning: JENKINS_USER not set');
  if (!process.env.JENKINS_TOKEN) console.error('Warning: JENKINS_TOKEN not set');

  api = axios.create({
    baseURL: process.env.JENKINS_URL || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.JENKINS_URL || ''}`,
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_jobs',
    description: 'List all jobs',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_job',
    description: 'Get job details',
    inputSchema: {
      type: 'object' as const,
      properties: { jobName: { type: 'string', description: 'The jobName' } },
      required: ['jobName'],
    },
  },
  {
    name: 'get_build',
    description: 'Get build details',
    inputSchema: {
      type: 'object' as const,
      properties: {
        jobName: { type: 'string', description: 'The jobName' },
        buildNumber: { type: 'string', description: 'The buildNumber' },
      },
      required: ['jobName', 'buildNumber'],
    },
  },
  {
    name: 'trigger_build',
    description: 'Trigger a build',
    inputSchema: {
      type: 'object' as const,
      properties: { jobName: { type: 'string', description: 'The jobName' } },
      required: ['jobName'],
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
    { name: 'jenkins-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_jobs':
        return safeCall(() =>
          api.get(`/api/json?tree=jobs[name,url,color,lastBuild[number,result,timestamp]]`)
        );
      case 'get_job':
        return safeCall(() => api.get(`/job/${a.jobName}/api/json`));
      case 'get_build':
        return safeCall(() => api.get(`/job/${a.jobName}/${a.buildNumber}/api/json`));
      case 'trigger_build':
        return safeCall(() => api.post(`/job/${a.jobName}/build`, {}));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Jenkins MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
