/**
 * MCP Client - Real implementation using @modelcontextprotocol/sdk
 * Spawns MCP servers as child processes and communicates via stdio
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { EventEmitter } from 'events';
import { buildEnvVarsFromParams } from './connection-env-map.js';

interface MCPServerConfig {
  id: string;
  type:
    // Databases
    | 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'sqlserver' | 'oracle'
    | 'sap-hana' | 'mariadb' | 'redis' | 'elasticsearch'
    | 'cassandra' | 'couchdb' | 'neo4j' | 'dynamodb'
    // CRM & Sales
    | 'salesforce' | 'hubspot' | 'oracle-siebel' | 'dynamics365'
    // ITSM & Support
    | 'servicenow' | 'jira' | 'zendesk'
    // ERP
    | 'netsuite' | 'infor-cloudsuite' | 'jd-edwards' | 'epicor'
    | 'sage-intacct' | 'oracle-peoplesoft' | 'oracle-opera'
    // HCM & HR
    | 'workday' | 'sap-successfactors' | 'adp' | 'ukg-kronos' | 'sap-concur'
    // Healthcare
    | 'epic-fhir' | 'cerner' | 'meditech' | 'allscripts'
    // Insurance
    | 'guidewire' | 'duck-creek' | 'applied-epic'
    // Supply Chain & Logistics
    | 'manhattan-associates' | 'blue-yonder' | 'descartes'
    // Finance & Banking
    | 'fis' | 'finastra' | 'temenos' | 'blackline' | 'quickbooks'
    // Commerce
    | 'shopify' | 'magento'
    // Telecom
    | 'amdocs' | 'ericsson-bss'
    // Document Management
    | 'sharepoint' | 'documentum' | 'ibm-filenet' | 'box'
    // Government
    | 'cgi-momentum' | 'tyler-technologies'
    // Education
    | 'ellucian-banner'
    // Asset & Facilities
    | 'ibm-maximo' | 'ibm-tririga' | 'ge-predix'
    // Procurement
    | 'sap-ariba' | 'coupa'
    // Legacy / Mainframe
    | 'as400';
  connectionString: string;
  connectionParams?: Record<string, string>;
  name: string;
}

interface MCPClientInstance {
  id: string;
  client: Client;
  transport: StdioClientTransport;
  config: MCPServerConfig;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  tools: any[];
}

/**
 * MCP Client Manager
 * Manages multiple MCP server connections
 */
export class MCPClientManager extends EventEmitter {
  private clients: Map<string, MCPClientInstance> = new Map();
  
