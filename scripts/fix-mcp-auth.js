#!/usr/bin/env node
/**
 * Fix MCP Server Auth — patches every generated MCP server's initConnection()
 * to use correct baseURL + authentication pattern.
 *
 * Root cause: the generator always set baseURL and Authorization to the first
 * env var, ignoring the connector's actual baseUrl / authHeader / authType metadata.
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'packages', 'mcp-servers');

// ── Helpers ────────────────────────────────────────────────────────

function toEnvName(name) {
  return name.replace(/-/g, '_').toUpperCase();
}

// Find env var matching a template variable like DOMAIN, HOST, BASE_URL
function findEnvVar(varName, envVars) {
  // Try exact match
  let m = envVars.find(e => e === varName);
  if (m) return m;
  // Try suffix match
  m = envVars.find(e => e.endsWith('_' + varName));
  if (m) return m;
  // Try contains
  m = envVars.find(e => e.includes(varName));
  if (m) return m;
  return null;
}

// Find credential-like env var (token, key, secret, access)
function findCredentialVar(envVars) {
  const credWords = ['TOKEN', 'KEY', 'SECRET', 'ACCESS', 'APP_PASSWORD', 'SERVICE_KEY'];
  const nonCredWords = [
    'URL',
    'HOST',
    'DOMAIN',
    'BASE',
    'SERVER',
    'SUBDOMAIN',
    'ACCOUNT_ID',
    'PROJECT_ID',
    'TENANT_ID',
    'SITE_ID',
    'PORT',
    'DATABASE',
    'WAREHOUSE',
    'ORG',
    'NAMESPACE',
    'STORE_HASH',
    'CLIENT',
    'SYSNR',
    'CERTIFICATE',
    'CREDENTIALS',
  ];
  for (const env of envVars) {
    const upper = env.toUpperCase();
    if (credWords.some(p => upper.includes(p)) && !nonCredWords.some(p => upper.includes(p))) {
      return env;
    }
  }
  return envVars[0];
}

// Find username/password env vars for Basic auth
function findBasicVars(envVars) {
  const user = envVars.find(
    e => e.includes('USERNAME') || (e.includes('USER') && !e.includes('PASSWORD'))
  );
  const pass = envVars.find(e => e.includes('PASSWORD') || e.includes('PASS'));
  const key = envVars.find(e => e.includes('API_KEY') || e.includes('_KEY'));
  const token = envVars.find(e => e.includes('TOKEN'));
  if (user && pass) return { user, pass };
  if (user && token) return { user, pass: token };
  if (key) return { user: key, pass: null }; // API_KEY:x pattern
  return { user: envVars[0], pass: envVars[1] || null };
}

// ── Connector metadata (auth-relevant only) ──────────────────────
// Each entry mirrors the generator's CONNECTORS but only auth fields.
// Fields: env, baseUrl, authHeader, authType, graphql, dbType

const CONNECTORS = {
  // ── PROJECT MANAGEMENT ──
  asana: {
    env: ['ASANA_ACCESS_TOKEN'],
    baseUrl: 'https://app.asana.com/api/1.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  'monday-com': {
    env: ['MONDAY_API_TOKEN'],
    baseUrl: 'https://api.monday.com/v2',
    authHeader: { Authorization: '${TOKEN}' },
    graphql: true,
  },
  clickup: {
    env: ['CLICKUP_API_TOKEN'],
    baseUrl: 'https://api.clickup.com/api/v2',
    authHeader: { Authorization: '${TOKEN}' },
  },
  linear: {
    env: ['LINEAR_API_KEY'],
    baseUrl: 'https://api.linear.app',
    authHeader: { Authorization: '${TOKEN}' },
    graphql: true,
  },
  wrike: {
    env: ['WRIKE_ACCESS_TOKEN'],
    baseUrl: 'https://www.wrike.com/api/v4',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  smartsheet: {
    env: ['SMARTSHEET_ACCESS_TOKEN'],
    baseUrl: 'https://api.smartsheet.com/2.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  basecamp: {
    env: ['BASECAMP_ACCESS_TOKEN', 'BASECAMP_ACCOUNT_ID'],
    baseUrl: 'https://3.basecampapi.com/${ACCOUNT_ID}',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },

  // ── COMMUNICATION ──
  slack: {
    env: ['SLACK_BOT_TOKEN'],
    baseUrl: 'https://slack.com/api',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  'ms-teams': {
    env: ['MS_TEAMS_ACCESS_TOKEN'],
    baseUrl: 'https://graph.microsoft.com/v1.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  notion: {
    env: ['NOTION_API_KEY'],
    baseUrl: 'https://api.notion.com/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}', 'Notion-Version': '2022-06-28' },
  },
  confluence: {
    env: ['CONFLUENCE_BASE_URL', 'CONFLUENCE_USERNAME', 'CONFLUENCE_API_TOKEN'],
    baseUrl: '${BASE_URL}/wiki/rest/api',
    authType: 'basic',
  },
  zoom: {
    env: ['ZOOM_ACCESS_TOKEN'],
    baseUrl: 'https://api.zoom.us/v2',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  'google-meet': {
    env: ['GOOGLE_ACCESS_TOKEN'],
    baseUrl: 'https://www.googleapis.com/calendar/v3',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  'google-workspace': {
    env: ['GOOGLE_WORKSPACE_ACCESS_TOKEN'],
    baseUrl: 'https://www.googleapis.com',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  'dropbox-business': {
    env: ['DROPBOX_ACCESS_TOKEN'],
    baseUrl: 'https://api.dropboxapi.com/2',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },

  // ── CRM & SALES ──
  'zoho-crm': {
    env: ['ZOHO_ACCESS_TOKEN', 'ZOHO_API_DOMAIN'],
    baseUrl: '${API_DOMAIN}/crm/v5',
    authHeader: { Authorization: 'Zoho-oauthtoken ${TOKEN}' },
  },
  pipedrive: {
    env: ['PIPEDRIVE_API_TOKEN', 'PIPEDRIVE_DOMAIN'],
    baseUrl: 'https://${DOMAIN}.pipedrive.com/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  freshsales: {
    env: ['FRESHSALES_API_KEY', 'FRESHSALES_DOMAIN'],
    baseUrl: 'https://${DOMAIN}.freshsales.io/api',
    authHeader: { Authorization: 'Token token=${TOKEN}' },
  },
  sugarcrm: {
    env: ['SUGARCRM_BASE_URL', 'SUGARCRM_USERNAME', 'SUGARCRM_PASSWORD'],
    baseUrl: '${BASE_URL}/rest/v11_15',
    authType: 'basic',
  },
  insightly: {
    env: ['INSIGHTLY_API_KEY'],
    baseUrl: 'https://api.insightly.com/v3.1',
    authType: 'basic',
  },
  'copper-crm': {
    env: ['COPPER_API_KEY', 'COPPER_EMAIL'],
    baseUrl: 'https://api.copper.com/developer_api/v1',
    authHeader: {
      'X-PW-AccessToken': '${TOKEN}',
      'X-PW-Application': 'developer_api',
      'X-PW-UserEmail': '${EMAIL}',
    },
  },
  'close-crm': {
    env: ['CLOSE_API_KEY'],
    baseUrl: 'https://api.close.com/api/v1',
    authType: 'basic',
  },
  'capsule-crm': {
    env: ['CAPSULE_ACCESS_TOKEN'],
    baseUrl: 'https://api.capsulecrm.com/api/v2',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  apptivo: {
    env: ['APPTIVO_API_KEY', 'APPTIVO_ACCESS_KEY'],
    baseUrl: 'https://api.apptivo.com/app',
    authHeader: { 'x-api-key': '${TOKEN}' },
  },
  bitrix24: {
    env: ['BITRIX24_WEBHOOK_URL'],
    baseUrl: '${WEBHOOK_URL}',
    // No extra auth needed - webhook URL contains auth
  },
  keap: {
    env: ['KEAP_ACCESS_TOKEN'],
    baseUrl: 'https://api.infusionsoft.com/crm/rest/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  nimble: {
    env: ['NIMBLE_API_KEY'],
    baseUrl: 'https://api.nimble.com/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  creatio: {
    env: ['CREATIO_BASE_URL', 'CREATIO_USERNAME', 'CREATIO_PASSWORD'],
    baseUrl: '${BASE_URL}/0/odata',
    authType: 'basic',
  },
  'zendesk-sell': {
    env: ['ZENDESK_SELL_ACCESS_TOKEN'],
    baseUrl: 'https://api.getbase.com/v2',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  'peoplesoft-crm': {
    env: ['PEOPLESOFT_CRM_BASE_URL', 'PEOPLESOFT_CRM_USERNAME', 'PEOPLESOFT_CRM_PASSWORD'],
    baseUrl: '${BASE_URL}/PSIGW/RESTListeningConnector/PSFT_HR',
    authType: 'basic',
  },

  // ── HCM & HR ──
  bamboohr: {
    env: ['BAMBOOHR_API_KEY', 'BAMBOOHR_SUBDOMAIN'],
    baseUrl: 'https://api.bamboohr.com/api/gateway.php/${SUBDOMAIN}/v1',
    authType: 'basic',
  },
  gusto: {
    env: ['GUSTO_ACCESS_TOKEN'],
    baseUrl: 'https://api.gusto.com/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  rippling: {
    env: ['RIPPLING_API_KEY'],
    baseUrl: 'https://api.rippling.com',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  deel: {
    env: ['DEEL_API_TOKEN'],
    baseUrl: 'https://api.deel.com/rest/v2',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },

  // ── CLOUD DATABASES (via Supabase / REST APIs where available) ──
  'amazon-aurora': {
    env: ['AURORA_HOST', 'AURORA_PORT', 'AURORA_DATABASE', 'AURORA_USER', 'AURORA_PASSWORD'],
    dbType: 'mysql',
  },
  'aws-rds': {
    env: ['RDS_HOST', 'RDS_PORT', 'RDS_DATABASE', 'RDS_USER', 'RDS_PASSWORD'],
    dbType: 'postgres',
  },
  'azure-sql': {
    env: ['AZURE_SQL_HOST', 'AZURE_SQL_DATABASE', 'AZURE_SQL_USER', 'AZURE_SQL_PASSWORD'],
    dbType: 'mssql',
  },
  'google-cloud-sql': {
    env: [
      'CLOUDSQL_HOST',
      'CLOUDSQL_PORT',
      'CLOUDSQL_DATABASE',
      'CLOUDSQL_USER',
      'CLOUDSQL_PASSWORD',
    ],
    dbType: 'postgres',
  },
  cockroachdb: {
    env: ['COCKROACHDB_URL'],
    dbType: 'postgres',
  },
  neon: {
    env: ['NEON_DATABASE_URL'],
    dbType: 'postgres',
  },
  planetscale: {
    env: [
      'PLANETSCALE_HOST',
      'PLANETSCALE_DATABASE',
      'PLANETSCALE_USERNAME',
      'PLANETSCALE_PASSWORD',
    ],
    dbType: 'mysql',
  },
  supabase: {
    env: ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'],
    baseUrl: '${URL}',
    authHeader: { apikey: '${SERVICE_KEY}', Authorization: 'Bearer ${SERVICE_KEY}' },
  },
  sqlite: {
    env: ['SQLITE_DATABASE_PATH'],
    dbType: 'sqlite',
  },
  firestore: {
    env: ['FIRESTORE_PROJECT_ID', 'GOOGLE_APPLICATION_CREDENTIALS'],
    baseUrl:
      'https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  influxdb: {
    env: ['INFLUXDB_URL', 'INFLUXDB_TOKEN', 'INFLUXDB_ORG'],
    baseUrl: '${URL}',
    authHeader: { Authorization: 'Token ${TOKEN}' },
  },

  // ── DATA WAREHOUSE ──
  snowflake: {
    env: [
      'SNOWFLAKE_ACCOUNT',
      'SNOWFLAKE_USERNAME',
      'SNOWFLAKE_PASSWORD',
      'SNOWFLAKE_DATABASE',
      'SNOWFLAKE_WAREHOUSE',
    ],
    dbType: 'snowflake',
  },
  bigquery: {
    env: ['BIGQUERY_PROJECT_ID', 'GOOGLE_APPLICATION_CREDENTIALS'],
    dbType: 'bigquery',
  },
  redshift: {
    env: [
      'REDSHIFT_HOST',
      'REDSHIFT_PORT',
      'REDSHIFT_DATABASE',
      'REDSHIFT_USER',
      'REDSHIFT_PASSWORD',
    ],
    dbType: 'postgres',
  },
  databricks: {
    env: ['DATABRICKS_HOST', 'DATABRICKS_TOKEN', 'DATABRICKS_WAREHOUSE_ID'],
    baseUrl: 'https://${HOST}/api/2.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  'azure-synapse': {
    env: ['SYNAPSE_HOST', 'SYNAPSE_DATABASE', 'SYNAPSE_USER', 'SYNAPSE_PASSWORD'],
    dbType: 'mssql',
  },
  teradata: {
    env: ['TERADATA_HOST', 'TERADATA_USER', 'TERADATA_PASSWORD'],
    dbType: 'teradata',
  },
  dremio: {
    env: ['DREMIO_HOST', 'DREMIO_TOKEN'],
    baseUrl: 'https://${HOST}/api/v3',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  starburst: {
    env: ['STARBURST_HOST', 'STARBURST_USER', 'STARBURST_PASSWORD'],
    dbType: 'trino',
  },
  firebolt: {
    env: ['FIREBOLT_CLIENT_ID', 'FIREBOLT_CLIENT_SECRET', 'FIREBOLT_DATABASE', 'FIREBOLT_ENGINE'],
    dbType: 'firebolt',
  },

  // ── BI & ANALYTICS ──
  tableau: {
    env: ['TABLEAU_SERVER_URL', 'TABLEAU_TOKEN_NAME', 'TABLEAU_TOKEN_SECRET', 'TABLEAU_SITE_ID'],
    baseUrl: '${SERVER_URL}/api/3.21',
    authHeader: { 'X-Tableau-Auth': '${TOKEN_SECRET}' },
  },
  'power-bi': {
    env: ['POWERBI_ACCESS_TOKEN'],
    baseUrl: 'https://api.powerbi.com/v1.0/myorg',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  looker: {
    env: ['LOOKER_BASE_URL', 'LOOKER_CLIENT_ID', 'LOOKER_CLIENT_SECRET'],
    baseUrl: '${BASE_URL}/api/4.0',
    // Looker uses OAuth2 client credentials - Bearer token from login
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  qlik: {
    env: ['QLIK_TENANT_URL', 'QLIK_API_KEY'],
    baseUrl: '${TENANT_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  cognos: {
    env: ['COGNOS_BASE_URL', 'COGNOS_NAMESPACE', 'COGNOS_USERNAME', 'COGNOS_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1',
    authType: 'basic',
  },
  'crystal-reports': {
    env: ['CRYSTAL_SERVER_URL', 'CRYSTAL_USERNAME', 'CRYSTAL_PASSWORD'],
    baseUrl: '${SERVER_URL}/api/v1',
    authType: 'basic',
  },
  brio: {
    env: ['BRIO_BASE_URL', 'BRIO_USERNAME', 'BRIO_PASSWORD'],
    baseUrl: '${BASE_URL}/api',
    authType: 'basic',
  },

  // ── COMMERCE ──
  bigcommerce: {
    env: ['BIGCOMMERCE_STORE_HASH', 'BIGCOMMERCE_ACCESS_TOKEN'],
    baseUrl: 'https://api.bigcommerce.com/stores/${STORE_HASH}/v3',
    authHeader: { 'X-Auth-Token': '${TOKEN}' },
  },
  woocommerce: {
    env: ['WOOCOMMERCE_URL', 'WOOCOMMERCE_CONSUMER_KEY', 'WOOCOMMERCE_CONSUMER_SECRET'],
    baseUrl: '${URL}/wp-json/wc/v3',
    authType: 'basic', // WooCommerce uses consumer_key:consumer_secret as Basic auth
  },
  squarespace: {
    env: ['SQUARESPACE_API_KEY'],
    baseUrl: 'https://api.squarespace.com/1.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  prestashop: {
    env: ['PRESTASHOP_URL', 'PRESTASHOP_API_KEY'],
    baseUrl: '${URL}/api',
    authType: 'basic', // PrestaShop uses API key as username, blank password
  },
  stripe: {
    env: ['STRIPE_SECRET_KEY'],
    baseUrl: 'https://api.stripe.com/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },

  // ── DEVTOOLS ──
  github: {
    env: ['GITHUB_TOKEN'],
    baseUrl: 'https://api.github.com',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  gitlab: {
    env: ['GITLAB_TOKEN', 'GITLAB_URL'],
    baseUrl: '${URL}/api/v4',
    authHeader: { 'PRIVATE-TOKEN': '${TOKEN}' },
  },
  bitbucket: {
    env: ['BITBUCKET_USERNAME', 'BITBUCKET_APP_PASSWORD'],
    baseUrl: 'https://api.bitbucket.org/2.0',
    authType: 'basic',
  },
  jenkins: {
    env: ['JENKINS_URL', 'JENKINS_USER', 'JENKINS_TOKEN'],
    baseUrl: '${URL}',
    authType: 'basic',
  },

  // ── IDENTITY & ACCESS ──
  okta: {
    env: ['OKTA_DOMAIN', 'OKTA_API_TOKEN'],
    baseUrl: 'https://${DOMAIN}/api/v1',
    authHeader: { Authorization: 'SSWS ${TOKEN}' },
  },
  'active-directory': {
    env: ['AZURE_AD_TENANT_ID', 'AZURE_AD_CLIENT_ID', 'AZURE_AD_CLIENT_SECRET'],
    baseUrl: 'https://graph.microsoft.com/v1.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  jumpcloud: {
    env: ['JUMPCLOUD_API_KEY'],
    baseUrl: 'https://console.jumpcloud.com/api',
    authHeader: { 'x-api-key': '${TOKEN}' },
  },

  // ── FINANCE ──
  freshbooks: {
    env: ['FRESHBOOKS_ACCESS_TOKEN', 'FRESHBOOKS_ACCOUNT_ID'],
    baseUrl: 'https://api.freshbooks.com/accounting/account/${ACCOUNT_ID}',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  xero: {
    env: ['XERO_ACCESS_TOKEN', 'XERO_TENANT_ID'],
    baseUrl: 'https://api.xero.com/api.xro/2.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}', 'Xero-tenant-id': '${TENANT_ID}' },
  },
  hyperion: {
    env: ['HYPERION_BASE_URL', 'HYPERION_USERNAME', 'HYPERION_PASSWORD'],
    baseUrl: '${BASE_URL}/HyperionPlanning/rest/v3',
    authType: 'basic',
  },

  // ── FINANCIAL MARKETS ──
  'bloomberg-terminal': {
    env: ['BLOOMBERG_HOST', 'BLOOMBERG_PORT'],
    baseUrl: 'http://${HOST}:${PORT}',
    // Bloomberg uses proprietary BLPAPI — REST is a placeholder
  },
  'reuters-3000': {
    env: ['REFINITIV_USERNAME', 'REFINITIV_PASSWORD', 'REFINITIV_APP_KEY'],
    baseUrl: 'https://api.refinitiv.com',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  murex: {
    env: ['MUREX_BASE_URL', 'MUREX_USERNAME', 'MUREX_PASSWORD'],
    baseUrl: '${BASE_URL}/mx/api/v1',
    authType: 'basic',
  },
  calypso: {
    env: ['CALYPSO_BASE_URL', 'CALYPSO_USERNAME', 'CALYPSO_PASSWORD'],
    baseUrl: '${BASE_URL}/calypso/api/v1',
    authType: 'basic',
  },
  frontarena: {
    env: ['FRONTARENA_BASE_URL', 'FRONTARENA_USERNAME', 'FRONTARENA_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1',
    authType: 'basic',
  },
  simcorp: {
    env: ['SIMCORP_BASE_URL', 'SIMCORP_USERNAME', 'SIMCORP_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1',
    authType: 'basic',
  },
  'charles-river': {
    env: ['CHARLES_RIVER_BASE_URL', 'CHARLES_RIVER_API_KEY'],
    baseUrl: '${BASE_URL}/api/v2',
    authHeader: { 'X-API-Key': '${TOKEN}' },
  },
  'blackrock-aladdin': {
    env: ['ALADDIN_BASE_URL', 'ALADDIN_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },

  // ── ERP ──
  'sap-s4hana': {
    env: ['SAP_S4_BASE_URL', 'SAP_S4_USERNAME', 'SAP_S4_PASSWORD'],
    baseUrl: '${BASE_URL}/sap/opu/odata/sap',
    authType: 'basic',
  },
  'sap-enterprise': {
    env: ['SAP_BASE_URL', 'SAP_USERNAME', 'SAP_PASSWORD'],
    baseUrl: '${BASE_URL}/sap/opu/odata/sap',
    authType: 'basic',
  },

  // ── ENTERPRISE ──
  accenture: {
    env: ['ACCENTURE_BASE_URL', 'ACCENTURE_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { 'X-API-Key': '${TOKEN}' },
  },
  broadcom: {
    env: ['BROADCOM_BASE_URL', 'BROADCOM_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  'dxc-technology': {
    env: ['DXC_BASE_URL', 'DXC_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  infosys: {
    env: ['INFOSYS_BASE_URL', 'INFOSYS_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  'micro-focus': {
    env: ['MICRO_FOCUS_BASE_URL', 'MICRO_FOCUS_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  opentext: {
    env: ['OPENTEXT_BASE_URL', 'OPENTEXT_USERNAME', 'OPENTEXT_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v2',
    authType: 'basic',
  },
  'progress-software': {
    env: ['PROGRESS_BASE_URL', 'PROGRESS_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  tcs: {
    env: ['TCS_BASE_URL', 'TCS_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  wipro: {
    env: ['WIPRO_BASE_URL', 'WIPRO_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },

  // ── LEGACY / MAINFRAME ──
  'ach-mainframe': {
    env: ['ACH_HOST', 'ACH_PORT', 'ACH_USERNAME', 'ACH_PASSWORD'],
    baseUrl: 'http://${HOST}:${PORT}',
    authType: 'basic',
  },
  'chips-mainframe': {
    env: ['CHIPS_HOST', 'CHIPS_PORT', 'CHIPS_USERNAME', 'CHIPS_PASSWORD'],
    baseUrl: 'http://${HOST}:${PORT}',
    authType: 'basic',
  },
  'cobol-banking': {
    env: ['COBOL_HOST', 'COBOL_PORT', 'COBOL_USERNAME', 'COBOL_PASSWORD'],
    baseUrl: 'http://${HOST}:${PORT}',
    authType: 'basic',
  },
  'fis-profile': {
    env: ['FIS_PROFILE_BASE_URL', 'FIS_PROFILE_USERNAME', 'FIS_PROFILE_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1',
    authType: 'basic',
  },
  'fis-world': {
    env: ['FIS_WORLD_BASE_URL', 'FIS_WORLD_USERNAME', 'FIS_WORLD_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1',
    authType: 'basic',
  },
  'ibm-cics': {
    env: ['CICS_BASE_URL', 'CICS_USERNAME', 'CICS_PASSWORD'],
    baseUrl: '${BASE_URL}/CICSSystemManagement',
    authType: 'basic',
  },
  'ibm-ims': {
    env: ['IMS_BASE_URL', 'IMS_USERNAME', 'IMS_PASSWORD'],
    baseUrl: '${BASE_URL}/ims/rest/v1',
    authType: 'basic',
  },
  'jde-oneworld': {
    env: ['JDE_BASE_URL', 'JDE_USERNAME', 'JDE_PASSWORD'],
    baseUrl: '${BASE_URL}/jderest/v3',
    authType: 'basic',
  },
  'jde-world': {
    env: ['JDE_WORLD_HOST', 'JDE_WORLD_USERNAME', 'JDE_WORLD_PASSWORD'],
    baseUrl: 'http://${HOST}',
    authType: 'basic',
  },
  'oracle-ebs': {
    env: ['ORACLE_EBS_BASE_URL', 'ORACLE_EBS_USERNAME', 'ORACLE_EBS_PASSWORD'],
    baseUrl: '${BASE_URL}/webservices/rest',
    authType: 'basic',
  },
  'peoplesoft-financials': {
    env: ['PEOPLESOFT_FIN_BASE_URL', 'PEOPLESOFT_FIN_USERNAME', 'PEOPLESOFT_FIN_PASSWORD'],
    baseUrl: '${BASE_URL}/PSIGW/RESTListeningConnector/PSFT_FIN',
    authType: 'basic',
  },
  'sap-r2': {
    env: ['SAP_R2_HOST', 'SAP_R2_SYSNR', 'SAP_R2_CLIENT', 'SAP_R2_USERNAME', 'SAP_R2_PASSWORD'],
    baseUrl: 'http://${HOST}',
    authType: 'basic',
  },
  'sap-r3': {
    env: ['SAP_R3_HOST', 'SAP_R3_SYSNR', 'SAP_R3_CLIENT', 'SAP_R3_USERNAME', 'SAP_R3_PASSWORD'],
    baseUrl: 'http://${HOST}',
    authType: 'basic',
  },
  'swift-fin': {
    env: ['SWIFT_BASE_URL', 'SWIFT_API_KEY', 'SWIFT_CERTIFICATE'],
    baseUrl: '${BASE_URL}/swift/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
  },
  'temenos-t24': {
    env: ['T24_BASE_URL', 'T24_USERNAME', 'T24_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1.0.0',
    authType: 'basic',
  },
  'unisys-clearpath': {
    env: ['CLEARPATH_HOST', 'CLEARPATH_PORT', 'CLEARPATH_USERNAME', 'CLEARPATH_PASSWORD'],
    baseUrl: 'http://${HOST}:${PORT}',
    authType: 'basic',
  },
};

// ── Generate the corrected axios.create block ──────────────────────

function buildAxiosBlock(systemType, config) {
  const envVars = config.env || [];

  // ── Resolve baseURL ──
  let baseUrlStr;
  if (config.baseUrl) {
    const raw = config.baseUrl;
    if (/\$\{/.test(raw)) {
      // Template URL — resolve ${VARNAME} → process.env.MATCHING_ENV
      let resolved = raw;
      const matches = [...raw.matchAll(/\$\{(\w+)\}/g)];
      for (const [full, varName] of matches) {
        const envVar = findEnvVar(varName, envVars);
        if (envVar) {
          resolved = resolved.replace(full, '${process.env.' + envVar + '}');
        } else {
          // Fallback: use systemType prefix
          resolved = resolved.replace(
            full,
            '${process.env.' + toEnvName(systemType) + '_' + varName + '}'
          );
        }
      }
      baseUrlStr = '`' + resolved + '`';
    } else {
      baseUrlStr = "'" + raw + "'";
    }
  } else if (config.dbType) {
    baseUrlStr = "'http://localhost'"; // placeholder for DB servers
  } else {
    baseUrlStr = "'https://api.example.com'";
  }

  // ── Resolve auth ──
  const lines = [];
  lines.push('  api = axios.create({');
  lines.push('    baseURL: ' + baseUrlStr + ',');

  if (config.authType === 'basic') {
    const bv = findBasicVars(envVars);
    lines.push('    auth: {');
    lines.push('      username: process.env.' + bv.user + " || '',");
    if (bv.pass) {
      lines.push('      password: process.env.' + bv.pass + " || '',");
    } else {
      lines.push("      password: 'x',");
    }
    lines.push('    },');
    lines.push('    headers: {');
    lines.push("      'Content-Type': 'application/json',");
    lines.push("      Accept: 'application/json',");
    lines.push('    },');
  } else if (config.authHeader) {
    const credVar = findCredentialVar(envVars);
    lines.push('    headers: {');
    lines.push("      'Content-Type': 'application/json',");
    lines.push("      Accept: 'application/json',");

    for (const [headerKey, headerVal] of Object.entries(config.authHeader)) {
      let resolved = headerVal;

      // Replace ${TOKEN} → credVar
      resolved = resolved.replace(/\$\{TOKEN\}/g, '${process.env.' + credVar + '}');

      // Replace other ${VAR} → matching env var
      resolved = resolved.replace(/\$\{(\w+)\}/g, (match, varName) => {
        if (varName === 'TOKEN') return '${process.env.' + credVar + '}';
        const ev = findEnvVar(varName, envVars);
        return ev ? '${process.env.' + ev + '}' : match;
      });

      // Determine if we need template literal vs plain string
      if (resolved.includes('${process.env.')) {
        lines.push("      '" + headerKey + "': `" + resolved + '`,');
      } else {
        lines.push("      '" + headerKey + "': '" + resolved + "',");
      }
    }
    lines.push('    },');
  } else {
    // No auth specified
    lines.push('    headers: {');
    lines.push("      'Content-Type': 'application/json',");
    lines.push("      Accept: 'application/json',");
    lines.push('    },');
  }

  lines.push('    timeout: 30000,');
  lines.push('  });');

  return lines.join('\n');
}

// ── Main: patch each server ────────────────────────────────────────

let fixed = 0;
let skipped = 0;
let errors = 0;

for (const [systemType, config] of Object.entries(CONNECTORS)) {
  const indexPath = path.join(BASE, systemType, 'src', 'index.ts');

  if (!fs.existsSync(indexPath)) {
    // console.log(`⏭  ${systemType} — no index.ts found`);
    skipped++;
    continue;
  }

  const code = fs.readFileSync(indexPath, 'utf-8');

  // Find the axios.create block
  // It looks like: api = axios.create({ ... });
  const axiosRegex = /  api = axios\.create\(\{[\s\S]*?\}\);/;
  const match = axiosRegex.exec(code);

  if (!match) {
    console.log(`⚠️  ${systemType} — no axios.create block found`);
    errors++;
    continue;
  }

  const oldBlock = match[0];
  const newBlock = buildAxiosBlock(systemType, config);

  if (oldBlock === newBlock) {
    // Already correct
    skipped++;
    continue;
  }

  const newCode = code.replace(axiosRegex, newBlock);
  fs.writeFileSync(indexPath, newCode);
  fixed++;
  process.stdout.write(`✅ ${systemType}\n`);
}

console.log(`\nDone! Fixed: ${fixed}, Skipped: ${skipped}, Errors: ${errors}`);
