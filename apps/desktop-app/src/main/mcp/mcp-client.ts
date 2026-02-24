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
  type: // Databases
    | 'postgresql'
    | 'mysql'
    | 'sqlite'
    | 'mongodb'
    | 'sqlserver'
    | 'oracle'
    | 'sap-hana'
    | 'mariadb'
    | 'redis'
    | 'elasticsearch'
    | 'cassandra'
    | 'couchdb'
    | 'neo4j'
    | 'dynamodb'
    // CRM & Sales
    | 'salesforce'
    | 'hubspot'
    | 'oracle-siebel'
    | 'dynamics365'
    // ITSM & Support
    | 'servicenow'
    | 'jira'
    | 'zendesk'
    // ERP
    | 'netsuite'
    | 'infor-cloudsuite'
    | 'jd-edwards'
    | 'epicor'
    | 'sage-intacct'
    | 'oracle-peoplesoft'
    | 'oracle-opera'
    // HCM & HR
    | 'workday'
    | 'sap-successfactors'
    | 'adp'
    | 'ukg-kronos'
    | 'sap-concur'
    // Healthcare
    | 'epic-fhir'
    | 'cerner'
    | 'meditech'
    | 'allscripts'
    // Insurance
    | 'guidewire'
    | 'duck-creek'
    | 'applied-epic'
    // Supply Chain & Logistics
    | 'manhattan-associates'
    | 'blue-yonder'
    | 'descartes'
    // Finance & Banking
    | 'fis'
    | 'finastra'
    | 'temenos'
    | 'blackline'
    | 'quickbooks'
    // Commerce
    | 'shopify'
    | 'magento'
    // Telecom
    | 'amdocs'
    | 'ericsson-bss'
    // Document Management
    | 'sharepoint'
    | 'documentum'
    | 'ibm-filenet'
    | 'box'
    // Government
    | 'cgi-momentum'
    | 'tyler-technologies'
    // Education
    | 'ellucian-banner'
    // Asset & Facilities
    | 'ibm-maximo'
    | 'ibm-tririga'
    | 'ge-predix'
    // Procurement
    | 'sap-ariba'
    | 'coupa'
    // Legacy / Mainframe
    | 'as400'
    // Project Management
    | 'trello'
    // ── New MCP Servers ──
    | 'accenture'
    | 'ach-mainframe'
    | 'active-directory'
    | 'amazon-aurora'
    | 'apptivo'
    | 'asana'
    | 'aws-rds'
    | 'azure-sql'
    | 'azure-synapse'
    | 'bamboohr'
    | 'basecamp'
    | 'bigcommerce'
    | 'bigquery'
    | 'bitbucket'
    | 'bitrix24'
    | 'blackrock-aladdin'
    | 'bloomberg-terminal'
    | 'brio'
    | 'broadcom'
    | 'calypso'
    | 'capsule-crm'
    | 'charles-river'
    | 'chips-mainframe'
    | 'clickup'
    | 'close-crm'
    | 'cobol-banking'
    | 'cockroachdb'
    | 'cognos'
    | 'confluence'
    | 'copper-crm'
    | 'creatio'
    | 'crystal-reports'
    | 'databricks'
    | 'deel'
    | 'dremio'
    | 'dropbox-business'
    | 'dxc-technology'
    | 'firebolt'
    | 'firestore'
    | 'fis-profile'
    | 'fis-world'
    | 'freshbooks'
    | 'freshsales'
    | 'frontarena'
    | 'github'
    | 'gitlab'
    | 'google-cloud-sql'
    | 'google-meet'
    | 'google-workspace'
    | 'gusto'
    | 'hyperion'
    | 'ibm-cics'
    | 'ibm-ims'
    | 'influxdb'
    | 'infosys'
    | 'insightly'
    | 'jde-oneworld'
    | 'jde-world'
    | 'jenkins'
    | 'jumpcloud'
    | 'keap'
    | 'linear'
    | 'looker'
    | 'micro-focus'
    | 'monday-com'
    | 'ms-teams'
    | 'murex'
    | 'neon'
    | 'nimble'
    | 'notion'
    | 'okta'
    | 'opentext'
    | 'oracle-ebs'
    | 'peoplesoft-crm'
    | 'peoplesoft-financials'
    | 'pipedrive'
    | 'planetscale'
    | 'power-bi'
    | 'prestashop'
    | 'progress-software'
    | 'qlik'
    | 'redshift'
    | 'reuters-3000'
    | 'rippling'
    | 'sap-enterprise'
    | 'sap-r2'
    | 'sap-r3'
    | 'sap-s4hana'
    | 'simcorp'
    | 'slack'
    | 'smartsheet'
    | 'snowflake'
    | 'squarespace'
    | 'starburst'
    | 'stripe'
    | 'sugarcrm'
    | 'supabase'
    | 'swift-fin'
    | 'tableau'
    | 'tcs'
    | 'temenos-t24'
    | 'teradata'
    | 'unisys-clearpath'
    | 'wipro'
    | 'woocommerce'
    | 'wrike'
    | 'xero'
    | 'zendesk-sell'
    | 'zoho-crm'
    | 'zoom';
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
  private serverPackages: Record<
    string,
    {
      command: string;
      args: string[];
      envKey: string;
    }
  > = {
    postgresql: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      envKey: 'POSTGRES_CONNECTION_STRING',
    },
    sqlite: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite'],
      envKey: 'SQLITE_DB_PATH',
    },
    mysql: {
      command: 'npx',
      args: ['-y', '@benborla/mcp-server-mysql'],
      envKey: 'MYSQL_CONNECTION_STRING',
    },
    // SQL Server MCP
    sqlserver: {
      command: 'npx',
      args: ['-y', '@azure-samples/mssql-mcp-server'],
      envKey: 'MSSQL_CONNECTION_STRING',
    },
    // MongoDB - local MCP server
    mongodb: {
      command: 'node',
      args: [], // Will be resolved to local path at connect time
      envKey: 'MONGODB_URI',
    },
    // Oracle - local MCP server
    oracle: {
      command: 'node',
      args: [],
      envKey: 'ORACLE_CONNECT_STRING',
    },
    // SAP HANA - local MCP server
    'sap-hana': {
      command: 'node',
      args: [],
      envKey: 'SAP_HANA_HOST',
    },
    // MariaDB - local MCP server (MySQL-compatible)
    mariadb: {
      command: 'node',
      args: [],
      envKey: 'MARIADB_CONNECTION_STRING',
    },
    // Redis - local MCP server
    redis: {
      command: 'node',
      args: [],
      envKey: 'REDIS_URL',
    },
    // Elasticsearch - local MCP server
    elasticsearch: {
      command: 'node',
      args: [],
      envKey: 'ELASTICSEARCH_URL',
    },
    // Salesforce - local MCP server
    salesforce: {
      command: 'node',
      args: [],
      envKey: 'SALESFORCE_INSTANCE_URL',
    },
    // ServiceNow - local MCP server
    servicenow: {
      command: 'node',
      args: [],
      envKey: 'SERVICENOW_INSTANCE_URL',
    },
    // Jira - local MCP server
    jira: {
      command: 'node',
      args: [],
      envKey: 'JIRA_BASE_URL',
    },
    // Zendesk - local MCP server
    zendesk: {
      command: 'node',
      args: [],
      envKey: 'ZENDESK_SUBDOMAIN',
    },
    // Workday - local MCP server
    workday: {
      command: 'node',
      args: [],
      envKey: 'WORKDAY_TENANT',
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
    // --- PROJECT MANAGEMENT ---
    trello: { command: 'node', args: [], envKey: 'TRELLO_API_KEY' },
    // ── New MCP Servers ──
    accenture: { command: 'node', args: [], envKey: 'ACCENTURE_BASE_URL' },
    'ach-mainframe': { command: 'node', args: [], envKey: 'ACH_HOST' },
    'active-directory': { command: 'node', args: [], envKey: 'AZURE_AD_TENANT_ID' },
    'amazon-aurora': { command: 'node', args: [], envKey: 'AURORA_HOST' },
    apptivo: { command: 'node', args: [], envKey: 'APPTIVO_API_KEY' },
    asana: { command: 'node', args: [], envKey: 'ASANA_ACCESS_TOKEN' },
    'aws-rds': { command: 'node', args: [], envKey: 'RDS_HOST' },
    'azure-sql': { command: 'node', args: [], envKey: 'AZURE_SQL_HOST' },
    'azure-synapse': { command: 'node', args: [], envKey: 'SYNAPSE_HOST' },
    bamboohr: { command: 'node', args: [], envKey: 'BAMBOOHR_API_KEY' },
    basecamp: { command: 'node', args: [], envKey: 'BASECAMP_ACCESS_TOKEN' },
    bigcommerce: { command: 'node', args: [], envKey: 'BIGCOMMERCE_STORE_HASH' },
    bigquery: { command: 'node', args: [], envKey: 'BIGQUERY_PROJECT_ID' },
    bitbucket: { command: 'node', args: [], envKey: 'BITBUCKET_USERNAME' },
    bitrix24: { command: 'node', args: [], envKey: 'BITRIX24_WEBHOOK_URL' },
    'blackrock-aladdin': { command: 'node', args: [], envKey: 'ALADDIN_BASE_URL' },
    'bloomberg-terminal': { command: 'node', args: [], envKey: 'BLOOMBERG_HOST' },
    brio: { command: 'node', args: [], envKey: 'BRIO_BASE_URL' },
    broadcom: { command: 'node', args: [], envKey: 'BROADCOM_BASE_URL' },
    calypso: { command: 'node', args: [], envKey: 'CALYPSO_BASE_URL' },
    'capsule-crm': { command: 'node', args: [], envKey: 'CAPSULE_ACCESS_TOKEN' },
    'charles-river': { command: 'node', args: [], envKey: 'CHARLES_RIVER_BASE_URL' },
    'chips-mainframe': { command: 'node', args: [], envKey: 'CHIPS_HOST' },
    clickup: { command: 'node', args: [], envKey: 'CLICKUP_API_TOKEN' },
    'close-crm': { command: 'node', args: [], envKey: 'CLOSE_API_KEY' },
    'cobol-banking': { command: 'node', args: [], envKey: 'COBOL_HOST' },
    cockroachdb: { command: 'node', args: [], envKey: 'COCKROACHDB_URL' },
    cognos: { command: 'node', args: [], envKey: 'COGNOS_BASE_URL' },
    confluence: { command: 'node', args: [], envKey: 'CONFLUENCE_BASE_URL' },
    'copper-crm': { command: 'node', args: [], envKey: 'COPPER_API_KEY' },
    creatio: { command: 'node', args: [], envKey: 'CREATIO_BASE_URL' },
    'crystal-reports': { command: 'node', args: [], envKey: 'CRYSTAL_SERVER_URL' },
    databricks: { command: 'node', args: [], envKey: 'DATABRICKS_HOST' },
    deel: { command: 'node', args: [], envKey: 'DEEL_API_TOKEN' },
    dremio: { command: 'node', args: [], envKey: 'DREMIO_HOST' },
    'dropbox-business': { command: 'node', args: [], envKey: 'DROPBOX_ACCESS_TOKEN' },
    'dxc-technology': { command: 'node', args: [], envKey: 'DXC_BASE_URL' },
    firebolt: { command: 'node', args: [], envKey: 'FIREBOLT_CLIENT_ID' },
    firestore: { command: 'node', args: [], envKey: 'FIRESTORE_PROJECT_ID' },
    'fis-profile': { command: 'node', args: [], envKey: 'FIS_PROFILE_BASE_URL' },
    'fis-world': { command: 'node', args: [], envKey: 'FIS_WORLD_BASE_URL' },
    freshbooks: { command: 'node', args: [], envKey: 'FRESHBOOKS_ACCESS_TOKEN' },
    freshsales: { command: 'node', args: [], envKey: 'FRESHSALES_API_KEY' },
    frontarena: { command: 'node', args: [], envKey: 'FRONTARENA_BASE_URL' },
    github: { command: 'node', args: [], envKey: 'GITHUB_TOKEN' },
    gitlab: { command: 'node', args: [], envKey: 'GITLAB_TOKEN' },
    'google-cloud-sql': { command: 'node', args: [], envKey: 'CLOUDSQL_HOST' },
    'google-meet': { command: 'node', args: [], envKey: 'GOOGLE_ACCESS_TOKEN' },
    'google-workspace': { command: 'node', args: [], envKey: 'GOOGLE_WORKSPACE_ACCESS_TOKEN' },
    gusto: { command: 'node', args: [], envKey: 'GUSTO_ACCESS_TOKEN' },
    hyperion: { command: 'node', args: [], envKey: 'HYPERION_BASE_URL' },
    'ibm-cics': { command: 'node', args: [], envKey: 'CICS_BASE_URL' },
    'ibm-ims': { command: 'node', args: [], envKey: 'IMS_BASE_URL' },
    influxdb: { command: 'node', args: [], envKey: 'INFLUXDB_URL' },
    infosys: { command: 'node', args: [], envKey: 'INFOSYS_BASE_URL' },
    insightly: { command: 'node', args: [], envKey: 'INSIGHTLY_API_KEY' },
    'jde-oneworld': { command: 'node', args: [], envKey: 'JDE_BASE_URL' },
    'jde-world': { command: 'node', args: [], envKey: 'JDE_WORLD_HOST' },
    jenkins: { command: 'node', args: [], envKey: 'JENKINS_URL' },
    jumpcloud: { command: 'node', args: [], envKey: 'JUMPCLOUD_API_KEY' },
    keap: { command: 'node', args: [], envKey: 'KEAP_ACCESS_TOKEN' },
    linear: { command: 'node', args: [], envKey: 'LINEAR_API_KEY' },
    looker: { command: 'node', args: [], envKey: 'LOOKER_BASE_URL' },
    'micro-focus': { command: 'node', args: [], envKey: 'MICRO_FOCUS_BASE_URL' },
    'monday-com': { command: 'node', args: [], envKey: 'MONDAY_API_TOKEN' },
    'ms-teams': { command: 'node', args: [], envKey: 'MS_TEAMS_ACCESS_TOKEN' },
    murex: { command: 'node', args: [], envKey: 'MUREX_BASE_URL' },
    neon: { command: 'node', args: [], envKey: 'NEON_DATABASE_URL' },
    nimble: { command: 'node', args: [], envKey: 'NIMBLE_API_KEY' },
    notion: { command: 'node', args: [], envKey: 'NOTION_API_KEY' },
    okta: { command: 'node', args: [], envKey: 'OKTA_DOMAIN' },
    opentext: { command: 'node', args: [], envKey: 'OPENTEXT_BASE_URL' },
    'oracle-ebs': { command: 'node', args: [], envKey: 'ORACLE_EBS_BASE_URL' },
    'peoplesoft-crm': { command: 'node', args: [], envKey: 'PEOPLESOFT_CRM_BASE_URL' },
    'peoplesoft-financials': { command: 'node', args: [], envKey: 'PEOPLESOFT_FIN_BASE_URL' },
    pipedrive: { command: 'node', args: [], envKey: 'PIPEDRIVE_API_TOKEN' },
    planetscale: { command: 'node', args: [], envKey: 'PLANETSCALE_HOST' },
    'power-bi': { command: 'node', args: [], envKey: 'POWERBI_ACCESS_TOKEN' },
    prestashop: { command: 'node', args: [], envKey: 'PRESTASHOP_URL' },
    'progress-software': { command: 'node', args: [], envKey: 'PROGRESS_BASE_URL' },
    qlik: { command: 'node', args: [], envKey: 'QLIK_TENANT_URL' },
    redshift: { command: 'node', args: [], envKey: 'REDSHIFT_HOST' },
    'reuters-3000': { command: 'node', args: [], envKey: 'REFINITIV_USERNAME' },
    rippling: { command: 'node', args: [], envKey: 'RIPPLING_API_KEY' },
    'sap-enterprise': { command: 'node', args: [], envKey: 'SAP_BASE_URL' },
    'sap-r2': { command: 'node', args: [], envKey: 'SAP_R2_HOST' },
    'sap-r3': { command: 'node', args: [], envKey: 'SAP_R3_HOST' },
    'sap-s4hana': { command: 'node', args: [], envKey: 'SAP_S4_BASE_URL' },
    simcorp: { command: 'node', args: [], envKey: 'SIMCORP_BASE_URL' },
    slack: { command: 'node', args: [], envKey: 'SLACK_BOT_TOKEN' },
    smartsheet: { command: 'node', args: [], envKey: 'SMARTSHEET_ACCESS_TOKEN' },
    snowflake: { command: 'node', args: [], envKey: 'SNOWFLAKE_ACCOUNT' },
    squarespace: { command: 'node', args: [], envKey: 'SQUARESPACE_API_KEY' },
    starburst: { command: 'node', args: [], envKey: 'STARBURST_HOST' },
    stripe: { command: 'node', args: [], envKey: 'STRIPE_SECRET_KEY' },
    sugarcrm: { command: 'node', args: [], envKey: 'SUGARCRM_BASE_URL' },
    supabase: { command: 'node', args: [], envKey: 'SUPABASE_URL' },
    'swift-fin': { command: 'node', args: [], envKey: 'SWIFT_BASE_URL' },
    tableau: { command: 'node', args: [], envKey: 'TABLEAU_SERVER_URL' },
    tcs: { command: 'node', args: [], envKey: 'TCS_BASE_URL' },
    'temenos-t24': { command: 'node', args: [], envKey: 'T24_BASE_URL' },
    teradata: { command: 'node', args: [], envKey: 'TERADATA_HOST' },
    'unisys-clearpath': { command: 'node', args: [], envKey: 'CLEARPATH_HOST' },
    wipro: { command: 'node', args: [], envKey: 'WIPRO_BASE_URL' },
    woocommerce: { command: 'node', args: [], envKey: 'WOOCOMMERCE_URL' },
    wrike: { command: 'node', args: [], envKey: 'WRIKE_ACCESS_TOKEN' },
    xero: { command: 'node', args: [], envKey: 'XERO_ACCESS_TOKEN' },
    'zendesk-sell': { command: 'node', args: [], envKey: 'ZENDESK_SELL_ACCESS_TOKEN' },
    'zoho-crm': { command: 'node', args: [], envKey: 'ZOHO_ACCESS_TOKEN' },
    zoom: { command: 'node', args: [], envKey: 'ZOOM_ACCESS_TOKEN' },
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
    'manhattan-associates':
      '../../../../../packages/mcp-servers/manhattan-associates/dist/index.js',
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
    // Project Management
    trello: '../../../../../packages/mcp-servers/trello/dist/index.js',
    // ── New MCP Servers ──
    accenture: '../../../../../packages/mcp-servers/accenture/dist/index.js',
    'ach-mainframe': '../../../../../packages/mcp-servers/ach-mainframe/dist/index.js',
    'active-directory': '../../../../../packages/mcp-servers/active-directory/dist/index.js',
    'amazon-aurora': '../../../../../packages/mcp-servers/amazon-aurora/dist/index.js',
    apptivo: '../../../../../packages/mcp-servers/apptivo/dist/index.js',
    asana: '../../../../../packages/mcp-servers/asana/dist/index.js',
    'aws-rds': '../../../../../packages/mcp-servers/aws-rds/dist/index.js',
    'azure-sql': '../../../../../packages/mcp-servers/azure-sql/dist/index.js',
    'azure-synapse': '../../../../../packages/mcp-servers/azure-synapse/dist/index.js',
    bamboohr: '../../../../../packages/mcp-servers/bamboohr/dist/index.js',
    basecamp: '../../../../../packages/mcp-servers/basecamp/dist/index.js',
    bigcommerce: '../../../../../packages/mcp-servers/bigcommerce/dist/index.js',
    bigquery: '../../../../../packages/mcp-servers/bigquery/dist/index.js',
    bitbucket: '../../../../../packages/mcp-servers/bitbucket/dist/index.js',
    bitrix24: '../../../../../packages/mcp-servers/bitrix24/dist/index.js',
    'blackrock-aladdin': '../../../../../packages/mcp-servers/blackrock-aladdin/dist/index.js',
    'bloomberg-terminal': '../../../../../packages/mcp-servers/bloomberg-terminal/dist/index.js',
    brio: '../../../../../packages/mcp-servers/brio/dist/index.js',
    broadcom: '../../../../../packages/mcp-servers/broadcom/dist/index.js',
    calypso: '../../../../../packages/mcp-servers/calypso/dist/index.js',
    'capsule-crm': '../../../../../packages/mcp-servers/capsule-crm/dist/index.js',
    'charles-river': '../../../../../packages/mcp-servers/charles-river/dist/index.js',
    'chips-mainframe': '../../../../../packages/mcp-servers/chips-mainframe/dist/index.js',
    clickup: '../../../../../packages/mcp-servers/clickup/dist/index.js',
    'close-crm': '../../../../../packages/mcp-servers/close-crm/dist/index.js',
    'cobol-banking': '../../../../../packages/mcp-servers/cobol-banking/dist/index.js',
    cockroachdb: '../../../../../packages/mcp-servers/cockroachdb/dist/index.js',
    cognos: '../../../../../packages/mcp-servers/cognos/dist/index.js',
    confluence: '../../../../../packages/mcp-servers/confluence/dist/index.js',
    'copper-crm': '../../../../../packages/mcp-servers/copper-crm/dist/index.js',
    creatio: '../../../../../packages/mcp-servers/creatio/dist/index.js',
    'crystal-reports': '../../../../../packages/mcp-servers/crystal-reports/dist/index.js',
    databricks: '../../../../../packages/mcp-servers/databricks/dist/index.js',
    deel: '../../../../../packages/mcp-servers/deel/dist/index.js',
    dremio: '../../../../../packages/mcp-servers/dremio/dist/index.js',
    'dropbox-business': '../../../../../packages/mcp-servers/dropbox-business/dist/index.js',
    'dxc-technology': '../../../../../packages/mcp-servers/dxc-technology/dist/index.js',
    firebolt: '../../../../../packages/mcp-servers/firebolt/dist/index.js',
    firestore: '../../../../../packages/mcp-servers/firestore/dist/index.js',
    'fis-profile': '../../../../../packages/mcp-servers/fis-profile/dist/index.js',
    'fis-world': '../../../../../packages/mcp-servers/fis-world/dist/index.js',
    freshbooks: '../../../../../packages/mcp-servers/freshbooks/dist/index.js',
    freshsales: '../../../../../packages/mcp-servers/freshsales/dist/index.js',
    frontarena: '../../../../../packages/mcp-servers/frontarena/dist/index.js',
    github: '../../../../../packages/mcp-servers/github/dist/index.js',
    gitlab: '../../../../../packages/mcp-servers/gitlab/dist/index.js',
    'google-cloud-sql': '../../../../../packages/mcp-servers/google-cloud-sql/dist/index.js',
    'google-meet': '../../../../../packages/mcp-servers/google-meet/dist/index.js',
    'google-workspace': '../../../../../packages/mcp-servers/google-workspace/dist/index.js',
    gusto: '../../../../../packages/mcp-servers/gusto/dist/index.js',
    hyperion: '../../../../../packages/mcp-servers/hyperion/dist/index.js',
    'ibm-cics': '../../../../../packages/mcp-servers/ibm-cics/dist/index.js',
    'ibm-ims': '../../../../../packages/mcp-servers/ibm-ims/dist/index.js',
    influxdb: '../../../../../packages/mcp-servers/influxdb/dist/index.js',
    infosys: '../../../../../packages/mcp-servers/infosys/dist/index.js',
    insightly: '../../../../../packages/mcp-servers/insightly/dist/index.js',
    'jde-oneworld': '../../../../../packages/mcp-servers/jde-oneworld/dist/index.js',
    'jde-world': '../../../../../packages/mcp-servers/jde-world/dist/index.js',
    jenkins: '../../../../../packages/mcp-servers/jenkins/dist/index.js',
    jumpcloud: '../../../../../packages/mcp-servers/jumpcloud/dist/index.js',
    keap: '../../../../../packages/mcp-servers/keap/dist/index.js',
    linear: '../../../../../packages/mcp-servers/linear/dist/index.js',
    looker: '../../../../../packages/mcp-servers/looker/dist/index.js',
    'micro-focus': '../../../../../packages/mcp-servers/micro-focus/dist/index.js',
    'monday-com': '../../../../../packages/mcp-servers/monday-com/dist/index.js',
    'ms-teams': '../../../../../packages/mcp-servers/ms-teams/dist/index.js',
    murex: '../../../../../packages/mcp-servers/murex/dist/index.js',
    neon: '../../../../../packages/mcp-servers/neon/dist/index.js',
    nimble: '../../../../../packages/mcp-servers/nimble/dist/index.js',
    notion: '../../../../../packages/mcp-servers/notion/dist/index.js',
    okta: '../../../../../packages/mcp-servers/okta/dist/index.js',
    opentext: '../../../../../packages/mcp-servers/opentext/dist/index.js',
    'oracle-ebs': '../../../../../packages/mcp-servers/oracle-ebs/dist/index.js',
    'peoplesoft-crm': '../../../../../packages/mcp-servers/peoplesoft-crm/dist/index.js',
    'peoplesoft-financials':
      '../../../../../packages/mcp-servers/peoplesoft-financials/dist/index.js',
    pipedrive: '../../../../../packages/mcp-servers/pipedrive/dist/index.js',
    planetscale: '../../../../../packages/mcp-servers/planetscale/dist/index.js',
    'power-bi': '../../../../../packages/mcp-servers/power-bi/dist/index.js',
    prestashop: '../../../../../packages/mcp-servers/prestashop/dist/index.js',
    'progress-software': '../../../../../packages/mcp-servers/progress-software/dist/index.js',
    qlik: '../../../../../packages/mcp-servers/qlik/dist/index.js',
    redshift: '../../../../../packages/mcp-servers/redshift/dist/index.js',
    'reuters-3000': '../../../../../packages/mcp-servers/reuters-3000/dist/index.js',
    rippling: '../../../../../packages/mcp-servers/rippling/dist/index.js',
    'sap-enterprise': '../../../../../packages/mcp-servers/sap-enterprise/dist/index.js',
    'sap-r2': '../../../../../packages/mcp-servers/sap-r2/dist/index.js',
    'sap-r3': '../../../../../packages/mcp-servers/sap-r3/dist/index.js',
    'sap-s4hana': '../../../../../packages/mcp-servers/sap-s4hana/dist/index.js',
    simcorp: '../../../../../packages/mcp-servers/simcorp/dist/index.js',
    slack: '../../../../../packages/mcp-servers/slack/dist/index.js',
    smartsheet: '../../../../../packages/mcp-servers/smartsheet/dist/index.js',
    snowflake: '../../../../../packages/mcp-servers/snowflake/dist/index.js',
    squarespace: '../../../../../packages/mcp-servers/squarespace/dist/index.js',
    starburst: '../../../../../packages/mcp-servers/starburst/dist/index.js',
    stripe: '../../../../../packages/mcp-servers/stripe/dist/index.js',
    sugarcrm: '../../../../../packages/mcp-servers/sugarcrm/dist/index.js',
    supabase: '../../../../../packages/mcp-servers/supabase/dist/index.js',
    'swift-fin': '../../../../../packages/mcp-servers/swift-fin/dist/index.js',
    tableau: '../../../../../packages/mcp-servers/tableau/dist/index.js',
    tcs: '../../../../../packages/mcp-servers/tcs/dist/index.js',
    'temenos-t24': '../../../../../packages/mcp-servers/temenos-t24/dist/index.js',
    teradata: '../../../../../packages/mcp-servers/teradata/dist/index.js',
    'unisys-clearpath': '../../../../../packages/mcp-servers/unisys-clearpath/dist/index.js',
    wipro: '../../../../../packages/mcp-servers/wipro/dist/index.js',
    woocommerce: '../../../../../packages/mcp-servers/woocommerce/dist/index.js',
    wrike: '../../../../../packages/mcp-servers/wrike/dist/index.js',
    xero: '../../../../../packages/mcp-servers/xero/dist/index.js',
    'zendesk-sell': '../../../../../packages/mcp-servers/zendesk-sell/dist/index.js',
    'zoho-crm': '../../../../../packages/mcp-servers/zoho-crm/dist/index.js',
    zoom: '../../../../../packages/mcp-servers/zoom/dist/index.js',
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
      throw new Error(
        `Unsupported database type: ${type}. Supported: ${Object.keys(this.serverPackages).join(', ')}`
      );
    }

    console.log(`[MCP] Starting ${type} MCP server for "${name}"...`);

    // Create instance placeholder
    const instance: MCPClientInstance = {
      id,
      client: null as any,
      transport: null as any,
      config,
      status: 'connecting',
      tools: [],
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
        console.log(
          `[MCP] Set ${Object.keys(mappedEnvVars).length} env vars for ${type}:`,
          Object.keys(mappedEnvVars)
        );
      } else {
        // Legacy single-connection-string path
        env = { ...baseEnv, [serverConfig.envKey]: connectionString };
      }

      // Resolve command and args for local MCP servers
      const command = serverConfig.command;
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
        stderr: 'pipe', // Capture stderr for debugging
      });

      instance.transport = transport;

      const client = new Client(
        {
          name: `velanova-${type}-client`,
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );

      instance.client = client;

      // Connect the client (this starts the process)
      await client.connect(transport);

      console.log(`[MCP] Connected to ${type} server for "${name}"`);

      // List available tools
      const toolsResponse = await client.listTools();
      instance.tools = toolsResponse.tools || [];

      console.log(
        `[MCP] Available tools for ${id}:`,
        instance.tools.map(t => t.name)
      );

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
        arguments: args,
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
    const queryTool = instance.tools.find(
      t =>
        t.name === 'query' ||
        t.name === 'execute_query' ||
        t.name === 'run_query' ||
        t.name === 'read_query'
    );

    if (!queryTool) {
      throw new Error(
        `No query tool found for connection ${connectionId}. Available tools: ${instance.tools.map(t => t.name).join(', ')}`
      );
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
    const listTool = instance.tools.find(
      t => t.name === 'list_tables' || t.name === 'get_tables' || t.name === 'describe_tables'
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
        throw new Error(
          `list_tables not supported for ${type} - this system's MCP server must provide a list tool`
        );
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
    const describeTool = instance.tools.find(
      t => t.name === 'describe_table' || t.name === 'get_schema' || t.name === 'table_schema'
    );

    if (describeTool) {
      return this.callTool(connectionId, describeTool.name, {
        table_name: tableName,
        table: tableName,
      });
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
        throw new Error(
          `get_table_schema not supported for ${type} - this system's MCP server must provide a describe tool`
        );
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
            parameters: tool.inputSchema || { type: 'object', properties: {} },
          },
        });
      }
    }

    return tools;
  }

  /**
   * Get status of all connections
   */
  getStatus(): Record<
    string,
    {
      status: string;
      type: string;
      name: string;
      toolCount: number;
    }
  > {
    const status: Record<string, any> = {};

    for (const [id, instance] of this.clients.entries()) {
      status[id] = {
        status: instance.status,
        type: instance.config.type,
        name: instance.config.name,
        toolCount: instance.tools.length,
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
