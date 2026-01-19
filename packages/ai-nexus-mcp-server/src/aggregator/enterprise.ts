/**
 * Enterprise Aggregator
 * Provides unified access to enterprise system MCP servers (SAP, Salesforce, Epic, etc.)
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('enterprise-aggregator');

interface EnterpriseSystem {
  id: string;
  name: string;
  type: 'sap' | 'salesforce' | 'epic' | 'servicenow' | 'jira' | 'workday' | 'dynamics365' | 'netsuite';
  mcpEndpoint: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  category: 'erp' | 'crm' | 'ehr' | 'itsm' | 'hcm' | 'pm';
}

// Registry of enterprise MCP servers
const ENTERPRISE_SERVERS: Record<string, Omit<EnterpriseSystem, 'id' | 'status'>> = {
  'sap-s4hana': {
    name: 'SAP S/4HANA',
    type: 'sap',
    mcpEndpoint: process.env.SAP_MCP_URL ?? 'http://sap-s4hana-mcp:3000',
    description: 'SAP S/4HANA ERP system',
    category: 'erp'
  },
  'salesforce-main': {
    name: 'Salesforce',
    type: 'salesforce',
    mcpEndpoint: process.env.SALESFORCE_MCP_URL ?? 'http://salesforce-mcp:3000',
    description: 'Salesforce CRM',
    category: 'crm'
  },
  'epic-fhir': {
    name: 'Epic FHIR',
    type: 'epic',
    mcpEndpoint: process.env.EPIC_MCP_URL ?? 'http://epic-fhir-mcp:3000',
    description: 'Epic EHR via FHIR R4 (HIPAA Compliant)',
    category: 'ehr'
  },
  'servicenow-itsm': {
    name: 'ServiceNow',
    type: 'servicenow',
    mcpEndpoint: process.env.SERVICENOW_MCP_URL ?? 'http://servicenow-mcp:3000',
    description: 'ServiceNow ITSM',
    category: 'itsm'
  },
  'jira-main': {
    name: 'Jira',
    type: 'jira',
    mcpEndpoint: process.env.JIRA_MCP_URL ?? 'http://jira-mcp:3000',
    description: 'Atlassian Jira Project Management',
    category: 'pm'
  }
};

export class EnterpriseAggregator {
  private systems: Map<string, EnterpriseSystem> = new Map();

  constructor() {
    this.initializeSystems();
  }

  private initializeSystems() {
    for (const [id, config] of Object.entries(ENTERPRISE_SERVERS)) {
      this.systems.set(id, {
        id,
        ...config,
        status: 'disconnected'
      });
    }

    logger.info({ count: this.systems.size }, 'Enterprise systems initialized');
  }

  async listSystems(): Promise<EnterpriseSystem[]> {
    return Array.from(this.systems.values());
  }

  // ============================================================
  // SAP S/4HANA
  // ============================================================
  async querySAP(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { intent, module, bapi, parameters } = args;

    logger.info({ intent, module }, 'Querying SAP S/4HANA');

    // In production, this would:
    // 1. Connect to SAP MCP server
    // 2. Convert intent to BAPI call if needed
    // 3. Execute and return results

    if (bapi) {
      // Direct BAPI call
      return {
        system: 'SAP S/4HANA',
        type: 'bapi_call',
        bapi,
        parameters,
        result: {
          message: `BAPI ${bapi} would be called here. Connect SAP MCP server for real results.`,
          mock: true
        }
      };
    }

    // Natural language intent
    const suggestedBapis = this.suggestSAPBAPI(intent as string, module as string);

    return {
      system: 'SAP S/4HANA',
      type: 'intent_query',
      intent,
      module: module ?? 'auto-detected',
      suggestedBapis,
      result: {
        message: 'Connect SAP MCP server to execute queries against real SAP system.',
        mock: true
      }
    };
  }

  private suggestSAPBAPI(intent: string, module?: string): string[] {
    const intentLower = intent.toLowerCase();
    
    // Common BAPI suggestions based on intent
    if (intentLower.includes('purchase order')) {
      return ['BAPI_PO_GETITEMS', 'BAPI_PO_CREATE1', 'BAPI_PO_GETDETAIL'];
    }
    if (intentLower.includes('invoice')) {
      return ['BAPI_INCOMINGINVOICE_GETLIST', 'BAPI_INCOMINGINVOICE_CREATE1'];
    }
    if (intentLower.includes('material') || intentLower.includes('inventory')) {
      return ['BAPI_MATERIAL_GET_DETAIL', 'BAPI_MATERIAL_AVAILABILITY'];
    }
    if (intentLower.includes('customer')) {
      return ['BAPI_CUSTOMER_GETLIST', 'BAPI_CUSTOMER_GETDETAIL2'];
    }
    if (intentLower.includes('vendor') || intentLower.includes('supplier')) {
      return ['BAPI_VENDOR_GETLIST', 'BAPI_VENDOR_GETDETAIL'];
    }
    if (intentLower.includes('employee') || intentLower.includes('hr')) {
      return ['BAPI_EMPLOYEE_GETDATA', 'BAPI_ORGUNIT_DATA_GET'];
    }

    return ['RFC_READ_TABLE', 'BAPI_TRANSACTION_COMMIT'];
  }

  // ============================================================
  // Salesforce
  // ============================================================
  async querySalesforce(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { soql, natural_language, object_type } = args;

    logger.info({ object_type, hasSoql: !!soql }, 'Querying Salesforce');

    let query = soql as string;
    if (!query && natural_language) {
      query = this.naturalLanguageToSOQL(natural_language as string, object_type as string);
    }

    return {
      system: 'Salesforce',
      query,
      object_type: object_type ?? 'detected',
      result: {
        records: [],
        totalSize: 0,
        message: 'Connect Salesforce MCP server to execute real queries.',
        mock: true
      }
    };
  }

  private naturalLanguageToSOQL(intent: string, objectType?: string): string {
    // Simple NL to SOQL conversion (in production, would use AI)
    const intentLower = intent.toLowerCase();
    
    if (intentLower.includes('all accounts') || intentLower.includes('list accounts')) {
      return 'SELECT Id, Name, Industry, AnnualRevenue FROM Account LIMIT 100';
    }
    if (intentLower.includes('opportunities')) {
      return 'SELECT Id, Name, Amount, StageName, CloseDate FROM Opportunity WHERE IsClosed = false';
    }
    if (intentLower.includes('contacts')) {
      return 'SELECT Id, Name, Email, Phone, AccountId FROM Contact LIMIT 100';
    }

    return `-- TODO: Generate SOQL for: ${intent}`;
  }

  // ============================================================
  // Epic FHIR (Healthcare)
  // ============================================================
  async queryEpic(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { resource_type, search_params, redact_phi = true } = args;

    logger.info({ resource_type, redact_phi }, 'Querying Epic FHIR');

    // Build FHIR URL
    const searchString = search_params 
      ? '?' + new URLSearchParams(search_params as Record<string, string>).toString()
      : '';

    const result = {
      system: 'Epic FHIR',
      resourceType: resource_type,
      searchParams: search_params ?? {},
      phiRedactionEnabled: redact_phi,
      result: {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 0,
        entry: [],
        message: 'Connect Epic FHIR MCP server to execute real queries. PHI will be redacted per HIPAA Safe Harbor.',
        mock: true
      }
    };

    // If PHI redaction is enabled, note which fields would be redacted
    if (redact_phi) {
      result.result.entry = [{
        note: 'PHI fields that would be redacted: name, address, telecom, birthDate, identifier, photo, contact'
      }];
    }

    return result;
  }

  // ============================================================
  // ServiceNow
  // ============================================================
  async queryServiceNow(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { table, query, limit = 10 } = args;

    logger.info({ table, limit }, 'Querying ServiceNow');

    return {
      system: 'ServiceNow',
      table,
      query: query ?? 'active=true',
      limit,
      result: {
        records: [],
        total: 0,
        message: 'Connect ServiceNow MCP server to execute real queries.',
        mock: true
      }
    };
  }

  // ============================================================
  // Jira
  // ============================================================
  async queryJira(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { jql, natural_language, project } = args;

    logger.info({ project, hasJql: !!jql }, 'Querying Jira');

    let query = jql as string;
    if (!query && natural_language) {
      query = this.naturalLanguageToJQL(natural_language as string, project as string);
    }

    return {
      system: 'Jira',
      jql: query,
      project,
      result: {
        issues: [],
        total: 0,
        message: 'Connect Jira MCP server to execute real queries.',
        mock: true
      }
    };
  }

  private naturalLanguageToJQL(intent: string, project?: string): string {
    const intentLower = intent.toLowerCase();
    const projectFilter = project ? `project = ${project} AND ` : '';

    if (intentLower.includes('my') && intentLower.includes('open')) {
      return `${projectFilter}assignee = currentUser() AND status != Done ORDER BY priority DESC`;
    }
    if (intentLower.includes('bugs') || intentLower.includes('bug')) {
      return `${projectFilter}type = Bug AND status != Done ORDER BY created DESC`;
    }
    if (intentLower.includes('sprint')) {
      return `${projectFilter}sprint in openSprints() ORDER BY priority DESC`;
    }

    return `${projectFilter}status != Done ORDER BY updated DESC`;
  }

  async healthCheck(): Promise<Record<string, unknown>> {
    const statuses: Record<string, string> = {};
    
    for (const [id, system] of this.systems) {
      statuses[id] = system.status;
    }

    return {
      status: 'healthy',
      systems: statuses,
      totalSystems: this.systems.size
    };
  }
}
