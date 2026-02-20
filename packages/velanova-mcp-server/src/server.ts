/**
 * Velanova MCP Server
 * 
 * The aggregation layer that unifies:
 * - 67+ AI models (GPT-4, Claude, Gemini, Llama, etc.)
 * - 60+ enterprise systems via MCP farm
 * - Governance: licensing, audit, cost tracking, RBAC
 * 
 * This server exposes Velanova capabilities via MCP protocol,
 * allowing any MCP-compatible tool (Claude Desktop, Cursor, etc.)
 * to leverage the full Velanova platform.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

import { AIRouter } from './tools/ai-router.js';
import { DatabaseAggregator } from './aggregator/database.js';
import { EnterpriseAggregator } from './aggregator/enterprise.js';
import { GovernanceLayer } from './governance/index.js';
import { createLogger } from './utils/logger.js';
import { parseArgs } from './utils/args.js';

const logger = createLogger('velanova-mcp');

class VelanovaMCPServer {
  private server: Server;
  private aiRouter: AIRouter;
  private databaseAggregator: DatabaseAggregator;
  private enterpriseAggregator: EnterpriseAggregator;
  private governance: GovernanceLayer;

  constructor() {
    this.server = new Server(
      { 
        name: 'velanova-mcp', 
        version: '1.0.0' 
      },
      { 
        capabilities: { 
          tools: {},
          resources: {},
          prompts: {}
        } 
      }
    );

    // Initialize components
    this.aiRouter = new AIRouter();
    this.databaseAggregator = new DatabaseAggregator();
    this.enterpriseAggregator = new EnterpriseAggregator();
    this.governance = new GovernanceLayer();

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupErrorHandler();

    logger.info('Velanova MCP Server initialized');
  }

  private setupToolHandlers() {
    // List all available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // ============================================================
          // AI MODEL TOOLS
          // ============================================================
          {
            name: 'query_ai',
            description: 'Query AI models with intelligent routing. Supports 67+ models including GPT-4, Claude, Gemini, Llama, Mistral, and more. Can auto-select best model based on requirements.',
            inputSchema: {
              type: 'object' as const,
              properties: {
                prompt: { 
                  type: 'string', 
                  description: 'The prompt to send to the AI model' 
                },
                model: { 
                  type: 'string', 
                  description: 'Specific model to use (optional). Examples: gpt-4o, claude-3-5-sonnet, gemini-2.0-flash' 
                },
                system_prompt: { 
                  type: 'string', 
                  description: 'System prompt for context (optional)' 
                },
                requirements: {
                  type: 'object',
                  description: 'Requirements for auto model selection',
                  properties: {
                    max_cost_per_1k: { type: 'number', description: 'Max cost per 1K tokens in $' },
                    max_latency_ms: { type: 'number', description: 'Max acceptable latency' },
                    min_quality_tier: { 
                      type: 'string', 
                      enum: ['economy', 'standard', 'premium', 'frontier'],
                      description: 'Minimum quality tier'
                    },
                    data_residency: { 
                      type: 'string', 
                      enum: ['any', 'US', 'EU', 'on-premise'],
                      description: 'Data residency requirement'
                    },
                    capabilities: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Required capabilities: vision, code, reasoning, function_calling'
                    }
                  }
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'list_ai_models',
            description: 'List all available AI models with pricing, capabilities, and current status',
            inputSchema: {
              type: 'object' as const,
              properties: {
                filter: {
                  type: 'object',
                  properties: {
                    provider: { 
                      type: 'string', 
                      enum: ['openai', 'anthropic', 'google', 'meta', 'mistral', 'groq', 'cohere'] 
                    },
                    tier: { 
                      type: 'string', 
                      enum: ['economy', 'standard', 'premium', 'frontier'] 
                    },
                    capability: { type: 'string' }
                  }
                }
              }
            }
          },
          {
            name: 'compare_models',
            description: 'Compare multiple AI models on a given prompt. Useful for evaluation and testing.',
            inputSchema: {
              type: 'object' as const,
              properties: {
                prompt: { type: 'string' },
                models: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'List of model IDs to compare'
                }
              },
              required: ['prompt', 'models']
            }
          },

          // ============================================================
          // DATABASE TOOLS
          // ============================================================
          {
            name: 'query_database',
            description: 'Query any connected database. Supports PostgreSQL, MySQL, MongoDB, SQL Server, Oracle, Redis, and more.',
            inputSchema: {
              type: 'object' as const,
              properties: {
                database_id: { 
                  type: 'string', 
                  description: 'Database connection ID (use list_databases to see available)' 
                },
                query: { 
                  type: 'string', 
                  description: 'SQL query or NoSQL query object' 
                },
                natural_language: {
                  type: 'string',
                  description: 'Optional: describe what you want in plain English and let AI generate the query'
                }
              },
              required: ['database_id']
            }
          },
          {
            name: 'list_databases',
            description: 'List all connected databases with their types and connection status',
            inputSchema: {
              type: 'object' as const,
              properties: {}
            }
          },
          {
            name: 'get_database_schema',
            description: 'Get the schema of a database including tables, columns, and relationships',
            inputSchema: {
              type: 'object' as const,
              properties: {
                database_id: { type: 'string' }
              },
              required: ['database_id']
            }
          },

          // ============================================================
          // ENTERPRISE SYSTEM TOOLS
          // ============================================================
          {
            name: 'query_sap',
            description: 'Query SAP S/4HANA using natural language or direct BAPI calls. Supports FI, CO, MM, SD, PP, HR modules.',
            inputSchema: {
              type: 'object' as const,
              properties: {
                intent: { 
                  type: 'string', 
                  description: 'Natural language description of what you want' 
                },
                module: { 
                  type: 'string', 
                  enum: ['FI', 'CO', 'MM', 'SD', 'PP', 'HR', 'QM', 'PM'],
                  description: 'SAP module (optional, will be auto-detected)'
                },
                bapi: { 
                  type: 'string', 
                  description: 'Direct BAPI name (optional, for advanced users)' 
                },
                parameters: { 
                  type: 'object', 
                  description: 'BAPI parameters (if using direct BAPI call)' 
                }
              },
              required: ['intent']
            }
          },
          {
            name: 'query_salesforce',
            description: 'Query Salesforce CRM. Supports SOQL queries or natural language.',
            inputSchema: {
              type: 'object' as const,
              properties: {
                soql: { 
                  type: 'string', 
                  description: 'SOQL query string' 
                },
                natural_language: { 
                  type: 'string', 
                  description: 'Describe what you want in plain English' 
                },
                object_type: {
                  type: 'string',
                  enum: ['Account', 'Contact', 'Opportunity', 'Lead', 'Case', 'Custom'],
                  description: 'Salesforce object type'
                }
              }
            }
          },
          {
            name: 'query_epic',
            description: 'Query Epic EHR via FHIR R4 API. HIPAA compliant with automatic PHI redaction.',
            inputSchema: {
              type: 'object' as const,
              properties: {
                resource_type: {
                  type: 'string',
                  enum: ['Patient', 'Observation', 'Condition', 'MedicationRequest', 
                         'Encounter', 'DiagnosticReport', 'Procedure', 'AllergyIntolerance',
                         'Immunization', 'CarePlan'],
                  description: 'FHIR resource type to query'
                },
                search_params: { 
                  type: 'object',
                  description: 'FHIR search parameters as key-value pairs'
                },
                redact_phi: { 
                  type: 'boolean', 
                  default: true,
                  description: 'Whether to redact PHI fields (default: true)'
                }
              },
              required: ['resource_type']
            }
          },
          {
            name: 'query_servicenow',
            description: 'Query ServiceNow ITSM for incidents, changes, problems, and more.',
            inputSchema: {
              type: 'object' as const,
              properties: {
                table: { 
                  type: 'string',
                  enum: ['incident', 'change_request', 'problem', 'kb_knowledge', 'cmdb_ci'],
                  description: 'ServiceNow table to query'
                },
                query: { 
                  type: 'string', 
                  description: 'Encoded query string or natural language' 
                },
                limit: { 
                  type: 'number', 
                  default: 10 
                }
              },
              required: ['table']
            }
          },
          {
            name: 'query_jira',
            description: 'Query Jira for issues, projects, and boards using JQL or natural language.',
            inputSchema: {
              type: 'object' as const,
              properties: {
                jql: { 
                  type: 'string', 
                  description: 'JQL query' 
                },
                natural_language: { 
                  type: 'string', 
                  description: 'Describe what you want to find' 
                },
                project: { type: 'string' }
              }
            }
          },

          // ============================================================
          // GOVERNANCE & ANALYTICS TOOLS
          // ============================================================
          {
            name: 'get_usage_stats',
            description: 'Get usage statistics including API calls, token usage, and costs.',
            inputSchema: {
              type: 'object' as const,
              properties: {
                period: { 
                  type: 'string', 
                  enum: ['today', 'week', 'month', 'year'],
                  default: 'month'
                },
                group_by: {
                  type: 'string',
                  enum: ['model', 'user', 'system', 'day'],
                  description: 'How to group the statistics'
                }
              }
            }
          },
          {
            name: 'get_cost_estimate',
            description: 'Estimate the cost of a planned operation before executing it.',
            inputSchema: {
              type: 'object' as const,
              properties: {
                operation: { type: 'string' },
                parameters: { type: 'object' }
              },
              required: ['operation']
            }
          },
          {
            name: 'get_audit_log',
            description: 'Retrieve audit logs for compliance and debugging.',
            inputSchema: {
              type: 'object' as const,
              properties: {
                start_date: { type: 'string', format: 'date-time' },
                end_date: { type: 'string', format: 'date-time' },
                user_id: { type: 'string' },
                action: { type: 'string' }
              }
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      // Extract metadata from request
      const userId = (request.params as any)._meta?.userId ?? 'anonymous';
      const licenseKey = (request.params as any)._meta?.licenseKey;

      logger.info({ tool: name, userId }, 'Tool call received');

      // Governance: Validate license (skip in development)
      if (process.env.NODE_ENV === 'production' && licenseKey) {
        const licenseResult = await this.governance.validateLicense(licenseKey);
        if (!licenseResult.valid) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `License validation failed: ${licenseResult.error}`
          );
        }
      }

      // Governance: Check rate limits
      const rateLimitOk = await this.governance.checkRateLimit(userId);
      if (!rateLimitOk) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Rate limit exceeded. Please try again later.'
        );
      }

      // Start audit trail
      const auditId = await this.governance.startAudit(userId, name, args as Record<string, unknown>);

      try {
        let result: unknown;

        switch (name) {
          // AI Tools
          case 'query_ai':
            result = await this.aiRouter.query(
              (args as { prompt: string }).prompt,
              (args as { model?: string }).model,
              (args as { requirements?: Record<string, unknown> }).requirements,
              (args as { system_prompt?: string }).system_prompt
            );
            break;

          case 'list_ai_models':
            result = await this.aiRouter.listModels(
              (args as { filter?: Record<string, unknown> }).filter
            );
            break;

          case 'compare_models':
            result = await this.aiRouter.compareModels(
              (args as { prompt: string }).prompt,
              (args as { models: string[] }).models
            );
            break;

          // Database Tools
          case 'query_database':
            result = await this.databaseAggregator.query(
              (args as { database_id: string }).database_id,
              (args as { query?: string }).query ?? '',
              (args as { natural_language?: string }).natural_language
            );
            break;

          case 'list_databases':
            result = await this.databaseAggregator.listDatabases();
            break;

          case 'get_database_schema':
            result = await this.databaseAggregator.getSchema(
              (args as { database_id: string }).database_id
            );
            break;

          // Enterprise Tools
          case 'query_sap':
            result = await this.enterpriseAggregator.querySAP(args as Record<string, unknown>);
            break;

          case 'query_salesforce':
            result = await this.enterpriseAggregator.querySalesforce(args as Record<string, unknown>);
            break;

          case 'query_epic':
            result = await this.enterpriseAggregator.queryEpic(args as Record<string, unknown>);
            break;

          case 'query_servicenow':
            result = await this.enterpriseAggregator.queryServiceNow(args as Record<string, unknown>);
            break;

          case 'query_jira':
            result = await this.enterpriseAggregator.queryJira(args as Record<string, unknown>);
            break;

          // Governance Tools
          case 'get_usage_stats':
            result = await this.governance.getUsageStats(
              userId,
              (args as { period?: string }).period ?? 'month'
            );
            break;

          case 'get_cost_estimate':
            result = await this.governance.estimateCost(
              (args as { operation: string }).operation,
              (args as { parameters?: Record<string, unknown> }).parameters
            );
            break;

          case 'get_audit_log':
            result = await this.governance.getAuditLog(args as Record<string, unknown>);
            break;

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }

        // Track cost and complete audit
        const cost = await this.governance.trackCost(userId, name, result);
        await this.governance.completeAudit(auditId, result, cost);

        logger.info({ tool: name, userId, cost }, 'Tool call completed');

        return {
          content: [
            {
              type: 'text' as const,
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }
          ]
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await this.governance.failAudit(auditId, errorMessage);
        logger.error({ tool: name, userId, error: errorMessage }, 'Tool call failed');
        throw error;
      }
    });
  }

  private setupResourceHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'velanova://models',
            name: 'AI Models Registry',
            description: 'Complete list of all 67+ AI models with pricing, capabilities, and status',
            mimeType: 'application/json'
          },
          {
            uri: 'velanova://databases',
            name: 'Connected Databases',
            description: 'All connected database systems and their schemas',
            mimeType: 'application/json'
          },
          {
            uri: 'velanova://enterprise-systems',
            name: 'Enterprise Systems',
            description: 'Connected enterprise systems (SAP, Salesforce, Epic, ServiceNow, etc.)',
            mimeType: 'application/json'
          },
          {
            uri: 'velanova://usage/current',
            name: 'Current Usage',
            description: 'Real-time usage statistics and costs',
            mimeType: 'application/json'
          },
          {
            uri: 'velanova://health',
            name: 'System Health',
            description: 'Health status of all connected systems',
            mimeType: 'application/json'
          }
        ]
      };
    });

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      let content: unknown;

      switch (uri) {
        case 'velanova://models':
          content = await this.aiRouter.listModels();
          break;

        case 'velanova://databases':
          content = await this.databaseAggregator.listDatabases();
          break;

        case 'velanova://enterprise-systems':
          content = await this.enterpriseAggregator.listSystems();
          break;

        case 'velanova://usage/current':
          content = await this.governance.getUsageStats('system', 'month');
          break;

        case 'velanova://health':
          content = await this.getHealthStatus();
          break;

        default:
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Unknown resource: ${uri}`
          );
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(content, null, 2)
          }
        ]
      };
    });
  }

  private setupErrorHandler() {
    this.server.onerror = (error) => {
      logger.error({ error }, 'MCP Server error');
    };
  }

  private async getHealthStatus(): Promise<Record<string, unknown>> {
    return {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      components: {
        ai_router: await this.aiRouter.healthCheck(),
        databases: await this.databaseAggregator.healthCheck(),
        enterprise: await this.enterpriseAggregator.healthCheck(),
        governance: await this.governance.healthCheck()
      }
    };
  }

  async runStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Velanova MCP Server running on STDIO');
  }

  async close(): Promise<void> {
    await this.server.close();
    logger.info('Velanova MCP Server closed');
  }
}

// Main entry point
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const server = new VelanovaMCPServer();

  // Handle shutdown
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.close();
    process.exit(0);
  });

  // Start server based on transport type
  if (args.transport === 'sse') {
    // TODO: Implement SSE transport for HTTP connections
    logger.error('SSE transport not yet implemented, falling back to STDIO');
    await server.runStdio();
  } else {
    await server.runStdio();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { VelanovaMCPServer };
