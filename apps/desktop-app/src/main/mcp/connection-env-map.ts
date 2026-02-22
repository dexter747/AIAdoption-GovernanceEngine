/**
 * Connection Environment Variable Mapping — Main Process
 *
 * Maps user-provided connection form values to MCP server environment variables.
 * This is the main-process counterpart of renderer/config/connection-fields.ts.
 * We keep a separate copy because Electron main cannot import from the renderer bundle.
 *
 * The envMap for each system type tells us: field key → ENV_VAR_NAME.
 */

/** All env-var mappings per system type */
const ENV_MAPS: Record<string, Record<string, string>> = {
  // ── Databases ──
  postgresql: {
    host: 'PGHOST',
    port: 'PGPORT',
    database: 'PGDATABASE',
    username: 'PGUSER',
    password: 'PGPASSWORD',
    ssl: 'PGSSLMODE',
  },
  mysql: {
    host: 'MYSQL_HOST',
    port: 'MYSQL_PORT',
    database: 'MYSQL_DATABASE',
    username: 'MYSQL_USER',
    password: 'MYSQL_PASSWORD',
  },
  mariadb: {
    host: 'MARIADB_HOST',
    port: 'MARIADB_PORT',
    database: 'MARIADB_DATABASE',
    username: 'MARIADB_USER',
    password: 'MARIADB_PASSWORD',
  },
  sqlserver: {
    host: 'SQLSERVER_HOST',
    port: 'SQLSERVER_PORT',
    database: 'SQLSERVER_DATABASE',
    username: 'SQLSERVER_USER',
    password: 'SQLSERVER_PASSWORD',
    encrypt: 'SQLSERVER_ENCRYPT',
    trustCert: 'SQLSERVER_TRUST_CERT',
  },
  oracle: {
    host: 'ORACLE_HOST',
    port: 'ORACLE_PORT',
    service: 'ORACLE_SERVICE',
    username: 'ORACLE_USER',
    password: 'ORACLE_PASSWORD',
  },
  mongodb: { uri: 'MONGODB_URI', database: 'MONGODB_DATABASE' },
  'sap-hana': {
    host: 'SAP_HANA_HOST',
    port: 'SAP_HANA_PORT',
    username: 'SAP_HANA_USER',
    password: 'SAP_HANA_PASSWORD',
  },
  redis: { url: 'REDIS_URL' },
  elasticsearch: {
    url: 'ELASTICSEARCH_URL',
    username: 'ELASTICSEARCH_USERNAME',
    password: 'ELASTICSEARCH_PASSWORD',
  },
  cassandra: {
    contactPoints: 'CASSANDRA_CONTACT_POINTS',
    datacenter: 'CASSANDRA_DATACENTER',
    keyspace: 'CASSANDRA_KEYSPACE',
    username: 'CASSANDRA_USERNAME',
    password: 'CASSANDRA_PASSWORD',
  },
  couchdb: { url: 'COUCHDB_URL' },
  neo4j: { uri: 'NEO4J_URI', username: 'NEO4J_USER', password: 'NEO4J_PASSWORD' },
  dynamodb: {
    region: 'AWS_REGION',
    endpoint: 'DYNAMODB_ENDPOINT',
    accessKeyId: 'AWS_ACCESS_KEY_ID',
    secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
  },
  // ── CRM & Sales ──
  salesforce: {
    instanceUrl: 'SALESFORCE_INSTANCE_URL',
    username: 'SALESFORCE_USERNAME',
    password: 'SALESFORCE_PASSWORD',
    securityToken: 'SALESFORCE_SECURITY_TOKEN',
    accessToken: 'SALESFORCE_ACCESS_TOKEN',
    apiVersion: 'SALESFORCE_API_VERSION',
  },
  hubspot: { accessToken: 'HUBSPOT_ACCESS_TOKEN', apiKey: 'HUBSPOT_API_KEY' },
  'oracle-siebel': { url: 'SIEBEL_URL', username: 'SIEBEL_USERNAME', password: 'SIEBEL_PASSWORD' },
  dynamics365: {
    tenantId: 'DYNAMICS365_TENANT_ID',
    clientId: 'DYNAMICS365_CLIENT_ID',
    clientSecret: 'DYNAMICS365_CLIENT_SECRET',
    resourceUrl: 'DYNAMICS365_RESOURCE_URL',
  },
  // ── ITSM & Support ──
  servicenow: {
    instanceUrl: 'SERVICENOW_INSTANCE_URL',
    username: 'SERVICENOW_USERNAME',
    password: 'SERVICENOW_PASSWORD',
  },
  jira: { baseUrl: 'JIRA_BASE_URL', email: 'JIRA_EMAIL', apiToken: 'JIRA_API_TOKEN' },
  zendesk: {
    subdomain: 'ZENDESK_SUBDOMAIN',
    email: 'ZENDESK_EMAIL',
    apiToken: 'ZENDESK_API_TOKEN',
  },
  // ── ERP ──
  netsuite: {
    accountId: 'NETSUITE_ACCOUNT_ID',
    consumerKey: 'NETSUITE_CONSUMER_KEY',
    consumerSecret: 'NETSUITE_CONSUMER_SECRET',
    tokenId: 'NETSUITE_TOKEN_ID',
    tokenSecret: 'NETSUITE_TOKEN_SECRET',
  },
  'infor-cloudsuite': {
    apiUrl: 'INFOR_API_URL',
    tokenUrl: 'INFOR_TOKEN_URL',
    clientId: 'INFOR_CLIENT_ID',
    clientSecret: 'INFOR_CLIENT_SECRET',
  },
  'jd-edwards': {
    aisUrl: 'JDE_AIS_URL',
    username: 'JDE_USERNAME',
    password: 'JDE_PASSWORD',
    environment: 'JDE_ENVIRONMENT',
  },
  epicor: {
    url: 'EPICOR_URL',
    apiKey: 'EPICOR_API_KEY',
    username: 'EPICOR_USERNAME',
    password: 'EPICOR_PASSWORD',
    company: 'EPICOR_COMPANY',
  },
  'sage-intacct': {
    senderId: 'INTACCT_SENDER_ID',
    senderPassword: 'INTACCT_SENDER_PASSWORD',
    companyId: 'INTACCT_COMPANY_ID',
    userId: 'INTACCT_USER_ID',
    userPassword: 'INTACCT_USER_PASSWORD',
  },
  'oracle-peoplesoft': {
    url: 'PEOPLESOFT_URL',
    username: 'PEOPLESOFT_USERNAME',
    password: 'PEOPLESOFT_PASSWORD',
  },
  'oracle-opera': {
    apiUrl: 'OPERA_API_URL',
    clientId: 'OPERA_CLIENT_ID',
    clientSecret: 'OPERA_CLIENT_SECRET',
    propertyId: 'OPERA_PROPERTY_ID',
  },
  // ── HCM & HR ──
  workday: { tenant: 'WORKDAY_TENANT', username: 'WORKDAY_USERNAME', password: 'WORKDAY_PASSWORD' },
  'sap-successfactors': {
    apiUrl: 'SF_API_URL',
    companyId: 'SF_COMPANY_ID',
    username: 'SF_USERNAME',
    password: 'SF_PASSWORD',
  },
  adp: {
    apiUrl: 'ADP_API_URL',
    clientId: 'ADP_CLIENT_ID',
    clientSecret: 'ADP_CLIENT_SECRET',
    tokenUrl: 'ADP_TOKEN_URL',
  },
  'ukg-kronos': {
    apiUrl: 'UKG_API_URL',
    username: 'UKG_USERNAME',
    password: 'UKG_PASSWORD',
    apiKey: 'UKG_API_KEY',
  },
  'sap-concur': { baseUrl: 'CONCUR_BASE_URL', accessToken: 'CONCUR_ACCESS_TOKEN' },
  // ── Healthcare ──
  'epic-fhir': { fhirUrl: 'EPIC_FHIR_URL', accessToken: 'EPIC_ACCESS_TOKEN' },
  cerner: { fhirUrl: 'CERNER_FHIR_URL', accessToken: 'CERNER_ACCESS_TOKEN' },
  meditech: { fhirUrl: 'MEDITECH_FHIR_URL', accessToken: 'MEDITECH_ACCESS_TOKEN' },
  allscripts: {
    url: 'ALLSCRIPTS_URL',
    appName: 'ALLSCRIPTS_APP_NAME',
    appUsername: 'ALLSCRIPTS_APP_USERNAME',
    appPassword: 'ALLSCRIPTS_APP_PASSWORD',
  },
  // ── Insurance ──
  guidewire: {
    pcUrl: 'GUIDEWIRE_PC_URL',
    ccUrl: 'GUIDEWIRE_CC_URL',
    bcUrl: 'GUIDEWIRE_BC_URL',
    accessToken: 'GUIDEWIRE_ACCESS_TOKEN',
  },
  'duck-creek': { apiUrl: 'DUCKCREEK_API_URL', accessToken: 'DUCKCREEK_ACCESS_TOKEN' },
  'applied-epic': { url: 'APPLIED_EPIC_URL', accessToken: 'APPLIED_EPIC_ACCESS_TOKEN' },
  // ── Supply Chain ──
  'manhattan-associates': { apiUrl: 'MANHATTAN_API_URL', accessToken: 'MANHATTAN_ACCESS_TOKEN' },
  'blue-yonder': { apiUrl: 'BLUEYONDER_API_URL', accessToken: 'BLUEYONDER_ACCESS_TOKEN' },
  descartes: { apiUrl: 'DESCARTES_API_URL', apiKey: 'DESCARTES_API_KEY' },
  // ── Finance & Banking ──
  fis: {
    apiUrl: 'FIS_API_URL',
    apiKey: 'FIS_API_KEY',
    clientId: 'FIS_CLIENT_ID',
    clientSecret: 'FIS_CLIENT_SECRET',
  },
  finastra: { apiUrl: 'FINASTRA_API_URL', accessToken: 'FINASTRA_ACCESS_TOKEN' },
  temenos: {
    apiUrl: 'TEMENOS_API_URL',
    username: 'TEMENOS_USERNAME',
    password: 'TEMENOS_PASSWORD',
  },
  blackline: { apiUrl: 'BLACKLINE_API_URL', accessToken: 'BLACKLINE_ACCESS_TOKEN' },
  quickbooks: {
    apiUrl: 'QUICKBOOKS_API_URL',
    realmId: 'QUICKBOOKS_REALM_ID',
    accessToken: 'QUICKBOOKS_ACCESS_TOKEN',
  },
  // ── Commerce ──
  shopify: { storeUrl: 'SHOPIFY_STORE_URL', accessToken: 'SHOPIFY_ACCESS_TOKEN' },
  magento: { url: 'MAGENTO_URL', accessToken: 'MAGENTO_ACCESS_TOKEN' },
  // ── Telecom ──
  amdocs: { apiUrl: 'AMDOCS_API_URL', accessToken: 'AMDOCS_ACCESS_TOKEN' },
  'ericsson-bss': { url: 'ERICSSON_BSS_URL', accessToken: 'ERICSSON_BSS_ACCESS_TOKEN' },
  // ── Document Management ──
  sharepoint: {
    tenantId: 'SHAREPOINT_TENANT_ID',
    clientId: 'SHAREPOINT_CLIENT_ID',
    clientSecret: 'SHAREPOINT_CLIENT_SECRET',
    siteUrl: 'SHAREPOINT_SITE_URL',
  },
  documentum: {
    url: 'DOCUMENTUM_URL',
    username: 'DOCUMENTUM_USERNAME',
    password: 'DOCUMENTUM_PASSWORD',
    repository: 'DOCUMENTUM_REPOSITORY',
  },
  'ibm-filenet': {
    url: 'FILENET_URL',
    username: 'FILENET_USERNAME',
    password: 'FILENET_PASSWORD',
    objectStore: 'FILENET_OBJECT_STORE',
  },
  box: { accessToken: 'BOX_ACCESS_TOKEN' },
  // ── Government ──
  'cgi-momentum': { apiUrl: 'CGI_API_URL', accessToken: 'CGI_ACCESS_TOKEN' },
  'tyler-technologies': { apiUrl: 'TYLER_API_URL', apiKey: 'TYLER_API_KEY' },
  // ── Education ──
  'ellucian-banner': {
    apiUrl: 'BANNER_API_URL',
    apiKey: 'BANNER_API_KEY',
    username: 'BANNER_USERNAME',
    password: 'BANNER_PASSWORD',
  },
  // ── Asset & Facilities ──
  'ibm-maximo': {
    url: 'MAXIMO_URL',
    apiKey: 'MAXIMO_API_KEY',
    username: 'MAXIMO_USERNAME',
    password: 'MAXIMO_PASSWORD',
  },
  'ibm-tririga': { url: 'TRIRIGA_URL', username: 'TRIRIGA_USERNAME', password: 'TRIRIGA_PASSWORD' },
  'ge-predix': {
    apiUrl: 'PREDIX_API_URL',
    zoneId: 'PREDIX_ZONE_ID',
    accessToken: 'PREDIX_ACCESS_TOKEN',
  },
  // ── Procurement ──
  'sap-ariba': { apiUrl: 'ARIBA_API_URL', apiKey: 'ARIBA_API_KEY', realm: 'ARIBA_REALM' },
  coupa: {
    url: 'COUPA_URL',
    apiKey: 'COUPA_API_KEY',
    clientId: 'COUPA_CLIENT_ID',
    clientSecret: 'COUPA_CLIENT_SECRET',
  },
  // ── Legacy ──
  as400: {
    host: 'AS400_HOST',
    username: 'AS400_USERNAME',
    password: 'AS400_PASSWORD',
    database: 'AS400_DATABASE',
  },
};

