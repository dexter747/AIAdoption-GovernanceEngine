#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import oracledb from 'oracledb';

let connection: any = null;
let poolConnection: any = null;

const server = new Server(
  { name: 'oracle-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

async function initConnection() {
  const config = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING || `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`,
  };
  
  // Create connection pool for better performance
  try {
    poolConnection = await oracledb.createPool({
      ...config,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    connection = await poolConnection.getConnection();
    console.error('Connected to Oracle with connection pool');
  } catch (poolError) {
    // Fallback to single connection
    connection = await oracledb.getConnection(config);
    console.error('Connected to Oracle (single connection)');
  }
}

async function executeQuery(sql: string, params: any[] = []) {
  if (!connection) throw new Error('Not connected to Oracle');
  try {
    const options = { 
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true 
    };
    const result = await connection.execute(sql, params, options);
    return {
      content: [{ 
        type: 'text' as const, 
        text: JSON.stringify({
          rows: result.rows,
          rowsAffected: result.rowsAffected,
          metaData: result.metaData
        }, null, 2) 
      }],
    };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Oracle Error: ${error.message}` }], isError: true };
  }
}

async function getTableSchema(tableName: string) {
  const sql = `
    SELECT column_name, data_type, data_length, nullable, data_default
    FROM user_tab_columns 
    WHERE table_name = UPPER(:1)
    ORDER BY column_id
  `;
  return executeQuery(sql, [tableName]);
}

async function getTableIndexes(tableName: string) {
  const sql = `
    SELECT index_name, column_name, column_position
    FROM user_ind_columns
    WHERE table_name = UPPER(:1)
    ORDER BY index_name, column_position
  `;
  return executeQuery(sql, [tableName]);
}

async function explainPlan(sql: string) {
  try {
    await connection.execute(`EXPLAIN PLAN FOR ${sql}`);
    const planResult = await connection.execute(
      `SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY())`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(planResult.rows, null, 2) }],
    };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

// Resource handlers for schema exploration
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    { uri: 'oracle://tables', name: 'All Tables', description: 'List of all tables in the schema', mimeType: 'application/json' },
    { uri: 'oracle://views', name: 'All Views', description: 'List of all views in the schema', mimeType: 'application/json' },
    { uri: 'oracle://procedures', name: 'Stored Procedures', description: 'List of stored procedures', mimeType: 'application/json' },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  let sql = '';
  
  if (uri === 'oracle://tables') {
    sql = 'SELECT table_name, num_rows, last_analyzed FROM user_tables ORDER BY table_name';
  } else if (uri === 'oracle://views') {
    sql = 'SELECT view_name, text_length FROM user_views ORDER BY view_name';
  } else if (uri === 'oracle://procedures') {
    sql = "SELECT object_name, object_type, created FROM user_objects WHERE object_type IN ('PROCEDURE', 'FUNCTION', 'PACKAGE') ORDER BY object_name";
  } else {
    throw new Error(`Unknown resource: ${uri}`);
  }
  
  const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(result.rows, null, 2) }] };
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'query',
      description: 'Execute SQL query on Oracle database',
      inputSchema: { 
        type: 'object', 
        properties: { 
          sql: { type: 'string', description: 'SQL query to execute' },
          params: { type: 'array', description: 'Query parameters (optional)', items: { type: 'string' } }
        }, 
        required: ['sql'] 
      },
    },
    {
      name: 'list_tables',
      description: 'List all tables in the schema with row counts',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'describe_table',
      description: 'Get column details for a specific table',
      inputSchema: { 
        type: 'object', 
        properties: { table: { type: 'string', description: 'Table name' } }, 
        required: ['table'] 
      },
    },
    {
      name: 'get_indexes',
      description: 'Get indexes for a table',
      inputSchema: { 
        type: 'object', 
        properties: { table: { type: 'string', description: 'Table name' } }, 
        required: ['table'] 
      },
    },
    {
      name: 'explain_plan',
      description: 'Get execution plan for a SQL query',
      inputSchema: { 
        type: 'object', 
        properties: { sql: { type: 'string', description: 'SQL query to analyze' } }, 
        required: ['sql'] 
      },
    },
    {
      name: 'get_db_info',
      description: 'Get Oracle database information and version',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'query':
      return executeQuery((args as any).sql, (args as any).params || []);
    
    case 'list_tables':
      return executeQuery('SELECT table_name, num_rows FROM user_tables ORDER BY table_name');
    
    case 'describe_table':
      return getTableSchema((args as any).table);
    
    case 'get_indexes':
      return getTableIndexes((args as any).table);
    
    case 'explain_plan':
      return explainPlan((args as any).sql);
    
    case 'get_db_info':
      return executeQuery(`SELECT * FROM v$version WHERE banner LIKE 'Oracle%'`);
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function cleanup() {
  if (connection) await connection.close();
  if (poolConnection) await poolConnection.close();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Oracle MCP Server running with enhanced features');
}

main();
