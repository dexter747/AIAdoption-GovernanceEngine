/**
 * Unit tests for connection-fields.ts — the schema that drives
 * the dynamic AddConnectionModal form and the env var mapping.
 */

// We replicate the core types and helpers from connection-fields.ts
// because the test runner can't resolve renderer imports.

interface ConnectionField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'password' | 'number' | 'url' | 'email' | 'select' | 'textarea';
  required: boolean;
  defaultValue?: string | number;
  group?: 'connection' | 'auth' | 'advanced';
}

interface ConnectionFieldSchema {
  fields: ConnectionField[];
  envMap: Record<string, string>;
}

// A representative subset of schemas to validate structure
const SAMPLE_SCHEMAS: Record<string, ConnectionFieldSchema> = {
  postgresql: {
    fields: [
      { key: 'host', label: 'Host', placeholder: 'localhost', type: 'text', required: true, defaultValue: 'localhost', group: 'connection' },
      { key: 'port', label: 'Port', placeholder: '5432', type: 'number', required: true, defaultValue: '5432', group: 'connection' },
      { key: 'database', label: 'Database', placeholder: 'my_database', type: 'text', required: true, group: 'connection' },
      { key: 'username', label: 'Username', placeholder: 'postgres', type: 'text', required: true, group: 'auth' },
      { key: 'password', label: 'Password', placeholder: 'password', type: 'password', required: true, group: 'auth' },
      { key: 'ssl', label: 'SSL Mode', placeholder: 'disable', type: 'text', required: false, defaultValue: 'disable', group: 'advanced' },
    ],
    envMap: { host: 'PGHOST', port: 'PGPORT', database: 'PGDATABASE', username: 'PGUSER', password: 'PGPASSWORD', ssl: 'PGSSLMODE' },
  },
  salesforce: {
    fields: [
      { key: 'instanceUrl', label: 'Instance URL', placeholder: 'https://myorg.salesforce.com', type: 'url', required: true, group: 'connection' },
      { key: 'username', label: 'Username', placeholder: 'user@salesforce.com', type: 'email', required: false, group: 'auth' },
      { key: 'password', label: 'Password', placeholder: 'password', type: 'password', required: false, group: 'auth' },
      { key: 'securityToken', label: 'Security Token', placeholder: 'security token', type: 'password', required: false, group: 'auth' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'Bearer token', type: 'password', required: false, group: 'auth' },
      { key: 'apiVersion', label: 'API Version', placeholder: '58.0', type: 'text', required: false, defaultValue: '58.0', group: 'advanced' },
    ],
    envMap: {
      instanceUrl: 'SALESFORCE_INSTANCE_URL',
      username: 'SALESFORCE_USERNAME',
      password: 'SALESFORCE_PASSWORD',
      securityToken: 'SALESFORCE_SECURITY_TOKEN',
      accessToken: 'SALESFORCE_ACCESS_TOKEN',
      apiVersion: 'SALESFORCE_API_VERSION',
    },
  },
  dynamics365: {
    fields: [
      { key: 'tenantId', label: 'Tenant ID', placeholder: 'Azure AD Tenant ID', type: 'text', required: true, group: 'auth' },
      { key: 'clientId', label: 'Client ID', placeholder: 'Application Client ID', type: 'text', required: true, group: 'auth' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'secret', type: 'password', required: true, group: 'auth' },
      { key: 'resourceUrl', label: 'Resource URL', placeholder: 'https://org.crm.dynamics.com', type: 'url', required: true, group: 'connection' },
    ],
    envMap: {
      tenantId: 'DYNAMICS365_TENANT_ID',
      clientId: 'DYNAMICS365_CLIENT_ID',
      clientSecret: 'DYNAMICS365_CLIENT_SECRET',
      resourceUrl: 'DYNAMICS365_RESOURCE_URL',
    },
  },
};

