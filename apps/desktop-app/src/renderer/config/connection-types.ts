/**
 * Shared Connection Type Configuration
 * Single source of truth for all MCP connection types displayed in the UI.
 * All pages import from here to avoid duplicated lists.
 */

export interface ConnectionTypeConfig {
  icon: string;
  /** Path to a static logo image (relative to public root, e.g. /legacy/mysql.svg).
   *  When present, rendered instead of the emoji icon. */
  logo?: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  category: ConnectionCategory;
}

export type ConnectionCategory =
  | 'database'
  | 'nosql'
  | 'enterprise'
  | 'erp'
  | 'crm'
  | 'hcm'
  | 'healthcare'
  | 'insurance'
  | 'supply-chain'
  | 'finance'
  | 'commerce'
  | 'telecom'
  | 'document'
  | 'government'
  | 'education'
  | 'asset'
  | 'procurement'
  | 'legacy'
  | 'warehouse'
  | 'mcp';

export const CONNECTION_LIBRARY: Record<string, ConnectionTypeConfig> = {
  // ─── Relational Databases ────────────────────────────────────────────
  mysql: {
    icon: '🐬', logo: '/legacy/mysql.svg', name: 'MySQL',
    description: 'Open-source relational database',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'database',
  },
  postgresql: {
    icon: '🐘', logo: '/legacy/postgresql.png', name: 'PostgreSQL',
    description: 'Advanced open-source database',
    color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30',
    category: 'database',
  },
  mariadb: {
    icon: '🦭', logo: '/legacy/mariadb.svg', name: 'MariaDB',
    description: 'MySQL-compatible database',
    color: 'from-sky-500 to-sky-600', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/30',
    category: 'database',
  },
  sqlserver: {
    icon: '🔷', logo: '/legacy/sqlserver.svg', name: 'SQL Server',
    description: 'Microsoft enterprise database',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'database',
  },
  oracle: {
    icon: '🔴', logo: '/legacy/oracle.svg', name: 'Oracle',
    description: 'Enterprise-grade database',
    color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30',
    category: 'database',
  },
  sqlite: {
    icon: '📦', logo: '/legacy/sqlite.svg', name: 'SQLite',
    description: 'Lightweight embedded database',
    color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/30',
    category: 'database',
  },

  // ─── NoSQL Databases ─────────────────────────────────────────────────
  mongodb: {
    icon: '🍃', logo: '/legacy/mongodb.svg', name: 'MongoDB',
    description: 'Document-oriented NoSQL database',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'nosql',
  },
  redis: {
    icon: '🔥', logo: '/legacy/redis-logo.svg', name: 'Redis',
    description: 'In-memory data store',
    color: 'from-red-400 to-red-500', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/30',
    category: 'nosql',
  },
  elasticsearch: {
    icon: '🔍', logo: '/legacy/elasticsearch.svg', name: 'Elasticsearch',
    description: 'Search and analytics engine',
    color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30',
    category: 'nosql',
  },
  dynamodb: {
    icon: '⚡', logo: '/legacy/dynamodb.svg', name: 'DynamoDB',
    description: 'AWS managed NoSQL database',
    color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
    category: 'nosql',
  },
  cassandra: {
    icon: '👁️', logo: '/legacy/cassandra.svg', name: 'Cassandra',
    description: 'Distributed NoSQL database',
    color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30',
    category: 'nosql',
  },
  couchdb: {
    icon: '🛋️', logo: '/legacy/CouchDB.svg', name: 'CouchDB',
    description: 'Apache document database',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'nosql',
  },
  neo4j: {
    icon: '🕸️', logo: '/legacy/nero4j.jpeg', name: 'Neo4j',
    description: 'Graph database platform',
    color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30',
    category: 'nosql',
  },

  // ─── Enterprise / ERP ────────────────────────────────────────────────
  'sap-hana': {
    icon: '💎', logo: '/legacy/saphana.svg', name: 'SAP HANA',
    description: 'In-memory enterprise platform',
    color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30',
    category: 'enterprise',
  },
  dynamics365: {
    icon: '🟦', logo: '/legacy/Dynamics365.svg', name: 'Dynamics 365',
    description: 'Microsoft ERP & CRM platform',
    color: 'from-blue-600 to-blue-700', bgColor: 'bg-blue-600/10', borderColor: 'border-blue-600/30',
    category: 'erp',
  },
  netsuite: {
    icon: '🌐', name: 'NetSuite',
    description: 'Oracle cloud ERP platform',
    color: 'from-gray-600 to-gray-700', bgColor: 'bg-gray-600/10', borderColor: 'border-gray-600/30',
    category: 'erp',
  },
  'sap-successfactors': {
    icon: '🏢', logo: '/legacy/sap-successfactors.png', name: 'SAP SuccessFactors',
    description: 'Cloud HCM suite',
    color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'hcm',
  },
  'infor-cloudsuite': {
    icon: '☁️', logo: '/legacy/infor.svg', name: 'Infor CloudSuite',
    description: 'Industry-specific ERP cloud',
    color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30',
    category: 'erp',
  },
  'jd-edwards': {
    icon: '🏗️', logo: '/legacy/JDEdwards.svg', name: 'JD Edwards',
    description: 'Oracle JD Edwards ERP',
    color: 'from-red-600 to-red-700', bgColor: 'bg-red-600/10', borderColor: 'border-red-600/30',
    category: 'erp',
  },
  epicor: {
    icon: '🔧', logo: '/legacy/epicor.svg', name: 'Epicor',
    description: 'Manufacturing & distribution ERP',
    color: 'from-green-600 to-green-700', bgColor: 'bg-green-600/10', borderColor: 'border-green-600/30',
    category: 'erp',
  },
  'sage-intacct': {
    icon: '📗', logo: '/legacy/sage-intacct.svg', name: 'Sage Intacct',
    description: 'Cloud financial management',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'erp',
  },
  'oracle-peoplesoft': {
    icon: '👤', logo: '/legacy/peoplesoft.svg', name: 'Oracle PeopleSoft',
    description: 'HR and campus solutions',
    color: 'from-red-500 to-orange-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'erp',
  },
  'oracle-opera': {
    icon: '🏨', logo: '/legacy/oracleopera.svg', name: 'Oracle Opera',
    description: 'Hospitality management platform',
    color: 'from-red-600 to-red-700', bgColor: 'bg-red-600/10', borderColor: 'border-red-600/30',
    category: 'erp',
  },

  // ─── CRM & Sales ─────────────────────────────────────────────────────
  salesforce: {
    icon: '☁️', logo: '/legacy/salesforce.png', name: 'Salesforce',
    description: 'CRM and enterprise cloud platform',
    color: 'from-sky-400 to-sky-500', bgColor: 'bg-sky-400/10', borderColor: 'border-sky-400/30',
    category: 'crm',
  },
  hubspot: {
    icon: '🧡', logo: '/legacy/hubspot.svg', name: 'HubSpot',
    description: 'Marketing and sales CRM',
    color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30',
    category: 'crm',
  },
  'oracle-siebel': {
    icon: '📞', logo: '/legacy/oraclesiebel.svg', name: 'Oracle Siebel',
    description: 'Enterprise CRM platform',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'crm',
  },
  zendesk: {
    icon: '🎫', logo: '/legacy/zendesk.svg', name: 'Zendesk',
    description: 'Customer support platform',
    color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30',
    category: 'crm',
  },

  // ─── ITSM & Support ──────────────────────────────────────────────────
  servicenow: {
    icon: '⚡', logo: '/legacy/ServiceNow.svg', name: 'ServiceNow',
    description: 'IT service management platform',
    color: 'from-teal-400 to-teal-500', bgColor: 'bg-teal-400/10', borderColor: 'border-teal-400/30',
    category: 'enterprise',
  },
  jira: {
    icon: '📋', logo: '/legacy/jira.svg', name: 'Jira',
    description: 'Project and issue tracking',
    color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30',
    category: 'enterprise',
  },

  // ─── HCM & HR ─────────────────────────────────────────────────────────
  workday: {
    icon: '👥', logo: '/legacy/workday.svg', name: 'Workday',
    description: 'HR and finance management',
    color: 'from-orange-400 to-orange-500', bgColor: 'bg-orange-400/10', borderColor: 'border-orange-400/30',
    category: 'hcm',
  },
  adp: {
    icon: '💼', logo: '/legacy/adp.svg', name: 'ADP',
    description: 'Payroll and HR solutions',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'hcm',
  },
  'ukg-kronos': {
    icon: '⏰', logo: '/legacy/ukg.svg', name: 'UKG / Kronos',
    description: 'Workforce management',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'hcm',
  },
  'sap-concur': {
    icon: '✈️', logo: '/legacy/sapconcur.svg', name: 'SAP Concur',
    description: 'Travel and expense management',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'hcm',
  },

  // ─── Healthcare ──────────────────────────────────────────────────────
  'epic-fhir': {
    icon: '🏥', logo: '/legacy/epicsystems.png', name: 'Epic (FHIR)',
    description: 'Healthcare EHR via FHIR R4',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'healthcare',
  },
  cerner: {
    icon: '🩺', logo: '/legacy/oraclecerner.svg', name: 'Cerner',
    description: 'Oracle Health / Cerner FHIR',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'healthcare',
  },
  meditech: {
    icon: '💊', logo: '/legacy/meditech.svg', name: 'MEDITECH',
    description: 'Healthcare information system',
    color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30',
    category: 'healthcare',
  },
  allscripts: {
    icon: '📋', logo: '/legacy/allscripts.svg', name: 'Allscripts',
    description: 'Clinical and financial solutions',
    color: 'from-green-600 to-green-700', bgColor: 'bg-green-600/10', borderColor: 'border-green-600/30',
    category: 'healthcare',
  },

  // ─── Insurance ───────────────────────────────────────────────────────
  guidewire: {
    icon: '🛡️', logo: '/legacy/guidewire.png', name: 'Guidewire',
    description: 'P&C insurance platform',
    color: 'from-blue-600 to-blue-700', bgColor: 'bg-blue-600/10', borderColor: 'border-blue-600/30',
    category: 'insurance',
  },
  'duck-creek': {
    icon: '🦆', logo: '/legacy/duckcreek.jpeg', name: 'Duck Creek',
    description: 'Insurance SaaS platform',
    color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30',
    category: 'insurance',
  },
  'applied-epic': {
    icon: '📄', logo: '/legacy/appliedepic.png', name: 'Applied Epic',
    description: 'Insurance management system',
    color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30',
    category: 'insurance',
  },

  // ─── Supply Chain & Logistics ────────────────────────────────────────
  'manhattan-associates': {
    icon: '📦', logo: '/legacy/manhattan-associates.svg', name: 'Manhattan Associates',
    description: 'Supply chain & WMS',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'supply-chain',
  },
  'blue-yonder': {
    icon: '🔵', logo: '/legacy/blueyonder.svg', name: 'Blue Yonder',
    description: 'Supply chain planning',
    color: 'from-blue-400 to-indigo-500', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30',
    category: 'supply-chain',
  },
  descartes: {
    icon: '🚚', logo: '/legacy/descartes.jpeg', name: 'Descartes',
    description: 'Logistics technology platform',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'supply-chain',
  },

  // ─── Finance & Banking ───────────────────────────────────────────────
  fis: {
    icon: '🏦', logo: '/legacy/fis.jpeg', name: 'FIS',
    description: 'Financial services technology',
    color: 'from-blue-700 to-blue-800', bgColor: 'bg-blue-700/10', borderColor: 'border-blue-700/30',
    category: 'finance',
  },
  finastra: {
    icon: '💳', logo: '/legacy/finastra.jpeg', name: 'Finastra',
    description: 'Financial software solutions',
    color: 'from-purple-600 to-purple-700', bgColor: 'bg-purple-600/10', borderColor: 'border-purple-600/30',
    category: 'finance',
  },
  temenos: {
    icon: '🏛️', logo: '/legacy/temenos.jpeg', name: 'Temenos',
    description: 'Banking software platform',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'finance',
  },
  blackline: {
    icon: '📊', logo: '/legacy/blackline.svg', name: 'BlackLine',
    description: 'Financial close management',
    color: 'from-gray-700 to-gray-800', bgColor: 'bg-gray-700/10', borderColor: 'border-gray-700/30',
    category: 'finance',
  },
  quickbooks: {
    icon: '📒', logo: '/legacy/quickbooks.png', name: 'QuickBooks',
    description: 'Small business accounting',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'finance',
  },

  // ─── Commerce ────────────────────────────────────────────────────────
  shopify: {
    icon: '🛒', logo: '/legacy/shopify.svg', name: 'Shopify',
    description: 'E-commerce platform',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'commerce',
  },
  magento: {
    icon: '🧲', logo: '/legacy/magento.png', name: 'Magento',
    description: 'Adobe Commerce platform',
    color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30',
    category: 'commerce',
  },

  // ─── Telecom ─────────────────────────────────────────────────────────
  amdocs: {
    icon: '📡', logo: '/legacy/amdocs.svg', name: 'Amdocs',
    description: 'Telecom BSS / OSS platform',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'telecom',
  },
  'ericsson-bss': {
    icon: '📶', logo: '/legacy/ericsson.jpeg', name: 'Ericsson BSS',
    description: 'Telecom billing & charging',
    color: 'from-blue-600 to-blue-700', bgColor: 'bg-blue-600/10', borderColor: 'border-blue-600/30',
    category: 'telecom',
  },

  // ─── Document Management ─────────────────────────────────────────────
  sharepoint: {
    icon: '📁', logo: '/legacy/sharepoint.svg', name: 'SharePoint',
    description: 'Microsoft collaboration platform',
    color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30',
    category: 'document',
  },
  documentum: {
    icon: '🗄️', logo: '/legacy/documentum.svg', name: 'Documentum',
    description: 'Enterprise content management',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'document',
  },
  'ibm-filenet': {
    icon: '📂', logo: '/legacy/filenet.svg', name: 'IBM FileNet',
    description: 'Content management platform',
    color: 'from-blue-600 to-blue-700', bgColor: 'bg-blue-600/10', borderColor: 'border-blue-600/30',
    category: 'document',
  },
  box: {
    icon: '📥', logo: '/legacy/box.svg', name: 'Box',
    description: 'Cloud content management',
    color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30',
    category: 'document',
  },

  // ─── Government ──────────────────────────────────────────────────────
  'cgi-momentum': {
    icon: '🏛️', logo: '/legacy/cgilogo.svg', name: 'CGI Momentum',
    description: 'Government ERP platform',
    color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
    category: 'government',
  },
  'tyler-technologies': {
    icon: '🏫', logo: '/legacy/tylertechnologies.svg', name: 'Tyler Technologies',
    description: 'Government management software',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'government',
  },

  // ─── Education ───────────────────────────────────────────────────────
  'ellucian-banner': {
    icon: '🎓', logo: '/legacy/ellucian.svg', name: 'Ellucian Banner',
    description: 'Higher education ERP',
    color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
    category: 'education',
  },

  // ─── Asset & Facilities ──────────────────────────────────────────────
  'ibm-maximo': {
    icon: '🏭', logo: '/legacy/ibm-maximo.png', name: 'IBM Maximo',
    description: 'Asset management platform',
    color: 'from-blue-600 to-blue-700', bgColor: 'bg-blue-600/10', borderColor: 'border-blue-600/30',
    category: 'asset',
  },
  'ibm-tririga': {
    icon: '🏢', logo: '/legacy/triraga.jpg', name: 'IBM TRIRIGA',
    description: 'Facilities management',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'asset',
  },
  'ge-predix': {
    icon: '⚙️', logo: '/legacy/ge-predix.jpg', name: 'GE Predix',
    description: 'Industrial IoT platform',
    color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'asset',
  },

  // ─── Procurement ─────────────────────────────────────────────────────
  'sap-ariba': {
    icon: '🛍️', logo: '/legacy/sap-ariba.png', name: 'SAP Ariba',
    description: 'Procurement & supply chain',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'procurement',
  },
  coupa: {
    icon: '💰', logo: '/legacy/coupa.svg', name: 'Coupa',
    description: 'Business spend management',
    color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30',
    category: 'procurement',
  },

  // ─── Legacy / Mainframe ──────────────────────────────────────────────
  as400: {
    icon: '🖥️', logo: '/legacy/ibmas400.png', name: 'IBM AS/400',
    description: 'IBM i / iSeries mainframe',
    color: 'from-gray-600 to-gray-700', bgColor: 'bg-gray-600/10', borderColor: 'border-gray-600/30',
    category: 'legacy',
  },

  // ─── Cloud Data Warehouses (display-only, no MCP server) ─────────────
  snowflake: {
    icon: '❄️', logo: '/legacy/snowflake.svg', name: 'Snowflake',
    description: 'Cloud data platform',
    color: 'from-cyan-400 to-cyan-500', bgColor: 'bg-cyan-400/10', borderColor: 'border-cyan-400/30',
    category: 'warehouse',
  },
  bigquery: {
    icon: '📊', logo: '/legacy/BigQuery.svg', name: 'BigQuery',
    description: 'Google serverless data warehouse',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'warehouse',
  },
  redshift: {
    icon: '🔶', logo: '/legacy/redshiftlogo.svg', name: 'Redshift',
    description: 'AWS cloud data warehouse',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'warehouse',
  },
  databricks: {
    icon: '🧱', logo: '/legacy/databricks.svg', name: 'Databricks',
    description: 'Unified analytics platform',
    color: 'from-red-400 to-orange-500', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/30',
    category: 'warehouse',
  },

  // ─── MCP Servers / Custom ────────────────────────────────────────────
  'mcp-server': {
    icon: '🔌', logo: '/legacy/mcp.jpg', name: 'MCP Server',
    description: 'Model Context Protocol server',
    color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
    category: 'mcp',
  },
  'custom-api': {
    icon: '🔗', logo: '/legacy/customapi.png', name: 'Custom API',
    description: 'Connect to any REST/GraphQL API',
    color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/30',
    category: 'mcp',
  },
};

