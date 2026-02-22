/**
 * Connection Field Schemas
 * Defines which form fields to show for each system type,
 * and maps user-provided field values to MCP server environment variables.
 *
 * Every entry in CONNECTION_FIELD_SCHEMAS maps a system type to:
 *   - fields[]: what the user fills in (label, placeholder, type, required, default)
 *   - envMap: Record<fieldKey, ENV_VAR_NAME> so we know which env vars to set
 */

export interface ConnectionField {
  key: string; // internal key – stored in ConnectionConfig.options
  label: string; // UI label
  placeholder: string; // UI placeholder text
  type: 'text' | 'password' | 'number' | 'url' | 'email' | 'select' | 'textarea';
  required: boolean;
  defaultValue?: string | number;
  group?: 'connection' | 'auth' | 'advanced'; // form grouping
}

export interface ConnectionFieldSchema {
  fields: ConnectionField[];
  envMap: Record<string, string>; // fieldKey -> ENV_VAR_NAME
}

/**
 * Comprehensive connection field schemas for all 64 MCP server types.
 * When a user selects a system type, the UI renders the corresponding fields.
 * Values are stored in ConnectionConfig.options and mapped to env vars at spawn time.
 */
export const CONNECTION_FIELD_SCHEMAS: Record<string, ConnectionFieldSchema> = {
  // ═══════════════════════════════════════════════════════════════════════
  // DATABASE SERVERS
  // ═══════════════════════════════════════════════════════════════════════

  postgresql: {
    fields: [
      {
        key: 'host',
        label: 'Host',
        placeholder: 'localhost',
        type: 'text',
        required: true,
        defaultValue: 'localhost',
        group: 'connection',
      },
      {
        key: 'port',
        label: 'Port',
        placeholder: '5432',
        type: 'number',
        required: true,
        defaultValue: 5432,
        group: 'connection',
      },
      {
        key: 'database',
        label: 'Database',
        placeholder: 'mydb',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'postgres',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'ssl',
        label: 'SSL Mode',
        placeholder: 'disable',
        type: 'text',
        required: false,
        group: 'advanced',
      },
    ],
    envMap: {
      host: 'PGHOST',
      port: 'PGPORT',
      database: 'PGDATABASE',
      username: 'PGUSER',
      password: 'PGPASSWORD',
      ssl: 'PGSSLMODE',
    },
  },

  mysql: {
    fields: [
      {
        key: 'host',
        label: 'Host',
        placeholder: 'localhost',
        type: 'text',
        required: true,
        defaultValue: 'localhost',
        group: 'connection',
      },
      {
        key: 'port',
        label: 'Port',
        placeholder: '3306',
        type: 'number',
        required: true,
        defaultValue: 3306,
        group: 'connection',
      },
      {
        key: 'database',
        label: 'Database',
        placeholder: 'mydb',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'root',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      host: 'MYSQL_HOST',
      port: 'MYSQL_PORT',
      database: 'MYSQL_DATABASE',
      username: 'MYSQL_USER',
      password: 'MYSQL_PASSWORD',
    },
  },

  mariadb: {
    fields: [
      {
        key: 'host',
        label: 'Host',
        placeholder: 'localhost',
        type: 'text',
        required: true,
        defaultValue: 'localhost',
        group: 'connection',
      },
      {
        key: 'port',
        label: 'Port',
        placeholder: '3306',
        type: 'number',
        required: true,
        defaultValue: 3306,
        group: 'connection',
      },
      {
        key: 'database',
        label: 'Database',
        placeholder: 'mydb',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'root',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      host: 'MARIADB_HOST',
      port: 'MARIADB_PORT',
      database: 'MARIADB_DATABASE',
      username: 'MARIADB_USER',
      password: 'MARIADB_PASSWORD',
    },
  },

  sqlserver: {
    fields: [
      {
        key: 'host',
        label: 'Host',
        placeholder: 'localhost',
        type: 'text',
        required: true,
        defaultValue: 'localhost',
        group: 'connection',
      },
      {
        key: 'port',
        label: 'Port',
        placeholder: '1433',
        type: 'number',
        required: true,
        defaultValue: 1433,
        group: 'connection',
      },
      {
        key: 'database',
        label: 'Database',
        placeholder: 'master',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'sa',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'encrypt',
        label: 'Encrypt',
        placeholder: 'true',
        type: 'text',
        required: false,
        defaultValue: 'true',
        group: 'advanced',
      },
      {
        key: 'trustCert',
        label: 'Trust Server Certificate',
        placeholder: 'false',
        type: 'text',
        required: false,
        group: 'advanced',
      },
    ],
    envMap: {
      host: 'SQLSERVER_HOST',
      port: 'SQLSERVER_PORT',
      database: 'SQLSERVER_DATABASE',
      username: 'SQLSERVER_USER',
      password: 'SQLSERVER_PASSWORD',
      encrypt: 'SQLSERVER_ENCRYPT',
      trustCert: 'SQLSERVER_TRUST_CERT',
    },
  },

  oracle: {
    fields: [
      {
        key: 'host',
        label: 'Host',
        placeholder: 'localhost',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'port',
        label: 'Port',
        placeholder: '1521',
        type: 'number',
        required: true,
        defaultValue: 1521,
        group: 'connection',
      },
      {
        key: 'service',
        label: 'Service Name',
        placeholder: 'ORCL',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'system',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      host: 'ORACLE_HOST',
      port: 'ORACLE_PORT',
      service: 'ORACLE_SERVICE',
      username: 'ORACLE_USER',
      password: 'ORACLE_PASSWORD',
    },
  },

  mongodb: {
    fields: [
      {
        key: 'uri',
        label: 'Connection URI',
        placeholder: 'mongodb://localhost:27017/mydb',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'database',
        label: 'Database',
        placeholder: 'mydb',
        type: 'text',
        required: false,
        group: 'connection',
      },
    ],
    envMap: {
      uri: 'MONGODB_URI',
      database: 'MONGODB_DATABASE',
    },
  },

  'sap-hana': {
    fields: [
      {
        key: 'host',
        label: 'Host',
        placeholder: 'hana-server.example.com',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'port',
        label: 'Port',
        placeholder: '30015',
        type: 'number',
        required: true,
        defaultValue: 30015,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'SYSTEM',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      host: 'SAP_HANA_HOST',
      port: 'SAP_HANA_PORT',
      username: 'SAP_HANA_USER',
      password: 'SAP_HANA_PASSWORD',
    },
  },

  redis: {
    fields: [
      {
        key: 'url',
        label: 'Redis URL',
        placeholder: 'redis://localhost:6379',
        type: 'url',
        required: true,
        defaultValue: 'redis://localhost:6379',
        group: 'connection',
      },
    ],
    envMap: {
      url: 'REDIS_URL',
    },
  },

  elasticsearch: {
    fields: [
      {
        key: 'url',
        label: 'Elasticsearch URL',
        placeholder: 'http://localhost:9200',
        type: 'url',
        required: true,
        defaultValue: 'http://localhost:9200',
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'elastic',
        type: 'text',
        required: false,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: false,
        group: 'auth',
      },
    ],
    envMap: {
      url: 'ELASTICSEARCH_URL',
      username: 'ELASTICSEARCH_USERNAME',
      password: 'ELASTICSEARCH_PASSWORD',
    },
  },

  cassandra: {
    fields: [
      {
        key: 'contactPoints',
        label: 'Contact Points',
        placeholder: 'host1,host2,host3',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'datacenter',
        label: 'Local Datacenter',
        placeholder: 'datacenter1',
        type: 'text',
        required: true,
        defaultValue: 'datacenter1',
        group: 'connection',
      },
      {
        key: 'keyspace',
        label: 'Keyspace',
        placeholder: 'my_keyspace',
        type: 'text',
        required: false,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'cassandra',
        type: 'text',
        required: false,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: false,
        group: 'auth',
      },
    ],
    envMap: {
      contactPoints: 'CASSANDRA_CONTACT_POINTS',
      datacenter: 'CASSANDRA_DATACENTER',
      keyspace: 'CASSANDRA_KEYSPACE',
      username: 'CASSANDRA_USERNAME',
      password: 'CASSANDRA_PASSWORD',
    },
  },

  couchdb: {
    fields: [
      {
        key: 'url',
        label: 'CouchDB URL',
        placeholder: 'http://localhost:5984',
        type: 'url',
        required: true,
        defaultValue: 'http://localhost:5984',
        group: 'connection',
      },
    ],
    envMap: {
      url: 'COUCHDB_URL',
    },
  },

  neo4j: {
    fields: [
      {
        key: 'uri',
        label: 'Neo4j URI',
        placeholder: 'bolt://localhost:7687',
        type: 'url',
        required: true,
        defaultValue: 'bolt://localhost:7687',
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'neo4j',
        type: 'text',
        required: true,
        defaultValue: 'neo4j',
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      uri: 'NEO4J_URI',
      username: 'NEO4J_USER',
      password: 'NEO4J_PASSWORD',
    },
  },

  dynamodb: {
    fields: [
      {
        key: 'region',
        label: 'AWS Region',
        placeholder: 'us-east-1',
        type: 'text',
        required: true,
        defaultValue: 'us-east-1',
        group: 'connection',
      },
      {
        key: 'endpoint',
        label: 'Endpoint (optional)',
        placeholder: 'http://localhost:8000',
        type: 'url',
        required: false,
        group: 'connection',
      },
      {
        key: 'accessKeyId',
        label: 'AWS Access Key ID',
        placeholder: 'AKIAxxxxxxxxxxxxxxxx',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'secretAccessKey',
        label: 'AWS Secret Access Key',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      region: 'AWS_REGION',
      endpoint: 'DYNAMODB_ENDPOINT',
      accessKeyId: 'AWS_ACCESS_KEY_ID',
      secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CRM & SALES
  // ═══════════════════════════════════════════════════════════════════════

  salesforce: {
    fields: [
      {
        key: 'instanceUrl',
        label: 'Instance URL',
        placeholder: 'https://myorg.salesforce.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'user@example.com',
        type: 'email',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'securityToken',
        label: 'Security Token',
        placeholder: 'AbCdEf123456',
        type: 'password',
        required: false,
        group: 'auth',
      },
      {
        key: 'accessToken',
        label: 'Access Token (alternative)',
        placeholder: 'Bearer ...',
        type: 'password',
        required: false,
        group: 'auth',
      },
      {
        key: 'apiVersion',
        label: 'API Version',
        placeholder: 'v58.0',
        type: 'text',
        required: false,
        defaultValue: 'v58.0',
        group: 'advanced',
      },
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

  hubspot: {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'pat-xxx-xxx-xxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'apiKey',
        label: 'API Key (legacy)',
        placeholder: 'xxx-xxx-xxx',
        type: 'password',
        required: false,
        group: 'auth',
      },
    ],
    envMap: {
      accessToken: 'HUBSPOT_ACCESS_TOKEN',
      apiKey: 'HUBSPOT_API_KEY',
    },
  },

  'oracle-siebel': {
    fields: [
      {
        key: 'url',
        label: 'Siebel REST URL',
        placeholder: 'https://siebel.example.com/siebel/v1.0',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'SADMIN',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      url: 'SIEBEL_URL',
      username: 'SIEBEL_USERNAME',
      password: 'SIEBEL_PASSWORD',
    },
  },

  dynamics365: {
    fields: [
      {
        key: 'tenantId',
        label: 'Tenant ID',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'clientId',
        label: 'Client ID',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'resourceUrl',
        label: 'Resource URL',
        placeholder: 'https://myorg.crm.dynamics.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
    ],
    envMap: {
      tenantId: 'DYNAMICS365_TENANT_ID',
      clientId: 'DYNAMICS365_CLIENT_ID',
      clientSecret: 'DYNAMICS365_CLIENT_SECRET',
      resourceUrl: 'DYNAMICS365_RESOURCE_URL',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ITSM & SUPPORT
  // ═══════════════════════════════════════════════════════════════════════

  servicenow: {
    fields: [
      {
        key: 'instanceUrl',
        label: 'Instance URL',
        placeholder: 'https://myinstance.service-now.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'admin',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      instanceUrl: 'SERVICENOW_INSTANCE_URL',
      username: 'SERVICENOW_USERNAME',
      password: 'SERVICENOW_PASSWORD',
    },
  },

  jira: {
    fields: [
      {
        key: 'baseUrl',
        label: 'Jira URL',
        placeholder: 'https://myorg.atlassian.net',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'email',
        label: 'Email',
        placeholder: 'you@example.com',
        type: 'email',
        required: true,
        group: 'auth',
      },
      {
        key: 'apiToken',
        label: 'API Token',
        placeholder: 'ATATTxxxxxxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      baseUrl: 'JIRA_BASE_URL',
      email: 'JIRA_EMAIL',
      apiToken: 'JIRA_API_TOKEN',
    },
  },

  zendesk: {
    fields: [
      {
        key: 'subdomain',
        label: 'Subdomain',
        placeholder: 'mycompany',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'email',
        label: 'Email',
        placeholder: 'you@example.com',
        type: 'email',
        required: true,
        group: 'auth',
      },
      {
        key: 'apiToken',
        label: 'API Token',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      subdomain: 'ZENDESK_SUBDOMAIN',
      email: 'ZENDESK_EMAIL',
      apiToken: 'ZENDESK_API_TOKEN',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ERP SYSTEMS
  // ═══════════════════════════════════════════════════════════════════════

  netsuite: {
    fields: [
      {
        key: 'accountId',
        label: 'Account ID',
        placeholder: '123456_SB1',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'consumerKey',
        label: 'Consumer Key',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'consumerSecret',
        label: 'Consumer Secret',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'tokenId',
        label: 'Token ID',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'tokenSecret',
        label: 'Token Secret',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      accountId: 'NETSUITE_ACCOUNT_ID',
      consumerKey: 'NETSUITE_CONSUMER_KEY',
      consumerSecret: 'NETSUITE_CONSUMER_SECRET',
      tokenId: 'NETSUITE_TOKEN_ID',
      tokenSecret: 'NETSUITE_TOKEN_SECRET',
    },
  },

  'infor-cloudsuite': {
    fields: [
      {
        key: 'apiUrl',
        label: 'ION API URL',
        placeholder: 'https://mingle-ionapi.inforcloudsuite.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'tokenUrl',
        label: 'Token URL',
        placeholder: 'https://mingle-sso.inforcloudsuite.com/...',
        type: 'url',
        required: true,
        group: 'auth',
      },
      {
        key: 'clientId',
        label: 'Client ID',
        placeholder: 'InforIntegration_xxx',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'INFOR_API_URL',
      tokenUrl: 'INFOR_TOKEN_URL',
      clientId: 'INFOR_CLIENT_ID',
      clientSecret: 'INFOR_CLIENT_SECRET',
    },
  },

  'jd-edwards': {
    fields: [
      {
        key: 'aisUrl',
        label: 'AIS Server URL',
        placeholder: 'https://jde-server:port/jderest',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'JDE_USER',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'environment',
        label: 'Environment',
        placeholder: 'JDV920',
        type: 'text',
        required: false,
        group: 'advanced',
      },
    ],
    envMap: {
      aisUrl: 'JDE_AIS_URL',
      username: 'JDE_USERNAME',
      password: 'JDE_PASSWORD',
      environment: 'JDE_ENVIRONMENT',
    },
  },

  epicor: {
    fields: [
      {
        key: 'url',
        label: 'Epicor REST URL',
        placeholder: 'https://epicor-server/api/v2',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'password',
        required: false,
        group: 'auth',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'manager',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'company',
        label: 'Company',
        placeholder: 'EPIC06',
        type: 'text',
        required: false,
        group: 'advanced',
      },
    ],
    envMap: {
      url: 'EPICOR_URL',
      apiKey: 'EPICOR_API_KEY',
      username: 'EPICOR_USERNAME',
      password: 'EPICOR_PASSWORD',
      company: 'EPICOR_COMPANY',
    },
  },

  'sage-intacct': {
    fields: [
      {
        key: 'senderId',
        label: 'Sender ID',
        placeholder: 'MyWebServicesID',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'senderPassword',
        label: 'Sender Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'companyId',
        label: 'Company ID',
        placeholder: 'mycompany',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'userId',
        label: 'User ID',
        placeholder: 'xml_gateway',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'userPassword',
        label: 'User Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      senderId: 'INTACCT_SENDER_ID',
      senderPassword: 'INTACCT_SENDER_PASSWORD',
      companyId: 'INTACCT_COMPANY_ID',
      userId: 'INTACCT_USER_ID',
      userPassword: 'INTACCT_USER_PASSWORD',
    },
  },

  'oracle-peoplesoft': {
    fields: [
      {
        key: 'url',
        label: 'PeopleSoft URL',
        placeholder: 'https://psft-server:port',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'PS_USER',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      url: 'PEOPLESOFT_URL',
      username: 'PEOPLESOFT_USERNAME',
      password: 'PEOPLESOFT_PASSWORD',
    },
  },

  'oracle-opera': {
    fields: [
      {
        key: 'apiUrl',
        label: 'Opera API URL',
        placeholder: 'https://opera-server/api',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'clientId',
        label: 'Client ID',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'propertyId',
        label: 'Property ID',
        placeholder: 'HOTEL1',
        type: 'text',
        required: true,
        group: 'connection',
      },
    ],
    envMap: {
      apiUrl: 'OPERA_API_URL',
      clientId: 'OPERA_CLIENT_ID',
      clientSecret: 'OPERA_CLIENT_SECRET',
      propertyId: 'OPERA_PROPERTY_ID',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HCM & HR
  // ═══════════════════════════════════════════════════════════════════════

  workday: {
    fields: [
      {
        key: 'tenant',
        label: 'Tenant',
        placeholder: 'mycompany',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'ISU_User',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      tenant: 'WORKDAY_TENANT',
      username: 'WORKDAY_USERNAME',
      password: 'WORKDAY_PASSWORD',
    },
  },

  'sap-successfactors': {
    fields: [
      {
        key: 'apiUrl',
        label: 'API URL',
        placeholder: 'https://api4.successfactors.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'companyId',
        label: 'Company ID',
        placeholder: 'myCompanyId',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'API Username',
        placeholder: 'admin_user',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'API Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'SF_API_URL',
      companyId: 'SF_COMPANY_ID',
      username: 'SF_USERNAME',
      password: 'SF_PASSWORD',
    },
  },

  adp: {
    fields: [
      {
        key: 'apiUrl',
        label: 'ADP API URL',
        placeholder: 'https://api.adp.com',
        type: 'url',
        required: true,
        defaultValue: 'https://api.adp.com',
        group: 'connection',
      },
      {
        key: 'clientId',
        label: 'Client ID',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'tokenUrl',
        label: 'Token URL',
        placeholder: 'https://accounts.adp.com/auth/oauth/v2/token',
        type: 'url',
        required: false,
        group: 'advanced',
      },
    ],
    envMap: {
      apiUrl: 'ADP_API_URL',
      clientId: 'ADP_CLIENT_ID',
      clientSecret: 'ADP_CLIENT_SECRET',
      tokenUrl: 'ADP_TOKEN_URL',
    },
  },

  'ukg-kronos': {
    fields: [
      {
        key: 'apiUrl',
        label: 'UKG API URL',
        placeholder: 'https://mycompany.kronos.net/api',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'api_user',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'xxxxxxxxxxxxxxxx',
        type: 'password',
        required: false,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'UKG_API_URL',
      username: 'UKG_USERNAME',
      password: 'UKG_PASSWORD',
      apiKey: 'UKG_API_KEY',
    },
  },

  'sap-concur': {
    fields: [
      {
        key: 'baseUrl',
        label: 'Concur Base URL',
        placeholder: 'https://us.api.concursolutions.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'eyJhbGci...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      baseUrl: 'CONCUR_BASE_URL',
      accessToken: 'CONCUR_ACCESS_TOKEN',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HEALTHCARE
  // ═══════════════════════════════════════════════════════════════════════

  'epic-fhir': {
    fields: [
      {
        key: 'fhirUrl',
        label: 'FHIR Base URL',
        placeholder: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer eyJhbGci...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      fhirUrl: 'EPIC_FHIR_URL',
      accessToken: 'EPIC_ACCESS_TOKEN',
    },
  },

  cerner: {
    fields: [
      {
        key: 'fhirUrl',
        label: 'FHIR Base URL',
        placeholder: 'https://fhir-ehr.cerner.com/r4/tenantid',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer eyJhbGci...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      fhirUrl: 'CERNER_FHIR_URL',
      accessToken: 'CERNER_ACCESS_TOKEN',
    },
  },

  meditech: {
    fields: [
      {
        key: 'fhirUrl',
        label: 'FHIR URL',
        placeholder: 'https://meditech-server/fhir',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      fhirUrl: 'MEDITECH_FHIR_URL',
      accessToken: 'MEDITECH_ACCESS_TOKEN',
    },
  },

  allscripts: {
    fields: [
      {
        key: 'url',
        label: 'Allscripts Unity URL',
        placeholder: 'https://open.allscripts.com/api',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'appName',
        label: 'App Name',
        placeholder: 'MyApp',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'appUsername',
        label: 'App Username',
        placeholder: 'app_user',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'appPassword',
        label: 'App Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      url: 'ALLSCRIPTS_URL',
      appName: 'ALLSCRIPTS_APP_NAME',
      appUsername: 'ALLSCRIPTS_APP_USERNAME',
      appPassword: 'ALLSCRIPTS_APP_PASSWORD',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INSURANCE
  // ═══════════════════════════════════════════════════════════════════════

  guidewire: {
    fields: [
      {
        key: 'pcUrl',
        label: 'PolicyCenter URL',
        placeholder: 'https://pc.example.com/pc/rest',
        type: 'url',
        required: false,
        group: 'connection',
      },
      {
        key: 'ccUrl',
        label: 'ClaimCenter URL',
        placeholder: 'https://cc.example.com/cc/rest',
        type: 'url',
        required: false,
        group: 'connection',
      },
      {
        key: 'bcUrl',
        label: 'BillingCenter URL',
        placeholder: 'https://bc.example.com/bc/rest',
        type: 'url',
        required: false,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      pcUrl: 'GUIDEWIRE_PC_URL',
      ccUrl: 'GUIDEWIRE_CC_URL',
      bcUrl: 'GUIDEWIRE_BC_URL',
      accessToken: 'GUIDEWIRE_ACCESS_TOKEN',
    },
  },

  'duck-creek': {
    fields: [
      {
        key: 'apiUrl',
        label: 'Duck Creek API URL',
        placeholder: 'https://api.duckcreek.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'DUCKCREEK_API_URL',
      accessToken: 'DUCKCREEK_ACCESS_TOKEN',
    },
  },

  'applied-epic': {
    fields: [
      {
        key: 'url',
        label: 'Applied Epic URL',
        placeholder: 'https://applied.example.com/api',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      url: 'APPLIED_EPIC_URL',
      accessToken: 'APPLIED_EPIC_ACCESS_TOKEN',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SUPPLY CHAIN & LOGISTICS
  // ═══════════════════════════════════════════════════════════════════════

  'manhattan-associates': {
    fields: [
      {
        key: 'apiUrl',
        label: 'API URL',
        placeholder: 'https://manhattan.example.com/api',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'MANHATTAN_API_URL',
      accessToken: 'MANHATTAN_ACCESS_TOKEN',
    },
  },

  'blue-yonder': {
    fields: [
      {
        key: 'apiUrl',
        label: 'API URL',
        placeholder: 'https://api.blueyonder.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'BLUEYONDER_API_URL',
      accessToken: 'BLUEYONDER_ACCESS_TOKEN',
    },
  },

  descartes: {
    fields: [
      {
        key: 'apiUrl',
        label: 'API URL',
        placeholder: 'https://api.descartes.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'DESCARTES_API_URL',
      apiKey: 'DESCARTES_API_KEY',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FINANCE & BANKING
  // ═══════════════════════════════════════════════════════════════════════

  fis: {
    fields: [
      {
        key: 'apiUrl',
        label: 'FIS API URL',
        placeholder: 'https://api.fisglobal.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'xxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'clientId',
        label: 'Client ID',
        placeholder: 'xxx-xxx',
        type: 'text',
        required: false,
        group: 'auth',
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        placeholder: '••••••••',
        type: 'password',
        required: false,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'FIS_API_URL',
      apiKey: 'FIS_API_KEY',
      clientId: 'FIS_CLIENT_ID',
      clientSecret: 'FIS_CLIENT_SECRET',
    },
  },

  finastra: {
    fields: [
      {
        key: 'apiUrl',
        label: 'Finastra API URL',
        placeholder: 'https://api.fusionfabric.cloud',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'FINASTRA_API_URL',
      accessToken: 'FINASTRA_ACCESS_TOKEN',
    },
  },

  temenos: {
    fields: [
      {
        key: 'apiUrl',
        label: 'Temenos API URL',
        placeholder: 'https://temenos-server/api/v1.0.0',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'INPUTTER',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'TEMENOS_API_URL',
      username: 'TEMENOS_USERNAME',
      password: 'TEMENOS_PASSWORD',
    },
  },

  blackline: {
    fields: [
      {
        key: 'apiUrl',
        label: 'BlackLine API URL',
        placeholder: 'https://myorg.blackline.com/api',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'BLACKLINE_API_URL',
      accessToken: 'BLACKLINE_ACCESS_TOKEN',
    },
  },

  quickbooks: {
    fields: [
      {
        key: 'apiUrl',
        label: 'QuickBooks API URL',
        placeholder: 'https://quickbooks.api.intuit.com',
        type: 'url',
        required: true,
        defaultValue: 'https://quickbooks.api.intuit.com',
        group: 'connection',
      },
      {
        key: 'realmId',
        label: 'Realm ID (Company ID)',
        placeholder: '123456789',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'eyJhbGci...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'QUICKBOOKS_API_URL',
      realmId: 'QUICKBOOKS_REALM_ID',
      accessToken: 'QUICKBOOKS_ACCESS_TOKEN',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // COMMERCE
  // ═══════════════════════════════════════════════════════════════════════

  shopify: {
    fields: [
      {
        key: 'storeUrl',
        label: 'Store URL',
        placeholder: 'https://mystore.myshopify.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Admin API Access Token',
        placeholder: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      storeUrl: 'SHOPIFY_STORE_URL',
      accessToken: 'SHOPIFY_ACCESS_TOKEN',
    },
  },

  magento: {
    fields: [
      {
        key: 'url',
        label: 'Magento URL',
        placeholder: 'https://magento.example.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Integration Access Token',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      url: 'MAGENTO_URL',
      accessToken: 'MAGENTO_ACCESS_TOKEN',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TELECOM
  // ═══════════════════════════════════════════════════════════════════════

  amdocs: {
    fields: [
      {
        key: 'apiUrl',
        label: 'Amdocs API URL',
        placeholder: 'https://amdocs.example.com/api',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'AMDOCS_API_URL',
      accessToken: 'AMDOCS_ACCESS_TOKEN',
    },
  },

  'ericsson-bss': {
    fields: [
      {
        key: 'url',
        label: 'Ericsson BSS URL',
        placeholder: 'https://bss.ericsson.example.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      url: 'ERICSSON_BSS_URL',
      accessToken: 'ERICSSON_BSS_ACCESS_TOKEN',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DOCUMENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════

  sharepoint: {
    fields: [
      {
        key: 'tenantId',
        label: 'Tenant ID',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'clientId',
        label: 'Client ID (App Registration)',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'siteUrl',
        label: 'Site URL',
        placeholder: 'https://myorg.sharepoint.com/sites/mysite',
        type: 'url',
        required: true,
        group: 'connection',
      },
    ],
    envMap: {
      tenantId: 'SHAREPOINT_TENANT_ID',
      clientId: 'SHAREPOINT_CLIENT_ID',
      clientSecret: 'SHAREPOINT_CLIENT_SECRET',
      siteUrl: 'SHAREPOINT_SITE_URL',
    },
  },

  documentum: {
    fields: [
      {
        key: 'url',
        label: 'Documentum REST URL',
        placeholder: 'https://documentum-server:8443/dctm-rest',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'dmadmin',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'repository',
        label: 'Repository',
        placeholder: 'docbase01',
        type: 'text',
        required: true,
        group: 'connection',
      },
    ],
    envMap: {
      url: 'DOCUMENTUM_URL',
      username: 'DOCUMENTUM_USERNAME',
      password: 'DOCUMENTUM_PASSWORD',
      repository: 'DOCUMENTUM_REPOSITORY',
    },
  },

  'ibm-filenet': {
    fields: [
      {
        key: 'url',
        label: 'FileNet REST URL',
        placeholder: 'https://filenet-server/acce/api/v1',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'p8admin',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'objectStore',
        label: 'Object Store',
        placeholder: 'OS1',
        type: 'text',
        required: true,
        group: 'connection',
      },
    ],
    envMap: {
      url: 'FILENET_URL',
      username: 'FILENET_USERNAME',
      password: 'FILENET_PASSWORD',
      objectStore: 'FILENET_OBJECT_STORE',
    },
  },

  box: {
    fields: [
      {
        key: 'accessToken',
        label: 'Developer Token / Access Token',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      accessToken: 'BOX_ACCESS_TOKEN',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // GOVERNMENT
  // ═══════════════════════════════════════════════════════════════════════

  'cgi-momentum': {
    fields: [
      {
        key: 'apiUrl',
        label: 'CGI Momentum API URL',
        placeholder: 'https://momentum.example.gov/api',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'CGI_API_URL',
      accessToken: 'CGI_ACCESS_TOKEN',
    },
  },

  'tyler-technologies': {
    fields: [
      {
        key: 'apiUrl',
        label: 'Tyler API URL',
        placeholder: 'https://tyler.example.gov/api',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'TYLER_API_URL',
      apiKey: 'TYLER_API_KEY',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // EDUCATION
  // ═══════════════════════════════════════════════════════════════════════

  'ellucian-banner': {
    fields: [
      {
        key: 'apiUrl',
        label: 'Banner API URL',
        placeholder: 'https://banner.example.edu/api',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'xxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'admin_user',
        type: 'text',
        required: false,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: false,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'BANNER_API_URL',
      apiKey: 'BANNER_API_KEY',
      username: 'BANNER_USERNAME',
      password: 'BANNER_PASSWORD',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ASSET & FACILITIES MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════

  'ibm-maximo': {
    fields: [
      {
        key: 'url',
        label: 'Maximo URL',
        placeholder: 'https://maximo.example.com/maximo/oslc',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'xxxxxxxxxxxxxxxx',
        type: 'password',
        required: false,
        group: 'auth',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'maxadmin',
        type: 'text',
        required: false,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: false,
        group: 'auth',
      },
    ],
    envMap: {
      url: 'MAXIMO_URL',
      apiKey: 'MAXIMO_API_KEY',
      username: 'MAXIMO_USERNAME',
      password: 'MAXIMO_PASSWORD',
    },
  },

  'ibm-tririga': {
    fields: [
      {
        key: 'url',
        label: 'TRIRIGA URL',
        placeholder: 'https://tririga.example.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'system',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      url: 'TRIRIGA_URL',
      username: 'TRIRIGA_USERNAME',
      password: 'TRIRIGA_PASSWORD',
    },
  },

  'ge-predix': {
    fields: [
      {
        key: 'apiUrl',
        label: 'Predix API URL',
        placeholder: 'https://predix.example.com/api',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'zoneId',
        label: 'Predix Zone ID',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        placeholder: 'Bearer ...',
        type: 'password',
        required: true,
        group: 'auth',
      },
    ],
    envMap: {
      apiUrl: 'PREDIX_API_URL',
      zoneId: 'PREDIX_ZONE_ID',
      accessToken: 'PREDIX_ACCESS_TOKEN',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PROCUREMENT
  // ═══════════════════════════════════════════════════════════════════════

  'sap-ariba': {
    fields: [
      {
        key: 'apiUrl',
        label: 'Ariba API URL',
        placeholder: 'https://openapi.ariba.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'realm',
        label: 'Realm',
        placeholder: 'mycompany-T',
        type: 'text',
        required: true,
        group: 'connection',
      },
    ],
    envMap: {
      apiUrl: 'ARIBA_API_URL',
      apiKey: 'ARIBA_API_KEY',
      realm: 'ARIBA_REALM',
    },
  },

  coupa: {
    fields: [
      {
        key: 'url',
        label: 'Coupa Instance URL',
        placeholder: 'https://mycompany.coupahost.com',
        type: 'url',
        required: true,
        group: 'connection',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'clientId',
        label: 'OAuth Client ID (optional)',
        placeholder: 'xxxx',
        type: 'text',
        required: false,
        group: 'auth',
      },
      {
        key: 'clientSecret',
        label: 'OAuth Client Secret (optional)',
        placeholder: '••••••••',
        type: 'password',
        required: false,
        group: 'auth',
      },
    ],
    envMap: {
      url: 'COUPA_URL',
      apiKey: 'COUPA_API_KEY',
      clientId: 'COUPA_CLIENT_ID',
      clientSecret: 'COUPA_CLIENT_SECRET',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LEGACY / MAINFRAME
  // ═══════════════════════════════════════════════════════════════════════

  as400: {
    fields: [
      {
        key: 'host',
        label: 'AS/400 Host',
        placeholder: '10.0.0.100',
        type: 'text',
        required: true,
        group: 'connection',
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'QSECOFR',
        type: 'text',
        required: true,
        group: 'auth',
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: '••••••••',
        type: 'password',
        required: true,
        group: 'auth',
      },
      {
        key: 'database',
        label: 'Database / Library',
        placeholder: 'MYLIB',
        type: 'text',
        required: false,
        group: 'connection',
      },
    ],
    envMap: {
      host: 'AS400_HOST',
      username: 'AS400_USERNAME',
      password: 'AS400_PASSWORD',
      database: 'AS400_DATABASE',
    },
  },
};

/**
 * Get the field schema for a given system type.
 * Falls back to a generic URL + token form for unknown types.
 */
export function getFieldSchema(type: string): ConnectionFieldSchema {
  return (
    CONNECTION_FIELD_SCHEMAS[type] ?? {
      fields: [
        {
          key: 'url',
          label: 'URL',
          placeholder: 'https://api.example.com',
          type: 'url' as const,
          required: true,
          group: 'connection' as const,
        },
        {
          key: 'accessToken',
          label: 'Access Token',
          placeholder: 'Bearer ...',
          type: 'password' as const,
          required: true,
          group: 'auth' as const,
        },
      ],
      envMap: {
        url: `${type.toUpperCase().replace(/-/g, '_')}_URL`,
        accessToken: `${type.toUpperCase().replace(/-/g, '_')}_ACCESS_TOKEN`,
      },
    }
  );
}

/**
 * Build environment variable map from user-provided connection form values.
 * Used by the main process to pass the correct env vars when spawning MCP servers.
 */
export function buildEnvVarsFromConfig(
  type: string,
  formValues: Record<string, string>
): Record<string, string> {
  const schema = getFieldSchema(type);
  const env: Record<string, string> = {};

  for (const [fieldKey, envVarName] of Object.entries(schema.envMap)) {
    const value = formValues[fieldKey];
    if (value !== undefined && value !== '') {
      env[envVarName] = String(value);
    }
  }

  return env;
}
