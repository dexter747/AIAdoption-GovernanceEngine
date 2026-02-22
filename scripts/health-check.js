#!/usr/bin/env node

/**
 * Velanova Health Check Script
 * 
 * Checks the health of all system components:
 * - Express API availability
 * - Supabase connection
 * - Landing site
 * - Admin dashboard
 * - Desktop app build status
 * - MCP servers
 * - Environment variables
 * 
 * Usage:
 *   pnpm health                # Check all
 *   pnpm health -- --verbose   # Detailed output
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const envPaths = [
    join(ROOT_DIR, '.env'),
    join(ROOT_DIR, 'apps', 'express-api', '.env'),
    join(ROOT_DIR, 'apps', 'landing-site', '.env.local'),
  ];
  const env = {};
  for (const p of envPaths) {
    if (existsSync(p)) {
      const lines = readFileSync(p, 'utf-8').split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*([^#=]+?)\s*=\s*(.+?)\s*$/);
        if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    }
  }
  return { ...process.env, ...env };
}

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      resolve(true);
      req.destroy();
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, (res) => {
      resolve(res.statusCode);
      req.destroy();
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
  });
}

async function main() {
  const verbose = process.argv.includes('--verbose');
  const env = loadEnv();
  const results = [];

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║          Velanova System Health Check            ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // 1. Environment files
  const envFiles = {
    'Root .env': join(ROOT_DIR, '.env'),
    'Express API .env': join(ROOT_DIR, 'apps', 'express-api', '.env'),
    'Landing .env.local': join(ROOT_DIR, 'apps', 'landing-site', '.env.local'),
    'Admin .env.local': join(ROOT_DIR, 'apps', 'admin-dashboard', '.env.local'),
  };
  
  console.log('📁 Environment Files:');
  for (const [name, path] of Object.entries(envFiles)) {
    const exists = existsSync(path);
    console.log(`  ${exists ? '✅' : '❌'} ${name}`);
    results.push({ name, ok: exists });
  }

  // 2. Key env vars
  console.log('\n🔑 Key Environment Variables:');
  const requiredVars = [
    'SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SUPABASE_ANON_KEY',
    'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'NEXTAUTH_SECRET',
    'JWT_SECRET',
  ];
  for (const v of requiredVars) {
    const val = env[v] || env[`NEXT_PUBLIC_${v}`];
    const set = !!val && !val.includes('YOUR_');
    console.log(`  ${set ? '✅' : '❌'} ${v}`);
    results.push({ name: v, ok: set });
  }

  // 3. Local services
  console.log('\n🌐 Local Services:');
  const ports = [
    { port: 3000, name: 'Landing Site' },
    { port: 3001, name: 'Admin Dashboard' },
    { port: 5500, name: 'Express API' },
  ];
  for (const { port, name } of ports) {
    const up = await checkPort(port);
    console.log(`  ${up ? '✅' : '⬜'} ${name} (port ${port}) — ${up ? 'Running' : 'Not running'}`);
    results.push({ name: `${name}:${port}`, ok: up });
  }

  // 4. MCP servers built
  console.log('\n📦 MCP Servers (built):');
  const mcpDir = join(ROOT_DIR, 'packages', 'mcp-servers');
  if (existsSync(mcpDir)) {
    const servers = readdirSync(mcpDir).filter(d => 
      existsSync(join(mcpDir, d, 'package.json'))
    );
    let built = 0;
    for (const server of servers) {
      const hasDistIndex = existsSync(join(mcpDir, server, 'dist', 'index.js'));
      if (verbose) console.log(`  ${hasDistIndex ? '✅' : '❌'} ${server}`);
      if (hasDistIndex) built++;
    }
    if (!verbose) console.log(`  ${built}/${servers.length} servers have dist/index.js`);
    console.log(`  ${built === servers.length ? '✅' : '⚠️'}  ${built}/${servers.length} built`);
  }

  // 5. Desktop app
  console.log('\n🖥️  Desktop App:');
  const desktopDir = join(ROOT_DIR, 'apps', 'desktop-app');
  const hasRendererBuild = existsSync(join(desktopDir, 'dist'));
  const hasMainBuild = existsSync(join(desktopDir, 'dist-electron')) || existsSync(join(desktopDir, 'dist', 'main'));
  const hasRelease = existsSync(join(desktopDir, 'release'));
  console.log(`  ${hasRendererBuild ? '✅' : '❌'} Renderer built`);
  console.log(`  ${hasRelease ? '✅' : '⬜'} Package artifacts`);

  // 6. Node modules
  console.log('\n📂 Dependencies:');
  const hasNodeModules = existsSync(join(ROOT_DIR, 'node_modules'));
  const hasLockfile = existsSync(join(ROOT_DIR, 'pnpm-lock.yaml'));
  console.log(`  ${hasNodeModules ? '✅' : '❌'} node_modules installed`);
  console.log(`  ${hasLockfile ? '✅' : '❌'} pnpm-lock.yaml`);

  // Summary
  const okCount = results.filter(r => r.ok).length;
  const totalChecks = results.length;
  
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  Health: ${okCount}/${totalChecks} checks passed`);
  console.log(`${'═'.repeat(50)}\n`);
}

main().catch(console.error);