/**
 * Build a Record<envVarName, value> from user-provided connection params.
 *
 * @param type  - The LegacySystemType
 * @param params - Key/value pairs from the connection form (field key = value)
 * @returns environment variables to inject when spawning the MCP server process
 */
export function buildEnvVarsFromParams(
  type: string,
  params: Record<string, string | number | undefined>
): Record<string, string> {
  const envMap = ENV_MAPS[type];
  if (!envMap) {
    // Fallback: pass everything as-is with a TYPE_ prefix
    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') {
        env[`${type.toUpperCase().replace(/-/g, '_')}_${k.toUpperCase()}`] = String(v);
      }
    }
    return env;
  }

  const env: Record<string, string> = {};
  for (const [fieldKey, envVarName] of Object.entries(envMap)) {
    const value = params[fieldKey];
    if (value !== undefined && value !== '') {
      env[envVarName] = String(value);
    }
  }

  // Also extract any values from legacy ConnectionConfig top-level fields
  // (host, port, database, username, password) that might not be in options
  const legacyMappings: Record<string, string | undefined> = {
    host: params.host !== undefined ? String(params.host) : undefined,
    port: params.port !== undefined ? String(params.port) : undefined,
    database: params.database !== undefined ? String(params.database) : undefined,
    username: params.username !== undefined ? String(params.username) : undefined,
    password: params.password !== undefined ? String(params.password) : undefined,
  };

  for (const [fieldKey, value] of Object.entries(legacyMappings)) {
    if (value && envMap[fieldKey] && !env[envMap[fieldKey]]) {
      env[envMap[fieldKey]] = value;
    }
  }

  return env;
}

export { ENV_MAPS };
