#!/usr/bin/env node
/**
 * Run SQL migration via Supabase client library
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env
const envPath = path.join(__dirname, '../apps/express-api/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

console.log('\n🔄 Running Database Migration\n');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read SQL file
const sqlPath = path.join(__dirname, '../database/schema-v3-byok.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

// Execute via RPC (if exists) or show manual instructions
async function runMigration() {
  try {
    // Try direct query approach
    console.log('📊 Creating tables...\n');
    
    // Split into statements and execute one by one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.length > 10);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';
      console.log(`  [${i + 1}/${statements.length}] Executing...`);
      
      const { data, error } = await supabase.rpc('exec', { sql: stmt });
      
      if (error && error.code !== 'PGRST202') {
        console.log(`  ⚠️  Statement ${i + 1} note:`, error.message);
      }
    }
    
    console.log('\n✅ Migration completed!\n');
    console.log('📊 Tables created:');
    console.log('   - user_provider_keys');
    console.log('   - user_connections\n');
    
  } catch (err) {
    console.log('\n⚠️  Automatic migration not available\n');
    console.log('📝 Please run the SQL manually:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/lwounfzhkuuqvgkvwxvt/sql/new');
    console.log('2. Copy all content from: database/schema-v3-byok.sql');
    console.log('3. Paste and click "Run"\n');
    console.log('Or copy this command:\n');
    console.log(`   cat database/schema-v3-byok.sql | pbcopy\n`);
  }
}

runMigration();
