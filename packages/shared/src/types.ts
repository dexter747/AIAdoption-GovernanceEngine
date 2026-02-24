// Connection Types
export interface ConnectionConfig {
  id?: string;
  name: string;
  type: LegacySystemType;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  options?: Record<string, any>;
}

export type LegacySystemType =
  // Databases
  | 'postgresql'
  | 'mysql'
  | 'oracle'
  | 'sqlserver'
  | 'sap-hana'
  | 'mongodb'
  | 'mariadb'
  | 'redis'
  | 'elasticsearch'
  | 'cassandra'
  | 'couchdb'
  | 'neo4j'
  | 'dynamodb'
  // CRM & Sales
  | 'salesforce'
  | 'hubspot'
  | 'oracle-siebel'
  | 'dynamics365'
  // ITSM & Support
  | 'servicenow'
  | 'jira'
  | 'zendesk'
  // ERP
  | 'netsuite'
  | 'infor-cloudsuite'
  | 'jd-edwards'
  | 'epicor'
  | 'sage-intacct'
  | 'oracle-peoplesoft'
  | 'oracle-opera'
  // HCM & HR
  | 'workday'
  | 'sap-successfactors'
  | 'adp'
  | 'ukg-kronos'
  | 'sap-concur'
  // Healthcare
  | 'epic-fhir'
  | 'cerner'
  | 'meditech'
  | 'allscripts'
  // Insurance
  | 'guidewire'
  | 'duck-creek'
  | 'applied-epic'
  // Supply Chain & Logistics
  | 'manhattan-associates'
  | 'blue-yonder'
  | 'descartes'
  // Finance & Banking
  | 'fis'
  | 'finastra'
  | 'temenos'
  | 'blackline'
  | 'quickbooks'
  // Commerce
  | 'shopify'
  | 'magento'
  // Telecom
  | 'amdocs'
  | 'ericsson-bss'
  // Document Management
  | 'sharepoint'
  | 'documentum'
  | 'ibm-filenet'
  | 'box'
  // Government
  | 'cgi-momentum'
  | 'tyler-technologies'
  // Education
  | 'ellucian-banner'
  // Asset & Facilities
  | 'ibm-maximo'
  | 'ibm-tririga'
  | 'ge-predix'
  // Procurement
  | 'sap-ariba'
  | 'coupa'
  // Legacy / Mainframe
  | 'as400'
  // Project Management
  | 'trello'
  // Project Management
  | 'asana'
  | 'monday-com'
  | 'clickup'
  | 'linear'
  | 'wrike'
  | 'smartsheet'
  | 'basecamp'
  // Communication
  | 'slack'
  | 'ms-teams'
  | 'notion'
  | 'confluence'
  | 'zoom'
  | 'google-meet'
  | 'google-workspace'
  | 'dropbox-business'
  // CRM
  | 'zoho-crm'
  | 'pipedrive'
  | 'freshsales'
  | 'sugarcrm'
  | 'insightly'
  | 'copper-crm'
  | 'close-crm'
  | 'capsule-crm'
  | 'apptivo'
  | 'bitrix24'
  | 'keap'
  | 'nimble'
  | 'creatio'
  | 'zendesk-sell'
  | 'peoplesoft-crm'
  // HCM
  | 'bamboohr'
  | 'gusto'
  | 'rippling'
  | 'deel'
  // Cloud Databases
  | 'amazon-aurora'
  | 'aws-rds'
  | 'azure-sql'
  | 'google-cloud-sql'
  | 'cockroachdb'
  | 'neon'
  | 'planetscale'
  | 'supabase'
  | 'firestore'
  | 'influxdb'
  // Data Warehouses
  | 'snowflake'
  | 'bigquery'
  | 'redshift'
  | 'databricks'
  | 'azure-synapse'
  | 'teradata'
  | 'dremio'
  | 'starburst'
  | 'firebolt'
  // BI & Analytics
  | 'tableau'
  | 'power-bi'
  | 'looker'
  | 'qlik'
  | 'cognos'
  | 'crystal-reports'
  | 'brio'
  // Commerce
  | 'bigcommerce'
  | 'woocommerce'
  | 'squarespace'
  | 'prestashop'
  | 'stripe'
  // DevTools
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'jenkins'
  // Identity & Access
  | 'okta'
  | 'active-directory'
  | 'jumpcloud'
  // Finance
  | 'freshbooks'
  | 'xero'
  | 'hyperion'
  // Financial Markets
  | 'bloomberg-terminal'
  | 'reuters-3000'
  | 'murex'
  | 'calypso'
  | 'frontarena'
  | 'simcorp'
  | 'charles-river'
  | 'blackrock-aladdin'
  // ERP
  | 'sap-s4hana'
  | 'sap-enterprise'
  // Enterprise Consulting
  | 'accenture'
  | 'broadcom'
  | 'dxc-technology'
  | 'infosys'
  | 'micro-focus'
  | 'opentext'
  | 'progress-software'
  | 'tcs'
  | 'wipro'
  // Legacy/Mainframe
  | 'ach-mainframe'
  | 'chips-mainframe'
  | 'cobol-banking'
  | 'fis-profile'
  | 'fis-world'
  | 'ibm-cics'
  | 'ibm-ims'
  | 'jde-oneworld'
  | 'jde-world'
  | 'oracle-ebs'
  | 'peoplesoft-financials'
  | 'sap-r2'
  | 'sap-r3'
  | 'swift-fin'
  | 'temenos-t24'
  | 'unisys-clearpath';

