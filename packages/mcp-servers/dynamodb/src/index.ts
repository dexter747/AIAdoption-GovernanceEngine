#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynamoDBClient, ListTablesCommand, DescribeTableCommand, ScanCommand, QueryCommand, PutItemCommand, DeleteItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/client-dynamodb';

let docClient: DynamoDBDocumentClient | null = null;
let rawClient: DynamoDBClient | null = null;

const TOOLS: Tool[] = [
  { name: 'list_tables', description: 'List all DynamoDB tables', inputSchema: { type: 'object', properties: {} } },
  { name: 'describe_table', description: 'Get table details', inputSchema: { type: 'object', properties: { table: { type: 'string' } }, required: ['table'] } },
  { name: 'scan', description: 'Scan a table', inputSchema: { type: 'object', properties: { table: { type: 'string' }, filter: { type: 'string', description: 'Filter expression' }, limit: { type: 'number' } }, required: ['table'] } },
  { name: 'query', description: 'Query a table', inputSchema: { type: 'object', properties: { table: { type: 'string' }, keyCondition: { type: 'string', description: 'Key condition expression' }, expressionValues: { type: 'object' }, limit: { type: 'number' } }, required: ['table', 'keyCondition'] } },
  { name: 'get_item', description: 'Get item by key', inputSchema: { type: 'object', properties: { table: { type: 'string' }, key: { type: 'object' } }, required: ['table', 'key'] } },
  { name: 'put_item', description: 'Put an item', inputSchema: { type: 'object', properties: { table: { type: 'string' }, item: { type: 'object' } }, required: ['table', 'item'] } },
];

const server = new Server({ name: 'dynamodb-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function initConnection() {
  rawClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.DYNAMODB_ENDPOINT,
    credentials: process.env.AWS_ACCESS_KEY_ID ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    } : undefined,
  });
  docClient = DynamoDBDocumentClient.from(rawClient);
  const result = await rawClient.send(new ListTablesCommand({}));
  console.error(`Connected to DynamoDB, ${result.TableNames?.length || 0} tables`);
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!rawClient) throw new Error('Not connected');
  try {
    switch (name) {
      case 'list_tables': {
        const r = await rawClient.send(new ListTablesCommand({}));
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.TableNames, null, 2) }] };
      }
      case 'describe_table': {
        const r = await rawClient.send(new DescribeTableCommand({ TableName: (args as any).table }));
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.Table, null, 2) }] };
      }
      case 'scan': {
        const r = await rawClient.send(new ScanCommand({ TableName: (args as any).table, FilterExpression: (args as any).filter, Limit: (args as any).limit || 25 }));
        const items = r.Items?.map(i => unmarshall(i)) || [];
        return { content: [{ type: 'text' as const, text: JSON.stringify({ items, count: r.Count, scannedCount: r.ScannedCount }, null, 2) }] };
      }
      case 'query': {
        const exprValues = (args as any).expressionValues ? marshall((args as any).expressionValues) : undefined;
        const r = await rawClient.send(new QueryCommand({ TableName: (args as any).table, KeyConditionExpression: (args as any).keyCondition, ExpressionAttributeValues: exprValues, Limit: (args as any).limit || 25 }));
        const items = r.Items?.map(i => unmarshall(i)) || [];
        return { content: [{ type: 'text' as const, text: JSON.stringify({ items, count: r.Count }, null, 2) }] };
      }
      case 'get_item': {
        const r = await rawClient.send(new GetItemCommand({ TableName: (args as any).table, Key: marshall((args as any).key) }));
        return { content: [{ type: 'text' as const, text: JSON.stringify(r.Item ? unmarshall(r.Item) : null, null, 2) }] };
      }
      case 'put_item': {
        await rawClient.send(new PutItemCommand({ TableName: (args as any).table, Item: marshall((args as any).item) }));
        return { content: [{ type: 'text' as const, text: 'Item created successfully' }] };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DynamoDB MCP Server running on stdio');
}

main();
