#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'servicenow-mcp-server', version: '1.0.0' }, 
  { capabilities: { tools: {}, resources: {} } }
);

const baseUrl = process.env.SERVICENOW_INSTANCE_URL;
const auth = Buffer.from(`${process.env.SERVICENOW_USERNAME}:${process.env.SERVICENOW_PASSWORD}`).toString('base64');

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
  
  const response = await fetch(`${baseUrl}/api/now/${endpoint}`, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ServiceNow API Error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

async function queryTable(table: string, query?: string, limit: number = 100) {
  try {
    let endpoint = `table/${table}?sysparm_limit=${limit}`;
    if (query) {
      endpoint += `&sysparm_query=${encodeURIComponent(query)}`;
    }
    const data = await makeRequest(endpoint);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data.result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function getRecord(table: string, sysId: string) {
  try {
    const data = await makeRequest(`table/${table}/${sysId}`);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data.result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function createRecord(table: string, data: any) {
  try {
    const result = await makeRequest(`table/${table}`, 'POST', data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result.result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function updateRecord(table: string, sysId: string, data: any) {
  try {
    const result = await makeRequest(`table/${table}/${sysId}`, 'PATCH', data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result.result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function getIncidentStats() {
  try {
    // Get incident counts by priority
    const priorities = ['1', '2', '3', '4', '5'];
    const stats: any = { byPriority: {}, byState: {} };
    
    for (const p of priorities) {
      const result = await makeRequest(`table/incident?sysparm_query=priority=${p}&sysparm_count=true`);
      stats.byPriority[`P${p}`] = result.result?.length || 0;
    }
    
    // Get counts by state
    const states = ['New', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
    for (const state of states) {
      const result = await makeRequest(`table/incident?sysparm_query=state=${state}&sysparm_count=true`);
      stats.byState[state] = result.result?.length || 0;
    }
    
    return { content: [{ type: 'text' as const, text: JSON.stringify(stats, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

// Resource handlers for common ServiceNow data
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    { uri: 'servicenow://incidents/open', name: 'Open Incidents', description: 'All open incidents', mimeType: 'application/json' },
    { uri: 'servicenow://incidents/critical', name: 'Critical Incidents', description: 'P1 and P2 incidents', mimeType: 'application/json' },
    { uri: 'servicenow://changes/pending', name: 'Pending Changes', description: 'Change requests awaiting approval', mimeType: 'application/json' },
    { uri: 'servicenow://problems/open', name: 'Open Problems', description: 'Open problem records', mimeType: 'application/json' },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  let data: any;
  
  if (uri === 'servicenow://incidents/open') {
    data = await makeRequest('table/incident?sysparm_query=active=true&sysparm_limit=100');
  } else if (uri === 'servicenow://incidents/critical') {
    data = await makeRequest('table/incident?sysparm_query=priority<=2^active=true&sysparm_limit=50');
  } else if (uri === 'servicenow://changes/pending') {
    data = await makeRequest('table/change_request?sysparm_query=approval=requested&sysparm_limit=50');
  } else if (uri === 'servicenow://problems/open') {
    data = await makeRequest('table/problem?sysparm_query=active=true&sysparm_limit=50');
  } else {
    throw new Error(`Unknown resource: ${uri}`);
  }
  
  return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(data.result, null, 2) }] };
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { 
      name: 'query_table', 
      description: 'Query any ServiceNow table with optional filter', 
      inputSchema: { 
        type: 'object', 
        properties: { 
          table: { type: 'string', description: 'Table name (e.g., incident, change_request, problem)' }, 
          query: { type: 'string', description: 'Encoded query string (optional)' },
          limit: { type: 'number', description: 'Max records (default 100)' }
        }, 
        required: ['table'] 
      } 
    },
    { 
      name: 'get_record', 
      description: 'Get a specific record by sys_id', 
      inputSchema: { 
        type: 'object', 
        properties: { 
          table: { type: 'string', description: 'Table name' },
          id: { type: 'string', description: 'Record sys_id' } 
        }, 
        required: ['table', 'id'] 
      } 
    },
    { 
      name: 'create_incident', 
      description: 'Create a new incident', 
      inputSchema: { 
        type: 'object', 
        properties: { 
          short_description: { type: 'string', description: 'Short description' },
          description: { type: 'string', description: 'Detailed description' },
          priority: { type: 'number', description: 'Priority (1-5)' },
          urgency: { type: 'number', description: 'Urgency (1-3)' },
          impact: { type: 'number', description: 'Impact (1-3)' },
          assignment_group: { type: 'string', description: 'Assignment group sys_id' },
          caller_id: { type: 'string', description: 'Caller sys_id' }
        }, 
        required: ['short_description'] 
      } 
    },
    { 
      name: 'update_incident', 
      description: 'Update an existing incident', 
      inputSchema: { 
        type: 'object', 
        properties: { 
          id: { type: 'string', description: 'Incident sys_id' },
          state: { type: 'number', description: 'State (1=New, 2=In Progress, 3=On Hold, 6=Resolved, 7=Closed)' },
          work_notes: { type: 'string', description: 'Work notes to add' },
          close_notes: { type: 'string', description: 'Close notes (for resolving)' }
        }, 
        required: ['id'] 
      } 
    },
    { 
      name: 'create_change', 
      description: 'Create a change request', 
      inputSchema: { 
        type: 'object', 
        properties: { 
          short_description: { type: 'string', description: 'Short description' },
          description: { type: 'string', description: 'Detailed description' },
          type: { type: 'string', description: 'Type: standard, normal, emergency' },
          risk: { type: 'string', description: 'Risk level: high, moderate, low' },
          start_date: { type: 'string', description: 'Planned start date (ISO format)' },
          end_date: { type: 'string', description: 'Planned end date (ISO format)' }
        }, 
        required: ['short_description', 'type'] 
      } 
    },
    { 
      name: 'get_incident_stats', 
      description: 'Get incident statistics by priority and state', 
      inputSchema: { type: 'object', properties: {} } 
    },
    { 
      name: 'search_users', 
      description: 'Search for users in ServiceNow', 
      inputSchema: { 
        type: 'object', 
        properties: { 
          name: { type: 'string', description: 'User name to search' } 
        }, 
        required: ['name'] 
      } 
    },
    { 
      name: 'list_assignment_groups', 
      description: 'List available assignment groups', 
      inputSchema: { type: 'object', properties: {} } 
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = args as any;
  
  switch (name) {
    case 'query_table':
      return queryTable(a.table, a.query, a.limit);
    
    case 'get_record':
      return getRecord(a.table, a.id);
    
    case 'create_incident':
      return createRecord('incident', {
        short_description: a.short_description,
        description: a.description,
        priority: a.priority,
        urgency: a.urgency,
        impact: a.impact,
        assignment_group: a.assignment_group,
        caller_id: a.caller_id
      });
    
    case 'update_incident':
      const updateData: any = {};
      if (a.state) updateData.state = a.state;
      if (a.work_notes) updateData.work_notes = a.work_notes;
      if (a.close_notes) updateData.close_notes = a.close_notes;
      return updateRecord('incident', a.id, updateData);
    
    case 'create_change':
      return createRecord('change_request', {
        short_description: a.short_description,
        description: a.description,
        type: a.type,
        risk: a.risk,
        start_date: a.start_date,
        end_date: a.end_date
      });
    
    case 'get_incident_stats':
      return getIncidentStats();
    
    case 'search_users':
      return queryTable('sys_user', `nameLIKE${a.name}`, 20);
    
    case 'list_assignment_groups':
      return queryTable('sys_user_group', 'active=true', 50);
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  console.error(`Connecting to ServiceNow: ${baseUrl}`);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ServiceNow MCP Server running with full ITSM capabilities');
}

main();
