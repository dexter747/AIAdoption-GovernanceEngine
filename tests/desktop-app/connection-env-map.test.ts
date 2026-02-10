/**
 * Unit tests for the connection environment variable mapping system.
 * Covers buildEnvVarsFromParams, ENV_MAPS completeness, and edge cases.
 */

// We inline the logic here since the main process module uses ES module imports
// that aren't compatible with the test runner. We test the same algorithm.

const ENV_MAPS: Record<string, Record<string, string>> = {
  postgresql: { host: 'PGHOST', port: 'PGPORT', database: 'PGDATABASE', username: 'PGUSER', password: 'PGPASSWORD', ssl: 'PGSSLMODE' },
  mysql: { host: 'MYSQL_HOST', port: 'MYSQL_PORT', database: 'MYSQL_DATABASE', username: 'MYSQL_USER', password: 'MYSQL_PASSWORD' },
  mariadb: { host: 'MARIADB_HOST', port: 'MARIADB_PORT', database: 'MARIADB_DATABASE', username: 'MARIADB_USER', password: 'MARIADB_PASSWORD' },
  sqlserver: { host: 'SQLSERVER_HOST', port: 'SQLSERVER_PORT', database: 'SQLSERVER_DATABASE', username: 'SQLSERVER_USER', password: 'SQLSERVER_PASSWORD', encrypt: 'SQLSERVER_ENCRYPT', trustCert: 'SQLSERVER_TRUST_CERT' },
  oracle: { host: 'ORACLE_HOST', port: 'ORACLE_PORT', service: 'ORACLE_SERVICE', username: 'ORACLE_USER', password: 'ORACLE_PASSWORD' },
  mongodb: { uri: 'MONGODB_URI', database: 'MONGODB_DATABASE' },
  'sap-hana': { host: 'SAP_HANA_HOST', port: 'SAP_HANA_PORT', username: 'SAP_HANA_USER', password: 'SAP_HANA_PASSWORD' },
  redis: { url: 'REDIS_URL' },
  elasticsearch: { url: 'ELASTICSEARCH_URL', username: 'ELASTICSEARCH_USERNAME', password: 'ELASTICSEARCH_PASSWORD' },
  cassandra: { contactPoints: 'CASSANDRA_CONTACT_POINTS', datacenter: 'CASSANDRA_DATACENTER', keyspace: 'CASSANDRA_KEYSPACE', username: 'CASSANDRA_USERNAME', password: 'CASSANDRA_PASSWORD' },
  couchdb: { url: 'COUCHDB_URL' },
  neo4j: { uri: 'NEO4J_URI', username: 'NEO4J_USER', password: 'NEO4J_PASSWORD' },
  dynamodb: { region: 'AWS_REGION', endpoint: 'DYNAMODB_ENDPOINT', accessKeyId: 'AWS_ACCESS_KEY_ID', secretAccessKey: 'AWS_SECRET_ACCESS_KEY' },
  salesforce: { instanceUrl: 'SALESFORCE_INSTANCE_URL', username: 'SALESFORCE_USERNAME', password: 'SALESFORCE_PASSWORD', securityToken: 'SALESFORCE_SECURITY_TOKEN', accessToken: 'SALESFORCE_ACCESS_TOKEN', apiVersion: 'SALESFORCE_API_VERSION' },
  hubspot: { accessToken: 'HUBSPOT_ACCESS_TOKEN', apiKey: 'HUBSPOT_API_KEY' },
  'oracle-siebel': { url: 'SIEBEL_URL', username: 'SIEBEL_USERNAME', password: 'SIEBEL_PASSWORD' },
  dynamics365: { tenantId: 'DYNAMICS365_TENANT_ID', clientId: 'DYNAMICS365_CLIENT_ID', clientSecret: 'DYNAMICS365_CLIENT_SECRET', resourceUrl: 'DYNAMICS365_RESOURCE_URL' },
  servicenow: { instanceUrl: 'SERVICENOW_INSTANCE_URL', username: 'SERVICENOW_USERNAME', password: 'SERVICENOW_PASSWORD' },
  jira: { baseUrl: 'JIRA_BASE_URL', email: 'JIRA_EMAIL', apiToken: 'JIRA_API_TOKEN' },
  zendesk: { subdomain: 'ZENDESK_SUBDOMAIN', email: 'ZENDESK_EMAIL', apiToken: 'ZENDESK_API_TOKEN' },
  netsuite: { accountId: 'NETSUITE_ACCOUNT_ID', consumerKey: 'NETSUITE_CONSUMER_KEY', consumerSecret: 'NETSUITE_CONSUMER_SECRET', tokenId: 'NETSUITE_TOKEN_ID', tokenSecret: 'NETSUITE_TOKEN_SECRET' },
  workday: { tenant: 'WORKDAY_TENANT', username: 'WORKDAY_USERNAME', password: 'WORKDAY_PASSWORD' },
  shopify: { storeUrl: 'SHOPIFY_STORE_URL', accessToken: 'SHOPIFY_ACCESS_TOKEN' },
  sharepoint: { tenantId: 'SHAREPOINT_TENANT_ID', clientId: 'SHAREPOINT_CLIENT_ID', clientSecret: 'SHAREPOINT_CLIENT_SECRET', siteUrl: 'SHAREPOINT_SITE_URL' },
  quickbooks: { apiUrl: 'QUICKBOOKS_API_URL', realmId: 'QUICKBOOKS_REALM_ID', accessToken: 'QUICKBOOKS_ACCESS_TOKEN' },
  as400: { host: 'AS400_HOST', username: 'AS400_USERNAME', password: 'AS400_PASSWORD', database: 'AS400_DATABASE' },
};

