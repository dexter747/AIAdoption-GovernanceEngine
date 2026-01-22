#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'jira-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function makeRequest(endpoint: string) {
  const baseUrl = process.env.JIRA_BASE_URL;
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
  
  const response = await fetch(`${baseUrl}/rest/api/3/${endpoint}`, {
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' }
  });
  return response.json();
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'search_issues', description: 'Search Jira issues with JQL', inputSchema: { type: 'object', properties: { jql: { type: 'string' } }, required: ['jql'] } },
    { name: 'get_issue', description: 'Get issue by key', inputSchema: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] } },
    { name: 'list_projects', description: 'List all projects', inputSchema: { type: 'object', properties: {} } },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    if (name === 'search_issues') {
      const data = await makeRequest(`search?jql=${encodeURIComponent((args as any).jql)}`);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data.issues, null, 2) }] };
    }
    if (name === 'get_issue') {
      const data = await makeRequest(`issue/${(args as any).key}`);
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    }
    if (name === 'list_projects') {
      const data = await makeRequest('project');
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Jira MCP Server running');
}
main();
