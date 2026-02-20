/**
 * Shared Connection Type Configuration
 * Single source of truth for all MCP connection types displayed in the UI.
 * All pages import from here to avoid duplicated lists.
 */

export interface ConnectionTypeConfig {
  icon: string;
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
    icon: '🐬', name: 'MySQL',
    description: 'Open-source relational database',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'database',
  },
  postgresql: {
    icon: '🐘', name: 'PostgreSQL',
    description: 'Advanced open-source database',
    color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30',
    category: 'database',
  },
  mariadb: {
    icon: '🦭', name: 'MariaDB',
    description: 'MySQL-compatible database',
    color: 'from-sky-500 to-sky-600', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/30',
    category: 'database',
  },
  sqlserver: {
    icon: '🔷', name: 'SQL Server',
    description: 'Microsoft enterprise database',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'database',
  },
  oracle: {
    icon: '🔴', name: 'Oracle',
    description: 'Enterprise-grade database',
    color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30',
    category: 'database',
  },
  sqlite: {
    icon: '📦', name: 'SQLite',
    description: 'Lightweight embedded database',
    color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/30',
    category: 'database',
  },

  // ─── NoSQL Databases ─────────────────────────────────────────────────
  mongodb: {
    icon: '🍃', name: 'MongoDB',
    description: 'Document-oriented NoSQL database',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'nosql',
  },
  redis: {
    icon: '🔥', name: 'Redis',
    description: 'In-memory data store',
    color: 'from-red-400 to-red-500', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/30',
    category: 'nosql',
  },
  elasticsearch: {
    icon: '🔍', name: 'Elasticsearch',
    description: 'Search and analytics engine',
    color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30',
    category: 'nosql',
  },
  dynamodb: {
    icon: '⚡', name: 'DynamoDB',
    description: 'AWS managed NoSQL database',
    color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
    category: 'nosql',
  },
  cassandra: {
    icon: '👁️', name: 'Cassandra',
    description: 'Distributed NoSQL database',
    color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30',
    category: 'nosql',
  },
  couchdb: {
    icon: '🛋️', name: 'CouchDB',
    description: 'Apache document database',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'nosql',
  },
  neo4j: {
    icon: '🕸️', name: 'Neo4j',
    description: 'Graph database platform',
    color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30',
    category: 'nosql',
  },

  // ─── Enterprise / ERP ────────────────────────────────────────────────
  'sap-hana': {
    icon: '💎', name: 'SAP HANA',
    description: 'In-memory enterprise platform',
    color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30',
    category: 'enterprise',
  },
  dynamics365: {
    icon: '🟦', name: 'Dynamics 365',
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
    icon: '🏢', name: 'SAP SuccessFactors',
    description: 'Cloud HCM suite',
    color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'hcm',
  },
  'infor-cloudsuite': {
    icon: '☁️', name: 'Infor CloudSuite',
    description: 'Industry-specific ERP cloud',
    color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30',
    category: 'erp',
  },
  'jd-edwards': {
    icon: '🏗️', name: 'JD Edwards',
    description: 'Oracle JD Edwards ERP',
    color: 'from-red-600 to-red-700', bgColor: 'bg-red-600/10', borderColor: 'border-red-600/30',
    category: 'erp',
  },
  epicor: {
    icon: '🔧', name: 'Epicor',
    description: 'Manufacturing & distribution ERP',
    color: 'from-green-600 to-green-700', bgColor: 'bg-green-600/10', borderColor: 'border-green-600/30',
    category: 'erp',
  },
  'sage-intacct': {
    icon: '📗', name: 'Sage Intacct',
    description: 'Cloud financial management',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'erp',
  },
  'oracle-peoplesoft': {
    icon: '👤', name: 'Oracle PeopleSoft',
    description: 'HR and campus solutions',
    color: 'from-red-500 to-orange-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'erp',
  },
  'oracle-opera': {
    icon: '🏨', name: 'Oracle Opera',
    description: 'Hospitality management platform',
    color: 'from-red-600 to-red-700', bgColor: 'bg-red-600/10', borderColor: 'border-red-600/30',
    category: 'erp',
  },

  // ─── CRM & Sales ─────────────────────────────────────────────────────
  salesforce: {
    icon: '☁️', name: 'Salesforce',
    description: 'CRM and enterprise cloud platform',
    color: 'from-sky-400 to-sky-500', bgColor: 'bg-sky-400/10', borderColor: 'border-sky-400/30',
    category: 'crm',
  },
  hubspot: {
    icon: '🧡', name: 'HubSpot',
    description: 'Marketing and sales CRM',
    color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30',
    category: 'crm',
  },
  'oracle-siebel': {
    icon: '📞', name: 'Oracle Siebel',
    description: 'Enterprise CRM platform',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'crm',
  },
  zendesk: {
    icon: '🎫', name: 'Zendesk',
    description: 'Customer support platform',
    color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30',
    category: 'crm',
  },

  // ─── ITSM & Support ──────────────────────────────────────────────────
  servicenow: {
    icon: '⚡', name: 'ServiceNow',
    description: 'IT service management platform',
    color: 'from-teal-400 to-teal-500', bgColor: 'bg-teal-400/10', borderColor: 'border-teal-400/30',
    category: 'enterprise',
  },
  jira: {
    icon: '📋', name: 'Jira',
    description: 'Project and issue tracking',
    color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30',
    category: 'enterprise',
  },

  // ─── HCM & HR ─────────────────────────────────────────────────────────
  workday: {
    icon: '👥', name: 'Workday',
    description: 'HR and finance management',
    color: 'from-orange-400 to-orange-500', bgColor: 'bg-orange-400/10', borderColor: 'border-orange-400/30',
    category: 'hcm',
  },
  adp: {
    icon: '💼', name: 'ADP',
    description: 'Payroll and HR solutions',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'hcm',
  },
  'ukg-kronos': {
    icon: '⏰', name: 'UKG / Kronos',
    description: 'Workforce management',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'hcm',
  },
  'sap-concur': {
    icon: '✈️', name: 'SAP Concur',
    description: 'Travel and expense management',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'hcm',
  },

  // ─── Healthcare ──────────────────────────────────────────────────────
  'epic-fhir': {
    icon: '🏥', name: 'Epic (FHIR)',
    description: 'Healthcare EHR via FHIR R4',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'healthcare',
  },
  cerner: {
    icon: '🩺', name: 'Cerner',
    description: 'Oracle Health / Cerner FHIR',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'healthcare',
  },
  meditech: {
    icon: '💊', name: 'MEDITECH',
    description: 'Healthcare information system',
    color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30',
    category: 'healthcare',
  },
  allscripts: {
    icon: '📋', name: 'Allscripts',
    description: 'Clinical and financial solutions',
    color: 'from-green-600 to-green-700', bgColor: 'bg-green-600/10', borderColor: 'border-green-600/30',
    category: 'healthcare',
  },

  // ─── Insurance ───────────────────────────────────────────────────────
  guidewire: {
    icon: '🛡️', name: 'Guidewire',
    description: 'P&C insurance platform',
    color: 'from-blue-600 to-blue-700', bgColor: 'bg-blue-600/10', borderColor: 'border-blue-600/30',
    category: 'insurance',
  },
  'duck-creek': {
    icon: '🦆', name: 'Duck Creek',
    description: 'Insurance SaaS platform',
    color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30',
    category: 'insurance',
  },
  'applied-epic': {
    icon: '📄', name: 'Applied Epic',
    description: 'Insurance management system',
    color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30',
    category: 'insurance',
  },

  // ─── Supply Chain & Logistics ────────────────────────────────────────
  'manhattan-associates': {
    icon: '📦', name: 'Manhattan Associates',
    description: 'Supply chain & WMS',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'supply-chain',
  },
  'blue-yonder': {
    icon: '🔵', name: 'Blue Yonder',
    description: 'Supply chain planning',
    color: 'from-blue-400 to-indigo-500', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30',
    category: 'supply-chain',
  },
  descartes: {
    icon: '🚚', name: 'Descartes',
    description: 'Logistics technology platform',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'supply-chain',
  },

  // ─── Finance & Banking ───────────────────────────────────────────────
  fis: {
    icon: '🏦', name: 'FIS',
    description: 'Financial services technology',
    color: 'from-blue-700 to-blue-800', bgColor: 'bg-blue-700/10', borderColor: 'border-blue-700/30',
    category: 'finance',
  },
  finastra: {
    icon: '💳', name: 'Finastra',
    description: 'Financial software solutions',
    color: 'from-purple-600 to-purple-700', bgColor: 'bg-purple-600/10', borderColor: 'border-purple-600/30',
    category: 'finance',
  },
  temenos: {
    icon: '🏛️', name: 'Temenos',
    description: 'Banking software platform',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'finance',
  },
  blackline: {
    icon: '📊', name: 'BlackLine',
    description: 'Financial close management',
    color: 'from-gray-700 to-gray-800', bgColor: 'bg-gray-700/10', borderColor: 'border-gray-700/30',
    category: 'finance',
  },
  quickbooks: {
    icon: '📒', name: 'QuickBooks',
    description: 'Small business accounting',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'finance',
  },

  // ─── Commerce ────────────────────────────────────────────────────────
  shopify: {
    icon: '🛒', name: 'Shopify',
    description: 'E-commerce platform',
    color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30',
    category: 'commerce',
  },
  magento: {
    icon: '🧲', name: 'Magento',
    description: 'Adobe Commerce platform',
    color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30',
    category: 'commerce',
  },

  // ─── Telecom ─────────────────────────────────────────────────────────
  amdocs: {
    icon: '📡', name: 'Amdocs',
    description: 'Telecom BSS / OSS platform',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'telecom',
  },
  'ericsson-bss': {
    icon: '📶', name: 'Ericsson BSS',
    description: 'Telecom billing & charging',
    color: 'from-blue-600 to-blue-700', bgColor: 'bg-blue-600/10', borderColor: 'border-blue-600/30',
    category: 'telecom',
  },

  // ─── Document Management ─────────────────────────────────────────────
  sharepoint: {
    icon: '📁', name: 'SharePoint',
    description: 'Microsoft collaboration platform',
    color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30',
    category: 'document',
  },
  documentum: {
    icon: '🗄️', name: 'Documentum',
    description: 'Enterprise content management',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'document',
  },
  'ibm-filenet': {
    icon: '📂', name: 'IBM FileNet',
    description: 'Content management platform',
    color: 'bg-blue-600 to-blue-700', bgColor: 'bg-blue-600/10', borderColor: 'border-blue-600/30',
    category: 'document',
  },
  box: {
    icon: '📥', name: 'Box',
    description: 'Cloud content management',
    color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30',
    category: 'document',
  },

  // ─── Government ──────────────────────────────────────────────────────
  'cgi-momentum': {
    icon: '🏛️', name: 'CGI Momentum',
    description: 'Government ERP platform',
    color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
    category: 'government',
  },
  'tyler-technologies': {
    icon: '🏫', name: 'Tyler Technologies',
    description: 'Government management software',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'government',
  },

  // ─── Education ───────────────────────────────────────────────────────
  'ellucian-banner': {
    icon: '🎓', name: 'Ellucian Banner',
    description: 'Higher education ERP',
    color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
    category: 'education',
  },

  // ─── Asset & Facilities ──────────────────────────────────────────────
  'ibm-maximo': {
    icon: '🏭', name: 'IBM Maximo',
    description: 'Asset management platform',
    color: 'from-blue-600 to-blue-700', bgColor: 'bg-blue-600/10', borderColor: 'border-blue-600/30',
    category: 'asset',
  },
  'ibm-tririga': {
    icon: '🏢', name: 'IBM TRIRIGA',
    description: 'Facilities management',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'asset',
  },
  'ge-predix': {
    icon: '⚙️', name: 'GE Predix',
    description: 'Industrial IoT platform',
    color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'asset',
  },

  // ─── Procurement ─────────────────────────────────────────────────────
  'sap-ariba': {
    icon: '🛍️', name: 'SAP Ariba',
    description: 'Procurement & supply chain',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'procurement',
  },
  coupa: {
    icon: '💰', name: 'Coupa',
    description: 'Business spend management',
    color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30',
    category: 'procurement',
  },

  // ─── Legacy / Mainframe ──────────────────────────────────────────────
  as400: {
    icon: '🖥️', name: 'IBM AS/400',
    description: 'IBM i / iSeries mainframe',
    color: 'from-gray-600 to-gray-700', bgColor: 'bg-gray-600/10', borderColor: 'border-gray-600/30',
    category: 'legacy',
  },

  // ─── Cloud Data Warehouses (display-only, no MCP server) ─────────────
  snowflake: {
    icon: '❄️', name: 'Snowflake',
    description: 'Cloud data platform',
    color: 'from-cyan-400 to-cyan-500', bgColor: 'bg-cyan-400/10', borderColor: 'border-cyan-400/30',
    category: 'warehouse',
  },
  bigquery: {
    icon: '📊', name: 'BigQuery',
    description: 'Google serverless data warehouse',
    color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    category: 'warehouse',
  },
  redshift: {
    icon: '🔶', name: 'Redshift',
    description: 'AWS cloud data warehouse',
    color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30',
    category: 'warehouse',
  },
  databricks: {
    icon: '🧱', name: 'Databricks',
    description: 'Unified analytics platform',
    color: 'from-red-400 to-orange-500', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/30',
    category: 'warehouse',
  },

  // ─── MCP Servers / Custom ────────────────────────────────────────────
  'mcp-server': {
    icon: '🔌', name: 'MCP Server',
    description: 'Model Context Protocol server',
    color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
    category: 'mcp',
  },
  'custom-api': {
    icon: '🔗', name: 'Custom API',
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