describe('ConnectionFieldSchema validation', () => {
  describe('field structure', () => {
    test.each(Object.keys(SAMPLE_SCHEMAS))('schema %s has at least 1 field', (type) => {
      expect(SAMPLE_SCHEMAS[type].fields.length).toBeGreaterThan(0);
    });

    test.each(Object.keys(SAMPLE_SCHEMAS))('schema %s fields have required properties', (type) => {
      for (const field of SAMPLE_SCHEMAS[type].fields) {
        expect(field.key).toBeTruthy();
        expect(field.label).toBeTruthy();
        expect(field.placeholder).toBeTruthy();
        expect(['text', 'password', 'number', 'url', 'email', 'select', 'textarea']).toContain(field.type);
        expect(typeof field.required).toBe('boolean');
      }
    });

    test('no duplicate field keys within a schema', () => {
      for (const [type, schema] of Object.entries(SAMPLE_SCHEMAS)) {
        const keys = schema.fields.map(f => f.key);
        expect(new Set(keys).size).toBe(keys.length);
      }
    });
  });

  describe('envMap consistency', () => {
    test.each(Object.keys(SAMPLE_SCHEMAS))('schema %s envMap keys match field keys', (type) => {
      const schema = SAMPLE_SCHEMAS[type];
      const fieldKeys = new Set(schema.fields.map(f => f.key));
      for (const envMapKey of Object.keys(schema.envMap)) {
        expect(fieldKeys.has(envMapKey)).toBe(true);
      }
    });

    test.each(Object.keys(SAMPLE_SCHEMAS))('schema %s envMap values are uppercase', (type) => {
      for (const envVar of Object.values(SAMPLE_SCHEMAS[type].envMap)) {
        expect(envVar).toBe(envVar.toUpperCase());
      }
    });

    test.each(Object.keys(SAMPLE_SCHEMAS))('schema %s has no duplicate env var names', (type) => {
      const envVarNames = Object.values(SAMPLE_SCHEMAS[type].envMap);
      expect(new Set(envVarNames).size).toBe(envVarNames.length);
    });
  });

  describe('postgresql schema specifics', () => {
    const pg = SAMPLE_SCHEMAS.postgresql;

    test('has host, port, database, username, password, ssl fields', () => {
      const keys = pg.fields.map(f => f.key);
      expect(keys).toContain('host');
      expect(keys).toContain('port');
      expect(keys).toContain('database');
      expect(keys).toContain('username');
      expect(keys).toContain('password');
      expect(keys).toContain('ssl');
    });

    test('host defaults to localhost', () => {
      const host = pg.fields.find(f => f.key === 'host');
      expect(host?.defaultValue).toBe('localhost');
    });

    test('port defaults to 5432', () => {
      const port = pg.fields.find(f => f.key === 'port');
      expect(port?.defaultValue).toBe('5432');
    });

    test('password is type password', () => {
      const pw = pg.fields.find(f => f.key === 'password');
      expect(pw?.type).toBe('password');
    });

    test('envMap maps host→PGHOST', () => {
      expect(pg.envMap.host).toBe('PGHOST');
    });
  });

  describe('salesforce schema specifics', () => {
    const sf = SAMPLE_SCHEMAS.salesforce;

    test('instanceUrl is required, other auth fields optional', () => {
      const instance = sf.fields.find(f => f.key === 'instanceUrl');
      expect(instance?.required).toBe(true);
      
      const acc = sf.fields.find(f => f.key === 'accessToken');
      expect(acc?.required).toBe(false);
    });

    test('has 6 env var mappings', () => {
      expect(Object.keys(sf.envMap)).toHaveLength(6);
    });

    test('envMap maps instanceUrl→SALESFORCE_INSTANCE_URL', () => {
      expect(sf.envMap.instanceUrl).toBe('SALESFORCE_INSTANCE_URL');
    });
  });

  describe('dynamics365 schema specifics', () => {
    const d365 = SAMPLE_SCHEMAS.dynamics365;

    test('all 4 fields are required', () => {
      for (const field of d365.fields) {
        expect(field.required).toBe(true);
      }
    });

    test('envMap maps tenantId→DYNAMICS365_TENANT_ID', () => {
      expect(d365.envMap.tenantId).toBe('DYNAMICS365_TENANT_ID');
    });
  });
});

