# AI Nexus - Comprehensive Test Suite

## Overview

This directory contains comprehensive unit and integration tests for the AI Adoption & Governance Engine, covering all major components including Express API, Desktop App, Admin Dashboard, and Landing Site.

## Test Structure

```
tests/
├── setup.ts                          # Global test setup and custom matchers
├── jest.config.json                  # Jest configuration
├── package.json                      # Test dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
│
├── express-api/                      # Express API tests
│   ├── services.test.ts              # Encryption, license, validation tests
│   ├── middleware.test.ts            # Security, auth, validation middleware
│   └── routes.test.ts                # API endpoint tests
│
├── desktop-app/                      # Desktop app tests
│   ├── contexts.test.tsx             # AuthContext, LicenseContext tests
│   ├── hooks.test.ts                 # useAsync, useMutation, useFetch tests
│   └── components.test.tsx           # UI component tests
│
├── admin-dashboard/                  # Admin dashboard tests
│   └── licenses-api.test.ts          # License management API tests
│
├── landing-site/                     # Landing site tests
│   └── payments-api.test.ts          # Payment/checkout API tests
│
└── integration/                      # Integration tests
    └── flows.test.ts                 # End-to-end flow tests
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

### Run Specific Test Suites

```bash
# Express API tests only
pnpm test:express

# Desktop app tests only
pnpm test:desktop

# Admin dashboard tests only
pnpm test:admin

# Landing site tests only
pnpm test:landing

# Unit tests only
pnpm test:unit

# Integration tests only
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

### CI Mode

```bash
pnpm test:ci
```

## Test Categories

### Unit Tests

Located in `*/services.test.ts`, `*/middleware.test.ts`, `*/contexts.test.tsx`, `*/hooks.test.ts`, `*/components.test.tsx`

#### Services Tests (`express-api/services.test.ts`)
- **EncryptionService**: `encrypt()`, `decrypt()`, `hashKey()`, `getKeyPreview()`
- **LicenseService**: `validate()`, `getTierFeatures()`
- **ApiError**: Factory methods for all HTTP error types
- **Validation Schemas**: UUID, pagination, licenseKey, aiQuery, userApiKey, userConnection

#### Middleware Tests (`express-api/middleware.test.ts`)
- **Security Middleware**: Request sanitization, payload limits, rate limiting, CSRF
- **Validation Middleware**: `validateBody()`, `validateQuery()`, `validateParams()`
- **Auth Middleware**: JWT validation, API key validation
- **Error Handlers**: Zod errors, JSON parse errors

#### Context Tests (`desktop-app/contexts.test.tsx`)
- **AuthContext**: User management, login/logout, authentication state
- **LicenseContext**: License validation, activation, tier features, expiration

#### Hooks Tests (`desktop-app/hooks.test.ts`)
- **useAsync**: Async state management, success/error handling, toast notifications
- **useFormSubmit**: Form submission with async operations
- **useFetch**: Data fetching with loading states
- **useMutation**: CRUD operations with callbacks

#### Component Tests (`desktop-app/components.test.tsx`)
- **Loading Components**: LoadingSpinner, LoadingOverlay, LoadingSkeleton, LoadingCard, LoadingTable
- **Error Components**: ErrorBoundary, ErrorDisplay, ErrorCard, EmptyState
- **Toast Components**: ToastProvider, useToast hook, notification types

### API Route Tests

Located in `*/routes.test.ts`, `*-api.test.ts`

#### Express API Routes (`express-api/routes.test.ts`)
- **Health Routes**: `/health`, `/ready` endpoints
- **License Routes**: Validate, activate, deactivate, features
- **User API Keys Routes**: CRUD operations, provider listing, key testing
- **User Connections Routes**: Database connections, MCP integration
- **AI Routes**: Query handling, provider listing
- **Usage Routes**: Statistics, logging

#### Admin Dashboard API (`admin-dashboard/licenses-api.test.ts`)
- **GET /api/licenses**: Pagination, filtering, search, statistics
- **POST /api/licenses**: License creation, key generation
- **License Operations**: Revoke, extend, upgrade, transfer

