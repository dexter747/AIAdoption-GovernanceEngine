// ─────────────────────────────────────────────────────────────────
// Integration Data — types, field templates, and complete catalog
// ─────────────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'password'
  | 'url'
  | 'number'
  | 'select'
  | 'toggle'
  | 'file'
  | 'textarea';

export interface ConnectionField {
  name: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  hint?: string;
}

export interface Integration {
  name: string;
  description: string;
  logo?: string;
  tag?: string;
  connectionType: string; // e.g. 'MCP', 'OAuth 2.0', 'API Key', 'JDBC', etc.
  fields: ConnectionField[];
}

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon name
  integrations: Integration[];
}

// ─── Field Templates ────────────────────────────────────────────

function dbFields(defaultPort: string): ConnectionField[] {
  return [
    { name: 'Host', type: 'text', placeholder: 'localhost', required: true },
    { name: 'Port', type: 'number', placeholder: defaultPort, required: true },
    { name: 'Database', type: 'text', placeholder: 'my_database', required: true },
    { name: 'Username', type: 'text', required: true },
    { name: 'Password', type: 'password', required: true },
    {
      name: 'SSL Mode',
      type: 'select',
      options: ['disable', 'require', 'verify-ca', 'verify-full'],
    },
  ];
}

function oauthFields(extra?: ConnectionField[]): ConnectionField[] {
  return [
    { name: 'Client ID', type: 'text', required: true },
    { name: 'Client Secret', type: 'password', required: true },
    { name: 'Redirect URI', type: 'url', placeholder: 'https://app.velanova.com/callback' },
    ...(extra || []),
  ];
}

export function apiKeyFields(urlPlaceholder?: string): ConnectionField[] {
  return [
    { name: 'API Key', type: 'password', required: true },
    { name: 'Base URL', type: 'url', placeholder: urlPlaceholder || 'https://api.example.com' },
  ];
}

export function apiTokenFields(urlPlaceholder?: string): ConnectionField[] {
  return [
    {
      name: 'API Token',
      type: 'password',
      required: true,
      hint: 'Personal access token or service token',
    },
    ...(urlPlaceholder
      ? [
          {
            name: 'Instance URL',
            type: 'url' as FieldType,
            placeholder: urlPlaceholder,
            required: true,
          },
        ]
      : []),
  ];
}

function awsFields(extra?: ConnectionField[]): ConnectionField[] {
  return [
    { name: 'AWS Access Key ID', type: 'text', required: true },
    { name: 'AWS Secret Access Key', type: 'password', required: true },
    {
      name: 'Region',
      type: 'select',
      options: [
        'us-east-1',
        'us-east-2',
        'us-west-1',
        'us-west-2',
        'eu-west-1',
        'eu-central-1',
        'ap-southeast-1',
        'ap-northeast-1',
      ],
      required: true,
    },
    ...(extra || []),
  ];
}

function mcpServerFields(): ConnectionField[] {
  return [
    {
      name: 'Server Command',
      type: 'text',
      placeholder: 'npx -y @modelcontextprotocol/server-*',
      required: true,
      hint: 'Command to start the MCP server',
    },
    {
      name: 'Arguments',
      type: 'text',
      placeholder: '--port 3000',
      hint: 'Space-separated CLI args',
    },
    {
      name: 'Environment Variables',
      type: 'textarea',
      placeholder: 'KEY=value\nDB_URL=...',
      hint: 'One per line: KEY=value',
    },
    {
      name: 'Transport',
      type: 'select',
      options: ['stdio', 'sse', 'streamable-http'],
      required: true,
    },
  ];
}

function mainframeFields(): ConnectionField[] {
  return [
    { name: 'Host', type: 'text', placeholder: 'mainframe.corp.local', required: true },
    { name: 'Port', type: 'number', placeholder: '23', required: true },
    { name: 'User ID', type: 'text', required: true },
    { name: 'Password', type: 'password', required: true },
    { name: 'Region / Subsystem', type: 'text', hint: 'CICS region, IMS subsystem, etc.' },
    {
      name: 'Codepage',
      type: 'select',
      options: ['EBCDIC-037', 'EBCDIC-500', 'EBCDIC-1047', 'ASCII'],
    },
  ];
}

function azureFields(extra?: ConnectionField[]): ConnectionField[] {
  return [
    { name: 'Tenant ID', type: 'text', required: true },
    { name: 'Client ID', type: 'text', required: true },
    { name: 'Client Secret', type: 'password', required: true },
    ...(extra || []),
  ];
}

// ─── Categories & Integrations ──────────────────────────────────