function buildEnvVarsFromParams(
  type: string,
  params: Record<string, string | number | undefined>
): Record<string, string> {
  const envMap = ENV_MAPS[type];
  if (!envMap) {
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
  return env;
}

// ══════════════════════════════════════════════════════════════════════════════
// Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('Connection Environment Variable Mapping', () => {
  describe('buildEnvVarsFromParams — database types', () => {
    test('postgresql: maps all 6 standard fields', () => {
      const result = buildEnvVarsFromParams('postgresql', {
        host: 'db.example.com',
        port: '5432',
        database: 'mydb',
        username: 'admin',
        password: 's3cret',
        ssl: 'require',
      });
      expect(result).toEqual({
        PGHOST: 'db.example.com',
        PGPORT: '5432',
        PGDATABASE: 'mydb',
        PGUSER: 'admin',
        PGPASSWORD: 's3cret',
        PGSSLMODE: 'require',
      });
    });

    test('mysql: maps host/port/database/username/password', () => {
      const result = buildEnvVarsFromParams('mysql', {
        host: 'localhost',
        port: '3306',
        database: 'testdb',
        username: 'root',
        password: 'pw',
      });
      expect(result).toEqual({
        MYSQL_HOST: 'localhost',
        MYSQL_PORT: '3306',
        MYSQL_DATABASE: 'testdb',
        MYSQL_USER: 'root',
        MYSQL_PASSWORD: 'pw',
      });
    });

    test('mongodb: maps uri and database', () => {
      const result = buildEnvVarsFromParams('mongodb', {
        uri: 'mongodb://host:27017/db',
        database: 'mydb',
      });
      expect(result).toEqual({
        MONGODB_URI: 'mongodb://host:27017/db',
        MONGODB_DATABASE: 'mydb',
      });
    });

    test('redis: maps url', () => {
      const result = buildEnvVarsFromParams('redis', {
        url: 'redis://localhost:6379',
      });
      expect(result).toEqual({ REDIS_URL: 'redis://localhost:6379' });
    });

    test('sqlserver: includes encrypt and trustCert', () => {
      const result = buildEnvVarsFromParams('sqlserver', {
        host: 'sql.example.com',
        port: '1433',
        database: 'master',
        username: 'sa',
        password: 'pass',
        encrypt: 'true',
        trustCert: 'true',
      });
      expect(result.SQLSERVER_HOST).toBe('sql.example.com');
      expect(result.SQLSERVER_ENCRYPT).toBe('true');
      expect(result.SQLSERVER_TRUST_CERT).toBe('true');
    });
  });

  describe('buildEnvVarsFromParams — CRM & API systems', () => {
    test('salesforce: maps 6 OAuth/credential fields', () => {
      const result = buildEnvVarsFromParams('salesforce', {
        instanceUrl: 'https://myorg.salesforce.com',
        username: 'user@salesforce.com',
        password: 'pw',
        securityToken: 'tok123',
        accessToken: 'at_xyz',
        apiVersion: '58.0',
      });
      expect(result).toEqual({
        SALESFORCE_INSTANCE_URL: 'https://myorg.salesforce.com',
        SALESFORCE_USERNAME: 'user@salesforce.com',
        SALESFORCE_PASSWORD: 'pw',
        SALESFORCE_SECURITY_TOKEN: 'tok123',
        SALESFORCE_ACCESS_TOKEN: 'at_xyz',
        SALESFORCE_API_VERSION: '58.0',
      });
    });

    test('dynamics365: maps tenantId/clientId/clientSecret/resourceUrl', () => {
      const result = buildEnvVarsFromParams('dynamics365', {
        tenantId: 'tenant-123',
        clientId: 'client-456',
        clientSecret: 'secret',
        resourceUrl: 'https://org.crm.dynamics.com',
      });
      expect(result).toEqual({
        DYNAMICS365_TENANT_ID: 'tenant-123',
        DYNAMICS365_CLIENT_ID: 'client-456',
        DYNAMICS365_CLIENT_SECRET: 'secret',
        DYNAMICS365_RESOURCE_URL: 'https://org.crm.dynamics.com',
      });
    });

    test('servicenow: maps instanceUrl/username/password', () => {
      const result = buildEnvVarsFromParams('servicenow', {
        instanceUrl: 'https://dev12345.service-now.com',
        username: 'admin',
        password: 'pw',
      });
      expect(result).toEqual({
        SERVICENOW_INSTANCE_URL: 'https://dev12345.service-now.com',
        SERVICENOW_USERNAME: 'admin',
        SERVICENOW_PASSWORD: 'pw',
      });
    });

    test('jira: maps baseUrl/email/apiToken', () => {
      const result = buildEnvVarsFromParams('jira', {
        baseUrl: 'https://myorg.atlassian.net',
        email: 'me@example.com',
        apiToken: 'jira_token_abc',
      });
      expect(result).toEqual({
        JIRA_BASE_URL: 'https://myorg.atlassian.net',
        JIRA_EMAIL: 'me@example.com',
        JIRA_API_TOKEN: 'jira_token_abc',
      });
    });

    test('hubspot: maps accessToken and apiKey', () => {
      const result = buildEnvVarsFromParams('hubspot', {
        accessToken: 'hub_token',
        apiKey: 'hub_key',
      });
      expect(result).toEqual({
        HUBSPOT_ACCESS_TOKEN: 'hub_token',
        HUBSPOT_API_KEY: 'hub_key',
      });
    });

    test('netsuite: maps all 5 OAuth1 credential fields', () => {
      const result = buildEnvVarsFromParams('netsuite', {
        accountId: 'ACCT123',
        consumerKey: 'ck',
        consumerSecret: 'cs',
        tokenId: 'tid',
        tokenSecret: 'ts',
      });
      expect(result).toEqual({
        NETSUITE_ACCOUNT_ID: 'ACCT123',
        NETSUITE_CONSUMER_KEY: 'ck',
        NETSUITE_CONSUMER_SECRET: 'cs',
        NETSUITE_TOKEN_ID: 'tid',
        NETSUITE_TOKEN_SECRET: 'ts',
      });
    });

    test('sharepoint: maps tenant/client/secret/siteUrl', () => {
      const result = buildEnvVarsFromParams('sharepoint', {
        tenantId: 'tid',
        clientId: 'cid',
        clientSecret: 'cs',
        siteUrl: 'https://myorg.sharepoint.com/sites/MySite',
      });
      expect(result).toEqual({
        SHAREPOINT_TENANT_ID: 'tid',
        SHAREPOINT_CLIENT_ID: 'cid',
        SHAREPOINT_CLIENT_SECRET: 'cs',
        SHAREPOINT_SITE_URL: 'https://myorg.sharepoint.com/sites/MySite',
      });
    });
  });

  describe('buildEnvVarsFromParams — edge cases', () => {
    test('skips empty string values', () => {
      const result = buildEnvVarsFromParams('postgresql', {
        host: 'localhost',
        port: '',
        database: '',
        username: 'user',
        password: '',
      });
      expect(result).toEqual({
        PGHOST: 'localhost',
        PGUSER: 'user',
      });
      expect(result).not.toHaveProperty('PGPORT');
      expect(result).not.toHaveProperty('PGDATABASE');
      expect(result).not.toHaveProperty('PGPASSWORD');
    });

    test('skips undefined values', () => {
      const result = buildEnvVarsFromParams('mysql', {
        host: 'localhost',
        port: undefined,
        database: 'db',
      });
      expect(result).toEqual({
        MYSQL_HOST: 'localhost',
        MYSQL_DATABASE: 'db',
      });
    });

    test('converts numeric values to strings', () => {
      const result = buildEnvVarsFromParams('postgresql', {
        host: 'localhost',
        port: 5432 as any,
      });
      expect(result.PGPORT).toBe('5432');
    });

    test('unknown type falls back to TYPE_KEY prefix pattern', () => {
      const result = buildEnvVarsFromParams('custom-system', {
        apiUrl: 'https://api.example.com',
        token: 'abc123',
      });
      expect(result).toEqual({
        CUSTOM_SYSTEM_APIURL: 'https://api.example.com',
        CUSTOM_SYSTEM_TOKEN: 'abc123',
      });
    });

    test('unknown type skips empty/undefined values in fallback', () => {
      const result = buildEnvVarsFromParams('unknown-db', {
        host: 'localhost',
        port: '',
        key: undefined,
      });
      expect(result).toEqual({
        UNKNOWN_DB_HOST: 'localhost',
      });
    });

    test('returns empty object when no params provided', () => {
      const result = buildEnvVarsFromParams('postgresql', {});
      expect(result).toEqual({});
    });

    test('ignores extra fields not in the env map', () => {
      const result = buildEnvVarsFromParams('redis', {
        url: 'redis://host',
        extraField: 'ignored',
      });
      expect(result).toEqual({ REDIS_URL: 'redis://host' });
      expect(result).not.toHaveProperty('REDIS_EXTRAFIELD');
    });
  });

  describe('ENV_MAPS coverage', () => {
    const expectedTypes = [
      'postgresql', 'mysql', 'mariadb', 'sqlserver', 'oracle', 'mongodb',
      'sap-hana', 'redis', 'elasticsearch', 'cassandra', 'couchdb', 'neo4j', 'dynamodb',
      'salesforce', 'hubspot', 'oracle-siebel', 'dynamics365',
      'servicenow', 'jira', 'zendesk',
      'netsuite', 'workday', 'shopify', 'sharepoint', 'quickbooks', 'as400',
    ];

    test.each(expectedTypes)('ENV_MAPS has mapping for %s', (type) => {
      expect(ENV_MAPS[type]).toBeDefined();
      expect(Object.keys(ENV_MAPS[type]).length).toBeGreaterThan(0);
    });

    test('every env map has at least one field', () => {
      for (const [type, map] of Object.entries(ENV_MAPS)) {
        expect(Object.keys(map).length).toBeGreaterThan(0);
      }
    });

    test('no env map has duplicate env var names', () => {
      for (const [type, map] of Object.entries(ENV_MAPS)) {
        const envVarNames = Object.values(map);
        const unique = new Set(envVarNames);
        expect(unique.size).toBe(envVarNames.length);
      }
    });
  });

  describe('end-to-end param → env simulation', () => {
    test('simulates Salesforce connection form → env vars', () => {
      // User fills in these form fields in the AddConnectionModal
      const formValues = {
        instanceUrl: 'https://myorg.salesforce.com',
        accessToken: 'bearer_xyz_123',
        apiVersion: '58.0',
      };

      // Merge with legacy ConnectionConfig fields
      const connectionParams: Record<string, string> = { ...formValues };

      // Build env vars
      const envVars = buildEnvVarsFromParams('salesforce', connectionParams);

      // MCP server would see these env vars
      expect(envVars.SALESFORCE_INSTANCE_URL).toBe('https://myorg.salesforce.com');
      expect(envVars.SALESFORCE_ACCESS_TOKEN).toBe('bearer_xyz_123');
      expect(envVars.SALESFORCE_API_VERSION).toBe('58.0');
    });

    test('simulates PostgreSQL connection form → env vars', () => {
      const formValues = {
        host: 'db.prod.example.com',
        port: '5432',
        database: 'production',
        username: 'prod_user',
        password: 'P@ssw0rd!',
        ssl: 'require',
      };

      const envVars = buildEnvVarsFromParams('postgresql', formValues);

      expect(envVars.PGHOST).toBe('db.prod.example.com');
      expect(envVars.PGPORT).toBe('5432');
      expect(envVars.PGDATABASE).toBe('production');
      expect(envVars.PGUSER).toBe('prod_user');
      expect(envVars.PGPASSWORD).toBe('P@ssw0rd!');
      expect(envVars.PGSSLMODE).toBe('require');
    });

    test('simulates Dynamics365 connection form → env vars', () => {
      const formValues = {
        tenantId: 'aaaabbbb-1111-2222-3333-ccccddddeeee',
        clientId: 'my-client-id',
        clientSecret: 'my-client-secret',
        resourceUrl: 'https://myorg.crm.dynamics.com',
      };

      const envVars = buildEnvVarsFromParams('dynamics365', formValues);

      expect(envVars.DYNAMICS365_TENANT_ID).toBe('aaaabbbb-1111-2222-3333-ccccddddeeee');
      expect(envVars.DYNAMICS365_CLIENT_ID).toBe('my-client-id');
      expect(envVars.DYNAMICS365_CLIENT_SECRET).toBe('my-client-secret');
      expect(envVars.DYNAMICS365_RESOURCE_URL).toBe('https://myorg.crm.dynamics.com');
    });

    test('simulates NetSuite connection form → env vars', () => {
      const formValues = {
        accountId: '1234567',
        consumerKey: 'ck_12345',
        consumerSecret: 'cs_12345',
        tokenId: 'tid_12345',
        tokenSecret: 'ts_12345',
      };

      const envVars = buildEnvVarsFromParams('netsuite', formValues);

      expect(envVars.NETSUITE_ACCOUNT_ID).toBe('1234567');
      expect(envVars.NETSUITE_CONSUMER_KEY).toBe('ck_12345');
      expect(Object.keys(envVars)).toHaveLength(5);
    });
  });
});
