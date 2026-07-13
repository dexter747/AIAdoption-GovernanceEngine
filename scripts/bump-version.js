#!/usr/bin/env node

/**
 * Velanova Version Bump Script
 *
 * Bumps the desktop app version and syncs it everywhere it's referenced.
 *
 * Usage:
 *   node scripts/bump-version.js --patch   # 1.0.0 → 1.0.1
 *   node scripts/bump-version.js --minor   # 1.0.0 → 1.1.0
 *   node scripts/bump-version.js --major   # 1.0.0 → 2.0.0
 *   node scripts/bump-version.js --to 1.2.3  # set exact version
 *
 * Files updated:
 *   - apps/desktop-app/package.json        (source of truth)
 *   - apps/landing-site/src/app/download/page.tsx  (currentVersion const)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

function bumpSemver(version, type) {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid semver: ${version}`);
  }
  switch (type) {
    case 'major':
      return `${parts[0] + 1}.0.0`;
    case 'minor':
      return `${parts[0]}.${parts[1] + 1}.0`;
    case 'patch':
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    default:
      throw new Error(`Unknown bump type: ${type}`);
  }
}

function updateJsonVersion(filePath, newVersion) {
  const raw = readFileSync(filePath, 'utf-8');
  const json = JSON.parse(raw);
  const old = json.version;
  json.version = newVersion;
  // Preserve formatting: keep same indent as original
  const indent = raw.match(/^(\s+)"name"/m)?.[1] ?? '  ';
  writeFileSync(filePath, JSON.stringify(json, null, indent.length) + '\n');
  return old;
}

function updateLandingPage(filePath, newVersion) {
  let src = readFileSync(filePath, 'utf-8');
  // Match: const currentVersion = '1.2.3';
  const match = src.match(/const currentVersion = '([^']+)'/);
  if (!match) {
    console.warn(`  ⚠️  Could not find currentVersion in ${filePath} — skipping`);
    return match?.[1] ?? '?';
  }
  const old = match[1];
  src = src.replace(/const currentVersion = '[^']+'/, `const currentVersion = '${newVersion}'`);
  writeFileSync(filePath, src);
  return old;
}

async function main() {
  const args = process.argv.slice(2);

  let bumpType = null;
  let exactVersion = null;

  for (let i = 0; i < args.length; i++) {
    if (['--patch', '--minor', '--major'].includes(args[i])) {
      bumpType = args[i].replace('--', '');
    } else if (args[i] === '--to' && args[i + 1]) {
      exactVersion = args[i + 1];
      i++;
    }
  }

  if (!bumpType && !exactVersion) {
    console.error('Usage: node scripts/bump-version.js [--patch|--minor|--major|--to x.y.z]');
    process.exit(1);
  }

  // --- Read current version from desktop app package.json ---
  const desktopPkgPath = join(ROOT_DIR, 'apps', 'desktop-app', 'package.json');
  const currentVersion = JSON.parse(readFileSync(desktopPkgPath, 'utf-8')).version;
  const newVersion = exactVersion ?? bumpSemver(currentVersion, bumpType);

  console.log(`\n🔖 Bumping version: ${currentVersion} → ${newVersion}\n`);

  // --- 1. desktop-app/package.json ---
  updateJsonVersion(desktopPkgPath, newVersion);
  console.log(`   ✅ apps/desktop-app/package.json       ${currentVersion} → ${newVersion}`);

  // --- 2. landing-site download page ---
  const landingPagePath = join(
    ROOT_DIR,
    'apps',
    'landing-site',
    'src',
    'app',
    'download',
    'page.tsx'
  );
  const oldLanding = updateLandingPage(landingPagePath, newVersion);
  console.log(`   ✅ apps/landing-site/.../download/page.tsx  ${oldLanding} → ${newVersion}`);

  console.log(`\n✨ Version is now ${newVersion}  (tag will be v${newVersion})\n`);
  // Print the new version to stdout for use in shell pipelines
  process.stdout.write(newVersion);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
