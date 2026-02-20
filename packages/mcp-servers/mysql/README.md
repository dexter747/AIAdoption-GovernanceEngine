# MySQL MCP Server

Model Context Protocol server for MySQL databases.

## Installation

```bash
cd packages/mcp-servers/mysql
pnpm install
pnpm build
```

## Usage

### Environment Variables

```bash
# Option 1: Connection string
MYSQL_CONNECTION_STRING=mysql://user:password@localhost:3306/database

# Option 2: Individual parameters
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_DATABASE=mydb
MYSQL_SSL=false
```

### Run

```bash
node dist/index.js
```

### In Velanova Desktop App

The desktop app will spawn this MCP server as a child process when a MySQL connection is activated.

## Available Tools

### query
Execute a SQL query
```json
{
  "name": "query",
  "arguments": {
    "sql": "SELECT * FROM users LIMIT 10"
  }
}
```

### list_tables
List all tables in the current database
```json
{
  "name": "list_tables",
  "arguments": {}
}
```

### describe_table
Get the schema of a specific table
```json
{
  "name": "describe_table",
  "arguments": {
    "table": "users"
  }
}
```

### show_databases
List all databases
```json
{
  "name": "show_databases",
  "arguments": {}
}
```
