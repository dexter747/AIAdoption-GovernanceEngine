# AI Nexus - Test Suite

## Overview

This directory contains comprehensive unit and integration tests for the AI Nexus platform.

## Test Structure

```
tests/
├── unit.test.ts          # Unit tests for individual components
├── integration.test.ts   # Integration tests for component interactions
├── package.json          # Test dependencies
├── jest.config.json      # Jest configuration
└── tsconfig.json         # TypeScript configuration
```

## Running Tests

### Install Dependencies

```bash
cd tests
pnpm install
```

### Run All Tests

```bash
pnpm test
```

### Run Unit Tests Only

```bash
pnpm test:unit
```

### Run Integration Tests Only

```bash
pnpm test:integration
```

### Watch Mode (for development)

```bash
pnpm test:watch
```

### Coverage Report

```bash
pnpm test:coverage
```

## Test Categories

### 1. MCP Server Tests

**Unit Tests:**
- Compilation checks for all 13 MCP servers
- Package structure validation
- TypeScript configuration validation
- Source code structure verification
- Tool definition validation

**Integration Tests:**
- Server startup and initialization
- Tool invocation and response handling
- Error handling
- Database connection tests (when available)

### 2. LLM Provider Tests

**Unit Tests:**
- Provider implementation validation
- Class export verification
- Method implementation checks
- Provider registry validation
- Default model configuration

**Integration Tests:**
- API availability checks
- Provider routing tests
- Model listing validation

### 3. Payment Integration Tests

**Unit Tests:**
- Dodo Payments client validation
- API endpoint existence checks
- Database schema validation
- Environment configuration validation

**Integration Tests:**
- Checkout flow tests
- Webhook endpoint tests
- Subscription management tests
- End-to-end workflow validation

### 4. Environment Configuration Tests

**Unit Tests:**
- PayPal/Razorpay removal verification
- Dodo Payments configuration validation
- Environment variable structure validation

## Test Coverage

The test suite covers:

- ✅ All 13 MCP servers (MySQL, MongoDB, SQL Server, Oracle, SAP HANA, Salesforce, ServiceNow, Jira, Redis, Elasticsearch, Zendesk, Workday, MariaDB)
- ✅ All 9 LLM providers (OpenAI, Anthropic, Google, Groq, Cohere, Mistral, Perplexity, DeepSeek, OpenRouter)
- ✅ Complete payment infrastructure (Dodo Payments)
- ✅ Database schema validation
- ✅ API endpoint availability
- ✅ Environment configuration

## Expected Results

### Unit Tests

All unit tests should pass without requiring external services:

```
✓ MCP Servers - Compilation (13 tests)
✓ MCP Servers - Package Structure (26 tests)
✓ MCP Servers - TypeScript Configuration (13 tests)
✓ MCP Servers - Source Code (52 tests)
✓ MCP Servers - Tool Definitions (13 tests)
✓ LLM Providers - Implementation (36 tests)
✓ LLM Providers - Registry (2 tests)
✓ Payment Integration - Client (4 tests)
✓ Payment Integration - Endpoints (3 tests)
✓ Payment Integration - Schema (3 tests)
✓ Environment Configuration (3 tests)
```

**Total: ~168 unit tests**

### Integration Tests

Integration tests may skip if external services aren't running:

```
✓ MCP Server Integration (3 tests)
✓ LLM Provider Integration (2 tests)
✓ Payment Flow Integration (3 tests)
✓ Database Schema Integration (2 tests)
✓ End-to-End Workflow (2 tests)
```

**Total: ~12 integration tests**

## Prerequisites for Integration Tests

### Optional Services (tests skip if not available):

1. **MySQL** - Port 3306
   ```bash
   docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql:8
   ```

2. **MongoDB** - Port 27017
   ```bash
   docker run -d -p 27017:27017 mongo:7
   ```

3. **Redis** - Port 6379
   ```bash
   docker run -d -p 6379:6379 redis:7
   ```

4. **Express API** - Port 4000
   ```bash
   cd apps/express-api && pnpm dev
   ```

5. **Cloud Backend** - Port 3001
   ```bash
   cd apps/cloud-backend && pnpm dev
   ```

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: cd tests && pnpm test
```

## Debugging Failed Tests

### View Detailed Output

```bash
pnpm test -- --verbose
```

### Run Specific Test

```bash
pnpm test -- -t "MySQL MCP Server"
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Contributing

When adding new features:

1. Add unit tests to `unit.test.ts`
2. Add integration tests to `integration.test.ts`
3. Ensure all tests pass: `pnpm test`
4. Check coverage: `pnpm test:coverage`

Target: **80%+ code coverage**

## Troubleshooting

### Issue: "Cannot find module"

```bash
cd tests && pnpm install
```

### Issue: "Tests timeout"

Increase timeout in `jest.config.json`:
```json
{
  "testTimeout": 60000
}
```

### Issue: "MCP server fails to start"

Check environment variables are set correctly.

### Issue: "API tests fail"

Ensure API servers are running on expected ports.

## License

MIT
