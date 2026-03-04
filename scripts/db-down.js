#!/usr/bin/env node

/**
 * Velanova Database Down Script
 *
 * Drops all Velanova tables, functions, views, and policies from Supabase.
 * USE WITH EXTREME CAUTION — this is destructive and irreversible.
 *
 * Usage:
 *   pnpm db:down                     # Interactive confirmation
 *   pnpm db:down -- --force          # Skip confirmation (CI usage)
 *   pnpm db:down -- --dry-run        # Show what would be dropped
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------- Config ----------

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

function getSupabaseConfig(env) {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = url?.match(/https:\/\/([^.]+)/)?.[1];
  const dbPassword = env.SUPABASE_DB_PASSWORD || env.DATABASE_PASSWORD;
  const databaseUrl = env.DATABASE_URL;
  return { url, projectRef, dbPassword, databaseUrl };
}

// ---------- Drop SQL ----------

const DROP_SQL = `
-- =============================================
-- Velanova Full Schema Tear-Down (DESTRUCTIVE)
-- 41 tables + views + functions
-- =============================================

-- Drop views first
DROP VIEW IF EXISTS public.device_activations CASCADE;

-- Drop all helper functions
DROP FUNCTION IF EXISTS public.get_daily_usage CASCADE;
DROP FUNCTION IF EXISTS public.get_monthly_usage CASCADE;
DROP FUNCTION IF EXISTS public.get_active_subscription CASCADE;
DROP FUNCTION IF EXISTS public.has_valid_license CASCADE;
DROP FUNCTION IF EXISTS public.get_current_period_usage CASCADE;
DROP FUNCTION IF EXISTS public.check_plan_limits CASCADE;
DROP FUNCTION IF EXISTS public.get_user_providers CASCADE;
DROP FUNCTION IF EXISTS public.get_user_connections CASCADE;
DROP FUNCTION IF EXISTS public.update_provider_key_usage CASCADE;
DROP FUNCTION IF EXISTS public.get_payment_history CASCADE;
DROP FUNCTION IF EXISTS public.generate_invoice_number CASCADE;
DROP FUNCTION IF EXISTS public.set_invoice_number CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at CASCADE;

-- Fraud Detection tables (UC3)
DROP TABLE IF EXISTS public.fraud_investigations CASCADE;
DROP TABLE IF EXISTS public.fraud_patterns CASCADE;
DROP TABLE IF EXISTS public.fraud_alerts CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;

-- KYC & Onboarding tables (UC1)
DROP TABLE IF EXISTS public.onboarding_workflows CASCADE;
DROP TABLE IF EXISTS public.kyc_documents CASCADE;
DROP TABLE IF EXISTS public.kyc_checks CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- Procurement tables (UC4)
DROP TABLE IF EXISTS public.procurement_reviews CASCADE;
DROP TABLE IF EXISTS public.contract_clauses CASCADE;
DROP TABLE IF EXISTS public.contracts CASCADE;

-- Regulatory tables (UC2)
DROP TABLE IF EXISTS public.compliance_assessments CASCADE;
DROP TABLE IF EXISTS public.regulatory_changes CASCADE;
DROP TABLE IF EXISTS public.regulatory_sources CASCADE;

-- Resource tables (UC6) — before projects
DROP TABLE IF EXISTS public.capacity_plans CASCADE;
DROP TABLE IF EXISTS public.resource_allocations CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;

-- Project tables (UC5)
DROP TABLE IF EXISTS public.project_insights CASCADE;
DROP TABLE IF EXISTS public.project_risks CASCADE;
DROP TABLE IF EXISTS public.project_tasks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;

-- BI tables (UC7)
DROP TABLE IF EXISTS public.query_visualizations CASCADE;
DROP TABLE IF EXISTS public.query_history CASCADE;
DROP TABLE IF EXISTS public.saved_queries CASCADE;

-- Email Auth
DROP TABLE IF EXISTS public.auth_tokens CASCADE;

-- Core platform tables
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.user_connections CASCADE;
DROP TABLE IF EXISTS public.user_provider_keys CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.usage_logs CASCADE;
DROP TABLE IF EXISTS public.usage_records CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.payment_sessions CASCADE;
DROP TABLE IF EXISTS public.license_activations CASCADE;
DROP TABLE IF EXISTS public.licenses CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Confirmation
DO $$ BEGIN RAISE NOTICE '🗑️  All 41 Velanova tables, views, and functions dropped.'; END $$;
`;

// ---------- Prompt ----------

function confirm(question) {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

// ---------- Main ----------

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const dryRun = args.includes('--dry-run');

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║       Velanova Database Schema — DOWN            ║');
  console.log('║       ⚠️  DESTRUCTIVE OPERATION ⚠️                ║');
  console.log('╚══════════════════════════════════════════════════╝');

  const env = loadEnv();
  const config = getSupabaseConfig(env);

  console.log(`\n  Project: ${config.projectRef}`);
  console.log('');
  console.log('  Tables to drop (41 total):');
  console.log('    Core: users, subscriptions, licenses, license_activations,');
  console.log('          payment_sessions, payments, invoices, usage_records,');
  console.log('          usage_logs, api_keys, user_provider_keys, user_connections,');
  console.log('          chat_sessions, chat_messages, team_members, audit_log, auth_tokens');
  console.log('    BI:   saved_queries, query_history, query_visualizations');
  console.log('    Proj: projects, project_tasks, project_risks, project_insights');
  console.log('    Res:  resources, resource_allocations, capacity_plans');
  console.log('    Reg:  regulatory_sources, regulatory_changes, compliance_assessments');
  console.log('    Proc: contracts, contract_clauses, procurement_reviews');
  console.log('    KYC:  clients, kyc_checks, kyc_documents, onboarding_workflows');
  console.log('    Fraud: transactions, fraud_alerts, fraud_patterns, fraud_investigations');
  console.log('');

  if (dryRun) {
    console.log('🔍 Dry run — SQL that would be executed:\n');
    console.log(DROP_SQL);
    return;
  }

  if (!force) {
    const answer = await confirm('⚠️  This will DELETE ALL DATA. Type "yes" to confirm: ');
    if (answer !== 'yes') {
      console.log('❌ Cancelled.');
      process.exit(0);
    }
  }

  // Execute via psql or manual instruction
  const hasPsql = (() => {
    try {
      execSync('psql --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  })();

  if (hasPsql && (config.databaseUrl || config.dbPassword)) {
    let connectionString = config.databaseUrl;
    if (!connectionString) {
      connectionString = `postgresql://postgres.${config.projectRef}:${config.dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
    }

    console.log('\n🗑️  Dropping all tables...\n');
    try {
      execSync(`psql "${connectionString}" -c "${DROP_SQL.replace(/"/g, '\\"')}"`, {
        stdio: 'inherit',
      });
      console.log('\n✅ All Velanova schema objects dropped.');
    } catch {
      console.error('\n❌ psql failed. Use Supabase Dashboard instead:');
      console.error(`   https://app.supabase.com/project/${config.projectRef}/sql/new`);
      console.log('\nPaste this SQL:\n' + DROP_SQL);
    }
  } else {
    console.log('\n📋 psql not available. Copy this SQL into Supabase Dashboard SQL Editor:\n');
    console.log(`   https://app.supabase.com/project/${config.projectRef}/sql/new\n`);
    console.log(DROP_SQL);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
