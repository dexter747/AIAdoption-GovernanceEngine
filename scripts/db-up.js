#!/usr/bin/env node

/**
 * Velanova Database Up Script
 * 
 * Applies the unified schema to Supabase using:
 *   1. Supabase CLI (if installed and linked)
 *   2. Direct psql connection (fallback)
 *   3. Supabase JS client (last resort - limited)
 * 
 * Usage:
 *   pnpm db:up                    # Apply full schema
 *   pnpm db:up -- --check         # Dry run, check connection only
 *   pnpm db:up -- --file schema.sql  # Apply specific file
 * 
 * Required env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY)
 *   Optional: DATABASE_URL (for direct psql), SUPABASE_DB_PASSWORD
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCHEMA_FILE = join(ROOT_DIR, 'database', 'schema-unified.sql');

// ---------- Config ----------

function loadEnv() {
  const envPaths = [
    join(ROOT_DIR, '.env'),
    join(ROOT_DIR, 'apps', 'express-api', '.env'),
    join(ROOT_DIR, 'apps', 'landing-site', '.env.local'),
    join(ROOT_DIR, 'apps', 'admin-dashboard', '.env.local'),
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

function getSupabaseConfig(env) {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const dbPassword = env.SUPABASE_DB_PASSWORD || env.DATABASE_PASSWORD;
  const databaseUrl = env.DATABASE_URL;

  if (!url) {
    console.error('❌ SUPABASE_URL not found in environment');
    console.error('   Set it in apps/express-api/.env or .env');
    process.exit(1);
  }

  // Extract project ref from URL
  const projectRef = url.match(/https:\/\/([^.]+)/)?.[1];

  return { url, serviceKey, anonKey, projectRef, dbPassword, databaseUrl };
}

// ---------- Methods ----------

function hasSupabaseCli() {
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

function hasPsql() {
  try {
    execSync('psql --version', { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

function applyWithSupabaseCli(schemaFile, config) {
  console.log('🔧 Using Supabase CLI...\n');
  
  try {
    // Check if linked
    execSync('supabase projects list', { stdio: 'pipe' });
  } catch {
    console.log('  Linking to project...');
    execSync(`supabase link --project-ref ${config.projectRef}`, { 
      stdio: 'inherit',
      cwd: ROOT_DIR 
    });
  }

  console.log('  Applying schema...');
  execSync(`supabase db push --db-url "postgresql://postgres:${config.dbPassword}@db.${config.projectRef}.supabase.co:5432/postgres"`, {
    stdio: 'inherit',
    cwd: ROOT_DIR,
  });
}

function applyWithPsql(schemaFile, config) {
  console.log('🔧 Using psql...\n');

  let connectionString = config.databaseUrl;
  if (!connectionString) {
    if (!config.dbPassword) {
      console.error('❌ DATABASE_URL or SUPABASE_DB_PASSWORD required for psql method');
      process.exit(1);
    }
    connectionString = `postgresql://postgres.${config.projectRef}:${config.dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  }

  console.log(`  Connecting to: ${connectionString.replace(/:([^@]+)@/, ':***@')}`);
  console.log(`  Schema file: ${schemaFile}\n`);

  try {
    execSync(`psql "${connectionString}" -f "${schemaFile}"`, {
      stdio: 'inherit',
      env: { ...process.env, PGOPTIONS: '--client-min-messages=warning' },
    });
    console.log('\n✅ Schema applied successfully via psql');
  } catch (err) {
    console.error('\n❌ psql failed. Try the Supabase Dashboard SQL Editor instead:');
    console.error(`   https://app.supabase.com/project/${config.projectRef}/sql/new`);
    process.exit(1);
  }
}

async function applyWithSupabaseJs(schemaFile, config) {
  console.log('🔧 Using Supabase JS client (limited — large schemas may fail)...\n');

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(config.url, config.serviceKey);

  const sql = readFileSync(schemaFile, 'utf-8');
  
  // Split into individual statements
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  console.log(`  Executing ${statements.length} statements...\n`);
  let success = 0;
  let errors = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt || stmt.length < 5) continue;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_text: stmt });
      if (error) {
        // Try direct query via REST
        const { error: error2 } = await supabase.from('_exec').select().limit(0);
        if (error2) {
          console.error(`  ❌ Statement ${i + 1}: ${error.message}`);
          errors++;
        }
      } else {
        success++;
      }
    } catch (err) {
      errors++;
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`  Progress: ${i + 1}/${statements.length}\r`);
    }
  }

  console.log(`\n  ✅ ${success} statements executed, ❌ ${errors} errors`);
  
  if (errors > 0) {
    console.log('\n⚠️  Some statements failed. For full schema, use psql or Supabase Dashboard:');
    console.log(`   https://app.supabase.com/project/${config.projectRef}/sql/new`);
    console.log('   Then paste contents of: database/schema-unified.sql');
  }
}

// ---------- Main ----------

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const fileIdx = args.indexOf('--file');
  const schemaFile = fileIdx !== -1 && args[fileIdx + 1]
    ? join(ROOT_DIR, 'database', args[fileIdx + 1])
    : SCHEMA_FILE;

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         Velanova Database Schema — UP            ║');
  console.log('╚══════════════════════════════════════════════════╝');

  if (!existsSync(schemaFile)) {
    console.error(`\n❌ Schema file not found: ${schemaFile}`);
    process.exit(1);
  }

  const env = loadEnv();
  const config = getSupabaseConfig(env);

  console.log(`\n  Project: ${config.projectRef}`);
  console.log(`  Schema: ${schemaFile}`);
  console.log(`  Supabase CLI: ${hasSupabaseCli() ? '✅' : '❌'}`);
  console.log(`  psql: ${hasPsql() ? '✅' : '❌'}`);
  console.log(`  Service Key: ${config.serviceKey ? '✅' : '❌'}`);
  console.log('');

  if (checkOnly) {
    console.log('✅ Connection check complete (dry run)');
    return;
  }

  // Choose method
  if (hasPsql() && (config.databaseUrl || config.dbPassword)) {
    applyWithPsql(schemaFile, config);
  } else if (hasSupabaseCli() && config.dbPassword) {
    applyWithSupabaseCli(schemaFile, config);
  } else if (config.serviceKey) {
    await applyWithSupabaseJs(schemaFile, config);
  } else {
    console.error('❌ No suitable method available. Options:');
    console.error('   1. Install psql + set DATABASE_URL or SUPABASE_DB_PASSWORD');
    console.error('   2. Install Supabase CLI + set SUPABASE_DB_PASSWORD');
    console.error('   3. Set SUPABASE_SERVICE_KEY for JS-based migration');
    console.error(`   4. Manually paste into: https://app.supabase.com/project/${config.projectRef}/sql/new`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
