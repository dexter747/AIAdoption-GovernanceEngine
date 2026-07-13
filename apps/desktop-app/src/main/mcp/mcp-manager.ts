/**
 * MCP (Model Context Protocol) Connection Manager
 * Manages connections to database systems via MCP servers
 */

import { ConnectionConfig, LegacySystemType } from '@shared/types';
import Store from 'electron-store';
import { exec } from 'child_process';
import { promisify } from 'util';
import { buildEnvVarsFromParams } from './connection-env-map.js';

const execAsync = promisify(exec);

interface MCPConnection {
  id: string;
  name: string;
  type: LegacySystemType;
  config: ConnectionConfig;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
  error?: string;
  mcpServerType: 'docker' | 'npm' | 'custom';
  mcpServerInfo?: {
    image?: string; // Docker image
    package?: string; // npm package
    containerId?: string; // Running Docker container
    processId?: number; // npm process
  };
}

export class MCPConnectionManager {
  private store: Store<any>;
  private connections: Map<string, MCPConnection> = new Map();

  // Available MCP servers (official and community)
  private mcpServers: Record<
    LegacySystemType,
    {
      type: 'docker' | 'npm';
      image?: string;
      package?: string;
      localPath?: string;
      available: boolean;
    }
  > = {
    postgresql: {
      type: 'npm',
      package: '@modelcontextprotocol/server-postgres',
      available: true,
    },
    mysql: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/mysql/dist/index.js',
      available: true,
    },
    oracle: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/oracle/dist/index.js',
      available: true,
    },
    sqlserver: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/sqlserver/dist/index.js',
      available: true,
    },
    'sap-hana': {
      type: 'npm' as const,
      localPath: '../../../../../packages/mcp-servers/sap-hana/dist/index.js',
      available: true,
    },
    mongodb: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/mongodb/dist/index.js',
      available: true,
    },
    salesforce: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/salesforce/dist/index.js',
      available: true,
    },
    servicenow: {
      type: 'npm' as const,
      localPath: '../../../../../packages/mcp-servers/servicenow/dist/index.js',
      available: true,
    },
    jira: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/jira/dist/index.js',
      available: true,
    },
    zendesk: {
      type: 'npm' as const,
      localPath: '../../../../../packages/mcp-servers/zendesk/dist/index.js',
      available: true,
    },
    mariadb: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/mariadb/dist/index.js',
      available: true,
    },
    redis: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/redis/dist/index.js',
      available: true,
    },
    elasticsearch: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/elasticsearch/dist/index.js',
      available: true,
    },
    workday: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/workday/dist/index.js',
      available: true,
    },
    // --- NEW DATABASE SERVERS ---
    cassandra: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/cassandra/dist/index.js',
      available: true,
    },
    couchdb: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/couchdb/dist/index.js',
      available: true,
    },
    neo4j: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/neo4j/dist/index.js',
      available: true,
    },
    dynamodb: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/dynamodb/dist/index.js',
      available: true,
    },
    // --- CRM & SALES ---
    hubspot: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/hubspot/dist/index.js',
      available: true,
    },
    'oracle-siebel': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/oracle-siebel/dist/index.js',
      available: true,
    },
    dynamics365: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/dynamics365/dist/index.js',
      available: true,
    },
    // --- ERP ---
    netsuite: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/netsuite/dist/index.js',
      available: true,
    },
    'infor-cloudsuite': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/infor-cloudsuite/dist/index.js',
      available: true,
    },
    'jd-edwards': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/jd-edwards/dist/index.js',
      available: true,
    },
    epicor: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/epicor/dist/index.js',
      available: true,
    },
    'sage-intacct': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/sage-intacct/dist/index.js',
      available: true,
    },
    'oracle-peoplesoft': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/oracle-peoplesoft/dist/index.js',
      available: true,
    },
    'oracle-opera': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/oracle-opera/dist/index.js',
      available: true,
    },
    // --- HCM & HR ---
    'sap-successfactors': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/sap-successfactors/dist/index.js',
      available: true,
    },
    adp: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/adp/dist/index.js',
      available: true,
    },
    'ukg-kronos': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/ukg-kronos/dist/index.js',
      available: true,
    },
    'sap-concur': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/sap-concur/dist/index.js',
      available: true,
    },
    // --- HEALTHCARE ---
    'epic-fhir': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/epic-fhir/dist/index.js',
      available: true,
    },
    cerner: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/cerner/dist/index.js',
      available: true,
    },
    meditech: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/meditech/dist/index.js',
      available: true,
    },
    allscripts: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/allscripts/dist/index.js',
      available: true,
    },
    // --- INSURANCE ---
    guidewire: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/guidewire/dist/index.js',
      available: true,
    },
    'duck-creek': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/duck-creek/dist/index.js',
      available: true,
    },
    'applied-epic': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/applied-epic/dist/index.js',
      available: true,
    },
    // --- SUPPLY CHAIN ---
    'manhattan-associates': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/manhattan-associates/dist/index.js',
      available: true,
    },
    'blue-yonder': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/blue-yonder/dist/index.js',
      available: true,
    },
    descartes: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/descartes/dist/index.js',
      available: true,
    },
    // --- FINANCE & BANKING ---
    fis: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/fis/dist/index.js',
      available: true,
    },
    finastra: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/finastra/dist/index.js',
      available: true,
    },
    temenos: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/temenos/dist/index.js',
      available: true,
    },
    blackline: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/blackline/dist/index.js',
      available: true,
    },
    quickbooks: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/quickbooks/dist/index.js',
      available: true,
    },
    // --- COMMERCE ---
    shopify: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/shopify/dist/index.js',
      available: true,
    },
    magento: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/magento/dist/index.js',
      available: true,
    },
    // --- TELECOM ---
    amdocs: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/amdocs/dist/index.js',
      available: true,
    },
    'ericsson-bss': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/ericsson-bss/dist/index.js',
      available: true,
    },
    // --- DOCUMENT MANAGEMENT ---
    sharepoint: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/sharepoint/dist/index.js',
      available: true,
    },
    documentum: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/documentum/dist/index.js',
      available: true,
    },
    'ibm-filenet': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/ibm-filenet/dist/index.js',
      available: true,
    },
    box: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/box/dist/index.js',
      available: true,
    },
    // --- GOVERNMENT ---
    'cgi-momentum': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/cgi-momentum/dist/index.js',
      available: true,
    },
    'tyler-technologies': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/tyler-technologies/dist/index.js',
      available: true,
    },
    // --- EDUCATION ---
    'ellucian-banner': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/ellucian-banner/dist/index.js',
      available: true,
    },
    // --- ASSET & FACILITIES ---
    'ibm-maximo': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/ibm-maximo/dist/index.js',
      available: true,
    },
    'ibm-tririga': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/ibm-tririga/dist/index.js',
      available: true,
    },
    'ge-predix': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/ge-predix/dist/index.js',
      available: true,
    },
    // --- PROCUREMENT ---
    'sap-ariba': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/sap-ariba/dist/index.js',
      available: true,
    },
    coupa: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/coupa/dist/index.js',
      available: true,
    },
    // --- LEGACY / MAINFRAME ---
    as400: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/as400/dist/index.js',
      available: true,
    },
    // --- PROJECT MANAGEMENT ---
    trello: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/trello/dist/index.js',
      available: true,
    },
    // ── New MCP Servers ──
    accenture: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/accenture/dist/index.js',
      available: true,
    },
    'ach-mainframe': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/ach-mainframe/dist/index.js',
      available: true,
    },
    'active-directory': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/active-directory/dist/index.js',
      available: true,
    },
    'amazon-aurora': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/amazon-aurora/dist/index.js',
      available: true,
    },
    apptivo: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/apptivo/dist/index.js',
      available: true,
    },
    asana: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/asana/dist/index.js',
      available: true,
    },
    'aws-rds': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/aws-rds/dist/index.js',
      available: true,
    },
    'azure-sql': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/azure-sql/dist/index.js',
      available: true,
    },
    'azure-synapse': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/azure-synapse/dist/index.js',
      available: true,
    },
    bamboohr: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/bamboohr/dist/index.js',
      available: true,
    },
    basecamp: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/basecamp/dist/index.js',
      available: true,
    },
    bigcommerce: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/bigcommerce/dist/index.js',
      available: true,
    },
    bigquery: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/bigquery/dist/index.js',
      available: true,
    },
    bitbucket: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/bitbucket/dist/index.js',
      available: true,
    },
    bitrix24: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/bitrix24/dist/index.js',
      available: true,
    },
    'blackrock-aladdin': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/blackrock-aladdin/dist/index.js',
      available: true,
    },
    'bloomberg-terminal': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/bloomberg-terminal/dist/index.js',
      available: true,
    },
    brio: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/brio/dist/index.js',
      available: true,
    },
    broadcom: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/broadcom/dist/index.js',
      available: true,
    },
    calypso: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/calypso/dist/index.js',
      available: true,
    },
    'capsule-crm': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/capsule-crm/dist/index.js',
      available: true,
    },
    'charles-river': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/charles-river/dist/index.js',
      available: true,
    },
    'chips-mainframe': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/chips-mainframe/dist/index.js',
      available: true,
    },
    clickup: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/clickup/dist/index.js',
      available: true,
    },
    'close-crm': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/close-crm/dist/index.js',
      available: true,
    },
    'cobol-banking': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/cobol-banking/dist/index.js',
      available: true,
    },
    cockroachdb: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/cockroachdb/dist/index.js',
      available: true,
    },
    cognos: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/cognos/dist/index.js',
      available: true,
    },
    confluence: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/confluence/dist/index.js',
      available: true,
    },
    'copper-crm': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/copper-crm/dist/index.js',
      available: true,
    },
    creatio: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/creatio/dist/index.js',
      available: true,
    },
    'crystal-reports': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/crystal-reports/dist/index.js',
      available: true,
    },
    databricks: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/databricks/dist/index.js',
      available: true,
    },
    deel: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/deel/dist/index.js',
      available: true,
    },
    dremio: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/dremio/dist/index.js',
      available: true,
    },
    'dropbox-business': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/dropbox-business/dist/index.js',
      available: true,
    },
    'dxc-technology': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/dxc-technology/dist/index.js',
      available: true,
    },
    firebolt: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/firebolt/dist/index.js',
      available: true,
    },
    firestore: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/firestore/dist/index.js',
      available: true,
    },
    'fis-profile': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/fis-profile/dist/index.js',
      available: true,
    },
    'fis-world': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/fis-world/dist/index.js',
      available: true,
    },
    freshbooks: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/freshbooks/dist/index.js',
      available: true,
    },
    freshsales: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/freshsales/dist/index.js',
      available: true,
    },
    frontarena: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/frontarena/dist/index.js',
      available: true,
    },
    github: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/github/dist/index.js',
      available: true,
    },
    gitlab: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/gitlab/dist/index.js',
      available: true,
    },
    'google-cloud-sql': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/google-cloud-sql/dist/index.js',
      available: true,
    },
    'google-meet': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/google-meet/dist/index.js',
      available: true,
    },
    'google-workspace': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/google-workspace/dist/index.js',
      available: true,
    },
    gusto: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/gusto/dist/index.js',
      available: true,
    },
    hyperion: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/hyperion/dist/index.js',
      available: true,
    },
    'ibm-cics': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/ibm-cics/dist/index.js',
      available: true,
    },
    'ibm-ims': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/ibm-ims/dist/index.js',
      available: true,
    },
    influxdb: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/influxdb/dist/index.js',
      available: true,
    },
    infosys: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/infosys/dist/index.js',
      available: true,
    },
    insightly: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/insightly/dist/index.js',
      available: true,
    },
    'jde-oneworld': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/jde-oneworld/dist/index.js',
      available: true,
    },
    'jde-world': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/jde-world/dist/index.js',
      available: true,
    },
    jenkins: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/jenkins/dist/index.js',
      available: true,
    },
    jumpcloud: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/jumpcloud/dist/index.js',
      available: true,
    },
    keap: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/keap/dist/index.js',
      available: true,
    },
    linear: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/linear/dist/index.js',
      available: true,
    },
    looker: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/looker/dist/index.js',
      available: true,
    },
    'micro-focus': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/micro-focus/dist/index.js',
      available: true,
    },
    'monday-com': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/monday-com/dist/index.js',
      available: true,
    },
    'ms-teams': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/ms-teams/dist/index.js',
      available: true,
    },
    murex: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/murex/dist/index.js',
      available: true,
    },
    neon: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/neon/dist/index.js',
      available: true,
    },
    nimble: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/nimble/dist/index.js',
      available: true,
    },
    notion: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/notion/dist/index.js',
      available: true,
    },
    okta: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/okta/dist/index.js',
      available: true,
    },
    opentext: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/opentext/dist/index.js',
      available: true,
    },
    'oracle-ebs': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/oracle-ebs/dist/index.js',
      available: true,
    },
    'peoplesoft-crm': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/peoplesoft-crm/dist/index.js',
      available: true,
    },
    'peoplesoft-financials': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/peoplesoft-financials/dist/index.js',
      available: true,
    },
    pipedrive: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/pipedrive/dist/index.js',
      available: true,
    },
    planetscale: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/planetscale/dist/index.js',
      available: true,
    },
    'power-bi': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/power-bi/dist/index.js',
      available: true,
    },
    prestashop: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/prestashop/dist/index.js',
      available: true,
    },
    'progress-software': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/progress-software/dist/index.js',
      available: true,
    },
    qlik: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/qlik/dist/index.js',
      available: true,
    },
    redshift: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/redshift/dist/index.js',
      available: true,
    },
    'reuters-3000': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/reuters-3000/dist/index.js',
      available: true,
    },
    rippling: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/rippling/dist/index.js',
      available: true,
    },
    'sap-enterprise': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/sap-enterprise/dist/index.js',
      available: true,
    },
    'sap-r2': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/sap-r2/dist/index.js',
      available: true,
    },
    'sap-r3': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/sap-r3/dist/index.js',
      available: true,
    },
    'sap-s4hana': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/sap-s4hana/dist/index.js',
      available: true,
    },
    simcorp: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/simcorp/dist/index.js',
      available: true,
    },
    slack: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/slack/dist/index.js',
      available: true,
    },
    smartsheet: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/smartsheet/dist/index.js',
      available: true,
    },
    snowflake: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/snowflake/dist/index.js',
      available: true,
    },
    squarespace: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/squarespace/dist/index.js',
      available: true,
    },
    starburst: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/starburst/dist/index.js',
      available: true,
    },
    stripe: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/stripe/dist/index.js',
      available: true,
    },
    sugarcrm: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/sugarcrm/dist/index.js',
      available: true,
    },
    supabase: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/supabase/dist/index.js',
      available: true,
    },
    'swift-fin': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/swift-fin/dist/index.js',
      available: true,
    },
    tableau: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/tableau/dist/index.js',
      available: true,
    },
    tcs: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/tcs/dist/index.js',
      available: true,
    },
    'temenos-t24': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/temenos-t24/dist/index.js',
      available: true,
    },
    teradata: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/teradata/dist/index.js',
      available: true,
    },
    'unisys-clearpath': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/unisys-clearpath/dist/index.js',
      available: true,
    },
    wipro: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/wipro/dist/index.js',
      available: true,
    },
    woocommerce: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/woocommerce/dist/index.js',
      available: true,
    },
    wrike: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/wrike/dist/index.js',
      available: true,
    },
    xero: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/xero/dist/index.js',
      available: true,
    },
    'zendesk-sell': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/zendesk-sell/dist/index.js',
      available: true,
    },
    'zoho-crm': {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/zoho-crm/dist/index.js',
      available: true,
    },
    zoom: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/zoom/dist/index.js',
      available: true,
    },
  };

  constructor() {
    this.store = new Store({
      name: 'mcp-connections',
      defaults: {
        connections: [],
      },
    });

    this.loadConnections();
  }

  private loadConnections() {
    const saved = this.store.get('connections', []);
    saved.forEach((conn: any) => {
      this.connections.set(conn.id, conn);
    });
  }

  private saveConnections() {
    const connections = Array.from(this.connections.values());
    this.store.set('connections', connections);
  }

  // Add new MCP connection
  async addConnection(config: ConnectionConfig): Promise<MCPConnection> {
    const id = crypto.randomUUID();
    const serverInfo = this.mcpServers[config.type];

    if (!serverInfo.available) {
      throw new Error(`MCP server for ${config.type} is not available yet`);
    }

    const connection: MCPConnection = {
      id,
      name: config.name,
      type: config.type,
      config,
      enabled: false,
      status: 'disconnected',
      mcpServerType: serverInfo.type,
      mcpServerInfo: {
        image: serverInfo.image,
        package: serverInfo.package,
      },
    };

    this.connections.set(id, connection);
    this.saveConnections();

    return connection;
  }

  // Enable MCP connection (start server and connect)
  async enableConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    try {
      if (connection.mcpServerType === 'docker') {
        await this.startDockerMCPServer(connection);
      } else if (connection.mcpServerType === 'npm') {
        await this.startNpmMCPServer(connection);
      }

      connection.enabled = true;
      connection.status = 'connected';
      connection.lastConnected = new Date();
      connection.error = undefined;

      this.saveConnections();
    } catch (error: any) {
      connection.status = 'error';
      connection.error = error.message;
      throw error;
    }
  }

  // Disable MCP connection (stop server)
  async disableConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    try {
      if (connection.mcpServerType === 'docker' && connection.mcpServerInfo?.containerId) {
        await this.stopDockerContainer(connection.mcpServerInfo.containerId);
      } else if (connection.mcpServerType === 'npm' && connection.mcpServerInfo?.processId) {
        process.kill(connection.mcpServerInfo.processId);
      }

      connection.enabled = false;
      connection.status = 'disconnected';
      connection.mcpServerInfo = {
        ...connection.mcpServerInfo,
        containerId: undefined,
        processId: undefined,
      };

      this.saveConnections();
    } catch (error: any) {
      connection.error = error.message;
      throw error;
    }
  }

  // Start Docker-based MCP server
  private async startDockerMCPServer(connection: MCPConnection): Promise<void> {
    const { image } = connection.mcpServerInfo!;
    const { config } = connection;

    // Check if Docker is available
    try {
      await execAsync('docker --version');
    } catch {
      throw new Error('Docker is not installed or not running');
    }

    // Pull image if not exists
    try {
      await execAsync(`docker pull ${image}`);
    } catch (error: any) {
      throw new Error(`Failed to pull Docker image: ${error.message}`);
    }

    // Build connection string based on type
    let connectionString = '';
    if (connection.type === 'postgresql') {
      connectionString = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    } else if (connection.type === 'mysql') {
      connectionString = `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    }

    // Start container
    const containerName = `mcp-${connection.type}-${connection.id.substring(0, 8)}`;
    const cmd = `docker run -d --name ${containerName} -e CONNECTION_STRING="${connectionString}" ${image}`;

    try {
      const { stdout } = await execAsync(cmd);
      const containerId = stdout.trim();
      connection.mcpServerInfo!.containerId = containerId;
    } catch (error: any) {
      throw new Error(`Failed to start Docker container: ${error.message}`);
    }
  }

  // Start npm-based MCP server
  private async startNpmMCPServer(connection: MCPConnection): Promise<void> {
    const { package: packageName } = connection.mcpServerInfo!;
    const { config } = connection;

    // Get localPath from mcpServers lookup
    const serverInfo = this.mcpServers[connection.type];
    const localPath = serverInfo?.localPath;

    let command: string;
    let args: string[] = [];

    if (localPath) {
      // Use local MCP server from packages/mcp-servers/
      const { resolve } = await import('path');
      const mcpServerPath = resolve(__dirname, localPath);
      command = 'node';
      args = [mcpServerPath];
    } else if (packageName) {
      // Check if package is installed
      try {
        await execAsync(`npm list -g ${packageName}`);
      } catch {
        // Install if not present
        console.log(`Installing ${packageName}...`);
        await execAsync(`npm install -g ${packageName}`);
      }
      command = 'npx';
      args = ['-y', packageName];
    } else {
      throw new Error('No package or local path specified');
    }

    // Set environment variables using schema-driven mapping
    const env: Record<string, string> = Object.fromEntries(
      Object.entries(process.env).filter(([_, v]) => v !== undefined) as [string, string][]
    );

    // Merge top-level ConnectionConfig fields + options into a single params object
    const connectionParams: Record<string, string> = {};
    if (config.host) connectionParams.host = config.host;
    if (config.port) connectionParams.port = String(config.port);
    if (config.database) connectionParams.database = config.database;
    if (config.username) connectionParams.username = config.username;
    if (config.password) connectionParams.password = config.password;
    if (config.ssl !== undefined) connectionParams.ssl = config.ssl ? 'require' : 'disable';

    // Merge any extra fields from options (accessToken, clientId, tenantId, etc.)
    if (config.options) {
      for (const [key, value] of Object.entries(config.options)) {
        if (value !== undefined && value !== null && value !== '') {
          connectionParams[key] = String(value);
        }
      }
    }

    // Build env vars from the connection params via the schema mapping
    const mappedEnvVars = buildEnvVarsFromParams(connection.type, connectionParams);
    Object.assign(env, mappedEnvVars);

    // Legacy: for postgresql, also build the connection string (some tools use it)
    if (connection.type === 'postgresql' && config.host && config.username) {
      env.POSTGRES_CONNECTION_STRING = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    }
    // Legacy: for mongodb, also build the connection URI
    if (connection.type === 'mongodb' && config.host) {
      env.MONGODB_URI =
        config.options?.uri ||
        `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    }
    // Legacy: for redis, also build the URL
    if (connection.type === 'redis' && config.host) {
      env.REDIS_URL =
        config.options?.url ||
        `redis://${config.username ? config.username + ':' + config.password + '@' : ''}${config.host}:${config.port}`;
    }

    console.log(
      `[MCP Manager] Set ${Object.keys(mappedEnvVars).length} env vars for ${connection.type}:`,
      Object.keys(mappedEnvVars)
    );

    // Start MCP server as child process
    console.log(`Starting MCP server: ${command} ${args.join(' ')}`);

    // Actual spawning would happen here with child_process.spawn
    // and maintain the process reference
    connection.mcpServerInfo!.processId = 1; // Placeholder
    connection.status = 'connected';
    connection.lastConnected = new Date();
    this.saveConnections();
  }

  // Stop Docker container
  private async stopDockerContainer(containerId: string): Promise<void> {
    try {
      await execAsync(`docker stop ${containerId}`);
      await execAsync(`docker rm ${containerId}`);
    } catch (error: any) {
      console.error(`Failed to stop container: ${error.message}`);
    }
  }

  // Test MCP connection
  async testConnection(id: string): Promise<boolean> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // TODO: Implement actual MCP connection test
    // This would involve sending a test query via MCP protocol
    return true;
  }

  // Get all connections
  getAllConnections(): MCPConnection[] {
    return Array.from(this.connections.values());
  }

  // Get connection by ID
  getConnection(id: string): MCPConnection | undefined {
    return this.connections.get(id);
  }

  // Update connection
  async updateConnection(id: string, updates: Partial<ConnectionConfig>): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // If connection is enabled, disable it first
    if (connection.enabled) {
      await this.disableConnection(id);
    }

    connection.config = { ...connection.config, ...updates };
    if (updates.name) {
      connection.name = updates.name;
    }

    this.saveConnections();
  }

  // Delete connection
  async deleteConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Disable if enabled
    if (connection.enabled) {
      await this.disableConnection(id);
    }

    this.connections.delete(id);
    this.saveConnections();
  }

  // Get available MCP server types
  getAvailableMCPServers(): Record<
    LegacySystemType,
    {
      available: boolean;
      type: 'docker' | 'npm' | 'custom';
      status: string;
    }
  > {
    const result: any = {};
    for (const [type, info] of Object.entries(this.mcpServers)) {
      result[type] = {
        available: info.available,
        type: info.type,
        status: info.available ? `Ready (${info.type})` : 'Coming soon',
      };
    }
    return result;
  }

  // Check if Docker is available
  async checkDockerAvailable(): Promise<boolean> {
    try {
      await execAsync('docker --version');
      return true;
    } catch {
      return false;
    }
  }
}

export const mcpConnectionManager = new MCPConnectionManager();