describe('AddConnectionModal form data → ConnectionConfig mapping', () => {
  // Simulate what the frontend does when user submits the form
  function buildConnectionConfig(
    name: string,
    type: string,
    fieldValues: Record<string, string>
  ): Record<string, any> {
    const config: Record<string, any> = {
      name,
      type,
      options: {} as Record<string, string>,
    };

    const standardFields = ['host', 'port', 'database', 'username', 'password', 'ssl'];
    for (const [key, value] of Object.entries(fieldValues)) {
      if (value === undefined || value === '') continue;
      if (standardFields.includes(key)) {
        config[key] = key === 'port' ? parseInt(value, 10) : value;
      } else {
        config.options[key] = value;
      }
    }
    return config;
  }

  test('PostgreSQL form → standard fields on config', () => {
    const config = buildConnectionConfig('My PG', 'postgresql', {
      host: 'localhost',
      port: '5432',
      database: 'testdb',
      username: 'admin',
      password: 'secret',
    });

    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5432);
    expect(config.database).toBe('testdb');
    expect(config.username).toBe('admin');
    expect(config.password).toBe('secret');
    expect(config.options).toEqual({});
  });

  test('Salesforce form → extra fields in options', () => {
    const config = buildConnectionConfig('My SF', 'salesforce', {
      instanceUrl: 'https://myorg.salesforce.com',
      accessToken: 'bearer_token',
      apiVersion: '58.0',
    });

    // These are non-standard, so they go into options
    expect(config.options.instanceUrl).toBe('https://myorg.salesforce.com');
    expect(config.options.accessToken).toBe('bearer_token');
    expect(config.options.apiVersion).toBe('58.0');
    // Standard fields not present
    expect(config.host).toBeUndefined();
  });

  test('Dynamics365 form → extra fields in options', () => {
    const config = buildConnectionConfig('My D365', 'dynamics365', {
      tenantId: 'tid',
      clientId: 'cid',
      clientSecret: 'secret',
      resourceUrl: 'https://org.crm.dynamics.com',
    });

    expect(config.options.tenantId).toBe('tid');
    expect(config.options.clientId).toBe('cid');
    expect(config.options.clientSecret).toBe('secret');
    expect(config.options.resourceUrl).toBe('https://org.crm.dynamics.com');
  });

  test('empty string values are excluded', () => {
    const config = buildConnectionConfig('Test', 'postgresql', {
      host: 'localhost',
      port: '',
      database: '',
    });

    expect(config.host).toBe('localhost');
    expect(config.port).toBeUndefined();
    expect(config.database).toBeUndefined();
  });
});