export interface ConnectionStatus {
  id: string;
  connected: boolean;
  lastChecked: Date;
  error?: string;
}

// AI Types
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'azure'
  | 'cohere'
  | 'mistral'
  | 'groq'
  | 'perplexity'
  | 'ollama'
  | 'xai'
  | 'deepseek';

export interface AIModel {
  id: string;
  provider: AIProvider;
  name: string;
  displayName: string;
  contextWindow: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  supportsStreaming: boolean;
}

export interface AIQueryOptions {
  model?: string;
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  connectionId?: string;
  projectId?: string;
  systemPrompt?: string;
  contextIds?: string[]; // Additional context IDs to include
  excludeContextIds?: string[]; // Context IDs to exclude
}

export interface AIQueryResult {
  id: string;
  prompt: string;
  response: string;
  model: string;
  provider: AIProvider;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  duration: number;
  timestamp: Date;
  contextTokens?: number; // Tokens used for context
}

// License Types
export type LicensePlan = 'trial' | 'professional' | 'team' | 'enterprise';

export interface License {
  id: string;
  licenseKey: string;
  planType: LicensePlan;
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  maxDevices: number;
  issuedAt: Date;
  expiresAt?: Date;
  lastValidatedAt?: Date;
  user: {
    email: string;
    name?: string;
  };
}

export interface LicenseValidationResult {
  valid: boolean;
  license?: License;
  error?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export type PaymentProvider = 'lemonsqueezy' | 'paypal';

export interface Subscription {
  id: string;
  userId: string;
  licenseId: string;
  paymentProvider: PaymentProvider;
  providerSubscriptionId?: string;
  planType: LicensePlan;
  billingPeriod: 'monthly' | 'yearly';
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  paymentProvider: PaymentProvider;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  paymentMethod?: string;
  failureReason?: string;
  paidAt?: Date;
  createdAt: Date;
}

// Settings Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoUpdate: boolean;
  analyticsEnabled: boolean;
  piiMaskingEnabled: boolean;
  defaultAIProvider: AIProvider;
  defaultModel: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Database Query Types
export interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  duration: number;
}

// Usage Tracking Types
export interface UsageLog {
  userId: string;
  licenseId: string;
  eventType: 'ai_query' | 'connection' | 'export';
  metadata: {
    provider?: AIProvider;
    model?: string;
    tokens?: number;
    cost?: number;
  };
  timestamp: Date;
}
