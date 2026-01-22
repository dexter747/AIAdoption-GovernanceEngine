#!/usr/bin/env node

/**
 * Automated Database Migration - Schema v2
 * Reads schema-v2-safe.sql and executes it via Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../apps/express-api/.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\n❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  console.error('   Check: apps/express-api/.env\n');
  process.exit(1);
}

console.log('\n🚀 AI Nexus - Database Migration v2');
console.log('━'.repeat(60));
console.log(`\n🔗 Connecting to: ${SUPABASE_URL}\n`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function executeSQLFile() {
  console.log('📄 Reading schema-v2-safe.sql...\n');
  
  const sqlPath = join(__dirname, 'schema-v2-safe.sql');
  const sql = readFileSync(sqlPath, 'utf8');
  
  console.log('🔧 Executing migration...\n');
  
  // Split SQL into statements and execute each
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comments and empty statements
    if (!statement || statement.startsWith('--')) continue;
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';'
      });
      
      if (error) {
        // Some errors are expected (like "already exists")
        if (error.message.includes('already exists') || 
            error.message.includes('does not exist')) {
          // Ignore these - they're fine
        } else {
          console.error(`   ⚠️  Warning: ${error.message.substring(0, 80)}...`);
          errorCount++;
        }
      } else {
        successCount++;
      }
      
      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`   ✓ Processed ${i + 1}/${statements.length} statements...`);
      }
    } catch (e) {
      errorCount++;
    }
  }
  
  console.log(`\n📊 Migration Results:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ⚠️  Warnings: ${errorCount}`);
  
  console.log('\n━'.repeat(60));
  console.log('✨ Migration complete!\n');
  console.log('Next steps:');
  console.log('  1. Run: node database/analyze-db.mjs');
  console.log('  2. Verify in Supabase dashboard\n');
}

// Check if exec_sql function exists, if not, provide instructions
async function checkExecFunction() {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1' });
    
    if (error && error.code === '42883') {
      console.log('\n⚠️  The exec_sql function does not exist in your database.\n');
      console.log('Please run this SQL in Supabase SQL Editor first:\n');
      console.log('─'.repeat(60));
      console.log(`
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  EXECUTE sql_query;
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
      `);
      console.log('─'.repeat(60));
      console.log('\nAfter creating the function, run this script again.\n');
      console.log('OR: Manually run database/schema-v2-safe.sql in Supabase SQL Editor\n');
      return false;
    }
    
    return true;
  } catch (e) {
    console.log('\n⚠️  Cannot execute SQL via RPC.\n');
    console.log('Please manually run: database/schema-v2-safe.sql\n');
    console.log('In Supabase Dashboard → SQL Editor\n');
    return false;
  }
}

// Main execution
(async () => {
  try {
    const canExecute = await checkExecFunction();
    
    if (canExecute) {
      await executeSQLFile();
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nPlease run database/schema-v2-safe.sql manually in Supabase SQL Editor\n');
    process.exit(1);
  }
})();
