/**
 * Integration Tests: All 7 Use Case Route Files
 *
 * Validates route structure, middleware usage, exports,
 * and endpoint registration for each route module.
 */

import { jest } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const ROUTES_DIR = path.join(ROOT, 'apps', 'express-api', 'src', 'routes');
const SERVICES_DIR = path.join(ROOT, 'apps', 'express-api', 'src', 'services');
const APP_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'app.js');

// ─── Route Files ───

const routeFiles = [
  { file: 'bi-queries.js', apiPrefix: '/api/bi', service: 'nl-to-sql-service.js', endpoints: ['POST /generate-sql', 'POST /summarize', 'POST /suggest-chart', 'GET /saved', 'POST /saved', 'PATCH /saved/:id/favorite', 'DELETE /saved/:id', 'GET /history', 'GET /history/stats'] },
  { file: 'project-intel.js', apiPrefix: '/api/projects', service: 'project-intel-service.js', endpoints: ['GET /projects', 'POST /projects', 'PATCH /projects/:id', 'DELETE /projects/:id', 'GET /projects/:id/tasks', 'POST /projects/:id/tasks', 'POST /projects/:id/analyze-health', 'POST /projects/:id/detect-risks'] },
  { file: 'resources.js', apiPrefix: '/api/resources', service: 'resource-service.js', endpoints: ['GET /', 'POST /', 'PATCH /:id', 'DELETE /:id', 'GET /allocations', 'POST /allocations', 'GET /utilization', 'POST /optimize'] },
  { file: 'regulatory.js', apiPrefix: '/api/regulatory', service: 'regulatory-service.js', endpoints: ['GET /sources', 'POST /sources', 'GET /changes', 'POST /changes', 'POST /changes/:id/analyze', 'POST /scan'] },
  { file: 'procurement.js', apiPrefix: '/api/procurement', service: 'procurement-service.js', endpoints: ['GET /contracts', 'POST /contracts', 'PATCH /contracts/:id', 'DELETE /contracts/:id', 'GET /contracts/:id/clauses', 'POST /contracts/:id/analyze', 'GET /contracts/:id/reviews', 'GET /dashboard'] },
  { file: 'kyc.js', apiPrefix: '/api/kyc', service: 'kyc-service.js', endpoints: ['GET /clients', 'POST /clients', 'PATCH /clients/:id', 'DELETE /clients/:id', 'GET /clients/:id/checks', 'POST /clients/:id/checks', 'POST /clients/:id/assess-risk', 'GET /clients/:id/documents', 'POST /clients/:id/documents', 'GET /clients/:id/workflows', 'POST /clients/:id/workflows', 'POST /workflows/:id/advance', 'GET /dashboard'] },
  { file: 'fraud-detection.js', apiPrefix: '/api/fraud', service: 'fraud-detection-service.js', endpoints: ['GET /transactions', 'POST /transactions', 'PATCH /transactions/:id', 'POST /transactions/:id/analyze', 'POST /detect-patterns', 'GET /alerts', 'PATCH /alerts/:id', 'GET /patterns', 'POST /patterns', 'PATCH /patterns/:id/toggle', 'GET /investigations', 'POST /investigations', 'PATCH /investigations/:id', 'GET /dashboard'] },
];