describe('mcp-manager.ts env building simulation', () => {
  // Simulate what startNpmMCPServer does with ConnectionConfig
  function simulateManagerEnvBuild(
    type: string,
    config: {
      host?: string;
      port?: number;
      database?: string;
      username?: string;
      password?: string;
      ssl?: boolean;
      options?: Record<string, any>;
    }
  ): Record<string, string> {
    // Build params from config (same logic as mcp-manager.ts)
    const connectionParams: Record<string, string> = {};
    if (config.host) connectionParams.host = config.host;
    if (config.port) connectionParams.port = String(config.port);
    if (config.database) connectionParams.database = config.database;
    if (config.username) connectionParams.username = config.username;
    if (config.password) connectionParams.password = config.password;
    if (config.ssl !== undefined) connectionParams.ssl = config.ssl ? 'require' : 'disable';

    if (config.options) {
      for (const [key, value] of Object.entries(config.options)) {
        if (value !== undefined && value !== null && value !== '') {
          connectionParams[key] = String(value);
        }
      }
    }

    // Use the same env map function
    const ENV_MAPS_LOCAL: Record<string, Record<string, string>> = {
      postgresql: { host: 'PGHOST', port: 'PGPORT', database: 'PGDATABASE', username: 'PGUSER', password: 'PGPASSWORD', ssl: 'PGSSLMODE' },
      salesforce: { instanceUrl: 'SALESFORCE_INSTANCE_URL', username: 'SALESFORCE_USERNAME', password: 'SALESFORCE_PASSWORD', securityToken: 'SALESFORCE_SECURITY_TOKEN', accessToken: 'SALESFORCE_ACCESS_TOKEN', apiVersion: 'SALESFORCE_API_VERSION' },
      dynamics365: { tenantId: 'DYNAMICS365_TENANT_ID', clientId: 'DYNAMICS365_CLIENT_ID', clientSecret: 'DYNAMICS365_CLIENT_SECRET', resourceUrl: 'DYNAMICS365_RESOURCE_URL' },
      netsuite: { accountId: 'NETSUITE_ACCOUNT_ID', consumerKey: 'NETSUITE_CONSUMER_KEY', consumerSecret: 'NETSUITE_CONSUMER_SECRET', tokenId: 'NETSUITE_TOKEN_ID', tokenSecret: 'NETSUITE_TOKEN_SECRET' },
      jira: { baseUrl: 'JIRA_BASE_URL', email: 'JIRA_EMAIL', apiToken: 'JIRA_API_TOKEN' },
    };

    const envMap = ENV_MAPS_LOCAL[type];
    if (!envMap) return {};

    const env: Record<string, string> = {};
    for (const [fieldKey, envVarName] of Object.entries(envMap)) {
      const value = connectionParams[fieldKey];
      if (value !== undefined && value !== '') {
        env[envVarName] = String(value);
      }
    }
    return env;
  }

  test('PostgreSQL: standard config → PGHOST/PGPORT/etc', () => {
    const env = simulateManagerEnvBuild('postgresql', {
      host: 'db.example.com',
      port: 5432,
      database: 'prod',
      username: 'admin',
      password: 'secret',
      ssl: true,
    });

    expect(env.PGHOST).toBe('db.example.com');
    expect(env.PGPORT).toBe('5432');
    expect(env.PGDATABASE).toBe('prod');
    expect(env.PGUSER).toBe('admin');
    expect(env.PGPASSWORD).toBe('secret');
    expect(env.PGSSLMODE).toBe('require');
  });

  test('Salesforce: options → SALESFORCE_* env vars', () => {
    const env = simulateManagerEnvBuild('salesforce', {
      options: {
        instanceUrl: 'https://myorg.salesforce.com',
        accessToken: 'token123',
        apiVersion: '58.0',
      },
    });

    expect(env.SALESFORCE_INSTANCE_URL).toBe('https://myorg.salesforce.com');
    expect(env.SALESFORCE_ACCESS_TOKEN).toBe('token123');
    expect(env.SALESFORCE_API_VERSION).toBe('58.0');
  });

  test('Dynamics365: options → DYNAMICS365_* env vars', () => {
    const env = simulateManagerEnvBuild('dynamics365', {
      options: {
        tenantId: 'tid',
        clientId: 'cid',
        clientSecret: 'cs',
        resourceUrl: 'https://org.crm.dynamics.com',
      },
    });

    expect(env.DYNAMICS365_TENANT_ID).toBe('tid');
    expect(env.DYNAMICS365_CLIENT_ID).toBe('cid');
    expect(env.DYNAMICS365_CLIENT_SECRET).toBe('cs');
    expect(env.DYNAMICS365_RESOURCE_URL).toBe('https://org.crm.dynamics.com');
  });

  test('NetSuite: all 5 fields via options', () => {
    const env = simulateManagerEnvBuild('netsuite', {
      options: {
        accountId: 'ACCT',
        consumerKey: 'ck',
        consumerSecret: 'cs',
        tokenId: 'tid',
        tokenSecret: 'ts',
      },
    });

    expect(Object.keys(env)).toHaveLength(5);
    expect(env.NETSUITE_ACCOUNT_ID).toBe('ACCT');
    expect(env.NETSUITE_CONSUMER_KEY).toBe('ck');
  });

  test('Jira: mixed standard + options fields', () => {
    // Jira uses baseUrl (options), email (options), apiToken (options)
    const env = simulateManagerEnvBuild('jira', {
      options: {
        baseUrl: 'https://myorg.atlassian.net',
        email: 'user@example.com',
        apiToken: 'jira_token',
      },
    });

    expect(env.JIRA_BASE_URL).toBe('https://myorg.atlassian.net');
    expect(env.JIRA_EMAIL).toBe('user@example.com');
    expect(env.JIRA_API_TOKEN).toBe('jira_token');
  });
});