export const categories: Category[] = [
  // ── 1. MCP SERVERS (FIRST) ──
  {
    id: 'mcp',
    name: 'MCP Servers',
    icon: 'Cpu',
    integrations: [
      {
        name: 'PostgreSQL MCP',
        description: 'Query Postgres via Model Context Protocol',
        tag: 'Official',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'MySQL MCP',
        description: 'MySQL connector over MCP',
        tag: 'Official',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'SQLite MCP',
        description: 'Lightweight local DB via MCP',
        tag: 'Official',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'MongoDB MCP',
        description: 'Document DB queries over MCP',
        tag: 'Community',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Redis MCP',
        description: 'In-memory store via MCP',
        tag: 'Community',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'GitHub MCP',
        description: 'Repos, issues, PRs via MCP',
        tag: 'Official',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Slack MCP',
        description: 'Channels & messages over MCP',
        tag: 'Official',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Google Drive MCP',
        description: 'Drive files & folders via MCP',
        tag: 'Official',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Notion MCP',
        description: 'Pages & databases over MCP',
        tag: 'Community',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Supabase MCP',
        description: 'Supabase DB & auth via MCP',
        tag: 'Community',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Stripe MCP',
        description: 'Payments & invoices over MCP',
        tag: 'Community',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Linear MCP',
        description: 'Issue tracking via MCP',
        tag: 'Community',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Sentry MCP',
        description: 'Error monitoring over MCP',
        tag: 'Official',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Brave Search MCP',
        description: 'Web search via MCP',
        tag: 'Official',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Filesystem MCP',
        description: 'Local file access via MCP',
        tag: 'Official',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Puppeteer MCP',
        description: 'Browser automation via MCP',
        tag: 'Official',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Docker MCP',
        description: 'Container management via MCP',
        tag: 'Community',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Kubernetes MCP',
        description: 'Cluster ops via MCP',
        tag: 'Community',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Elasticsearch MCP',
        description: 'Search & analytics over MCP',
        tag: 'Community',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
      {
        name: 'Cloudflare MCP',
        description: 'CDN & workers via MCP',
        tag: 'Community',
        connectionType: 'MCP',
        fields: mcpServerFields(),
      },
    ],
  },

  // ── 2. API CONNECTORS (SECOND) ──
  {
    id: 'api',
    name: 'API & REST Connectors',
    icon: 'Globe',
    integrations: [
      {
        name: 'REST API',
        description: 'Connect to any REST API endpoint',
        tag: 'Universal',
        connectionType: 'REST',
        fields: [
          {
            name: 'Base URL',
            type: 'url',
            placeholder: 'https://api.example.com/v1',
            required: true,
          },
          {
            name: 'Auth Type',
            type: 'select',
            options: ['None', 'Bearer Token', 'API Key', 'Basic Auth', 'OAuth 2.0'],
            required: true,
          },
          { name: 'Auth Token', type: 'password', hint: 'Bearer token, API key, or password' },
          {
            name: 'Headers',
            type: 'textarea',
            placeholder: 'Content-Type: application/json',
            hint: 'One header per line',
          },
        ],
      },
      {
        name: 'GraphQL API',
        description: 'Connect to any GraphQL endpoint',
        tag: 'Universal',
        connectionType: 'GraphQL',
        fields: [
          {
            name: 'Endpoint URL',
            type: 'url',
            placeholder: 'https://api.example.com/graphql',
            required: true,
          },
          { name: 'Auth Header', type: 'text', placeholder: 'Authorization' },
          { name: 'Auth Value', type: 'password', placeholder: 'Bearer your-token' },
          { name: 'Custom Headers', type: 'textarea', hint: 'One per line: Header-Name: value' },
        ],
      },
      {
        name: 'SOAP / XML API',
        description: 'Legacy SOAP web services',
        tag: 'Enterprise',
        connectionType: 'SOAP',
        fields: [
          {
            name: 'WSDL URL',
            type: 'url',
            placeholder: 'https://service.example.com?wsdl',
            required: true,
          },
          { name: 'Username', type: 'text' },
          { name: 'Password', type: 'password' },
          { name: 'SOAP Action', type: 'text', hint: 'SOAPAction header value' },
        ],
      },
      {
        name: 'Webhook Listener',
        description: 'Receive real-time webhook events',
        tag: 'Universal',
        connectionType: 'Webhook',
        fields: [
          { name: 'Webhook URL', type: 'url', required: true, hint: 'Auto-generated endpoint' },
          { name: 'Secret Key', type: 'password', hint: 'For signature verification' },
          {
            name: 'Events',
            type: 'text',
            placeholder: 'order.created, user.updated',
            hint: 'Comma-separated event types',
          },
        ],
      },
      {
        name: 'gRPC',
        description: 'High-performance RPC connector',
        tag: 'Advanced',
        connectionType: 'gRPC',
        fields: [
          {
            name: 'Server Address',
            type: 'text',
            placeholder: 'grpc.example.com:443',
            required: true,
          },
          { name: 'Proto File', type: 'file', hint: 'Upload .proto service definition' },
          { name: 'TLS', type: 'toggle', required: true },
          { name: 'Auth Token', type: 'password' },
        ],
      },
      {
        name: 'JDBC Connector',
        description: 'Universal Java database connector',
        tag: 'Database',
        connectionType: 'JDBC',
        fields: [
          {
            name: 'JDBC URL',
            type: 'text',
            placeholder: 'jdbc:postgresql://host:5432/db',
            required: true,
          },
          {
            name: 'Driver Class',
            type: 'text',
            placeholder: 'org.postgresql.Driver',
            required: true,
          },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
        ],
      },
      {
        name: 'ODBC Connector',
        description: 'Open Database Connectivity bridge',
        tag: 'Database',
        connectionType: 'ODBC',
        fields: [
          { name: 'DSN', type: 'text', placeholder: 'MyDataSource', required: true },
          { name: 'Username', type: 'text' },
          { name: 'Password', type: 'password' },
          { name: 'Driver', type: 'text', placeholder: '/usr/lib/odbc/driver.so' },
        ],
      },
      {
        name: 'OData',
        description: 'Open Data Protocol connector',
        tag: 'Enterprise',
        connectionType: 'OData',
        fields: [
          {
            name: 'Service Root URL',
            type: 'url',
            placeholder: 'https://services.odata.org/V4/',
            required: true,
          },
          {
            name: 'Auth Type',
            type: 'select',
            options: ['None', 'Basic', 'OAuth 2.0'],
            required: true,
          },
          { name: 'Username', type: 'text' },
          { name: 'Password', type: 'password' },
        ],
      },
    ],
  },

  // ── 3. DATABASES ──
  {
    id: 'databases',
    name: 'Databases',
    icon: 'Database',
    integrations: [
      {
        name: 'PostgreSQL',
        description: 'Open-source relational DB',
        logo: '/legacy/postgresql.png',
        connectionType: 'TCP/SSL',
        fields: dbFields('5432'),
      },
      {
        name: 'MySQL',
        description: "World's most popular DB",
        logo: '/legacy/mysql.svg',
        connectionType: 'TCP/SSL',
        fields: dbFields('3306'),
      },
      {
        name: 'MongoDB',
        description: 'NoSQL document database',
        logo: '/legacy/mongodb.svg',
        connectionType: 'Connection URI',
        fields: [
          {
            name: 'Connection URI',
            type: 'url',
            placeholder: 'mongodb+srv://user:pass@cluster.mongodb.net/db',
            required: true,
            hint: 'Full MongoDB connection string',
          },
          { name: 'Database', type: 'text', placeholder: 'my_database', required: true },
          { name: 'Auth Source', type: 'text', placeholder: 'admin' },
          { name: 'Replica Set', type: 'text' },
          { name: 'TLS', type: 'toggle' },
        ],
      },
      {
        name: 'Oracle DB',
        description: 'Enterprise RDBMS',
        logo: '/legacy/oracle.svg',
        connectionType: 'TNS / TCP',
        fields: [
          { name: 'Host', type: 'text', placeholder: 'oracle.corp.local', required: true },
          { name: 'Port', type: 'number', placeholder: '1521', required: true },
          {
            name: 'Service Name',
            type: 'text',
            placeholder: 'ORCL',
            required: true,
            hint: 'Or SID',
          },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'TNS Name', type: 'text', hint: 'Optional: use TNS alias instead of host/port' },
          { name: 'Wallet Path', type: 'file', hint: 'For Oracle Cloud Autonomous DB' },
        ],
      },
      {
        name: 'SQL Server',
        description: 'Microsoft enterprise DB',
        logo: '/legacy/sqlserver.svg',
        connectionType: 'TDS / TCP',
        fields: [
          { name: 'Server', type: 'text', placeholder: 'sql.corp.local', required: true },
          { name: 'Port', type: 'number', placeholder: '1433', required: true },
          { name: 'Database', type: 'text', placeholder: 'master', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Windows Auth', type: 'toggle', hint: 'Use Windows integrated authentication' },
          { name: 'Encrypt', type: 'toggle' },
          { name: 'Trust Server Cert', type: 'toggle' },
        ],
      },
      {
        name: 'Redis',
        description: 'In-memory data store',
        logo: '/legacy/redis.svg',
        connectionType: 'TCP/TLS',
        fields: [
          { name: 'Host', type: 'text', placeholder: 'localhost', required: true },
          { name: 'Port', type: 'number', placeholder: '6379', required: true },
          { name: 'Password', type: 'password' },
          { name: 'Database Index', type: 'number', placeholder: '0' },
          { name: 'TLS', type: 'toggle' },
          { name: 'Cluster Mode', type: 'toggle' },
        ],
      },
      {
        name: 'Elasticsearch',
        description: 'Search & analytics engine',
        logo: '/legacy/elasticsearch.svg',
        connectionType: 'HTTPS',
        fields: [
          {
            name: 'Node URL',
            type: 'url',
            placeholder: 'https://es-cluster.corp.local:9200',
            required: true,
          },
          { name: 'Username', type: 'text', placeholder: 'elastic' },
          { name: 'Password', type: 'password' },
          { name: 'API Key', type: 'password', hint: 'Alternative to username/password' },
          { name: 'Cloud ID', type: 'text', hint: 'For Elastic Cloud deployments' },
          { name: 'CA Certificate', type: 'file' },
        ],
      },
      {
        name: 'Cassandra',
        description: 'Distributed NoSQL DB',
        logo: '/legacy/cassandra.svg',
        connectionType: 'CQL',
        fields: [
          {
            name: 'Contact Points',
            type: 'text',
            placeholder: 'node1.corp.local, node2.corp.local',
            required: true,
          },
          { name: 'Port', type: 'number', placeholder: '9042', required: true },
          { name: 'Keyspace', type: 'text', required: true },
          { name: 'Username', type: 'text' },
          { name: 'Password', type: 'password' },
          { name: 'Data Center', type: 'text', placeholder: 'dc1' },
        ],
      },
      {
        name: 'DynamoDB',
        description: 'AWS serverless NoSQL',
        logo: '/legacy/dynamodb.svg',
        connectionType: 'AWS SDK',
        fields: awsFields([
          { name: 'Table Name', type: 'text', required: true },
          { name: 'Endpoint Override', type: 'url', hint: 'For local DynamoDB or DynamoDB Local' },
        ]),
      },
      {
        name: 'MariaDB',
        description: 'MySQL-compatible fork',
        logo: '/legacy/mariadb.svg',
        connectionType: 'TCP/SSL',
        fields: dbFields('3306'),
      },
      {
        name: 'SQLite',
        description: 'Embedded SQL database',
        logo: '/legacy/sqlite.svg',
        connectionType: 'File',
        fields: [
          {
            name: 'Database File Path',
            type: 'text',
            placeholder: '/path/to/database.db',
            required: true,
          },
          { name: 'Read Only', type: 'toggle' },
          { name: 'WAL Mode', type: 'toggle', hint: 'Write-Ahead Logging for concurrency' },
        ],
      },
      {
        name: 'CouchDB',
        description: 'Document-oriented DB',
        tag: 'NoSQL',
        connectionType: 'HTTP',
        fields: [
          { name: 'URL', type: 'url', placeholder: 'http://localhost:5984', required: true },
          { name: 'Database', type: 'text', required: true },
          { name: 'Username', type: 'text' },
          { name: 'Password', type: 'password' },
        ],
      },
      {
        name: 'InfluxDB',
        description: 'Time-series database',
        tag: 'Time Series',
        connectionType: 'HTTP API',
        fields: [
          { name: 'URL', type: 'url', placeholder: 'http://localhost:8086', required: true },
          { name: 'Token', type: 'password', required: true },
          { name: 'Organization', type: 'text', required: true },
          { name: 'Bucket', type: 'text', required: true },
        ],
      },
      {
        name: 'Firestore',
        description: 'Google Cloud NoSQL',
        tag: 'Cloud',
        connectionType: 'GCP SDK',
        fields: [
          { name: 'Project ID', type: 'text', required: true },
          { name: 'Service Account Key', type: 'file', required: true, hint: 'JSON key file' },
          { name: 'Database ID', type: 'text', placeholder: '(default)' },
        ],
      },
    ],
  },

  // ── 4. LEGACY & MAINFRAME ──
  {
    id: 'legacy',
    name: 'Legacy & Mainframe',
    icon: 'Server',
    integrations: [
      {
        name: 'IBM CICS',
        description: 'Customer Information Control System',
        tag: 'Mainframe',
        connectionType: 'TN3270 / CTG',
        fields: [
          ...mainframeFields(),
          {
            name: 'CICS Region',
            type: 'text',
            required: true,
            hint: 'CICS region name (e.g. CICSPROD)',
          },
          {
            name: 'Transaction ID',
            type: 'text',
            placeholder: 'CEDA',
            hint: '4-char transaction code',
          },
        ],
      },
      {
        name: 'IBM IMS',
        description: 'Information Management System',
        tag: 'Mainframe',
        connectionType: 'IMS Connect',
        fields: [
          ...mainframeFields(),
          { name: 'Data Store', type: 'text', required: true },
          { name: 'Program Name', type: 'text', hint: 'IMS transaction program' },
          { name: 'IMS Connect Port', type: 'number', placeholder: '9999' },
        ],
      },
      {
        name: 'COBOL Banking Systems',
        description: 'COBOL-based core banking',
        tag: 'Mainframe',
        connectionType: 'TN3270 / Batch',
        fields: [
          ...mainframeFields(),
          { name: 'JCL Job Name', type: 'text', hint: 'Batch job name for scheduled runs' },
          { name: 'Dataset Name', type: 'text', placeholder: 'USER.BANKING.DATA' },
        ],
      },
      {
        name: 'FIS Profile',
        description: 'FIS core banking platform',
        tag: 'Banking',
        connectionType: 'API / TCP',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'Port', type: 'number', required: true },
          { name: 'Institution ID', type: 'text', required: true },
          { name: 'User ID', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Environment', type: 'select', options: ['Production', 'UAT', 'Development'] },
        ],
      },
      {
        name: 'FIS/World',
        description: 'FIS World banking system',
        tag: 'Banking',
        connectionType: 'API / TCP',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'Port', type: 'number', required: true },
          { name: 'Bank Number', type: 'text', required: true },
          { name: 'User ID', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
        ],
      },
      {
        name: 'Temenos T24',
        description: 'Legacy core banking (Temenos)',
        tag: 'Banking',
        connectionType: 'T24 API / jBASE',
        fields: [
          { name: 'T24 Server URL', type: 'url', required: true },
          { name: 'Company ID', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Channel', type: 'text', placeholder: 'BROWSER.API' },
        ],
      },
      {
        name: 'SAP R/2',
        description: 'Legacy SAP mainframe ERP',
        tag: 'Mainframe',
        connectionType: 'RFC / IDoc',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'System Number', type: 'text', placeholder: '00', required: true },
          { name: 'Client', type: 'text', placeholder: '800', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Language', type: 'select', options: ['EN', 'DE', 'FR', 'ES', 'JA', 'ZH'] },
        ],
      },
      {
        name: 'SAP R/3',
        description: 'SAP R/3 early version ERP',
        tag: 'Enterprise',
        connectionType: 'RFC / BAPI',
        fields: [
          { name: 'Application Server', type: 'text', required: true },
          { name: 'System Number', type: 'text', placeholder: '00', required: true },
          { name: 'Client', type: 'text', placeholder: '100', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Router String', type: 'text', hint: 'SAProuter string for remote access' },
          { name: 'Language', type: 'select', options: ['EN', 'DE', 'FR', 'ES', 'JA', 'ZH'] },
        ],
      },
      {
        name: 'Oracle E-Business Suite',
        description: 'Legacy Oracle EBS versions',
        tag: 'Enterprise',
        connectionType: 'JDBC / PL/SQL',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'Port', type: 'number', placeholder: '1521', required: true },
          { name: 'SID', type: 'text', placeholder: 'VIS', required: true },
          { name: 'Apps Username', type: 'text', placeholder: 'APPS', required: true },
          { name: 'Apps Password', type: 'password', required: true },
          { name: 'Responsibility', type: 'text', hint: 'EBS responsibility key' },
        ],
      },
      {
        name: 'JD Edwards World',
        description: 'JDE World (AS/400-based)',
        tag: 'Mainframe',
        connectionType: 'AS/400 ODBC',
        fields: [
          { name: 'AS/400 Host', type: 'text', required: true },
          { name: 'Library', type: 'text', required: true },
          { name: 'User Profile', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Environment', type: 'text', placeholder: 'JDE' },
        ],
      },
      {
        name: 'JD Edwards OneWorld',
        description: 'JDE OneWorld / EnterpriseOne',
        tag: 'Enterprise',
        connectionType: 'BSSV / JDBC',
        fields: [
          { name: 'Enterprise Server', type: 'text', required: true },
          { name: 'Port', type: 'number', placeholder: '6016', required: true },
          { name: 'Environment', type: 'text', placeholder: 'JDV920', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Role', type: 'text', placeholder: '*ALL' },
        ],
      },
      {
        name: 'PeopleSoft Financials',
        description: 'Oracle PeopleSoft Finance modules',
        tag: 'Enterprise',
        connectionType: 'CI / Web Service',
        fields: [
          { name: 'PeopleSoft URL', type: 'url', required: true },
          { name: 'Node', type: 'text', required: true, hint: 'Integration Broker node' },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Business Unit', type: 'text' },
        ],
      },
      {
        name: 'SWIFT FIN',
        description: 'SWIFT financial messaging',
        tag: 'Financial',
        connectionType: 'SWIFT Alliance',
        fields: [
          { name: 'BIC Code', type: 'text', placeholder: 'DEUTDEFF', required: true },
          { name: 'Alliance Lite2 URL', type: 'url', required: true },
          {
            name: 'Certificate File',
            type: 'file',
            required: true,
            hint: 'X.509 certificate (.pem)',
          },
          { name: 'Private Key', type: 'file', required: true },
          { name: 'Passphrase', type: 'password' },
        ],
      },
      {
        name: 'ACH Mainframe',
        description: 'Automated Clearing House systems',
        tag: 'Payments',
        connectionType: 'NACHA / Batch',
        fields: [
          ...mainframeFields(),
          { name: 'Routing Number', type: 'text', required: true },
          { name: 'Company ID', type: 'text', required: true },
          { name: 'NACHA File Path', type: 'text', hint: 'Input/output file location' },
        ],
      },
      {
        name: 'CHIPS Mainframe',
        description: 'Clearing House Interbank systems',
        tag: 'Payments',
        connectionType: 'Proprietary',
        fields: [
          ...mainframeFields(),
          { name: 'Participant ID', type: 'text', required: true },
          { name: 'Universal ID', type: 'text', required: true },
          { name: 'Certificate', type: 'file', required: true },
        ],
      },
      {
        name: 'Siebel',
        description: 'Oracle Siebel CRM',
        tag: 'Enterprise',
        connectionType: 'SOAP / EAI',
        fields: [
          { name: 'Siebel Server', type: 'text', required: true },
          { name: 'Enterprise', type: 'text', required: true },
          { name: 'Object Manager', type: 'text', placeholder: 'EAIObjMgr_enu', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Port', type: 'number', placeholder: '2321' },
        ],
      },
      {
        name: 'Unisys ClearPath',
        description: 'Unisys mainframe platform',
        tag: 'Mainframe',
        connectionType: 'TN3270 / MCP',
        fields: mainframeFields(),
      },
      {
        name: 'CGI Momentum',
        description: 'CGI government ERP system',
        tag: 'Government',
        connectionType: 'API / SOAP',
        fields: [
          { name: 'Server URL', type: 'url', required: true },
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Organization', type: 'text' },
        ],
      },
    ],
  },

  // ── 5. FINANCIAL MARKETS & TRADING ──
  {
    id: 'finance-markets',
    name: 'Financial Markets & Trading',
    icon: 'TrendingUp',
    integrations: [
      {
        name: 'Bloomberg Terminal',
        description: 'Bloomberg market data (legacy)',
        tag: 'Market Data',
        connectionType: 'BLPAPI',
        fields: [
          { name: 'Server Host', type: 'text', placeholder: 'localhost', required: true },
          { name: 'Port', type: 'number', placeholder: '8194', required: true },
          { name: 'UUID', type: 'text', required: true, hint: 'Bloomberg UUID' },
          { name: 'Application Name', type: 'text' },
          {
            name: 'Auth Type',
            type: 'select',
            options: ['OS_LOGON', 'APPLICATION', 'USER_AND_APPLICATION', 'TOKEN'],
          },
        ],
      },
      {
        name: 'Reuters 3000',
        description: 'Thomson Reuters market data',
        tag: 'Market Data',
        connectionType: 'TREP / EMA',
        fields: [
          { name: 'TREP Host', type: 'text', required: true },
          { name: 'DACS Username', type: 'text', required: true },
          { name: 'DACS Position', type: 'text', required: true },
          { name: 'Application ID', type: 'text', placeholder: '256' },
          { name: 'Service Name', type: 'text', placeholder: 'ELEKTRON_DD' },
        ],
      },
      {
        name: 'Murex MX.3',
        description: 'Trading & risk management',
        tag: 'Trading',
        connectionType: 'MX API / SOAP',
        fields: [
          { name: 'Murex Server', type: 'text', required: true },
          { name: 'Port', type: 'number', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'MX Environment', type: 'text', required: true },
          { name: 'MXML Gateway', type: 'url', hint: 'For MXML API access' },
        ],
      },
      {
        name: 'Calypso',
        description: 'Cross-asset trading platform',
        tag: 'Trading',
        connectionType: 'Calypso API',
        fields: [
          { name: 'Server URL', type: 'url', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Environment', type: 'select', options: ['Production', 'UAT', 'DR'] },
          { name: 'RMI Port', type: 'number', placeholder: '1099' },
        ],
      },
      {
        name: 'FrontArena',
        description: 'SunGard trading system',
        tag: 'Trading',
        connectionType: 'AMBA / ADS',
        fields: [
          { name: 'ADS Host', type: 'text', required: true },
          { name: 'ADS Port', type: 'number', placeholder: '9100', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'AMBA Connection', type: 'text', hint: 'For message broker integration' },
        ],
      },
      {
        name: 'SimCorp Dimension',
        description: 'Investment management platform',
        tag: 'Asset Mgmt',
        connectionType: 'SCD API / SOAP',
        fields: [
          { name: 'Server URL', type: 'url', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Domain', type: 'text', required: true },
          { name: 'Installation', type: 'text' },
        ],
      },
      {
        name: 'BlackRock Aladdin',
        description: 'Risk & portfolio management',
        tag: 'Asset Mgmt',
        connectionType: 'Aladdin API',
        fields: [
          { name: 'API URL', type: 'url', required: true },
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
          { name: 'Account Group', type: 'text' },
          {
            name: 'Data Scope',
            type: 'select',
            options: ['Portfolio', 'Risk', 'Compliance', 'Trading'],
          },
        ],
      },
      {
        name: 'Charles River IMS',
        description: 'Investment management system',
        tag: 'Asset Mgmt',
        connectionType: 'CRDM API',
        fields: [
          { name: 'Server URL', type: 'url', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Fund Family', type: 'text' },
          { name: 'Data Feed', type: 'select', options: ['Real-time', 'Batch', 'On-demand'] },
        ],
      },
    ],
  },

  // ── 6. ERP SYSTEMS ──
  {
    id: 'erp',
    name: 'ERP Systems',
    icon: 'Building2',
    integrations: [
      {
        name: 'SAP S/4HANA',
        description: 'In-memory ERP platform',
        logo: '/legacy/saphana.svg',
        connectionType: 'RFC / OData',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'Instance Number', type: 'text', placeholder: '00', required: true },
          { name: 'Client', type: 'text', placeholder: '100', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'System ID (SID)', type: 'text', placeholder: 'S4H' },
          { name: 'Language', type: 'select', options: ['EN', 'DE', 'FR', 'ES', 'JA', 'ZH'] },
          { name: 'Router String', type: 'text', hint: 'For SAProuter access' },
        ],
      },
      {
        name: 'Oracle EBS',
        description: 'E-Business Suite',
        logo: '/legacy/oracle.svg',
        connectionType: 'JDBC / REST',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'Port', type: 'number', placeholder: '1521', required: true },
          { name: 'SID', type: 'text', required: true },
          { name: 'Apps Username', type: 'text', required: true },
          { name: 'Apps Password', type: 'password', required: true },
          { name: 'Responsibility', type: 'text' },
        ],
      },
      {
        name: 'JD Edwards',
        description: 'Oracle ERP suite',
        logo: '/legacy/jdedwards.svg',
        connectionType: 'BSSV',
        fields: [
          { name: 'Server', type: 'text', required: true },
          { name: 'Port', type: 'number', placeholder: '6016', required: true },
          { name: 'Environment', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
        ],
      },
      {
        name: 'Infor',
        description: 'Industry-specific ERP',
        logo: '/legacy/infor.svg',
        connectionType: 'ION API',
        fields: [
          { name: 'ION API Gateway', type: 'url', required: true },
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
          { name: 'Tenant ID', type: 'text', required: true },
        ],
      },
      {
        name: 'Epicor',
        description: 'Manufacturing ERP',
        logo: '/legacy/epicor.svg',
        connectionType: 'REST API',
        fields: [
          { name: 'Server URL', type: 'url', required: true },
          { name: 'API Key', type: 'password', required: true },
          { name: 'Company', type: 'text', required: true },
          { name: 'Username', type: 'text' },
          { name: 'Password', type: 'password' },
        ],
      },
      {
        name: 'SAP Ariba',
        description: 'Procurement platform',
        logo: '/legacy/sap-ariba.png',
        connectionType: 'OAuth 2.0',
        fields: [
          { name: 'API URL', type: 'url', required: true },
          { name: 'API Key', type: 'password', required: true },
          { name: 'Realm', type: 'text', required: true },
          { name: 'Client ID', type: 'text' },
          { name: 'Secret', type: 'password' },
        ],
      },
      {
        name: 'NetSuite',
        description: 'Oracle Cloud ERP',
        tag: 'Cloud',
        connectionType: 'SuiteTalk / REST',
        fields: [
          { name: 'Account ID', type: 'text', required: true, hint: 'e.g. 1234567' },
          { name: 'Consumer Key', type: 'text', required: true },
          { name: 'Consumer Secret', type: 'password', required: true },
          { name: 'Token ID', type: 'text', required: true },
          { name: 'Token Secret', type: 'password', required: true },
        ],
      },
      {
        name: 'Microsoft Dynamics',
        description: 'Business applications suite',
        logo: '/legacy/dynamics365.svg',
        connectionType: 'OAuth 2.0 / OData',
        fields: [
          ...azureFields(),
          {
            name: 'Environment URL',
            type: 'url',
            placeholder: 'https://org.crm.dynamics.com',
            required: true,
          },
        ],
      },
    ],
  },

  // ── 7. CRM & SALES ──
  {
    id: 'crm',
    name: 'CRM & Sales',
    icon: 'Users',
    integrations: [
      {
        name: 'Salesforce',
        description: 'CRM & Sales Cloud',
        logo: '/legacy/salesforce.png',
        connectionType: 'OAuth 2.0',
        fields: [
          {
            name: 'Login URL',
            type: 'url',
            placeholder: 'https://login.salesforce.com',
            required: true,
          },
          {
            name: 'Client ID',
            type: 'text',
            required: true,
            hint: 'Consumer Key from Connected App',
          },
          { name: 'Client Secret', type: 'password', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Security Token', type: 'password', hint: 'Appended to password for API access' },
        ],
      },
      {
        name: 'HubSpot',
        description: 'Inbound CRM platform',
        logo: '/legacy/hubspot.svg',
        connectionType: 'OAuth 2.0 / Token',
        fields: [
          {
            name: 'Private App Token',
            type: 'password',
            required: true,
            hint: 'From HubSpot Developer > Private Apps',
          },
          { name: 'Portal ID', type: 'text', hint: 'Your HubSpot account ID' },
        ],
      },
      {
        name: 'Dynamics 365',
        description: 'Microsoft CRM & ERP',
        logo: '/legacy/dynamics365.svg',
        connectionType: 'OAuth 2.0',
        fields: [
          ...azureFields(),
          {
            name: 'Organization URL',
            type: 'url',
            placeholder: 'https://org.crm.dynamics.com',
            required: true,
          },
        ],
      },
      {
        name: 'Zoho CRM',
        description: 'SMB-focused CRM',
        tag: 'Cloud',
        connectionType: 'OAuth 2.0',
        fields: [
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
          { name: 'Refresh Token', type: 'password', required: true },
          {
            name: 'Domain',
            type: 'select',
            options: ['zoho.com', 'zoho.eu', 'zoho.in', 'zoho.com.cn', 'zoho.com.au'],
            required: true,
          },
        ],
      },
      {
        name: 'Pipedrive',
        description: 'Sales pipeline CRM',
        tag: 'Sales',
        connectionType: 'API Token',
        fields: [
          {
            name: 'API Token',
            type: 'password',
            required: true,
            hint: 'From Settings > Personal Preferences > API',
          },
          { name: 'Company Domain', type: 'text', placeholder: 'yourcompany.pipedrive.com' },
        ],
      },
      {
        name: 'Freshsales',
        description: 'Freshworks CRM for sales',
        tag: 'Sales',
        connectionType: 'API Key',
        fields: [
          { name: 'Bundle Alias', type: 'text', placeholder: 'yourcompany', required: true },
          { name: 'API Key', type: 'password', required: true },
          { name: 'Domain', type: 'url', placeholder: 'https://yourcompany.freshsales.io' },
        ],
      },
      {
        name: 'SugarCRM',
        description: 'Flexible open-source CRM',
        tag: 'Enterprise',
        connectionType: 'OAuth 2.0',
        fields: [
          {
            name: 'Instance URL',
            type: 'url',
            placeholder: 'https://yourinstance.sugarondemand.com',
            required: true,
          },
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
        ],
      },
      {
        name: 'Creatio',
        description: 'No-code CRM & process platform',
        tag: 'Enterprise',
        connectionType: 'OAuth 2.0',
        fields: [
          { name: 'Instance URL', type: 'url', required: true },
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
        ],
      },
      {
        name: 'Zendesk Sell',
        description: 'Zendesk CRM for sales teams',
        tag: 'Sales',
        connectionType: 'OAuth 2.0',
        fields: [
          { name: 'Access Token', type: 'password', required: true },
          {
            name: 'Subdomain',
            type: 'text',
            placeholder: 'yourcompany',
            hint: 'yourcompany.zendesk.com',
          },
        ],
      },
      {
        name: 'Copper',
        description: 'CRM built for Google Workspace',
        tag: 'Google',
        connectionType: 'API Key',
        fields: [
          { name: 'API Key', type: 'password', required: true },
          {
            name: 'User Email',
            type: 'text',
            required: true,
            hint: 'Email associated with Copper account',
          },
        ],
      },
      {
        name: 'Close',
        description: 'CRM for inside sales teams',
        tag: 'Sales',
        connectionType: 'API Key',
        fields: [
          { name: 'API Key', type: 'password', required: true, hint: 'From Settings > API Keys' },
        ],
      },
      {
        name: 'Insightly',
        description: 'CRM & project management',
        tag: 'Cloud',
        connectionType: 'API Key',
        fields: [
          { name: 'API Key', type: 'password', required: true },
          {
            name: 'Pod',
            type: 'select',
            options: ['na1', 'au1', 'eu1'],
            hint: 'Your Insightly data center',
          },
        ],
      },
      {
        name: 'Bitrix24',
        description: 'Collaboration suite with CRM',
        tag: 'Cloud',
        connectionType: 'OAuth 2.0 / Webhook',
        fields: [
          {
            name: 'Portal URL',
            type: 'url',
            placeholder: 'https://yourcompany.bitrix24.com',
            required: true,
          },
          { name: 'Webhook Token', type: 'password', hint: 'Inbound webhook secret' },
          { name: 'Client ID', type: 'text', hint: 'For OAuth integration' },
          { name: 'Client Secret', type: 'password' },
        ],
      },
      {
        name: 'Apptivo',
        description: 'Business management suite',
        tag: 'SMB',
        connectionType: 'API Key',
        fields: [
          { name: 'API Key', type: 'password', required: true },
          { name: 'Access Key', type: 'password', required: true },
        ],
      },
      {
        name: 'Nimble',
        description: 'Simple CRM for small business',
        tag: 'SMB',
        connectionType: 'API Token',
        fields: [
          {
            name: 'API Token',
            type: 'password',
            required: true,
            hint: 'From Nimble > Settings > API Tokens',
          },
        ],
      },
      {
        name: 'Keap',
        description: 'CRM & marketing automation',
        tag: 'Marketing',
        connectionType: 'OAuth 2.0',
        fields: [
          ...oauthFields(),
          { name: 'API Key', type: 'password', hint: 'Keap developer API key' },
        ],
      },
      {
        name: 'Capsule CRM',
        description: 'Simple online CRM',
        tag: 'SMB',
        connectionType: 'API Token',
        fields: [
          {
            name: 'API Token',
            type: 'password',
            required: true,
            hint: 'From My Preferences > API Authentication Tokens',
          },
        ],
      },
      {
        name: 'PeopleSoft CRM',
        description: 'Oracle PeopleSoft HR & CRM',
        logo: '/legacy/peoplesoft.svg',
        connectionType: 'CI / REST',
        fields: [
          { name: 'URL', type: 'url', required: true },
          { name: 'Node', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
        ],
      },
      {
        name: 'Zendesk',
        description: 'Customer support & CRM',
        logo: '/legacy/zendesk.svg',
        connectionType: 'API Token',
        fields: [
          { name: 'Subdomain', type: 'text', placeholder: 'yourcompany', required: true },
          { name: 'Email', type: 'text', required: true },
          { name: 'API Token', type: 'password', required: true },
        ],
      },
    ],
  },

  // ── 8. DATA WAREHOUSE ──
  {
    id: 'data-warehouse',
    name: 'Data Warehouse',
    icon: 'Warehouse',
    integrations: [
      {
        name: 'Snowflake',
        description: 'Cloud data platform',
        logo: '/legacy/snowflake.svg',
        connectionType: 'Snowflake SDK',
        fields: [
          {
            name: 'Account Identifier',
            type: 'text',
            placeholder: 'xy12345.us-east-1',
            required: true,
          },
          { name: 'Warehouse', type: 'text', placeholder: 'COMPUTE_WH', required: true },
          { name: 'Database', type: 'text', required: true },
          { name: 'Schema', type: 'text', placeholder: 'PUBLIC' },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Role', type: 'text', placeholder: 'SYSADMIN' },
        ],
      },
      {
        name: 'BigQuery',
        description: 'Google serverless DW',
        logo: '/legacy/bigquery.svg',
        connectionType: 'GCP SDK',
        fields: [
          { name: 'Project ID', type: 'text', required: true },
          { name: 'Dataset', type: 'text', required: true },
          {
            name: 'Service Account Key',
            type: 'file',
            required: true,
            hint: 'JSON credentials file',
          },
          {
            name: 'Location',
            type: 'select',
            options: ['US', 'EU', 'asia-east1', 'australia-southeast1'],
          },
        ],
      },
      {
        name: 'Amazon Redshift',
        description: 'AWS petabyte-scale DW',
        logo: '/legacy/redshift.svg',
        connectionType: 'JDBC / TCP',
        fields: [
          { name: 'Cluster Endpoint', type: 'text', required: true },
          { name: 'Port', type: 'number', placeholder: '5439', required: true },
          { name: 'Database', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'SSL', type: 'toggle' },
        ],
      },
      {
        name: 'Databricks',
        description: 'Unified analytics platform',
        logo: '/legacy/databricks.svg',
        connectionType: 'DBSQL / REST',
        fields: [
          {
            name: 'Workspace URL',
            type: 'url',
            placeholder: 'https://adb-xxx.azuredatabricks.net',
            required: true,
          },
          { name: 'Personal Access Token', type: 'password', required: true },
          {
            name: 'HTTP Path',
            type: 'text',
            placeholder: '/sql/1.0/warehouses/xxx',
            required: true,
          },
          { name: 'Catalog', type: 'text', placeholder: 'main' },
        ],
      },
      {
        name: 'Azure Synapse',
        description: 'Microsoft analytics service',
        tag: 'Cloud',
        connectionType: 'JDBC / OAuth',
        fields: [
          { name: 'Server', type: 'text', placeholder: 'ws.sql.azuresynapse.net', required: true },
          { name: 'Database', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Port', type: 'number', placeholder: '1433' },
        ],
      },
      {
        name: 'Teradata',
        description: 'Enterprise data warehouse',
        tag: 'Enterprise',
        connectionType: 'JDBC / Teradata',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'DBS Port', type: 'number', placeholder: '1025', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Database', type: 'text' },
          { name: 'Logon Mechanism', type: 'select', options: ['TD2', 'LDAP', 'KRB5', 'JWT'] },
        ],
      },
      {
        name: 'Firebolt',
        description: 'Sub-second analytics',
        tag: 'Analytics',
        connectionType: 'REST API',
        fields: [
          { name: 'Account', type: 'text', required: true },
          { name: 'Engine URL', type: 'url', required: true },
          { name: 'Database', type: 'text', required: true },
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
        ],
      },
      {
        name: 'Dremio',
        description: 'Lakehouse platform',
        tag: 'Lakehouse',
        connectionType: 'Arrow Flight / REST',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'Port', type: 'number', placeholder: '31010' },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Project ID', type: 'text', hint: 'For Dremio Cloud' },
        ],
      },
      {
        name: 'Starburst',
        description: 'Distributed SQL engine',
        tag: 'Analytics',
        connectionType: 'Trino JDBC',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'Port', type: 'number', placeholder: '443', required: true },
          { name: 'Catalog', type: 'text', required: true },
          { name: 'Schema', type: 'text' },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password' },
        ],
      },
    ],
  },

  // ── 9. PROJECT MANAGEMENT ──
  {
    id: 'project-mgmt',
    name: 'Project Management',
    icon: 'KanbanSquare',
    integrations: [
      {
        name: 'Jira',
        description: 'Project & issue tracking',
        logo: '/legacy/jira.svg',
        connectionType: 'API Token',
        fields: [
          {
            name: 'Instance URL',
            type: 'url',
            placeholder: 'https://yourteam.atlassian.net',
            required: true,
          },
          { name: 'Email', type: 'text', required: true },
          {
            name: 'API Token',
            type: 'password',
            required: true,
            hint: 'From id.atlassian.com/manage-profile/security/api-tokens',
          },
          { name: 'Project Key', type: 'text', placeholder: 'PROJ' },
        ],
      },
      {
        name: 'Trello',
        description: 'Kanban-style project boards',
        tag: 'Kanban',
        connectionType: 'API Key + Token',
        fields: [
          { name: 'API Key', type: 'text', required: true },
          { name: 'Token', type: 'password', required: true },
          { name: 'Board ID', type: 'text', hint: 'Visible in board URL' },
        ],
      },
      {
        name: 'Asana',
        description: 'Work management platform',
        tag: 'Cloud',
        connectionType: 'OAuth 2.0 / PAT',
        fields: [
          { name: 'Personal Access Token', type: 'password', required: true },
          { name: 'Workspace GID', type: 'text', hint: 'Workspace or Organization GID' },
        ],
      },
      {
        name: 'Monday.com',
        description: 'Work OS platform',
        tag: 'Cloud',
        connectionType: 'API Token',
        fields: [
          { name: 'API Token', type: 'password', required: true, hint: 'From Admin > API' },
          { name: 'Board ID', type: 'text' },
        ],
      },
      {
        name: 'ClickUp',
        description: 'All-in-one productivity',
        tag: 'Cloud',
        connectionType: 'API Token',
        fields: [
          { name: 'API Token', type: 'password', required: true, hint: 'From Settings > Apps' },
          { name: 'Team ID', type: 'text' },
        ],
      },
      {
        name: 'Wrike',
        description: 'Versatile work management',
        tag: 'Enterprise',
        connectionType: 'OAuth 2.0',
        fields: oauthFields([{ name: 'Account ID', type: 'text' }]),
      },
      {
        name: 'Smartsheet',
        description: 'Spreadsheet-style project mgmt',
        tag: 'Enterprise',
        connectionType: 'API Token',
        fields: [
          { name: 'Access Token', type: 'password', required: true },
          { name: 'Sheet ID', type: 'text' },
        ],
      },
      {
        name: 'Basecamp',
        description: 'Simple project management',
        tag: 'SMB',
        connectionType: 'OAuth 2.0',
        fields: [...oauthFields(), { name: 'Account ID', type: 'text', required: true }],
      },
    ],
  },

  // ── 10. COMMUNICATION & COLLABORATION ──
  {
    id: 'communication',
    name: 'Communication',
    icon: 'MessageSquare',
    integrations: [
      {
        name: 'Slack',
        description: 'Team messaging platform',
        tag: 'Popular',
        connectionType: 'OAuth 2.0 / Bot Token',
        fields: [
          {
            name: 'Bot Token',
            type: 'password',
            required: true,
            hint: 'xoxb-... from Slack App settings',
          },
          { name: 'App Token', type: 'password', hint: 'xapp-... for Socket Mode' },
          { name: 'Signing Secret', type: 'password', hint: 'For event verification' },
          { name: 'Channel', type: 'text', placeholder: '#general' },
        ],
      },
      {
        name: 'Microsoft Teams',
        description: 'Enterprise team collaboration',
        tag: 'Enterprise',
        connectionType: 'OAuth 2.0 / Bot Framework',
        fields: [
          ...azureFields(),
          { name: 'Bot App ID', type: 'text' },
          { name: 'Bot App Password', type: 'password' },
        ],
      },
      {
        name: 'Zoom',
        description: 'Video conferencing platform',
        tag: 'Popular',
        connectionType: 'OAuth 2.0 / JWT',
        fields: [
          { name: 'Account ID', type: 'text', required: true },
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
        ],
      },
      {
        name: 'Google Meet',
        description: 'Google video meetings',
        tag: 'Google',
        connectionType: 'OAuth 2.0',
        fields: [
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
          { name: 'Service Account Key', type: 'file', hint: 'For server-to-server access' },
        ],
      },
      {
        name: 'Confluence',
        description: 'Team knowledge wiki',
        tag: 'Atlassian',
        connectionType: 'API Token',
        fields: [
          {
            name: 'Instance URL',
            type: 'url',
            placeholder: 'https://yourteam.atlassian.net/wiki',
            required: true,
          },
          { name: 'Email', type: 'text', required: true },
          { name: 'API Token', type: 'password', required: true },
          { name: 'Space Key', type: 'text' },
        ],
      },
      {
        name: 'Notion',
        description: 'All-in-one workspace',
        tag: 'Popular',
        connectionType: 'API Token',
        fields: [
          {
            name: 'Integration Token',
            type: 'password',
            required: true,
            hint: 'Internal integration token from notion.so/my-integrations',
          },
          { name: 'Database ID', type: 'text', hint: 'Specific database to connect' },
        ],
      },
      {
        name: 'Google Workspace',
        description: 'Gmail, Drive, Docs, Sheets & more',
        tag: 'Google',
        connectionType: 'OAuth 2.0 / Service Account',
        fields: [
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
          { name: 'Service Account Key', type: 'file', hint: 'For domain-wide delegation' },
          {
            name: 'Scopes',
            type: 'text',
            placeholder: 'drive.readonly,gmail.readonly',
            hint: 'Comma-separated OAuth scopes',
          },
        ],
      },
      {
        name: 'SharePoint',
        description: 'Microsoft document management',
        logo: '/legacy/sharepoint.svg',
        connectionType: 'OAuth 2.0 / Graph API',
        fields: [
          ...azureFields(),
          {
            name: 'Site URL',
            type: 'url',
            placeholder: 'https://yourorg.sharepoint.com/sites/mysite',
            required: true,
          },
        ],
      },
      {
        name: 'Dropbox Business',
        description: 'Cloud file storage & sharing',
        tag: 'Storage',
        connectionType: 'OAuth 2.0',
        fields: [
          { name: 'App Key', type: 'text', required: true },
          { name: 'App Secret', type: 'password', required: true },
          { name: 'Access Token', type: 'password', hint: 'For direct access without OAuth flow' },
          { name: 'Team Member ID', type: 'text', hint: 'For Business API access' },
        ],
      },
    ],
  },

  // ── 11. HR & PEOPLE ──
  {
    id: 'hr',
    name: 'HR & People',
    icon: 'UserCheck',
    integrations: [
      {
        name: 'Workday',
        description: 'HR & finance platform',
        logo: '/legacy/workday.svg',
        connectionType: 'SOAP / REST',
        fields: [
          {
            name: 'Tenant URL',
            type: 'url',
            placeholder: 'https://impl.workday.com/ccx/service/tenant',
            required: true,
          },
          { name: 'Username', type: 'text', required: true, hint: 'Integration system user' },
          { name: 'Password', type: 'password', required: true },
          { name: 'Tenant Name', type: 'text', required: true },
          { name: 'WSDL Version', type: 'text', placeholder: 'v40.0' },
        ],
      },
      {
        name: 'BambooHR',
        description: 'HR software for SMBs',
        tag: 'SMB',
        connectionType: 'API Key',
        fields: [
          { name: 'Subdomain', type: 'text', placeholder: 'yourcompany', required: true },
          { name: 'API Key', type: 'password', required: true },
        ],
      },
      {
        name: 'Gusto',
        description: 'Payroll & benefits platform',
        tag: 'Payroll',
        connectionType: 'OAuth 2.0',
        fields: [...oauthFields(), { name: 'Company UUID', type: 'text' }],
      },
      {
        name: 'Rippling',
        description: 'Unified HR, IT & finance',
        tag: 'Cloud',
        connectionType: 'OAuth 2.0',
        fields: [...oauthFields(), { name: 'Company ID', type: 'text' }],
      },
      {
        name: 'Deel',
        description: 'Global HR & payroll',
        tag: 'Global',
        connectionType: 'API Token',
        fields: [
          {
            name: 'API Token',
            type: 'password',
            required: true,
            hint: 'From Deel developer portal',
          },
          { name: 'Environment', type: 'select', options: ['Production', 'Sandbox'] },
        ],
      },
    ],
  },

  // ── 12. FINANCE & ACCOUNTING ──
  {
    id: 'finance',
    name: 'Finance & Accounting',
    icon: 'DollarSign',
    integrations: [
      {
        name: 'QuickBooks',
        description: 'SMB accounting platform',
        tag: 'Popular',
        connectionType: 'OAuth 2.0',
        fields: [
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
          { name: 'Realm ID', type: 'text', required: true, hint: 'Company ID from QuickBooks' },
          { name: 'Refresh Token', type: 'password', required: true },
          {
            name: 'Environment',
            type: 'select',
            options: ['Production', 'Sandbox'],
            required: true,
          },
        ],
      },
      {
        name: 'Xero',
        description: 'Cloud accounting software',
        tag: 'Cloud',
        connectionType: 'OAuth 2.0',
        fields: [
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
          { name: 'Tenant ID', type: 'text', required: true, hint: 'Xero organization ID' },
          { name: 'Scopes', type: 'text', placeholder: 'accounting.transactions.read' },
        ],
      },
      {
        name: 'FreshBooks',
        description: 'Invoicing & accounting',
        tag: 'SMB',
        connectionType: 'OAuth 2.0',
        fields: [...oauthFields(), { name: 'Account ID', type: 'text', required: true }],
      },
      {
        name: 'Hyperion Financial Mgmt',
        description: 'Oracle EPM consolidation',
        tag: 'Enterprise',
        connectionType: 'SOAP / REST',
        fields: [
          { name: 'Server URL', type: 'url', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Application', type: 'text', required: true },
          { name: 'Cluster', type: 'text' },
        ],
      },
      {
        name: 'Cognos',
        description: 'IBM business intelligence',
        tag: 'BI',
        connectionType: 'REST / SOAP',
        fields: [
          { name: 'Dispatcher URL', type: 'url', required: true },
          { name: 'Namespace', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
        ],
      },
    ],
  },

  // ── 13. IDENTITY & SECURITY ──
  {
    id: 'identity',
    name: 'Identity & Security',
    icon: 'Shield',
    integrations: [
      {
        name: 'Okta',
        description: 'Identity & access management',
        tag: 'IAM',
        connectionType: 'SAML / OIDC',
        fields: [
          {
            name: 'Okta Domain',
            type: 'url',
            placeholder: 'https://yourorg.okta.com',
            required: true,
          },
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password' },
          { name: 'API Token', type: 'password', hint: 'For admin operations' },
          { name: 'Auth Server ID', type: 'text', placeholder: 'default' },
        ],
      },
      {
        name: 'JumpCloud',
        description: 'Cloud directory platform',
        tag: 'IAM',
        connectionType: 'API Key / LDAP',
        fields: [
          { name: 'API Key', type: 'password', required: true },
          { name: 'Organization ID', type: 'text', required: true },
          { name: 'LDAP Bind DN', type: 'text', hint: 'For LDAP integration' },
          { name: 'LDAP Password', type: 'password' },
        ],
      },
      {
        name: 'Active Directory',
        description: 'Microsoft directory service',
        tag: 'Enterprise',
        connectionType: 'LDAP / Kerberos',
        fields: [
          { name: 'Domain Controller', type: 'text', placeholder: 'dc.corp.local', required: true },
          { name: 'Port', type: 'number', placeholder: '389', required: true },
          { name: 'Base DN', type: 'text', placeholder: 'DC=corp,DC=local', required: true },
          { name: 'Bind Username', type: 'text', required: true },
          { name: 'Bind Password', type: 'password', required: true },
          { name: 'Use LDAPS', type: 'toggle', hint: 'LDAP over SSL (port 636)' },
        ],
      },
      {
        name: '1Password',
        description: 'Password manager for teams',
        tag: 'Secrets',
        connectionType: 'Connect API',
        fields: [
          { name: 'Connect Server URL', type: 'url', required: true },
          { name: 'Connect Token', type: 'password', required: true },
          { name: 'Vault UUID', type: 'text', hint: 'Specific vault to access' },
        ],
      },
    ],
  },

  // ── 14. DEV TOOLS & CI/CD ──
  {
    id: 'devtools',
    name: 'Dev Tools & CI/CD',
    icon: 'GitBranch',
    integrations: [
      {
        name: 'GitHub',
        description: 'Code hosting & CI/CD',
        tag: 'DevOps',
        connectionType: 'PAT / OAuth',
        fields: [
          { name: 'Personal Access Token', type: 'password', required: true },
          { name: 'Organization', type: 'text' },
          {
            name: 'Base URL',
            type: 'url',
            placeholder: 'https://api.github.com',
            hint: 'Change for GitHub Enterprise',
          },
        ],
      },
      {
        name: 'GitLab',
        description: 'DevOps lifecycle platform',
        tag: 'DevOps',
        connectionType: 'PAT / OAuth',
        fields: [
          { name: 'Personal Access Token', type: 'password', required: true },
          { name: 'Instance URL', type: 'url', placeholder: 'https://gitlab.com', required: true },
          { name: 'Group / Project', type: 'text' },
        ],
      },
      {
        name: 'Bitbucket',
        description: 'Atlassian code hosting',
        tag: 'DevOps',
        connectionType: 'App Password',
        fields: [
          { name: 'Username', type: 'text', required: true },
          {
            name: 'App Password',
            type: 'password',
            required: true,
            hint: 'From Personal Settings > App Passwords',
          },
          { name: 'Workspace', type: 'text' },
          {
            name: 'Base URL',
            type: 'url',
            placeholder: 'https://api.bitbucket.org/2.0',
            hint: 'Change for Bitbucket Server',
          },
        ],
      },
      {
        name: 'Jenkins',
        description: 'Automation & CI server',
        tag: 'CI/CD',
        connectionType: 'API Token',
        fields: [
          {
            name: 'Jenkins URL',
            type: 'url',
            placeholder: 'https://jenkins.corp.local',
            required: true,
          },
          { name: 'Username', type: 'text', required: true },
          { name: 'API Token', type: 'password', required: true },
          { name: 'CRUMB Issuer', type: 'toggle', hint: 'Enable CSRF crumb header' },
        ],
      },
    ],
  },

  // ── 15. CLOUD PLATFORMS ──
  {
    id: 'cloud',
    name: 'Cloud Platforms',
    icon: 'Cloud',
    integrations: [
      {
        name: 'AWS RDS',
        description: 'Amazon relational DB service',
        tag: 'AWS',
        connectionType: 'AWS SDK',
        fields: awsFields([
          { name: 'DB Instance Identifier', type: 'text', required: true },
          {
            name: 'Engine',
            type: 'select',
            options: ['postgres', 'mysql', 'mariadb', 'oracle-ee', 'sqlserver-ee'],
          },
        ]),
      },
      {
        name: 'Azure SQL',
        description: 'Microsoft cloud SQL',
        tag: 'Azure',
        connectionType: 'ADO.NET',
        fields: [
          {
            name: 'Server',
            type: 'text',
            placeholder: 'server.database.windows.net',
            required: true,
          },
          { name: 'Database', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Encrypt', type: 'toggle' },
        ],
      },
      {
        name: 'Google Cloud SQL',
        description: 'Managed relational DB',
        tag: 'GCP',
        connectionType: 'Cloud SQL Proxy',
        fields: [
          { name: 'Project ID', type: 'text', required: true },
          {
            name: 'Instance Connection Name',
            type: 'text',
            placeholder: 'project:region:instance',
            required: true,
          },
          { name: 'Database', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Service Account Key', type: 'file' },
        ],
      },
      {
        name: 'Amazon Aurora',
        description: 'AWS high-performance DB',
        tag: 'AWS',
        connectionType: 'MySQL/Postgres',
        fields: [
          { name: 'Cluster Endpoint', type: 'text', required: true },
          { name: 'Port', type: 'number', placeholder: '3306', required: true },
          { name: 'Database', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Engine', type: 'select', options: ['aurora-mysql', 'aurora-postgresql'] },
        ],
      },
      {
        name: 'Supabase',
        description: 'Open-source Firebase alt',
        tag: 'Open Source',
        connectionType: 'REST / Postgres',
        fields: [
          {
            name: 'Project URL',
            type: 'url',
            placeholder: 'https://xxx.supabase.co',
            required: true,
          },
          { name: 'Anon Key', type: 'password', required: true },
          { name: 'Service Role Key', type: 'password', hint: 'For admin access' },
          { name: 'DB Password', type: 'password', hint: 'For direct Postgres connection' },
        ],
      },
      {
        name: 'PlanetScale',
        description: 'MySQL-compatible serverless',
        tag: 'Serverless',
        connectionType: 'MySQL',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Database', type: 'text', required: true },
          { name: 'SSL', type: 'toggle' },
        ],
      },
      {
        name: 'CockroachDB',
        description: 'Distributed SQL database',
        tag: 'Distributed',
        connectionType: 'PostgreSQL Wire',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'Port', type: 'number', placeholder: '26257', required: true },
          { name: 'Database', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password' },
          { name: 'Cluster ID', type: 'text', hint: 'For CockroachDB Cloud' },
        ],
      },
      {
        name: 'Neon',
        description: 'Serverless Postgres',
        tag: 'Serverless',
        connectionType: 'PostgreSQL',
        fields: [
          {
            name: 'Connection String',
            type: 'password',
            required: true,
            hint: 'postgres://user:pass@ep-xxx.region.aws.neon.tech/db',
          },
          { name: 'Branch', type: 'text', placeholder: 'main' },
        ],
      },
    ],
  },

  // ── 16. E-COMMERCE ──
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: 'ShoppingCart',
    integrations: [
      {
        name: 'Shopify',
        description: 'Leading e-commerce platform',
        logo: '/legacy/shopify.svg',
        connectionType: 'Admin API / OAuth',
        fields: [
          {
            name: 'Store URL',
            type: 'url',
            placeholder: 'https://yourstore.myshopify.com',
            required: true,
          },
          { name: 'Admin API Access Token', type: 'password', required: true },
          { name: 'API Key', type: 'text' },
          { name: 'API Secret Key', type: 'password' },
          { name: 'API Version', type: 'text', placeholder: '2024-01' },
        ],
      },
      {
        name: 'Magento',
        description: 'Adobe Commerce platform',
        logo: '/legacy/magento.png',
        connectionType: 'REST / GraphQL',
        fields: [
          { name: 'Base URL', type: 'url', required: true },
          {
            name: 'Admin Token',
            type: 'password',
            required: true,
            hint: 'Integration access token',
          },
          { name: 'Consumer Key', type: 'text' },
          { name: 'Consumer Secret', type: 'password' },
        ],
      },
      {
        name: 'WooCommerce',
        description: 'WordPress commerce plugin',
        tag: 'WordPress',
        connectionType: 'REST API Key',
        fields: [
          { name: 'Store URL', type: 'url', required: true },
          { name: 'Consumer Key', type: 'text', required: true },
          { name: 'Consumer Secret', type: 'password', required: true },
          { name: 'API Version', type: 'text', placeholder: 'wc/v3' },
        ],
      },
      {
        name: 'BigCommerce',
        description: 'SaaS commerce platform',
        tag: 'SaaS',
        connectionType: 'REST API',
        fields: [
          { name: 'Store Hash', type: 'text', required: true },
          { name: 'Access Token', type: 'password', required: true },
          { name: 'Client ID', type: 'text' },
          { name: 'Client Secret', type: 'password' },
        ],
      },
      {
        name: 'Squarespace',
        description: 'Website & commerce builder',
        tag: 'Builder',
        connectionType: 'OAuth 2.0',
        fields: oauthFields([{ name: 'Site ID', type: 'text' }]),
      },
      {
        name: 'PrestaShop',
        description: 'Open-source e-commerce',
        tag: 'Open Source',
        connectionType: 'Web Service Key',
        fields: [
          { name: 'Store URL', type: 'url', required: true },
          { name: 'Web Service Key', type: 'password', required: true },
        ],
      },
    ],
  },

  // ── 17. BI & REPORTING ──
  {
    id: 'bi',
    name: 'BI & Reporting',
    icon: 'BarChart3',
    integrations: [
      {
        name: 'Tableau',
        description: 'Business intelligence & viz',
        tag: 'BI',
        connectionType: 'REST / PAT',
        fields: [
          {
            name: 'Server URL',
            type: 'url',
            placeholder: 'https://tableau.corp.local',
            required: true,
          },
          { name: 'Personal Access Token Name', type: 'text', required: true },
          { name: 'Personal Access Token Secret', type: 'password', required: true },
          { name: 'Site ID', type: 'text' },
        ],
      },
      {
        name: 'Power BI',
        description: 'Microsoft analytics tool',
        tag: 'BI',
        connectionType: 'OAuth 2.0 / REST',
        fields: [...azureFields(), { name: 'Workspace ID', type: 'text' }],
      },
      {
        name: 'Looker',
        description: 'Google data platform',
        tag: 'Analytics',
        connectionType: 'API Key',
        fields: [
          {
            name: 'Instance URL',
            type: 'url',
            placeholder: 'https://yourcompany.looker.com',
            required: true,
          },
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
        ],
      },
      {
        name: 'Qlik',
        description: 'Data analytics platform',
        tag: 'Analytics',
        connectionType: 'API Key',
        fields: [
          { name: 'Tenant URL', type: 'url', required: true },
          { name: 'API Key', type: 'password', required: true },
        ],
      },
      {
        name: 'Crystal Reports',
        description: 'SAP enterprise reporting',
        tag: 'Legacy',
        connectionType: 'BI Platform SDK',
        fields: [
          { name: 'CMS Server', type: 'text', required: true, hint: 'Central Management Server' },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          {
            name: 'Authentication Type',
            type: 'select',
            options: ['secEnterprise', 'secLDAP', 'secWinAD'],
          },
        ],
      },
      {
        name: 'Brio',
        description: 'Legacy BI & reporting tool',
        tag: 'Legacy',
        connectionType: 'ODBC / Proprietary',
        fields: [
          { name: 'Server', type: 'text', required: true },
          { name: 'Port', type: 'number', required: true },
          { name: 'Repository', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
        ],
      },
      {
        name: 'ServiceNow',
        description: 'IT service management',
        logo: '/legacy/servicenow.svg',
        connectionType: 'REST / OAuth',
        fields: [
          {
            name: 'Instance URL',
            type: 'url',
            placeholder: 'https://yourinstance.service-now.com',
            required: true,
          },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Client ID', type: 'text', hint: 'For OAuth' },
          { name: 'Client Secret', type: 'password' },
        ],
      },
    ],
  },

  // ── 18. ENTERPRISE IT PLATFORMS ──
  {
    id: 'enterprise-it',
    name: 'Enterprise IT Platforms',
    icon: 'Landmark',
    integrations: [
      {
        name: 'SAP',
        description: 'Enterprise resource planning giant',
        tag: 'ERP',
        connectionType: 'RFC / OData',
        fields: [
          { name: 'Application Server', type: 'text', required: true },
          { name: 'System Number', type: 'text', placeholder: '00', required: true },
          { name: 'Client', type: 'text', placeholder: '100', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
        ],
      },
      {
        name: 'Oracle',
        description: 'Database & cloud applications',
        tag: 'Enterprise',
        connectionType: 'JDBC / REST',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'Port', type: 'number', placeholder: '1521', required: true },
          { name: 'Service Name', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
        ],
      },
      {
        name: 'IBM',
        description: 'Enterprise systems & mainframes',
        tag: 'Mainframe',
        connectionType: 'Various',
        fields: [
          { name: 'Host', type: 'text', required: true },
          { name: 'Port', type: 'number', required: true },
          { name: 'User ID', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Protocol', type: 'select', options: ['TN3270', 'MQ', 'DB2', 'REST API'] },
        ],
      },
      {
        name: 'Microsoft',
        description: 'Azure & enterprise stack',
        tag: 'Enterprise',
        connectionType: 'Azure AD / OAuth',
        fields: azureFields(),
      },
      {
        name: 'OpenText',
        description: 'Content management & ECM',
        tag: 'ECM',
        connectionType: 'REST / SOAP',
        fields: [
          { name: 'Server URL', type: 'url', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Library', type: 'text' },
        ],
      },
      {
        name: 'Micro Focus',
        description: 'COBOL dev & enterprise tools',
        tag: 'Legacy',
        connectionType: 'API / MFDS',
        fields: [
          { name: 'Server URL', type: 'url', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
          { name: 'Region', type: 'text' },
        ],
      },
      {
        name: 'Progress Software',
        description: 'OpenEdge & DataDirect connectors',
        tag: 'Middleware',
        connectionType: 'DataDirect / REST',
        fields: [
          { name: 'Server URL', type: 'url', required: true },
          { name: 'Database', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
        ],
      },
      {
        name: 'Broadcom',
        description: 'CA Automic & Rally',
        tag: 'Enterprise',
        connectionType: 'REST API',
        fields: [
          { name: 'Server URL', type: 'url', required: true },
          { name: 'API Key', type: 'password', required: true },
          { name: 'Username', type: 'text' },
          { name: 'Password', type: 'password' },
        ],
      },
      {
        name: 'CGI',
        description: 'IT consulting & managed services',
        tag: 'Services',
        connectionType: 'Custom / API',
        fields: [
          { name: 'Endpoint URL', type: 'url', required: true },
          { name: 'Client Certificate', type: 'file' },
          { name: 'API Key', type: 'password' },
          { name: 'Username', type: 'text' },
          { name: 'Password', type: 'password' },
        ],
      },
      {
        name: 'Accenture',
        description: 'Enterprise technology solutions',
        tag: 'Services',
        connectionType: 'Custom / API',
        fields: [
          { name: 'Platform URL', type: 'url', required: true },
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
        ],
      },
      {
        name: 'DXC Technology',
        description: 'IT services & managed cloud',
        tag: 'Services',
        connectionType: 'API / SSH',
        fields: [
          { name: 'Service URL', type: 'url', required: true },
          { name: 'API Token', type: 'password', required: true },
          { name: 'Organization ID', type: 'text' },
        ],
      },
      {
        name: 'TCS (Tata Consultancy)',
        description: 'IT services & BaNCS platform',
        tag: 'Services',
        connectionType: 'REST / SOAP',
        fields: [
          { name: 'BaNCS Server URL', type: 'url' },
          { name: 'Client ID', type: 'text', required: true },
          { name: 'Client Secret', type: 'password', required: true },
          { name: 'Bank Code', type: 'text' },
        ],
      },
      {
        name: 'Infosys',
        description: 'Finacle & enterprise solutions',
        tag: 'Services',
        connectionType: 'REST / SOAP',
        fields: [
          { name: 'Finacle Server', type: 'url' },
          { name: 'Bank ID', type: 'text', required: true },
          { name: 'Username', type: 'text', required: true },
          { name: 'Password', type: 'password', required: true },
        ],
      },
      {
        name: 'Wipro',
        description: 'HOLMES AI & enterprise solutions',
        tag: 'Services',
        connectionType: 'REST API',
        fields: [
          { name: 'Platform URL', type: 'url', required: true },
          { name: 'API Key', type: 'password', required: true },
          { name: 'Tenant ID', type: 'text' },
        ],
      },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────

export const totalIntegrationCount = categories.reduce((sum, c) => sum + c.integrations.length, 0);
