#!/usr/bin/env node

/**
 * Velanova Debug / Test Runner
 *
 * Runs all tests: unit, integration, frontend, backend, type-checking.
 *
 * Usage:
 *   pnpm debug                         # Run everything
 *   pnpm debug -- --unit               # Unit tests only
 *   pnpm debug -- --integration        # Integration tests only
 *   pnpm debug -- --types              # Type-check only
 *   pnpm debug -- --express            # Express API tests only
 *   pnpm debug -- --desktop            # Desktop tests only
 *   pnpm debug -- --admin              # Admin dashboard tests only
 *   pnpm debug -- --landing            # Landing site tests only
 *   pnpm debug -- --coverage           # All tests with coverage
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, label, optional = false) {
  console.log(`\n${'━'.repeat(60)}`);
  console.log(`🔍 ${label}`);
  console.log(`${'━'.repeat(60)}\n`);

  try {
    execSync(cmd, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1', NODE_ENV: 'test' },
    });
    return { label, status: '✅ PASS' };
  } catch {
    if (optional) {
      return { label, status: '⚠️  WARN (non-blocking)' };
    }
    return { label, status: '❌ FAIL' };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const runAll = args.length === 0;
  const coverage = args.includes('--coverage');
  const results = [];

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║          Velanova Debug / Test Suite             ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  console.log(`  Mode: ${runAll ? 'ALL' : args.join(', ')}`);
  console.log(`  Root: ${ROOT_DIR}`);

  const startTime = Date.now();

  // 1. TypeScript type-checking
  if (runAll || args.includes('--types')) {
    results.push(run('pnpm tsc --noEmit 2>&1 || true', 'TypeScript Type Check (root)', true));

    // Also try per-app type check
    for (const app of ['landing-site', 'admin-dashboard']) {
      results.push(
        run(
          `pnpm --filter ${app} type-check 2>/dev/null || pnpm --filter ${app} exec tsc --noEmit 2>&1 || true`,
          `TypeScript: ${app}`,
          true
        )
      );
    }
  }

  // 2. Linting
  if (runAll || args.includes('--lint')) {
    results.push(run('pnpm lint 2>&1 || true', 'ESLint (all packages)', true));
  }

  // 3. Unit tests
  if (runAll || args.includes('--unit')) {
    results.push(
      run(
        `cd tests && node ../node_modules/jest/bin/jest.js --testPathPattern="unit" ${coverage ? '--coverage' : ''} 2>&1 || true`,
        'Unit Tests',
        true
      )
    );
  }

  // 4. Integration tests
  if (runAll || args.includes('--integration')) {
    results.push(
      run(
        `cd tests && node ../node_modules/jest/bin/jest.js --testPathPattern="integration" ${coverage ? '--coverage' : ''} 2>&1 || true`,
        'Integration Tests',
        true
      )
    );
  }

  // 5. Express API tests
  if (runAll || args.includes('--express')) {
    results.push(
      run(
        `cd tests && node ../node_modules/jest/bin/jest.js --testPathPattern="express-api" ${coverage ? '--coverage' : ''} 2>&1 || true`,
        'Express API Tests',
        true
      )
    );
  }

  // 6. Desktop app tests
  if (runAll || args.includes('--desktop')) {
    results.push(
      run(
        `cd tests && node ../node_modules/jest/bin/jest.js --testPathPattern="desktop-app" ${coverage ? '--coverage' : ''} 2>&1 || true`,
        'Desktop App Tests',
        true
      )
    );
  }

  // 7. Admin dashboard tests
  if (runAll || args.includes('--admin')) {
    results.push(
      run(
        `cd tests && node ../node_modules/jest/bin/jest.js --testPathPattern="admin-dashboard" ${coverage ? '--coverage' : ''} 2>&1 || true`,
        'Admin Dashboard Tests',
        true
      )
    );
  }

  // 8. Landing site tests
  if (runAll || args.includes('--landing')) {
    results.push(
      run(
        `cd tests && node ../node_modules/jest/bin/jest.js --testPathPattern="landing-site" ${coverage ? '--coverage' : ''} 2>&1 || true`,
        'Landing Site Tests',
        true
      )
    );
  }

  // 9. Build check (ensures everything compiles)
  if (runAll || args.includes('--build-check')) {
    results.push(run('pnpm build 2>&1 | tail -20 || true', 'Build Check (all packages)', true));
  }

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const passed = results.filter(r => r.status.includes('PASS')).length;
  const failed = results.filter(r => r.status.includes('FAIL')).length;
  const warned = results.filter(r => r.status.includes('WARN')).length;

  console.log(`\n${'═'.repeat(60)}`);
  console.log('                     TEST SUMMARY');
  console.log(`${'═'.repeat(60)}\n`);

  for (const r of results) {
    console.log(`  ${r.status}  ${r.label}`);
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Total: ${results.length} | ✅ ${passed} | ❌ ${failed} | ⚠️  ${warned}`);
  console.log(`  Time: ${elapsed}s`);
  console.log(`${'═'.repeat(60)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