  // Map of database types to their MCP server packages
  private serverPackages: Record<string, { 
    command: string; 
    args: string[];
    envKey: string;
  }> = {
    postgresql: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      envKey: 'POSTGRES_CONNECTION_STRING'
    },
    sqlite: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite'],
      envKey: 'SQLITE_DB_PATH'
    },
    mysql: {
      command: 'npx',
      args: ['-y', '@benborla/mcp-server-mysql'],
      envKey: 'MYSQL_CONNECTION_STRING'
    },
    // SQL Server MCP
    sqlserver: {
      command: 'npx',
      args: ['-y', '@azure-samples/mssql-mcp-server'],
      envKey: 'MSSQL_CONNECTION_STRING'
    },
    // MongoDB - local MCP server
    mongodb: {
      command: 'node',
      args: [],  // Will be resolved to local path at connect time
      envKey: 'MONGODB_URI'
    },
    // Oracle - local MCP server
    oracle: {
      command: 'node',
      args: [],
      envKey: 'ORACLE_CONNECT_STRING'
    },
    // SAP HANA - local MCP server
    'sap-hana': {
      command: 'node',
      args: [],
      envKey: 'SAP_HANA_HOST'
    },
    // MariaDB - local MCP server (MySQL-compatible)
    mariadb: {
      command: 'node',
      args: [],
      envKey: 'MARIADB_CONNECTION_STRING'
    },
    // Redis - local MCP server
    redis: {
      command: 'node',
      args: [],
      envKey: 'REDIS_URL'
    },
    // Elasticsearch - local MCP server
    elasticsearch: {
      command: 'node',
      args: [],
      envKey: 'ELASTICSEARCH_URL'
    },
    // Salesforce - local MCP server
    salesforce: {
      command: 'node',
      args: [],
      envKey: 'SALESFORCE_INSTANCE_URL'
    },
    // ServiceNow - local MCP server
    servicenow: {
      command: 'node',
      args: [],
      envKey: 'SERVICENOW_INSTANCE_URL'
    },
    // Jira - local MCP server
    jira: {
      command: 'node',
      args: [],
      envKey: 'JIRA_BASE_URL'
    },
    // Zendesk - local MCP server
    zendesk: {
      command: 'node',
      args: [],
      envKey: 'ZENDESK_SUBDOMAIN'
    },
    // Workday - local MCP server
    workday: {
      command: 'node',
      args: [],
      envKey: 'WORKDAY_TENANT'
    },
    // --- NEW DATABASE SERVERS ---
    cassandra: { command: 'node', args: [], envKey: 'CASSANDRA_CONTACT_POINTS' },
    couchdb: { command: 'node', args: [], envKey: 'COUCHDB_URL' },
    neo4j: { command: 'node', args: [], envKey: 'NEO4J_URI' },
    dynamodb: { command: 'node', args: [], envKey: 'AWS_REGION' },
    // --- CRM & SALES ---
    hubspot: { command: 'node', args: [], envKey: 'HUBSPOT_ACCESS_TOKEN' },
    'oracle-siebel': { command: 'node', args: [], envKey: 'SIEBEL_BASE_URL' },
    dynamics365: { command: 'node', args: [], envKey: 'DYNAMICS365_TENANT_ID' },
    // --- ERP ---
    netsuite: { command: 'node', args: [], envKey: 'NETSUITE_ACCOUNT_ID' },
    'infor-cloudsuite': { command: 'node', args: [], envKey: 'INFOR_ION_API_URL' },
    'jd-edwards': { command: 'node', args: [], envKey: 'JDE_AIS_BASE_URL' },
    epicor: { command: 'node', args: [], envKey: 'EPICOR_BASE_URL' },
    'sage-intacct': { command: 'node', args: [], envKey: 'INTACCT_SENDER_ID' },
    'oracle-peoplesoft': { command: 'node', args: [], envKey: 'PEOPLESOFT_BASE_URL' },
    'oracle-opera': { command: 'node', args: [], envKey: 'OPERA_BASE_URL' },
    // --- HCM & HR ---
    'sap-successfactors': { command: 'node', args: [], envKey: 'SF_API_URL' },
    adp: { command: 'node', args: [], envKey: 'ADP_BASE_URL' },
    'ukg-kronos': { command: 'node', args: [], envKey: 'UKG_BASE_URL' },
    'sap-concur': { command: 'node', args: [], envKey: 'CONCUR_BASE_URL' },
    // --- HEALTHCARE ---
    'epic-fhir': { command: 'node', args: [], envKey: 'EPIC_FHIR_BASE_URL' },
    cerner: { command: 'node', args: [], envKey: 'CERNER_FHIR_BASE_URL' },
    meditech: { command: 'node', args: [], envKey: 'MEDITECH_FHIR_BASE_URL' },
    allscripts: { command: 'node', args: [], envKey: 'ALLSCRIPTS_BASE_URL' },
    // --- INSURANCE ---
    guidewire: { command: 'node', args: [], envKey: 'GUIDEWIRE_BASE_URL' },
    'duck-creek': { command: 'node', args: [], envKey: 'DUCKCREEK_BASE_URL' },
    'applied-epic': { command: 'node', args: [], envKey: 'APPLIED_EPIC_BASE_URL' },
    // --- SUPPLY CHAIN ---
    'manhattan-associates': { command: 'node', args: [], envKey: 'MANHATTAN_BASE_URL' },
    'blue-yonder': { command: 'node', args: [], envKey: 'BLUEYONDER_BASE_URL' },
    descartes: { command: 'node', args: [], envKey: 'DESCARTES_BASE_URL' },
    // --- FINANCE & BANKING ---
    fis: { command: 'node', args: [], envKey: 'FIS_BASE_URL' },
    finastra: { command: 'node', args: [], envKey: 'FINASTRA_BASE_URL' },
    temenos: { command: 'node', args: [], envKey: 'TEMENOS_BASE_URL' },
    blackline: { command: 'node', args: [], envKey: 'BLACKLINE_BASE_URL' },
    quickbooks: { command: 'node', args: [], envKey: 'QUICKBOOKS_BASE_URL' },
    // --- COMMERCE ---
    shopify: { command: 'node', args: [], envKey: 'SHOPIFY_STORE_URL' },
    magento: { command: 'node', args: [], envKey: 'MAGENTO_BASE_URL' },
    // --- TELECOM ---
    amdocs: { command: 'node', args: [], envKey: 'AMDOCS_BASE_URL' },
    'ericsson-bss': { command: 'node', args: [], envKey: 'ERICSSON_BSS_BASE_URL' },
    // --- DOCUMENT MANAGEMENT ---
    sharepoint: { command: 'node', args: [], envKey: 'SHAREPOINT_TENANT_ID' },
    documentum: { command: 'node', args: [], envKey: 'DOCUMENTUM_BASE_URL' },
    'ibm-filenet': { command: 'node', args: [], envKey: 'FILENET_BASE_URL' },
    box: { command: 'node', args: [], envKey: 'BOX_CLIENT_ID' },
    // --- GOVERNMENT ---
    'cgi-momentum': { command: 'node', args: [], envKey: 'MOMENTUM_BASE_URL' },
    'tyler-technologies': { command: 'node', args: [], envKey: 'TYLER_BASE_URL' },
    // --- EDUCATION ---
    'ellucian-banner': { command: 'node', args: [], envKey: 'BANNER_BASE_URL' },
    // --- ASSET & FACILITIES ---
    'ibm-maximo': { command: 'node', args: [], envKey: 'MAXIMO_BASE_URL' },
    'ibm-tririga': { command: 'node', args: [], envKey: 'TRIRIGA_BASE_URL' },
    'ge-predix': { command: 'node', args: [], envKey: 'PREDIX_BASE_URL' },
    // --- PROCUREMENT ---
    'sap-ariba': { command: 'node', args: [], envKey: 'ARIBA_BASE_URL' },
    coupa: { command: 'node', args: [], envKey: 'COUPA_BASE_URL' },
    // --- LEGACY / MAINFRAME ---
    as400: { command: 'node', args: [], envKey: 'AS400_BASE_URL' },
  };

  // Map local MCP server types to their built package paths
  private localServerPaths: Record<string, string> = {
    mongodb: '../../../../../packages/mcp-servers/mongodb/dist/index.js',
    oracle: '../../../../../packages/mcp-servers/oracle/dist/index.js',
    'sap-hana': '../../../../../packages/mcp-servers/sap-hana/dist/index.js',
    mariadb: '../../../../../packages/mcp-servers/mariadb/dist/index.js',
    redis: '../../../../../packages/mcp-servers/redis/dist/index.js',
    elasticsearch: '../../../../../packages/mcp-servers/elasticsearch/dist/index.js',
    salesforce: '../../../../../packages/mcp-servers/salesforce/dist/index.js',
    servicenow: '../../../../../packages/mcp-servers/servicenow/dist/index.js',
    jira: '../../../../../packages/mcp-servers/jira/dist/index.js',
    zendesk: '../../../../../packages/mcp-servers/zendesk/dist/index.js',
    workday: '../../../../../packages/mcp-servers/workday/dist/index.js',
    // New database servers
    cassandra: '../../../../../packages/mcp-servers/cassandra/dist/index.js',
    couchdb: '../../../../../packages/mcp-servers/couchdb/dist/index.js',
    neo4j: '../../../../../packages/mcp-servers/neo4j/dist/index.js',
    dynamodb: '../../../../../packages/mcp-servers/dynamodb/dist/index.js',
    // CRM & Sales
    hubspot: '../../../../../packages/mcp-servers/hubspot/dist/index.js',
    'oracle-siebel': '../../../../../packages/mcp-servers/oracle-siebel/dist/index.js',
    dynamics365: '../../../../../packages/mcp-servers/dynamics365/dist/index.js',
    // ERP
    netsuite: '../../../../../packages/mcp-servers/netsuite/dist/index.js',
    'infor-cloudsuite': '../../../../../packages/mcp-servers/infor-cloudsuite/dist/index.js',
    'jd-edwards': '../../../../../packages/mcp-servers/jd-edwards/dist/index.js',
    epicor: '../../../../../packages/mcp-servers/epicor/dist/index.js',
    'sage-intacct': '../../../../../packages/mcp-servers/sage-intacct/dist/index.js',
    'oracle-peoplesoft': '../../../../../packages/mcp-servers/oracle-peoplesoft/dist/index.js',
    'oracle-opera': '../../../../../packages/mcp-servers/oracle-opera/dist/index.js',
    // HCM & HR
    'sap-successfactors': '../../../../../packages/mcp-servers/sap-successfactors/dist/index.js',
    adp: '../../../../../packages/mcp-servers/adp/dist/index.js',
    'ukg-kronos': '../../../../../packages/mcp-servers/ukg-kronos/dist/index.js',
    'sap-concur': '../../../../../packages/mcp-servers/sap-concur/dist/index.js',
    // Healthcare
    'epic-fhir': '../../../../../packages/mcp-servers/epic-fhir/dist/index.js',
    cerner: '../../../../../packages/mcp-servers/cerner/dist/index.js',
    meditech: '../../../../../packages/mcp-servers/meditech/dist/index.js',
    allscripts: '../../../../../packages/mcp-servers/allscripts/dist/index.js',
    // Insurance
    guidewire: '../../../../../packages/mcp-servers/guidewire/dist/index.js',
    'duck-creek': '../../../../../packages/mcp-servers/duck-creek/dist/index.js',
    'applied-epic': '../../../../../packages/mcp-servers/applied-epic/dist/index.js',
    // Supply Chain
    'manhattan-associates': '../../../../../packages/mcp-servers/manhattan-associates/dist/index.js',
    'blue-yonder': '../../../../../packages/mcp-servers/blue-yonder/dist/index.js',
    descartes: '../../../../../packages/mcp-servers/descartes/dist/index.js',
    // Finance & Banking
    fis: '../../../../../packages/mcp-servers/fis/dist/index.js',
    finastra: '../../../../../packages/mcp-servers/finastra/dist/index.js',
    temenos: '../../../../../packages/mcp-servers/temenos/dist/index.js',
    blackline: '../../../../../packages/mcp-servers/blackline/dist/index.js',
    quickbooks: '../../../../../packages/mcp-servers/quickbooks/dist/index.js',
    // Commerce
    shopify: '../../../../../packages/mcp-servers/shopify/dist/index.js',
    magento: '../../../../../packages/mcp-servers/magento/dist/index.js',
    // Telecom
    amdocs: '../../../../../packages/mcp-servers/amdocs/dist/index.js',
    'ericsson-bss': '../../../../../packages/mcp-servers/ericsson-bss/dist/index.js',
    // Document Management
    sharepoint: '../../../../../packages/mcp-servers/sharepoint/dist/index.js',
    documentum: '../../../../../packages/mcp-servers/documentum/dist/index.js',
    'ibm-filenet': '../../../../../packages/mcp-servers/ibm-filenet/dist/index.js',
    box: '../../../../../packages/mcp-servers/box/dist/index.js',
    // Government
    'cgi-momentum': '../../../../../packages/mcp-servers/cgi-momentum/dist/index.js',
    'tyler-technologies': '../../../../../packages/mcp-servers/tyler-technologies/dist/index.js',
    // Education
    'ellucian-banner': '../../../../../packages/mcp-servers/ellucian-banner/dist/index.js',
    // Asset & Facilities
    'ibm-maximo': '../../../../../packages/mcp-servers/ibm-maximo/dist/index.js',
    'ibm-tririga': '../../../../../packages/mcp-servers/ibm-tririga/dist/index.js',
    'ge-predix': '../../../../../packages/mcp-servers/ge-predix/dist/index.js',
    // Procurement
    'sap-ariba': '../../../../../packages/mcp-servers/sap-ariba/dist/index.js',
    coupa: '../../../../../packages/mcp-servers/coupa/dist/index.js',
    // Legacy / Mainframe
    as400: '../../../../../packages/mcp-servers/as400/dist/index.js',
  };

  constructor() {
    super();
  }

  /**
   * Connect to a database via MCP server
   */
  async connect(config: MCPServerConfig): Promise<MCPClientInstance> {
    const { id, type, connectionString, name } = config;

    // Check if already connected
    if (this.clients.has(id)) {
      const existing = this.clients.get(id)!;
      if (existing.status === 'connected') {
        return existing;
      }
      // Disconnect existing and reconnect
      await this.disconnect(id);
    }

    const serverConfig = this.serverPackages[type];
    if (!serverConfig) {
      throw new Error(`Unsupported database type: ${type}. Supported: ${Object.keys(this.serverPackages).join(', ')}`);
    }

    console.log(`[MCP] Starting ${type} MCP server for "${name}"...`);

    // Create instance placeholder
    const instance: MCPClientInstance = {
      id,
      client: null as any,
      transport: null as any,
      config,
      status: 'connecting',
      tools: []
    };
    this.clients.set(id, instance);

    try {
      // Create environment with connection parameters
      const baseEnv: Record<string, string> = Object.fromEntries(
        Object.entries(process.env).filter(([_, v]) => v !== undefined) as [string, string][]
      );

      let env: Record<string, string>;

      if (config.connectionParams && Object.keys(config.connectionParams).length > 0) {
        // New multi-env-var path: map form field values to env var names via schema
        const mappedEnvVars = buildEnvVarsFromParams(type, config.connectionParams);
        env = { ...baseEnv, ...mappedEnvVars };
        console.log(`[MCP] Set ${Object.keys(mappedEnvVars).length} env vars for ${type}:`, Object.keys(mappedEnvVars));
      } else {
        // Legacy single-connection-string path
        env = { ...baseEnv, [serverConfig.envKey]: connectionString };
      }

      // Resolve command and args for local MCP servers
      let command = serverConfig.command;
      let args = [...serverConfig.args];
      
      // For local MCP servers (command=node, empty args), resolve the local path
      if (command === 'node' && args.length === 0 && this.localServerPaths[type]) {
        const path = await import('path');
        const resolvedPath = path.resolve(__dirname, this.localServerPaths[type]);
        args = [resolvedPath];
        console.log(`[MCP] Using local MCP server: ${resolvedPath}`);
      }

      console.log(`[MCP] Spawning: ${command} ${args.join(' ')}`);
      
      // Create MCP client with stdio transport
      // StdioClientTransport spawns the process internally
      const transport = new StdioClientTransport({
        command,
        args,
        env,
        stderr: 'pipe' // Capture stderr for debugging
      });

      instance.transport = transport;

      const client = new Client({
        name: `velanova-${type}-client`,
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      instance.client = client;

      // Connect the client (this starts the process)
      await client.connect(transport);
      
      console.log(`[MCP] Connected to ${type} server for "${name}"`);

      // List available tools
      const toolsResponse = await client.listTools();
      instance.tools = toolsResponse.tools || [];
      
      console.log(`[MCP] Available tools for ${id}:`, instance.tools.map(t => t.name));

      instance.status = 'connected';
      this.emit('connected', { id, tools: instance.tools });

      return instance;

    } catch (error: any) {
      console.error(`[MCP] Failed to connect ${id}:`, error);
      instance.status = 'error';
      
      // Clean up
      if (instance.transport) {
        try {
          await instance.transport.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      this.clients.delete(id);
      throw error;
    }
  }

  /**
   * Disconnect from an MCP server
   */
  async disconnect(id: string): Promise<void> {
    const instance = this.clients.get(id);
    if (!instance) {
      return;
    }

    console.log(`[MCP] Disconnecting ${id}...`);

    try {
      // Close the client connection
      if (instance.client) {
        await instance.client.close();
      }
    } catch (error) {
      console.error(`[MCP] Error closing client for ${id}:`, error);
    }

    try {
      // Close the transport (this kills the spawned process)
      if (instance.transport) {
        await instance.transport.close();
      }
    } catch (error) {
      console.error(`[MCP] Error closing transport for ${id}:`, error);
    }

    this.clients.delete(id);
    this.emit('disconnected', { id });
    
    console.log(`[MCP] Disconnected ${id}`);
  }

  /**
   * Execute a tool on an MCP server
   */
  async callTool(connectionId: string, toolName: string, args: Record<string, any>): Promise<any> {
    const instance = this.clients.get(connectionId);
    if (!instance) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    if (instance.status !== 'connected') {
      throw new Error(`Connection ${connectionId} is not connected (status: ${instance.status})`);
    }

    console.log(`[MCP] Calling tool ${toolName} on ${connectionId} with args:`, args);

    try {
      const result = await instance.client.callTool({
        name: toolName,
        arguments: args
      });

      console.log(`[MCP] Tool ${toolName} result:`, result);
      return result;

    } catch (error: any) {
      console.error(`[MCP] Tool ${toolName} failed:`, error);
      throw error;
    }
  }

  /**
   * Execute a database query via MCP
   */
  async query(connectionId: string, sql: string): Promise<any> {
    const instance = this.clients.get(connectionId);
    if (!instance) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    // Find the appropriate query tool
    const queryTool = instance.tools.find(t => 
      t.name === 'query' || 
      t.name === 'execute_query' || 
      t.name === 'run_query' ||
      t.name === 'read_query'
    );

    if (!queryTool) {
      throw new Error(`No query tool found for connection ${connectionId}. Available tools: ${instance.tools.map(t => t.name).join(', ')}`);
    }

    return this.callTool(connectionId, queryTool.name, { query: sql, sql });
  }

  /**
   * List tables in a database
   */
  async listTables(connectionId: string): Promise<any> {
    const instance = this.clients.get(connectionId);
    if (!instance) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    // Find list tables tool
    const listTool = instance.tools.find(t => 
      t.name === 'list_tables' || 
      t.name === 'get_tables' ||
      t.name === 'describe_tables'
    );

    if (listTool) {
      return this.callTool(connectionId, listTool.name, {});
    }

    // Fallback: use query
    const type = instance.config.type;
    let sql = '';
    
    switch (type) {
      case 'postgresql':
        sql = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
        break;
      case 'mysql':
        sql = `SHOW TABLES`;
        break;
      case 'sqlite':
        sql = `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`;
        break;
      case 'sqlserver':
        sql = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME`;
        break;
      case 'oracle':
        sql = `SELECT table_name FROM user_tables ORDER BY table_name`;
        break;
      case 'mariadb':
        sql = `SHOW TABLES`;
        break;
      case 'sap-hana':
        sql = `SELECT TABLE_NAME FROM SYS.TABLES WHERE SCHEMA_NAME = CURRENT_SCHEMA ORDER BY TABLE_NAME`;
        break;
      default:
        // For non-SQL systems (MongoDB, Redis, Salesforce, etc.),
        // they must expose a list tool via MCP
        throw new Error(`list_tables not supported for ${type} - this system's MCP server must provide a list tool`);
    }

    return this.query(connectionId, sql);
  }

  /**
   * Get schema for a table
   */
  async getTableSchema(connectionId: string, tableName: string): Promise<any> {
    const instance = this.clients.get(connectionId);
    if (!instance) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    // Find describe tool
    const describeTool = instance.tools.find(t => 
      t.name === 'describe_table' || 
      t.name === 'get_schema' ||
      t.name === 'table_schema'
    );

    if (describeTool) {
      return this.callTool(connectionId, describeTool.name, { table_name: tableName, table: tableName });
    }

    // Fallback: use query
    const type = instance.config.type;
    let sql = '';
    
    switch (type) {
      case 'postgresql':
        sql = `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY ordinal_position`;
        break;
      case 'mysql':
        sql = `DESCRIBE ${tableName}`;
        break;
      case 'sqlite':
        sql = `PRAGMA table_info(${tableName})`;
        break;
      case 'sqlserver':
        sql = `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`;
        break;
      case 'oracle':
        sql = `SELECT COLUMN_NAME, DATA_TYPE, NULLABLE FROM USER_TAB_COLUMNS WHERE TABLE_NAME = '${tableName.toUpperCase()}' ORDER BY COLUMN_ID`;
        break;
      case 'mariadb':
        sql = `DESCRIBE ${tableName}`;
        break;
      case 'sap-hana':
        sql = `SELECT COLUMN_NAME, DATA_TYPE_NAME, IS_NULLABLE FROM SYS.TABLE_COLUMNS WHERE SCHEMA_NAME = CURRENT_SCHEMA AND TABLE_NAME = '${tableName}' ORDER BY POSITION`;
        break;
      default:
        // For non-SQL systems, they must expose a describe tool via MCP
        throw new Error(`get_table_schema not supported for ${type} - this system's MCP server must provide a describe tool`);
    }

    return this.query(connectionId, sql);
  }

  /**
   * Get available tools for a connection
   */
  getTools(connectionId: string): any[] {
    const instance = this.clients.get(connectionId);
    return instance?.tools || [];
  }

  /**
   * Get all tools across all connections (for AI function calling)
   */
  getAllToolsForAI(): any[] {
    const tools: any[] = [];
    
    for (const [id, instance] of this.clients.entries()) {
      if (instance.status !== 'connected') continue;
      
      for (const tool of instance.tools) {
        tools.push({
          type: 'function',
          function: {
            name: `${id}_${tool.name}`,
            description: `[${instance.config.name}] ${tool.description || tool.name}`,
            parameters: tool.inputSchema || { type: 'object', properties: {} }
          }
        });
      }
    }
    
    return tools;
  }

  /**
   * Get status of all connections
   */
  getStatus(): Record<string, { 
    status: string; 
    type: string;
    name: string;
    toolCount: number;
  }> {
    const status: Record<string, any> = {};
    
    for (const [id, instance] of this.clients.entries()) {
      status[id] = {
        status: instance.status,
        type: instance.config.type,
        name: instance.config.name,
        toolCount: instance.tools.length
      };
    }
    
    return status;
  }

  /**
   * Check if a connection is ready
   */
  isConnected(connectionId: string): boolean {
    const instance = this.clients.get(connectionId);
    return instance?.status === 'connected';
  }

  /**
   * Disconnect all connections
   */
  async disconnectAll(): Promise<void> {
    const ids = Array.from(this.clients.keys());
    await Promise.all(ids.map(id => this.disconnect(id)));
  }
}

// Export singleton instance
export const mcpClient = new MCPClientManager();

export default mcpClient;
