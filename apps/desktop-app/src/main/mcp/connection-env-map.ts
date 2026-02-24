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
  // ── Project Management ──
  trello: {
    apiKey: 'TRELLO_API_KEY',
    apiToken: 'TRELLO_API_TOKEN',
  },
  // ── New MCP Servers ──
  accenture: { baseUrl: 'ACCENTURE_BASE_URL', apiKey: 'ACCENTURE_API_KEY' },
  'ach-mainframe': {
    achHost: 'ACH_HOST',
    achPort: 'ACH_PORT',
    achUsername: 'ACH_USERNAME',
    achPassword: 'ACH_PASSWORD',
  },
  'active-directory': {
    adTenantId: 'AZURE_AD_TENANT_ID',
    adClientId: 'AZURE_AD_CLIENT_ID',
    adClientSecret: 'AZURE_AD_CLIENT_SECRET',
  },
  'amazon-aurora': {
    auroraHost: 'AURORA_HOST',
    auroraPort: 'AURORA_PORT',
    auroraDatabase: 'AURORA_DATABASE',
    auroraUser: 'AURORA_USER',
    auroraPassword: 'AURORA_PASSWORD',
  },
  apptivo: { apiKey: 'APPTIVO_API_KEY', accessKey: 'APPTIVO_ACCESS_KEY' },
  asana: { accessToken: 'ASANA_ACCESS_TOKEN' },
  'aws-rds': {
    rdsHost: 'RDS_HOST',
    rdsPort: 'RDS_PORT',
    rdsDatabase: 'RDS_DATABASE',
    rdsUser: 'RDS_USER',
    rdsPassword: 'RDS_PASSWORD',
  },
  'azure-sql': {
    host: 'AZURE_SQL_HOST',
    database: 'AZURE_SQL_DATABASE',
    user: 'AZURE_SQL_USER',
    password: 'AZURE_SQL_PASSWORD',
  },
  'azure-synapse': {
    synapseHost: 'SYNAPSE_HOST',
    synapseDatabase: 'SYNAPSE_DATABASE',
    synapseUser: 'SYNAPSE_USER',
    synapsePassword: 'SYNAPSE_PASSWORD',
  },
  bamboohr: { apiKey: 'BAMBOOHR_API_KEY', subdomain: 'BAMBOOHR_SUBDOMAIN' },
  basecamp: { accessToken: 'BASECAMP_ACCESS_TOKEN', accountId: 'BASECAMP_ACCOUNT_ID' },
  bigcommerce: { storeHash: 'BIGCOMMERCE_STORE_HASH', accessToken: 'BIGCOMMERCE_ACCESS_TOKEN' },
  bigquery: {
    projectId: 'BIGQUERY_PROJECT_ID',
    applicationCredentials: 'GOOGLE_APPLICATION_CREDENTIALS',
  },
  bitbucket: { username: 'BITBUCKET_USERNAME', appPassword: 'BITBUCKET_APP_PASSWORD' },
  bitrix24: { webhookUrl: 'BITRIX24_WEBHOOK_URL' },
  'blackrock-aladdin': { aladdinBaseUrl: 'ALADDIN_BASE_URL', aladdinApiKey: 'ALADDIN_API_KEY' },
  'bloomberg-terminal': { bloombergHost: 'BLOOMBERG_HOST', bloombergPort: 'BLOOMBERG_PORT' },
  brio: {
    baseUrl: 'BRIO_BASE_URL',
    username: 'BRIO_USERNAME',
    password: 'BRIO_PASSWORD',
  },
  broadcom: { baseUrl: 'BROADCOM_BASE_URL', apiKey: 'BROADCOM_API_KEY' },
  calypso: {
    baseUrl: 'CALYPSO_BASE_URL',
    username: 'CALYPSO_USERNAME',
    password: 'CALYPSO_PASSWORD',
  },
  'capsule-crm': { capsuleAccessToken: 'CAPSULE_ACCESS_TOKEN' },
  'charles-river': { baseUrl: 'CHARLES_RIVER_BASE_URL', apiKey: 'CHARLES_RIVER_API_KEY' },
  'chips-mainframe': {
    chipsHost: 'CHIPS_HOST',
    chipsPort: 'CHIPS_PORT',
    chipsUsername: 'CHIPS_USERNAME',
    chipsPassword: 'CHIPS_PASSWORD',
  },
  clickup: { apiToken: 'CLICKUP_API_TOKEN' },
  'close-crm': { closeApiKey: 'CLOSE_API_KEY' },
  'cobol-banking': {
    cobolHost: 'COBOL_HOST',
    cobolPort: 'COBOL_PORT',
    cobolUsername: 'COBOL_USERNAME',
    cobolPassword: 'COBOL_PASSWORD',
  },
  cockroachdb: { url: 'COCKROACHDB_URL' },
  cognos: {
    baseUrl: 'COGNOS_BASE_URL',
    namespace: 'COGNOS_NAMESPACE',
    username: 'COGNOS_USERNAME',
    password: 'COGNOS_PASSWORD',
  },
  confluence: {
    baseUrl: 'CONFLUENCE_BASE_URL',
    username: 'CONFLUENCE_USERNAME',
    apiToken: 'CONFLUENCE_API_TOKEN',
  },
  'copper-crm': { copperApiKey: 'COPPER_API_KEY', copperEmail: 'COPPER_EMAIL' },
  creatio: {
    baseUrl: 'CREATIO_BASE_URL',
    username: 'CREATIO_USERNAME',
    password: 'CREATIO_PASSWORD',
  },
  'crystal-reports': {
    crystalServerUrl: 'CRYSTAL_SERVER_URL',
    crystalUsername: 'CRYSTAL_USERNAME',
    crystalPassword: 'CRYSTAL_PASSWORD',
  },
  databricks: {
    host: 'DATABRICKS_HOST',
    token: 'DATABRICKS_TOKEN',
    warehouseId: 'DATABRICKS_WAREHOUSE_ID',
  },
  deel: { apiToken: 'DEEL_API_TOKEN' },
  dremio: { host: 'DREMIO_HOST', token: 'DREMIO_TOKEN' },
  'dropbox-business': { dropboxAccessToken: 'DROPBOX_ACCESS_TOKEN' },
  'dxc-technology': { dxcBaseUrl: 'DXC_BASE_URL', dxcApiKey: 'DXC_API_KEY' },
  firebolt: {
    clientId: 'FIREBOLT_CLIENT_ID',
    clientSecret: 'FIREBOLT_CLIENT_SECRET',
    database: 'FIREBOLT_DATABASE',
    engine: 'FIREBOLT_ENGINE',
  },
  firestore: {
    projectId: 'FIRESTORE_PROJECT_ID',
    applicationCredentials: 'GOOGLE_APPLICATION_CREDENTIALS',
  },
  'fis-profile': {
    baseUrl: 'FIS_PROFILE_BASE_URL',
    username: 'FIS_PROFILE_USERNAME',
    password: 'FIS_PROFILE_PASSWORD',
  },
  'fis-world': {
    baseUrl: 'FIS_WORLD_BASE_URL',
    username: 'FIS_WORLD_USERNAME',
    password: 'FIS_WORLD_PASSWORD',
  },
  freshbooks: { accessToken: 'FRESHBOOKS_ACCESS_TOKEN', accountId: 'FRESHBOOKS_ACCOUNT_ID' },
  freshsales: { apiKey: 'FRESHSALES_API_KEY', domain: 'FRESHSALES_DOMAIN' },
  frontarena: {
    baseUrl: 'FRONTARENA_BASE_URL',
    username: 'FRONTARENA_USERNAME',
    password: 'FRONTARENA_PASSWORD',
  },
  github: { token: 'GITHUB_TOKEN' },
  gitlab: { token: 'GITLAB_TOKEN', url: 'GITLAB_URL' },
  'google-cloud-sql': {
    cloudsqlHost: 'CLOUDSQL_HOST',
    cloudsqlPort: 'CLOUDSQL_PORT',
    cloudsqlDatabase: 'CLOUDSQL_DATABASE',
    cloudsqlUser: 'CLOUDSQL_USER',
    cloudsqlPassword: 'CLOUDSQL_PASSWORD',
  },
  'google-meet': { accessToken: 'GOOGLE_ACCESS_TOKEN' },
  'google-workspace': { accessToken: 'GOOGLE_WORKSPACE_ACCESS_TOKEN' },
  gusto: { accessToken: 'GUSTO_ACCESS_TOKEN' },
  hyperion: {
    baseUrl: 'HYPERION_BASE_URL',
    username: 'HYPERION_USERNAME',
    password: 'HYPERION_PASSWORD',
  },
  'ibm-cics': {
    cicsBaseUrl: 'CICS_BASE_URL',
    cicsUsername: 'CICS_USERNAME',
    cicsPassword: 'CICS_PASSWORD',
  },
  'ibm-ims': {
    imsBaseUrl: 'IMS_BASE_URL',
    imsUsername: 'IMS_USERNAME',
    imsPassword: 'IMS_PASSWORD',
  },
  influxdb: {
    url: 'INFLUXDB_URL',
    token: 'INFLUXDB_TOKEN',
    org: 'INFLUXDB_ORG',
  },
  infosys: { baseUrl: 'INFOSYS_BASE_URL', apiKey: 'INFOSYS_API_KEY' },
  insightly: { apiKey: 'INSIGHTLY_API_KEY' },
  'jde-oneworld': {
    jdeBaseUrl: 'JDE_BASE_URL',
    jdeUsername: 'JDE_USERNAME',
    jdePassword: 'JDE_PASSWORD',
  },
  'jde-world': {
    host: 'JDE_WORLD_HOST',
    username: 'JDE_WORLD_USERNAME',
    password: 'JDE_WORLD_PASSWORD',
  },
  jenkins: {
    url: 'JENKINS_URL',
    user: 'JENKINS_USER',
    token: 'JENKINS_TOKEN',
  },
  jumpcloud: { apiKey: 'JUMPCLOUD_API_KEY' },
  keap: { accessToken: 'KEAP_ACCESS_TOKEN' },
  linear: { apiKey: 'LINEAR_API_KEY' },
  looker: {
    baseUrl: 'LOOKER_BASE_URL',
    clientId: 'LOOKER_CLIENT_ID',
    clientSecret: 'LOOKER_CLIENT_SECRET',
  },
  'micro-focus': { baseUrl: 'MICRO_FOCUS_BASE_URL', apiKey: 'MICRO_FOCUS_API_KEY' },
  'monday-com': { mondayApiToken: 'MONDAY_API_TOKEN' },
  'ms-teams': { accessToken: 'MS_TEAMS_ACCESS_TOKEN' },
  murex: {
    baseUrl: 'MUREX_BASE_URL',
    username: 'MUREX_USERNAME',
    password: 'MUREX_PASSWORD',
  },
  neon: { databaseUrl: 'NEON_DATABASE_URL' },
  nimble: { apiKey: 'NIMBLE_API_KEY' },
  notion: { apiKey: 'NOTION_API_KEY' },
  okta: { domain: 'OKTA_DOMAIN', apiToken: 'OKTA_API_TOKEN' },
  opentext: {
    baseUrl: 'OPENTEXT_BASE_URL',
    username: 'OPENTEXT_USERNAME',
    password: 'OPENTEXT_PASSWORD',
  },
  'oracle-ebs': {
    baseUrl: 'ORACLE_EBS_BASE_URL',
    username: 'ORACLE_EBS_USERNAME',
    password: 'ORACLE_EBS_PASSWORD',
  },
  'peoplesoft-crm': {
    baseUrl: 'PEOPLESOFT_CRM_BASE_URL',
    username: 'PEOPLESOFT_CRM_USERNAME',
    password: 'PEOPLESOFT_CRM_PASSWORD',
  },
  'peoplesoft-financials': {
    peoplesoftFinBaseUrl: 'PEOPLESOFT_FIN_BASE_URL',
    peoplesoftFinUsername: 'PEOPLESOFT_FIN_USERNAME',
    peoplesoftFinPassword: 'PEOPLESOFT_FIN_PASSWORD',
  },
  pipedrive: { apiToken: 'PIPEDRIVE_API_TOKEN', domain: 'PIPEDRIVE_DOMAIN' },
  planetscale: {
    host: 'PLANETSCALE_HOST',
    database: 'PLANETSCALE_DATABASE',
    username: 'PLANETSCALE_USERNAME',
    password: 'PLANETSCALE_PASSWORD',
  },
  'power-bi': { powerbiAccessToken: 'POWERBI_ACCESS_TOKEN' },
  prestashop: { url: 'PRESTASHOP_URL', apiKey: 'PRESTASHOP_API_KEY' },
  'progress-software': { progressBaseUrl: 'PROGRESS_BASE_URL', progressApiKey: 'PROGRESS_API_KEY' },
  qlik: { tenantUrl: 'QLIK_TENANT_URL', apiKey: 'QLIK_API_KEY' },
  redshift: {
    host: 'REDSHIFT_HOST',
    port: 'REDSHIFT_PORT',
    database: 'REDSHIFT_DATABASE',
    user: 'REDSHIFT_USER',
    password: 'REDSHIFT_PASSWORD',
  },
  'reuters-3000': {
    refinitivUsername: 'REFINITIV_USERNAME',
    refinitivPassword: 'REFINITIV_PASSWORD',
    refinitivAppKey: 'REFINITIV_APP_KEY',
  },
  rippling: { apiKey: 'RIPPLING_API_KEY' },
  'sap-enterprise': {
    sapBaseUrl: 'SAP_BASE_URL',
    sapUsername: 'SAP_USERNAME',
    sapPassword: 'SAP_PASSWORD',
  },
  'sap-r2': {
    host: 'SAP_R2_HOST',
    sysnr: 'SAP_R2_SYSNR',
    client: 'SAP_R2_CLIENT',
    username: 'SAP_R2_USERNAME',
    password: 'SAP_R2_PASSWORD',
  },
  'sap-r3': {
    host: 'SAP_R3_HOST',
    sysnr: 'SAP_R3_SYSNR',
    client: 'SAP_R3_CLIENT',
    username: 'SAP_R3_USERNAME',
    password: 'SAP_R3_PASSWORD',
  },
  'sap-s4hana': {
    sapS4BaseUrl: 'SAP_S4_BASE_URL',
    sapS4Username: 'SAP_S4_USERNAME',
    sapS4Password: 'SAP_S4_PASSWORD',
  },
  simcorp: {
    baseUrl: 'SIMCORP_BASE_URL',
    username: 'SIMCORP_USERNAME',
    password: 'SIMCORP_PASSWORD',
  },
  slack: { botToken: 'SLACK_BOT_TOKEN' },
  smartsheet: { accessToken: 'SMARTSHEET_ACCESS_TOKEN' },
  snowflake: {
    account: 'SNOWFLAKE_ACCOUNT',
    username: 'SNOWFLAKE_USERNAME',
    password: 'SNOWFLAKE_PASSWORD',
    database: 'SNOWFLAKE_DATABASE',
    warehouse: 'SNOWFLAKE_WAREHOUSE',
  },
  squarespace: { apiKey: 'SQUARESPACE_API_KEY' },
  starburst: {
    host: 'STARBURST_HOST',
    user: 'STARBURST_USER',
    password: 'STARBURST_PASSWORD',
  },
  stripe: { secretKey: 'STRIPE_SECRET_KEY' },
  sugarcrm: {
    baseUrl: 'SUGARCRM_BASE_URL',
    username: 'SUGARCRM_USERNAME',
    password: 'SUGARCRM_PASSWORD',
  },
  supabase: { url: 'SUPABASE_URL', serviceKey: 'SUPABASE_SERVICE_KEY' },
  'swift-fin': {
    swiftBaseUrl: 'SWIFT_BASE_URL',
    swiftApiKey: 'SWIFT_API_KEY',
    swiftCertificate: 'SWIFT_CERTIFICATE',
  },
  tableau: {
    serverUrl: 'TABLEAU_SERVER_URL',
    tokenName: 'TABLEAU_TOKEN_NAME',
    tokenSecret: 'TABLEAU_TOKEN_SECRET',
    siteId: 'TABLEAU_SITE_ID',
  },
  tcs: { baseUrl: 'TCS_BASE_URL', apiKey: 'TCS_API_KEY' },
  'temenos-t24': {
    t24BaseUrl: 'T24_BASE_URL',
    t24Username: 'T24_USERNAME',
    t24Password: 'T24_PASSWORD',
  },
  teradata: {
    host: 'TERADATA_HOST',
    user: 'TERADATA_USER',
    password: 'TERADATA_PASSWORD',
  },
  'unisys-clearpath': {
    clearpathHost: 'CLEARPATH_HOST',
    clearpathPort: 'CLEARPATH_PORT',
    clearpathUsername: 'CLEARPATH_USERNAME',
    clearpathPassword: 'CLEARPATH_PASSWORD',
  },
  wipro: { baseUrl: 'WIPRO_BASE_URL', apiKey: 'WIPRO_API_KEY' },
  woocommerce: {
    url: 'WOOCOMMERCE_URL',
    consumerKey: 'WOOCOMMERCE_CONSUMER_KEY',
    consumerSecret: 'WOOCOMMERCE_CONSUMER_SECRET',
  },
  wrike: { accessToken: 'WRIKE_ACCESS_TOKEN' },
  xero: { accessToken: 'XERO_ACCESS_TOKEN', tenantId: 'XERO_TENANT_ID' },
  'zendesk-sell': { accessToken: 'ZENDESK_SELL_ACCESS_TOKEN' },
  'zoho-crm': { zohoAccessToken: 'ZOHO_ACCESS_TOKEN', zohoApiDomain: 'ZOHO_API_DOMAIN' },
  zoom: { accessToken: 'ZOOM_ACCESS_TOKEN' },
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
