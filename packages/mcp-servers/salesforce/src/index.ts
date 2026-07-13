#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import jsforce from 'jsforce';

let conn: any = null;

const server = new Server(
  { name: 'salesforce-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

async function initConnection() {
  conn = new jsforce.Connection({
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
    accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
    version: process.env.SALESFORCE_API_VERSION || '59.0',
  });

  // If using username/password instead
  if (process.env.SALESFORCE_USERNAME && process.env.SALESFORCE_PASSWORD) {
    const securityToken = process.env.SALESFORCE_SECURITY_TOKEN || '';
    await conn.login(
      process.env.SALESFORCE_USERNAME,
      process.env.SALESFORCE_PASSWORD + securityToken
    );
  }

  console.error(`Connected to Salesforce: ${conn.instanceUrl}`);
}

async function querySalesforce(soql: string) {
  if (!conn) throw new Error('Not connected to Salesforce');
  try {
    const result = await conn.query(soql);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              totalSize: result.totalSize,
              done: result.done,
              records: result.records,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [{ type: 'text' as const, text: `Salesforce Error: ${error.message}` }],
      isError: true,
    };
  }
}

async function createRecord(objectName: string, data: any) {
  if (!conn) throw new Error('Not connected');
  try {
    const result = await conn.sobject(objectName).create(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function updateRecord(objectName: string, id: string, data: any) {
  if (!conn) throw new Error('Not connected');
  try {
    const result = await conn.sobject(objectName).update({ Id: id, ...data });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function deleteRecord(objectName: string, id: string) {
  if (!conn) throw new Error('Not connected');
  try {
    const result = await conn.sobject(objectName).destroy(id);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function listObjects() {
  if (!conn) throw new Error('Not connected');
  const metadata = await conn.describeGlobal();
  const objects = metadata.sobjects.map((obj: any) => ({
    name: obj.name,
    label: obj.label,
    queryable: obj.queryable,
    createable: obj.createable,
    updateable: obj.updateable,
    deletable: obj.deletable,
  }));
  return { content: [{ type: 'text' as const, text: JSON.stringify(objects, null, 2) }] };
}

async function describeObject(objectName: string) {
  if (!conn) throw new Error('Not connected');
  const metadata = await conn.sobject(objectName).describe();
  const fields = metadata.fields.map((f: any) => ({
    name: f.name,
    label: f.label,
    type: f.type,
    length: f.length,
    required: !f.nillable,
    picklistValues: f.picklistValues?.map((p: any) => p.value),
  }));
  return { content: [{ type: 'text' as const, text: JSON.stringify(fields, null, 2) }] };
}

async function searchRecords(searchTerm: string) {
  if (!conn) throw new Error('Not connected');
  try {
    const result = await conn.search(
      `FIND {${searchTerm}} IN ALL FIELDS RETURNING Account(Id, Name), Contact(Id, Name, Email), Lead(Id, Name, Email), Opportunity(Id, Name, Amount)`
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.searchRecords, null, 2) }],
    };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function getRecentRecords(objectName: string, limit: number = 10) {
  if (!conn) throw new Error('Not connected');
  try {
    const result = await conn
      .sobject(objectName)
      .select('*')
      .sort({ LastModifiedDate: -1 })
      .limit(limit)
      .execute();
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'salesforce://accounts',
      name: 'Recent Accounts',
      description: 'Recently modified accounts',
      mimeType: 'application/json',
    },
    {
      uri: 'salesforce://contacts',
      name: 'Recent Contacts',
      description: 'Recently modified contacts',
      mimeType: 'application/json',
    },
    {
      uri: 'salesforce://opportunities',
      name: 'Open Opportunities',
      description: 'Open sales opportunities',
      mimeType: 'application/json',
    },
    {
      uri: 'salesforce://leads',
      name: 'Recent Leads',
      description: 'Recent leads',
      mimeType: 'application/json',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const uri = request.params.uri;
  let result: any;

  if (uri === 'salesforce://accounts') {
    result = await conn.query(
      'SELECT Id, Name, Industry, AnnualRevenue, Website FROM Account ORDER BY LastModifiedDate DESC LIMIT 50'
    );
  } else if (uri === 'salesforce://contacts') {
    result = await conn.query(
      'SELECT Id, Name, Email, Phone, Account.Name FROM Contact ORDER BY LastModifiedDate DESC LIMIT 50'
    );
  } else if (uri === 'salesforce://opportunities') {
    result = await conn.query(
      'SELECT Id, Name, Amount, StageName, CloseDate, Account.Name FROM Opportunity WHERE IsClosed = false ORDER BY CloseDate ASC LIMIT 50'
    );
  } else if (uri === 'salesforce://leads') {
    result = await conn.query(
      'SELECT Id, Name, Email, Company, Status FROM Lead ORDER BY CreatedDate DESC LIMIT 50'
    );
  } else {
    throw new Error(`Unknown resource: ${uri}`);
  }

  return {
    contents: [
      { uri, mimeType: 'application/json', text: JSON.stringify(result.records, null, 2) },
    ],
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'query',
      description: 'Execute SOQL query on Salesforce',
      inputSchema: {
        type: 'object',
        properties: { soql: { type: 'string', description: 'SOQL query' } },
        required: ['soql'],
      },
    },
    {
      name: 'search',
      description: 'Search across Salesforce objects using SOSL',
      inputSchema: {
        type: 'object',
        properties: { term: { type: 'string', description: 'Search term' } },
        required: ['term'],
      },
    },
    {
      name: 'list_objects',
      description: 'List all available Salesforce objects',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'describe_object',
      description: 'Get field details for a Salesforce object',
      inputSchema: {
        type: 'object',
        properties: { object: { type: 'string', description: 'Object API name' } },
        required: ['object'],
      },
    },
    {
      name: 'create_record',
      description: 'Create a new record in Salesforce',
      inputSchema: {
        type: 'object',
        properties: {
          object: { type: 'string', description: 'Object API name' },
          data: { type: 'object', description: 'Record data as key-value pairs' },
        },
        required: ['object', 'data'],
      },
    },
    {
      name: 'update_record',
      description: 'Update an existing Salesforce record',
      inputSchema: {
        type: 'object',
        properties: {
          object: { type: 'string', description: 'Object API name' },
          id: { type: 'string', description: 'Record ID' },
          data: { type: 'object', description: 'Fields to update' },
        },
        required: ['object', 'id', 'data'],
      },
    },
    {
      name: 'delete_record',
      description: 'Delete a Salesforce record',
      inputSchema: {
        type: 'object',
        properties: {
          object: { type: 'string', description: 'Object API name' },
          id: { type: 'string', description: 'Record ID' },
        },
        required: ['object', 'id'],
      },
    },
    {
      name: 'get_recent',
      description: 'Get recently modified records of an object type',
      inputSchema: {
        type: 'object',
        properties: {
          object: { type: 'string', description: 'Object API name' },
          limit: { type: 'number', description: 'Max records to return (default 10)' },
        },
        required: ['object'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'query':
      return querySalesforce((args as any).soql);

    case 'search':
      return searchRecords((args as any).term);

    case 'list_objects':
      return listObjects();

    case 'describe_object':
      return describeObject((args as any).object);

    case 'create_record':
      return createRecord((args as any).object, (args as any).data);

    case 'update_record':
      return updateRecord((args as any).object, (args as any).id, (args as any).data);

    case 'delete_record':
      return deleteRecord((args as any).object, (args as any).id);

    case 'get_recent':
      return getRecentRecords((args as any).object, (args as any).limit);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Salesforce MCP Server running with full CRM capabilities');
}

main();
