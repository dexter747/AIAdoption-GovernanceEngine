#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'jira-mcp-server', version: '1.0.0' }, 
  { capabilities: { tools: {}, resources: {} } }
);

const baseUrl = process.env.JIRA_BASE_URL;
const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');

async function makeRequest(endpoint: string, method: string = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: { 
      'Authorization': `Basic ${auth}`, 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${baseUrl}/rest/api/3/${endpoint}`, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jira API Error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

async function searchIssues(jql: string, maxResults: number = 50) {
  try {
    const data = await makeRequest(`search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}`);
    const issues = data.issues.map((i: any) => ({
      key: i.key,
      summary: i.fields.summary,
      status: i.fields.status?.name,
      priority: i.fields.priority?.name,
      assignee: i.fields.assignee?.displayName,
      reporter: i.fields.reporter?.displayName,
      created: i.fields.created,
      updated: i.fields.updated,
    }));
    return { content: [{ type: 'text' as const, text: JSON.stringify(issues, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function getIssue(key: string) {
  try {
    const data = await makeRequest(`issue/${key}?expand=changelog,comments`);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function createIssue(projectKey: string, issueType: string, summary: string, description?: string, priority?: string, assignee?: string) {
  try {
    const body: any = {
      fields: {
        project: { key: projectKey },
        issuetype: { name: issueType },
        summary,
      }
    };
    
    if (description) body.fields.description = { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: description }] }] };
    if (priority) body.fields.priority = { name: priority };
    if (assignee) body.fields.assignee = { accountId: assignee };
    
    const data = await makeRequest('issue', 'POST', body);
    return { content: [{ type: 'text' as const, text: JSON.stringify({ key: data.key, self: data.self }, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function updateIssue(key: string, fields: any) {
  try {
    await makeRequest(`issue/${key}`, 'PUT', { fields });
    return { content: [{ type: 'text' as const, text: `Issue ${key} updated successfully` }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function transitionIssue(key: string, transitionId: string) {
  try {
    await makeRequest(`issue/${key}/transitions`, 'POST', { transition: { id: transitionId } });
    return { content: [{ type: 'text' as const, text: `Issue ${key} transitioned successfully` }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function addComment(key: string, comment: string) {
  try {
    const body = {
      body: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: comment }] }] }
    };
    await makeRequest(`issue/${key}/comment`, 'POST', body);
    return { content: [{ type: 'text' as const, text: `Comment added to ${key}` }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function getTransitions(key: string) {
  try {
    const data = await makeRequest(`issue/${key}/transitions`);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data.transitions, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    { uri: 'jira://myissues', name: 'My Issues', description: 'Issues assigned to current user', mimeType: 'application/json' },
    { uri: 'jira://recent', name: 'Recent Issues', description: 'Recently updated issues', mimeType: 'application/json' },
    { uri: 'jira://sprints', name: 'Active Sprints', description: 'Currently active sprints', mimeType: 'application/json' },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  let data: any;
  
  if (uri === 'jira://myissues') {
    data = await makeRequest('search?jql=assignee=currentUser() AND resolution=Unresolved ORDER BY updated DESC&maxResults=50');
  } else if (uri === 'jira://recent') {
    data = await makeRequest('search?jql=updated >= -7d ORDER BY updated DESC&maxResults=50');
  } else if (uri === 'jira://sprints') {
    data = await makeRequest('board?type=scrum');
  } else {
    throw new Error(`Unknown resource: ${uri}`);
  }
  
  return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(data.issues || data.values, null, 2) }] };
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { 
      name: 'search_issues', 
      description: 'Search Jira issues with JQL query', 
      inputSchema: { 
        type: 'object', 
        properties: { 
          jql: { type: 'string', description: 'JQL query (e.g., "project=PROJ AND status=Open")' },
          maxResults: { type: 'number', description: 'Max results to return (default 50)' }
        }, 
        required: ['jql'] 
      } 
    },
    { 
      name: 'get_issue', 
      description: 'Get full issue details including comments and history', 
      inputSchema: { type: 'object', properties: { key: { type: 'string', description: 'Issue key (e.g., PROJ-123)' } }, required: ['key'] } 
    },
    { 
      name: 'create_issue', 
      description: 'Create a new Jira issue', 
      inputSchema: { 
        type: 'object', 
        properties: { 
          project: { type: 'string', description: 'Project key' },
          type: { type: 'string', description: 'Issue type (Bug, Story, Task, Epic)' },
          summary: { type: 'string', description: 'Issue summary' },
          description: { type: 'string', description: 'Detailed description' },
          priority: { type: 'string', description: 'Priority (Highest, High, Medium, Low, Lowest)' },
          assignee: { type: 'string', description: 'Assignee account ID' }
        }, 
        required: ['project', 'type', 'summary'] 
      } 
    },
    { 
      name: 'update_issue', 
      description: 'Update issue fields', 
      inputSchema: { 
        type: 'object', 
        properties: { 
          key: { type: 'string', description: 'Issue key' },
          summary: { type: 'string', description: 'New summary' },
          priority: { type: 'string', description: 'New priority' },
          assignee: { type: 'string', description: 'New assignee account ID' }
        }, 
        required: ['key'] 
      } 
    },
    { 
      name: 'transition_issue', 
      description: 'Move issue to a different status', 
      inputSchema: { 
        type: 'object', 
        properties: { 
          key: { type: 'string', description: 'Issue key' },
          transitionId: { type: 'string', description: 'Transition ID (use get_transitions to find)' }
        }, 
        required: ['key', 'transitionId'] 
      } 
    },
    { 
      name: 'get_transitions', 
      description: 'Get available transitions for an issue', 
      inputSchema: { type: 'object', properties: { key: { type: 'string', description: 'Issue key' } }, required: ['key'] } 
    },
    { 
      name: 'add_comment', 
      description: 'Add a comment to an issue', 
      inputSchema: { 
        type: 'object', 
        properties: { 
          key: { type: 'string', description: 'Issue key' },
          comment: { type: 'string', description: 'Comment text' }
        }, 
        required: ['key', 'comment'] 
      } 
    },
    { 
      name: 'list_projects', 
      description: 'List all accessible Jira projects', 
      inputSchema: { type: 'object', properties: {} } 
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = args as any;
  
  switch (name) {
    case 'search_issues':
      return searchIssues(a.jql, a.maxResults);
    
    case 'get_issue':
      return getIssue(a.key);
    
    case 'create_issue':
      return createIssue(a.project, a.type, a.summary, a.description, a.priority, a.assignee);
    
    case 'update_issue':
      const fields: any = {};
      if (a.summary) fields.summary = a.summary;
      if (a.priority) fields.priority = { name: a.priority };
      if (a.assignee) fields.assignee = { accountId: a.assignee };
      return updateIssue(a.key, fields);
    
    case 'transition_issue':
      return transitionIssue(a.key, a.transitionId);
    
    case 'get_transitions':
      return getTransitions(a.key);
    
    case 'add_comment':
      return addComment(a.key, a.comment);
    
    case 'list_projects':
      try {
        const data = await makeRequest('project');
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
      }
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  console.error(`Connecting to Jira: ${baseUrl}`);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Jira MCP Server running with full issue tracking capabilities');
}

main();
