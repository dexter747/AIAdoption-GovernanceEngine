#!/usr/bin/env node

/**
 * Velanova Admin Seed Script
 * 
 * Seeds the database with admin user, test data, sample licenses, etc.
 * 
 * Usage:
 *   pnpm admin:seed                       # Seed all default data
 *   pnpm admin:seed -- --admin-only       # Create admin user only
 *   pnpm admin:seed -- --with-test-data   # Include test users, payments, etc.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = join(new URL('.', import.meta.url).pathname, '..');

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

// ---------- Seed Data ----------

async function seedAdminUser(supabase) {
  console.log('  👤 Creating admin user...');
  
  const adminEmail = 'admin@velanova.ai';
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', adminEmail)
    .single();

  if (existing) {
    console.log('     ⚡ Admin user already exists');
    return existing.id;
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: adminEmail,
      full_name: 'Velanova Admin',
      plan: 'enterprise',
      auth_provider: 'email',
    })
    .select('id')
    .single();

  if (error) {
    console.error(`     ❌ Failed: ${error.message}`);
    return null;
  }

  console.log(`     ✅ Admin user created: ${data.id}`);
  return data.id;
}

async function seedTestUsers(supabase) {
  console.log('  👥 Creating test users...');

  const testUsers = [
    { email: 'starter@test.velanova.ai', full_name: 'Test Starter User', plan: 'starter' },
    { email: 'pro@test.velanova.ai', full_name: 'Test Pro User', plan: 'professional' },
    { email: 'team@test.velanova.ai', full_name: 'Test Team User', plan: 'team' },
    { email: 'free@test.velanova.ai', full_name: 'Test Free User', plan: 'free' },
    { email: 'trial@test.velanova.ai', full_name: 'Test Trial User', plan: 'trial' },
  ];

  const ids = [];
  for (const user of testUsers) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (existing) {
      ids.push(existing.id);
      continue;
    }

    const { data, error } = await supabase
      .from('users')
      .insert({ ...user, auth_provider: 'email' })
      .select('id')
      .single();

    if (error) {
      console.error(`     ❌ ${user.email}: ${error.message}`);
    } else {
      ids.push(data.id);
    }
  }
  console.log(`     ✅ ${ids.length} test users ready`);
  return ids;
}

async function seedLicenses(supabase, userIds) {
  console.log('  🔑 Creating test licenses...');

  const plans = ['starter', 'professional', 'team', 'enterprise'];
  let created = 0;

  for (let i = 0; i < userIds.length && i < plans.length; i++) {
    const licenseKey = `VLN-${plans[i].toUpperCase().slice(0, 4)}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const { error } = await supabase.from('licenses').insert({
      user_id: userIds[i],
      license_key: licenseKey,
      plan_type: plans[i],
      status: 'active',
      device_limit: plans[i] === 'enterprise' ? 10 : plans[i] === 'team' ? 5 : plans[i] === 'professional' ? 3 : 1,
      max_machines: plans[i] === 'enterprise' ? 10 : plans[i] === 'team' ? 5 : 3,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (!error) created++;
  }
  console.log(`     ✅ ${created} licenses created`);
}

async function seedSubscriptions(supabase, userIds) {
  console.log('  💳 Creating test subscriptions...');

  const plans = [
    { type: 'starter', amount: 19900 },
    { type: 'professional', amount: 49900 },
    { type: 'team', amount: 99900 },
  ];

  let created = 0;
  for (let i = 0; i < Math.min(userIds.length, plans.length); i++) {
    const { error } = await supabase.from('subscriptions').insert({
      user_id: userIds[i],
      provider: 'dodo',
      plan_type: plans[i].type,
      billing_cycle: 'monthly',
      status: 'active',
      amount: plans[i].amount,
      currency: 'usd',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (!error) created++;
  }
  console.log(`     ✅ ${created} subscriptions created`);
}

async function seedUsageData(supabase, userIds) {
  console.log('  📊 Creating sample usage data...');

  const providers = ['openai', 'anthropic', 'google', 'groq'];
  const models = ['gpt-4', 'claude-3-sonnet', 'gemini-pro', 'llama-3'];
  let created = 0;

  for (const userId of userIds.slice(0, 3)) {
    for (let day = 0; day < 14; day++) {
      const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
      const count = Math.floor(Math.random() * 5) + 1;

      for (let j = 0; j < count; j++) {
        const pi = Math.floor(Math.random() * providers.length);
        const { error } = await supabase.from('usage_records').insert({
          user_id: userId,
          provider: providers[pi],
          model: models[pi],
          input_tokens: Math.floor(Math.random() * 2000) + 100,
          output_tokens: Math.floor(Math.random() * 1000) + 50,
          cost_cents: Math.floor(Math.random() * 50) + 1,
          duration_ms: Math.floor(Math.random() * 5000) + 500,
          created_at: date.toISOString(),
        });
        if (!error) created++;
      }
    }
  }
  console.log(`     ✅ ${created} usage records created`);
}

// ---------- Main ----------

async function main() {
  const args = process.argv.slice(2);
  const adminOnly = args.includes('--admin-only');
  const withTestData = args.includes('--with-test-data');

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║          Velanova Admin Seed                     ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const env = loadEnv();
  const supabase = await getSupabase(env);

  // Always create admin
  const adminId = await seedAdminUser(supabase);

  if (adminOnly) {
    console.log('\n✅ Admin seed complete (admin only).\n');
    return;
  }

  // Create test users
  const userIds = await seedTestUsers(supabase);

  // Create licenses for test users
  if (userIds.length > 0) {
    await seedLicenses(supabase, userIds);
    await seedSubscriptions(supabase, userIds);
  }

  // Optional: heavy test data
  if (withTestData && userIds.length > 0) {
    await seedUsageData(supabase, userIds);
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log('✅ Seed complete');
  console.log('   Admin: admin@velanova.ai');
  console.log(`   Test users: ${userIds.length}`);
  console.log(`${'═'.repeat(50)}\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
