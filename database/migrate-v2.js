#!/usr/bin/env node

/**
 * Database Migration Script - Schema v2
 * Automatically analyzes Supabase database and applies missing changes
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../apps/express-api/.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log(`   URL: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(0);
  
  return !error || error.code !== 'PGRST116'; // PGRST116 = table doesn't exist
}

async function runSQL(sql, description) {
  console.log(`   📝 ${description}...`);
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error(`      ❌ Error: ${error.message}`);
    return false;
  }
  
  console.log(`      ✅ Success`);
  return true;
}

async function createExecSQLFunction() {
  // First, we need to create a SQL execution function if it doesn't exist
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1' });
    if (!error || error.code !== '42883') {
      // Function exists
      return true;
    }
  } catch (e) {
    // Function doesn't exist, need to create it differently
  }
  
  console.log('⚠️  Cannot execute SQL directly. Please run the schema-v2-safe.sql file manually.');
  return false;
}

async function analyzeDatabase() {
  console.log('\n📊 Analyzing current database schema...\n');
  
  const tables = [
    'users',
    'licenses', 
    'device_activations',
    'subscriptions',
    'payments',
    'usage_logs',
    'api_keys',
    'usage_records',
    'chat_sessions',
    'chat_messages',
    'audit_log'
  ];
  
  const tableStatus = {};
  
  for (const table of tables) {
    const exists = await checkTableExists(table);
    tableStatus[table] = exists;
    
    const icon = exists ? '✅' : '❌';
    console.log(`   ${icon} ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
  }
  
  return tableStatus;
}

async function executeMigration() {
  console.log('\n🚀 Starting Schema v2 Migration\n');
  console.log('━'.repeat(60));
  
  // Analyze current state
  const tableStatus = await analyzeDatabase();
  
  console.log('\n━'.repeat(60));
  console.log('\n📦 Creating missing tables...\n');
  
  // Create usage_records table
  if (!tableStatus.usage_records) {
    console.log('Creating usage_records table...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.usage_records (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          provider TEXT NOT NULL,
          model TEXT NOT NULL,
          input_tokens INT DEFAULT 0,
          output_tokens INT DEFAULT 0,
          cost_cents DECIMAL(10, 4) DEFAULT 0,
          duration_ms INT DEFAULT 0,
          request_type TEXT DEFAULT 'chat',
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::JSONB
        );
        
        CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);
        CREATE INDEX IF NOT EXISTS idx_usage_records_timestamp ON public.usage_records(timestamp);
        
        ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (error) {
      console.error('❌ Error creating usage_records:', error.message);
    } else {
      console.log('✅ usage_records table created');
    }
  }
  
  // Create chat_sessions table
  if (!tableStatus.chat_sessions) {
    console.log('Creating chat_sessions table...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.chat_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT DEFAULT 'New Chat',
          provider TEXT,
          model TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          is_archived BOOLEAN DEFAULT FALSE,
          metadata JSONB DEFAULT '{}'::JSONB
        );
        
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
        ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (error) {
      console.error('❌ Error creating chat_sessions:', error.message);
    } else {
      console.log('✅ chat_sessions table created');
    }
  }
  
  console.log('\n━'.repeat(60));
  console.log('\n✨ Migration Summary:\n');
  
  const finalStatus = await analyzeDatabase();
  
  console.log('\n━'.repeat(60));
  console.log('\n🎉 Migration complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. Verify tables in Supabase dashboard');
  console.log('   2. Test the Express API');
  console.log('   3. Test the desktop app\n');
}

// Main execution
(async () => {
  try {
    await executeMigration();
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n⚠️  Please run database/schema-v2-safe.sql manually in Supabase SQL Editor');
    process.exit(1);
  }
})();
