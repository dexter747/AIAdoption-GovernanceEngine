#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import hana from '@sap/hana-client';

let connection: any = null;

const server = new Server(
  { name: 'sap-hana-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

async function initConnection() {
  const connOptions = {
    serverNode: `${process.env.SAP_HANA_HOST}:${process.env.SAP_HANA_PORT}`,
    uid: process.env.SAP_HANA_USER,
    pwd: process.env.SAP_HANA_PASSWORD,
    encrypt: process.env.SAP_HANA_ENCRYPT === 'true',
    sslValidateCertificate: process.env.SAP_HANA_SSL_VALIDATE !== 'false',
  };

  connection = hana.createConnection();
  await new Promise((resolve, reject) => {
    connection.connect(connOptions, (err: any) => {
      if (err) reject(err);
      else resolve(null);
    });
  });
  console.error('Connected to SAP HANA');
}

function executeQuery(sql: string, params: any[] = []): Promise<any> {
  if (!connection) throw new Error('Not connected to SAP HANA');
  return new Promise((resolve, reject) => {
    connection.exec(sql, params, (err: any, rows: any) => {
      if (err) {
        resolve({
          content: [{ type: 'text' as const, text: `SAP HANA Error: ${err.message}` }],
          isError: true,
        });
      } else {
        resolve({ content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] });
      }
    });
  });
}

function getTableSchema(tableName: string): Promise<any> {
  const sql = `
    SELECT COLUMN_NAME, DATA_TYPE_NAME, LENGTH, SCALE, IS_NULLABLE, DEFAULT_VALUE
    FROM SYS.TABLE_COLUMNS 
    WHERE SCHEMA_NAME = CURRENT_SCHEMA 
    AND TABLE_NAME = UPPER(?)
    ORDER BY POSITION
  `;
  return executeQuery(sql, [tableName]);
}

function getTableIndexes(tableName: string): Promise<any> {
  const sql = `
    SELECT INDEX_NAME, COLUMN_NAME, ASCENDING_ORDER
    FROM SYS.INDEX_COLUMNS
    WHERE SCHEMA_NAME = CURRENT_SCHEMA
    AND TABLE_NAME = UPPER(?)
    ORDER BY INDEX_NAME, POSITION
  `;
  return executeQuery(sql, [tableName]);
}

function explainPlan(sql: string): Promise<any> {
  const explainSql = `EXPLAIN PLAN FOR ${sql}`;
  return new Promise(resolve => {
    connection.exec(explainSql, [], (err: any) => {
      if (err) {
        resolve({
          content: [{ type: 'text' as const, text: `Error: ${err.message}` }],
          isError: true,
        });
        return;
      }
      connection.exec(
        `SELECT * FROM EXPLAIN_PLAN_TABLE WHERE STATEMENT_NAME = (SELECT MAX(STATEMENT_NAME) FROM EXPLAIN_PLAN_TABLE)`,
        [],
        (err2: any, rows: any) => {
          if (err2) {
            resolve({
              content: [{ type: 'text' as const, text: `Error: ${err2.message}` }],
              isError: true,
            });
          } else {
            resolve({ content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] });
          }
        }
      );
    });
  });
}

// Resource handlers for schema exploration
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'hana://tables',
      name: 'All Tables',
      description: 'List of all tables in current schema',
      mimeType: 'application/json',
    },
    {
      uri: 'hana://views',
      name: 'All Views',
      description: 'List of all views',
      mimeType: 'application/json',
    },
    {
      uri: 'hana://procedures',
      name: 'Stored Procedures',
      description: 'List of stored procedures',
      mimeType: 'application/json',
    },
    {
      uri: 'hana://calculation-views',
      name: 'Calculation Views',
      description: 'SAP HANA Calculation Views',
      mimeType: 'application/json',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const uri = request.params.uri;
  let sql = '';

  if (uri === 'hana://tables') {
    sql =
      'SELECT TABLE_NAME, RECORD_COUNT, TABLE_TYPE FROM SYS.TABLES WHERE SCHEMA_NAME = CURRENT_SCHEMA ORDER BY TABLE_NAME';
  } else if (uri === 'hana://views') {
    sql =
      'SELECT VIEW_NAME, VIEW_TYPE FROM SYS.VIEWS WHERE SCHEMA_NAME = CURRENT_SCHEMA ORDER BY VIEW_NAME';
  } else if (uri === 'hana://procedures') {
    sql =
      'SELECT PROCEDURE_NAME, INPUT_PARAMETER_COUNT, OUTPUT_PARAMETER_COUNT FROM SYS.PROCEDURES WHERE SCHEMA_NAME = CURRENT_SCHEMA ORDER BY PROCEDURE_NAME';
  } else if (uri === 'hana://calculation-views') {
    sql =
      "SELECT PACKAGE_ID, OBJECT_NAME, OBJECT_SUFFIX FROM _SYS_REPO.ACTIVE_OBJECT WHERE OBJECT_SUFFIX = 'calculationview' ORDER BY OBJECT_NAME";
  } else {
    throw new Error(`Unknown resource: ${uri}`);
  }

  const result: any = await new Promise((resolve, reject) => {
    connection.exec(sql, [], (err: any, rows: any) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  return {
    contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(result, null, 2) }],
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'query',
      description: 'Execute SQL query on SAP HANA',
      inputSchema: {
        type: 'object',
        properties: {
          sql: { type: 'string', description: 'SQL query to execute' },
          params: {
            type: 'array',
            description: 'Query parameters (optional)',
            items: { type: 'string' },
          },
        },
        required: ['sql'],
      },
    },
    {
      name: 'list_tables',
      description: 'List all tables in current schema with row counts',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'describe_table',
      description: 'Get column details for a specific table',
      inputSchema: {
        type: 'object',
        properties: { table: { type: 'string', description: 'Table name' } },
        required: ['table'],
      },
    },
    {
      name: 'get_indexes',
      description: 'Get indexes for a table',
      inputSchema: {
        type: 'object',
        properties: { table: { type: 'string', description: 'Table name' } },
        required: ['table'],
      },
    },
    {
      name: 'explain_plan',
      description: 'Get execution plan for a SQL query',
      inputSchema: {
        type: 'object',
        properties: { sql: { type: 'string', description: 'SQL query to analyze' } },
        required: ['sql'],
      },
    },
    {
      name: 'get_memory_info',
      description: 'Get SAP HANA memory usage information',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_active_connections',
      description: 'Get current active connections',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'query':
      return executeQuery((args as any).sql, (args as any).params || []);

    case 'list_tables':
      return executeQuery(
        'SELECT TABLE_NAME, RECORD_COUNT FROM SYS.TABLES WHERE SCHEMA_NAME = CURRENT_SCHEMA ORDER BY TABLE_NAME'
      );

    case 'describe_table':
      return getTableSchema((args as any).table);

    case 'get_indexes':
      return getTableIndexes((args as any).table);

    case 'explain_plan':
      return explainPlan((args as any).sql);

    case 'get_memory_info':
      return executeQuery('SELECT * FROM SYS.M_SERVICE_MEMORY');

    case 'get_active_connections':
      return executeQuery(
        "SELECT CONNECTION_ID, CONNECTION_STATUS, USER_NAME, CLIENT_HOST FROM SYS.M_CONNECTIONS WHERE CONNECTION_STATUS = 'RUNNING'"
      );

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

function cleanup() {
  if (connection) {
    connection.disconnect();
  }
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SAP HANA MCP Server running with enhanced features');
}

main();
