#!/usr/bin/env node

/**
 * Velanova Admin Delete Script
 * 
 * Cleans up seeded/test data from the database.
 * 
 * Usage:
 *   pnpm admin:delete                      # Delete test users + their data
 *   pnpm admin:delete -- --all             # Delete ALL users (nuclear)
 *   pnpm admin:delete -- --test-only       # Delete only @test.velanova.ai users
 *   pnpm admin:delete -- --dry-run         # Preview what would be deleted
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

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

async function getSupabase(env) {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY required');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, serviceKey);
}

function confirm(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

// ---------- Main ----------

async function main() {
  const args = process.argv.slice(2);
  const deleteAll = args.includes('--all');
  const testOnly = args.includes('--test-only');
  const dryRun = args.includes('--dry-run');

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║          Velanova Admin Delete                   ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const env = loadEnv();
  const supabase = await getSupabase(env);

  // Determine which users to delete
  let query = supabase.from('users').select('id, email, full_name, plan');

  if (testOnly) {
    query = query.like('email', '%@test.velanova.ai');
  } else if (!deleteAll) {
    // Default: delete test users + admin seed
    query = query.or('email.like.%@test.velanova.ai,email.eq.admin@velanova.ai');
  }

  const { data: users, error } = await query;

  if (error) {
    console.error(`❌ Failed to fetch users: ${error.message}`);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('ℹ️  No matching users found. Nothing to delete.\n');
    return;
  }

  console.log(`  Found ${users.length} users to delete:\n`);
  for (const user of users) {
    console.log(`    • ${user.email} (${user.plan}) — ${user.full_name || 'no name'}`);
  }

  if (dryRun) {
    console.log('\n🔍 Dry run — no changes made.\n');
    return;
  }

  if (deleteAll) {
    const answer = await confirm('\n⚠️  DELETE ALL USERS? This is irreversible. Type "yes" to confirm: ');
    if (answer !== 'yes') {
      console.log('❌ Cancelled.\n');
      return;
    }
  }

  // Delete users (cascades to subscriptions, licenses, etc.)
  const userIds = users.map(u => u.id);

  console.log('\n🗑️  Deleting...');

  // Delete from tables that cascade from users
  const tables = [
    'audit_log',
    'chat_messages',  // via chat_sessions
    'chat_sessions',
    'user_connections',
    'user_provider_keys',
    'api_keys',
    'usage_logs',
    'usage_records',
    'license_activations',  // via licenses
    'invoices',
    'payments',
    'payment_sessions',
    'licenses',
    'subscriptions',
    'team_members',
  ];

  for (const table of tables) {
    try {
      const col = table === 'audit_log' ? 'actor_id' : 
                  table === 'team_members' ? 'team_owner_id' :
                  table === 'chat_messages' ? null :
                  table === 'license_activations' ? null :
                  'user_id';
      
      if (col) {
        const { error } = await supabase.from(table).delete().in(col, userIds);
        if (error && !error.message.includes('0 rows')) {
          console.log(`    ⚠️  ${table}: ${error.message}`);
        }
      }
    } catch {
      // Table might not exist or column mismatch — skip
    }
  }

  // Finally delete users
  const { error: deleteError } = await supabase.from('users').delete().in('id', userIds);
  if (deleteError) {
    console.error(`  ❌ Users: ${deleteError.message}`);
  } else {
    console.log(`  ✅ ${users.length} users and all related data deleted`);
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ Cleanup complete`);
  console.log(`${'═'.repeat(50)}\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
