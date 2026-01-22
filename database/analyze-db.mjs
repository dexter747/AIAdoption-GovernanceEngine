#!/usr/bin/env node

/**
 * Database Schema Analyzer
 * Connects to Supabase and shows current schema state
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from express-api
dotenv.config({ path: join(__dirname, '../apps/express-api/.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\n❌ Missing environment variables!\n');
  console.error('Required in apps/express-api/.env:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_KEY\n');
  process.exit(1);
}

console.log('\n🔗 Connecting to Supabase...');
console.log(`   URL: ${SUPABASE_URL}\n`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTable(tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { exists: false, count: 0 };
      }
      return { exists: true, count: 0, error: error.message };
    }
    
    return { exists: true, count: count || 0 };
  } catch (e) {
    return { exists: false, count: 0, error: e.message };
  }
}

async function analyzeDatabase() {
  console.log('━'.repeat(70));
  console.log('📊 DATABASE SCHEMA ANALYSIS');
  console.log('━'.repeat(70));
  console.log('');
  
  const tables = [
    { name: 'users', description: 'User profiles', from: 'schema.sql' },
    { name: 'licenses', description: 'License keys', from: 'schema.sql' },
    { name: 'device_activations', description: 'Device tracking', from: 'schema.sql' },
    { name: 'subscriptions', description: 'Recurring billing', from: 'schema.sql' },
    { name: 'payments', description: 'Payment history', from: 'schema.sql' },
    { name: 'usage_logs', description: 'Basic usage tracking', from: 'schema.sql' },
    { name: 'usage_records', description: 'Detailed AI usage', from: 'schema-v2.sql' },
    { name: 'api_keys', description: 'User API keys (BYOK)', from: 'schema-v2.sql' },
    { name: 'chat_sessions', description: 'Chat history', from: 'schema-v2.sql' },
    { name: 'chat_messages', description: 'Chat messages', from: 'schema-v2.sql' },
    { name: 'audit_log', description: 'Admin actions', from: 'schema-v2.sql' },
  ];
  
  console.log('Table Name               Status    Rows    Source          Description');
  console.log('─'.repeat(70));
  
  let existingCount = 0;
  let missingCount = 0;
  
  for (const table of tables) {
    const result = await checkTable(table.name);
    
    const status = result.exists ? '✅ EXISTS' : '❌ MISSING';
    const rows = result.exists ? result.count.toString().padStart(6) : '   N/A';
    const name = table.name.padEnd(23);
    const source = table.from.padEnd(15);
    
    console.log(`${name} ${status}  ${rows}    ${source} ${table.description}`);
    
    if (result.exists) existingCount++;
    else missingCount++;
  }
  
  console.log('─'.repeat(70));
  console.log(`\n📈 Summary: ${existingCount} tables exist, ${missingCount} missing\n`);
  
  if (missingCount > 0) {
    console.log('⚠️  Missing tables detected!\n');
    console.log('To fix this, run ONE of the following:\n');
    console.log('  Option 1 (Recommended): Run in Supabase SQL Editor');
    console.log('    → Copy and run: database/schema-v2-safe.sql\n');
    console.log('  Option 2: Use migration script');
    console.log('    → Run: node database/run-migration.mjs\n');
  } else {
    console.log('✅ All tables exist! Database is ready.\n');
  }
  
  console.log('━'.repeat(70));
  console.log('');
}

// Run analysis
analyzeDatabase().catch(error => {
  console.error('\n❌ Analysis failed:', error.message);
  process.exit(1);
});
