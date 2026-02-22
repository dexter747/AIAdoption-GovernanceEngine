# Velanova MCP Server

> The aggregation layer that unifies 67+ AI models and 60+ enterprise systems into a single MCP interface.

## Overview

The Velanova MCP Server exposes the full Velanova platform via the Model Context Protocol (MCP), allowing any MCP-compatible tool (Claude Desktop, Cursor, Windsurf, etc.) to leverage:

- **67+ AI Models**: GPT-4o, Claude, Gemini, Llama, Mistral, and more
- **Database Systems**: PostgreSQL, MySQL, MongoDB, SQL Server, Oracle, Redis
- **Enterprise Systems**: SAP S/4HANA, Salesforce, Epic FHIR, ServiceNow, Jira
- **Governance**: Licensing, audit logging, cost tracking, rate limiting

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### Docker

```bash
# Build the image
docker build -t velanova-mcp-server .

# Run the container
docker run -it --rm \
  -e OPENAI_API_KEY=sk-... \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  velanova-mcp-server
```

## Configuration

### Environment Variables

| Variable               | Description          | Required       |
| ---------------------- | -------------------- | -------------- |
| `OPENAI_API_KEY`       | OpenAI API key       | Optional       |
| `ANTHROPIC_API_KEY`    | Anthropic API key    | Optional       |
| `GOOGLE_AI_API_KEY`    | Google AI API key    | Optional       |
| `GROQ_API_KEY`         | Groq API key         | Optional       |
| `SUPABASE_URL`         | Supabase project URL | For governance |
| `SUPABASE_SERVICE_KEY` | Supabase service key | For governance |

### Using with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "velanova": {
      "command": "node",
      "args": ["/path/to/velanova-mcp-server/dist/server.js"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

### Using with Cursor

Add to your Cursor MCP config:

```json
{
  "mcpServers": {
    "velanova": {
      "command": "node",
      "args": ["/path/to/velanova-mcp-server/dist/server.js"]
    }
  }
}
```

## Available Tools

### AI Model Tools

| Tool             | Description                               |
| ---------------- | ----------------------------------------- |
| `query_ai`       | Query AI models with intelligent routing  |
| `list_ai_models` | List all available AI models with pricing |
| `compare_models` | Compare multiple models on a prompt       |

### Database Tools

| Tool                  | Description                  |
| --------------------- | ---------------------------- |
| `query_database`      | Query any connected database |
| `list_databases`      | List all connected databases |
| `get_database_schema` | Get schema information       |

### Enterprise Tools

| Tool               | Description           |
| ------------------ | --------------------- |
| `query_sap`        | Query SAP S/4HANA     |
| `query_salesforce` | Query Salesforce CRM  |
| `query_epic`       | Query Epic EHR (FHIR) |
| `query_servicenow` | Query ServiceNow ITSM |
| `query_jira`       | Query Jira issues     |

### Governance Tools

| Tool                | Description              |
| ------------------- | ------------------------ |
| `get_usage_stats`   | Get usage statistics     |
| `get_cost_estimate` | Estimate operation costs |
| `get_audit_log`     | Retrieve audit logs      |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Velanova MCP Server                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  AI Router  │  │  Database   │  │ Enterprise  │         │
│  │             │  │ Aggregator  │  │ Aggregator  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │            Governance Layer                     │         │
│  │  License │ Audit │ Cost Tracking │ Rate Limit  │         │
│  └────────────────────────────────────────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    MCP Protocol Layer                        │
│              (STDIO / SSE Transport)                         │
└─────────────────────────────────────────────────────────────┘
```

## License

MIT License - Velanova