/** Categories for filtering in the UI */
export const CONNECTION_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'database', name: 'Databases' },
  { id: 'nosql', name: 'NoSQL' },
  { id: 'enterprise', name: 'Enterprise' },
  { id: 'erp', name: 'ERP' },
  { id: 'crm', name: 'CRM & Sales' },
  { id: 'hcm', name: 'HCM & HR' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'insurance', name: 'Insurance' },
  { id: 'supply-chain', name: 'Supply Chain' },
  { id: 'finance', name: 'Finance' },
  { id: 'commerce', name: 'Commerce' },
  { id: 'telecom', name: 'Telecom' },
  { id: 'document', name: 'Documents' },
  { id: 'government', name: 'Government' },
  { id: 'education', name: 'Education' },
  { id: 'asset', name: 'Assets' },
  { id: 'procurement', name: 'Procurement' },
  { id: 'legacy', name: 'Mainframe' },
  { id: 'warehouse', name: 'Data Warehouse' },
  { id: 'mcp', name: 'MCP & APIs' },
] as const;

/** Helper: get connection info with a safe fallback */
export function getConnectionInfo(type: string): ConnectionTypeConfig {
  return CONNECTION_LIBRARY[type] ?? {
    icon: '🔗',
    name: type,
    description: 'Custom connection',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    category: 'mcp' as ConnectionCategory,
  };
}

/** Helper: Build simple icon/name/color lookup for lightweight pages */
export function getSimpleConnectionTypes(): Record<string, { icon: string; name: string; color: string }> {
  const result: Record<string, { icon: string; name: string; color: string }> = {};
  for (const [key, val] of Object.entries(CONNECTION_LIBRARY)) {
    result[key] = { icon: val.icon, name: val.name, color: val.color };
  }
  return result;
}