describe('Route files exist and have correct structure', () => {
  routeFiles.forEach(({ file, service, endpoints }) => {
    describe(`${file}`, () => {
      let content: string;

      beforeAll(() => {
        content = fs.readFileSync(path.join(ROUTES_DIR, file), 'utf-8');
      });

      test('file exists', () => {
        expect(fs.existsSync(path.join(ROUTES_DIR, file))).toBe(true);
      });

      test('imports Router from express', () => {
        expect(content).toMatch(/import\s+\{.*Router.*\}\s+from\s+['"]express['"]/);
      });

      test('imports validateJwt middleware', () => {
        expect(content).toMatch(/validateJwt/);
      });

      test('imports its service module', () => {
        expect(content).toContain(service.replace('.js', ''));
      });

      test('uses zod for validation', () => {
        expect(content).toMatch(/import\s+\{.*z.*\}\s+from\s+['"]zod['"]/);
      });

      test('applies validateJwt middleware', () => {
        // Some routes use router.use(validateJwt), others apply validateJwt per-route
        const usesGlobalMiddleware = /router\.use\s*\(\s*validateJwt\s*\)/.test(content);
        const usesPerRouteMiddleware = /router\.(get|post|patch|delete|put)\s*\([^)]*validateJwt/.test(content);
        expect(usesGlobalMiddleware || usesPerRouteMiddleware).toBe(true);
      });

      test('exports router as default', () => {
        expect(content).toMatch(/export\s+default\s+router/);
      });

      endpoints.forEach(endpoint => {
        const [method, routePath] = endpoint.split(' ');
        const httpMethod = method.toLowerCase();
        // Normalize route path for regex - escape special chars and handle params  
        const routeRegex = routePath.replace(/:[a-zA-Z]+/g, ':[a-zA-Z]+').replace(/\//g, '\\/');

        test(`registers ${endpoint}`, () => {
          expect(content).toMatch(new RegExp(`router\\.${httpMethod}\\s*\\(\\s*['"]${routeRegex}`));
        });
      });
    });
  });
});

describe('Service files exist and export classes', () => {
  const serviceFiles = [
    'nl-to-sql-service.js',
    'project-intel-service.js',
    'resource-service.js',
    'regulatory-service.js',
    'procurement-service.js',
    'kyc-service.js',
    'fraud-detection-service.js',
  ];

  serviceFiles.forEach(file => {
    test(`${file} exists`, () => {
      expect(fs.existsSync(path.join(SERVICES_DIR, file))).toBe(true);
    });

    test(`${file} exports service`, () => {
      const content = fs.readFileSync(path.join(SERVICES_DIR, file), 'utf-8');
      // Some services use "export default", others use "export const ServiceName = {}"
      expect(content).toMatch(/export\s+(default|const\s+\w+Service)/);
    });

    test(`${file} imports supabase`, () => {
      const content = fs.readFileSync(path.join(SERVICES_DIR, file), 'utf-8');
      expect(content).toMatch(/supabase/);
    });

    test(`${file} imports AIService`, () => {
      const content = fs.readFileSync(path.join(SERVICES_DIR, file), 'utf-8');
      expect(content).toMatch(/AIService|ai-service/);
    });
  });
});

describe('app.js route registration', () => {
  let appContent: string;

  beforeAll(() => {
    appContent = fs.readFileSync(APP_PATH, 'utf-8');
  });

  const registrations = [
    { import: 'bi-queries', mount: '/api/bi' },
    { import: 'project-intel', mount: '/api/projects' },
    { import: 'resources', mount: '/api/resources' },
    { import: 'regulatory', mount: '/api/regulatory' },
    { import: 'procurement', mount: '/api/procurement' },
    { import: 'kyc', mount: '/api/kyc' },
    { import: 'fraud-detection', mount: '/api/fraud' },
  ];

  registrations.forEach(({ import: imp, mount }) => {
    test(`imports ${imp} route`, () => {
      expect(appContent).toContain(imp);
    });

    test(`mounts ${imp} at ${mount}`, () => {
      expect(appContent).toContain(mount);
    });
  });

  test('all 7 use case routes are registered', () => {
    const routeMounts = appContent.match(/app\.use\(['"]\/api\//g);
    // At least 7 new + existing routes
    expect(routeMounts!.length).toBeGreaterThanOrEqual(7);
  });
});

describe('Database migration files exist', () => {
  const migrations = [
    'migration-bi.sql',
    'migration-projects.sql',
    'migration-resources.sql',
    'migration-regulatory.sql',
    'migration-procurement.sql',
    'migration-kyc.sql',
    'migration-fraud.sql',
  ];

  const DB_DIR = path.join(ROOT, 'database');

  migrations.forEach(file => {
    describe(file, () => {
      let content: string;

      beforeAll(() => {
        content = fs.readFileSync(path.join(DB_DIR, file), 'utf-8');
      });

      test('file exists', () => {
        expect(fs.existsSync(path.join(DB_DIR, file))).toBe(true);
      });

      test('creates tables with IF NOT EXISTS', () => {
        expect(content).toMatch(/CREATE TABLE IF NOT EXISTS/);
      });

      test('enables RLS', () => {
        expect(content).toMatch(/ENABLE ROW LEVEL SECURITY/);
      });

      test('creates user policies', () => {
        expect(content).toMatch(/CREATE POLICY/);
      });

      test('has service role bypass policies', () => {
        expect(content).toMatch(/service/i);
      });

      test('references user_id FK', () => {
        expect(content).toMatch(/user_id\s+UUID.*REFERENCES\s+(auth|public)\.users/);
      });

      test('has updated_at trigger', () => {
        expect(content).toMatch(/set_updated_at/);
      });

      test('creates indexes', () => {
        expect(content).toMatch(/CREATE INDEX/);
      });
    });
  });
});

describe('Frontend pages exist', () => {
  const PAGES_DIR = path.join(ROOT, 'apps', 'desktop-app', 'src', 'renderer', 'pages');
  const pages = [
    'BusinessIntelPage.tsx',
    'ProjectIntelPage.tsx',
    'ResourcePlanningPage.tsx',
    'RegulatoryIntelPage.tsx',
    'ProcurementPage.tsx',
    'KYCDashboardPage.tsx',
    'FraudDetectionPage.tsx',
  ];

  pages.forEach(page => {
    describe(page, () => {
      let content: string;

      beforeAll(() => {
        content = fs.readFileSync(path.join(PAGES_DIR, page), 'utf-8');
      });

      test('file exists', () => {
        expect(fs.existsSync(path.join(PAGES_DIR, page))).toBe(true);
      });

      test('exports a default component', () => {
        expect(content).toMatch(/export\s+default\s+function/);
      });

      test('uses Recharts for data visualization', () => {
        expect(content).toMatch(/recharts/);
      });

      test('uses lucide-react icons', () => {
        expect(content).toMatch(/lucide-react/);
      });

      test('uses cn() utility', () => {
        expect(content).toMatch(/cn\(/);
      });

      test('has loading state', () => {
        expect(content).toMatch(/Loader2|loading/);
      });

      test('has API helper function or fetch calls', () => {
        // Some pages use a const api = helper, others make inline fetch calls
        const hasApiHelper = /const\s+api\s*=/.test(content);
        const hasInlineFetch = /fetch\s*\(\s*['"]\/?api\//.test(content);
        expect(hasApiHelper || hasInlineFetch).toBe(true);
      });

      test('uses auth token', () => {
        expect(content).toMatch(/localStorage.*token|Authorization.*Bearer/);
      });
    });
  });
});

describe('App.tsx route registration', () => {
  const appTsxPath = path.join(ROOT, 'apps', 'desktop-app', 'src', 'renderer', 'App.tsx');
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(appTsxPath, 'utf-8');
  });

  const routes = [
    { path: '/business-intel', component: 'BusinessIntelPage' },
    { path: '/project-intel', component: 'ProjectIntelPage' },
    { path: '/resource-planning', component: 'ResourcePlanningPage' },
    { path: '/regulatory-intel', component: 'RegulatoryIntelPage' },
    { path: '/procurement', component: 'ProcurementPage' },
    { path: '/kyc', component: 'KYCDashboardPage' },
    { path: '/fraud-detection', component: 'FraudDetectionPage' },
  ];

  routes.forEach(({ path: routePath, component }) => {
    test(`lazy imports ${component}`, () => {
      expect(content).toContain(component);
    });

    test(`registers route ${routePath}`, () => {
      expect(content).toContain(routePath);
    });
  });
});

describe('Sidebar navigation', () => {
  const sidebarPath = path.join(ROOT, 'apps', 'desktop-app', 'src', 'renderer', 'components', 'Sidebar.tsx');
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(sidebarPath, 'utf-8');
  });

  test('has Solutions section', () => {
    expect(content).toMatch(/[Ss]olutions/);
  });

  const navItems = [
    { label: 'Business Intel', path: '/business-intel' },
    { label: 'Project Intel', path: '/project-intel' },
    { label: 'Resources', path: '/resource-planning' },
    { label: 'Regulatory', path: '/regulatory-intel' },
    { label: 'Procurement', path: '/procurement' },
    { label: 'KYC', path: '/kyc' },
    { label: 'Fraud Detection', path: '/fraud-detection' },
  ];

  navItems.forEach(({ label, path: navPath }) => {
    test(`includes ${label} nav item`, () => {
      expect(content).toContain(navPath);
    });
  });
});