#### Landing Site API (`landing-site/payments-api.test.ts`)
- **Plan Prices**: Configuration, formatting
- **Checkout Creation**: Session generation, Dodo Payments integration
- **Webhooks**: Signature verification, event handling
- **Billing Cycles**: Monthly/yearly expiration calculation

### Integration Tests

Located in `integration/flows.test.ts`

- **User Registration & Payment Flow**: Complete purchase journey from registration to license
- **License Activation Flow**: Desktop app activation with machine management
- **API Key Management Flow**: BYOK setup, encryption, testing, usage
- **MCP Connection Flow**: Database connection, MCP server, AI queries
- **Admin Dashboard Flow**: License and user management workflows
- **Error Recovery Flows**: Payment failures, expired licenses, network issues
- **Concurrent Operations**: Race conditions, operation queuing

## Custom Jest Matchers

The test suite includes custom matchers defined in `setup.ts`:

```typescript
// Check if value is within a numeric range
expect(value).toBeWithinRange(min, max);

// Check if string is a valid UUID
expect(value).toBeValidUUID();

// Check if string is a valid JWT format
expect(value).toBeValidJWT();
```

## Coverage Thresholds

The test suite enforces minimum coverage thresholds:

| Metric | Threshold |
|--------|-----------|
| Branches | 50% |
| Functions | 50% |
| Lines | 50% |
| Statements | 50% |

## Test Files Summary

| File | Approx Tests | Description |
|------|--------------|-------------|
| `express-api/services.test.ts` | ~100 | Encryption, license validation, schemas |
| `express-api/middleware.test.ts` | ~80 | Security, auth, validation middleware |
| `express-api/routes.test.ts` | ~90 | Express API endpoints |
| `desktop-app/contexts.test.tsx` | ~60 | Auth and License React contexts |
| `desktop-app/hooks.test.ts` | ~70 | Custom React hooks |
| `desktop-app/components.test.tsx` | ~80 | UI components |
| `admin-dashboard/licenses-api.test.ts` | ~70 | Admin license management |
| `landing-site/payments-api.test.ts` | ~80 | Payment processing |
| `integration/flows.test.ts` | ~60 | End-to-end flows |

**Total: ~700+ test cases**

## Adding New Tests

1. Create test file in the appropriate directory
2. Follow naming convention: `*.test.ts` or `*.test.tsx`
3. Use Jest globals: `describe`, `it`, `expect`, `jest`
4. Mock external dependencies
5. Test both success and error cases

### Example Test

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('MyFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('myFunction', () => {
    it('should handle valid input', () => {
      const result = myFunction('valid');
      expect(result).toBe('expected');
    });

    it('should throw on invalid input', () => {
      expect(() => myFunction(null)).toThrow();
    });

    it('should return correct type', () => {
      const result = myFunction('test');
      expect(typeof result).toBe('string');
    });
  });
});
```

## Mocking Guidelines

### Mocking Supabase

```typescript
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
};
```

### Mocking Electron IPC

```typescript
const mockElectron = {
  auth: {
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    check: jest.fn().mockResolvedValue({ user: mockUser }),
  },
  license: {
    validate: jest.fn().mockResolvedValue({ valid: true }),
  },
};

(global as any).window = { electron: mockElectron };
```

### Mocking Fetch

```typescript
const mockFetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true, data: mockData }),
});

(global as any).fetch = mockFetch;
```

## Troubleshooting

### ESM Issues

If you encounter ESM-related errors, use the experimental VM modules flag:

```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js
```

### Type Errors

Ensure the following are installed and configured:
- `@types/jest` in devDependencies
- `@jest/globals` for proper typing
- `tsconfig.json` includes Jest types

### Timeout Issues

For slow tests, increase timeout in `jest.config.json`:

```json
{
  "testTimeout": 60000
}
```

### Module Resolution

If modules aren't resolving correctly, check:
- `moduleDirectories` in jest.config.json
- `moduleNameMapper` for path aliases
- TypeScript paths in tsconfig.json

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Tests
  working-directory: tests
  run: |
    pnpm install
    pnpm test:ci
  env:
    CI: true
```

### Test Artifacts

- Coverage reports are generated in `tests/coverage/`
- JUnit XML reports are generated for CI integration
- HTML coverage report available at `coverage/lcov-report/index.html`
