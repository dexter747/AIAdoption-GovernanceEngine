/**
 * Database Migration Script
 * Executes schema-v3-byok.sql against Supabase
 * 
 * Usage: node scripts/migrate-v3-byok.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'your_service_role_key_here') {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
  console.error('   Get your service key from: https://supabase.com/dashboard/project/_/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting database migration...\n');
  
  // Read the SQL file
  const sqlPath = path.join(__dirname, '..', '..', 'database', 'schema-v3-byok.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ SQL file not found: ${sqlPath}`);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // Split into individual statements (simple split by semicolon followed by newline)
  // We need to be careful with functions that contain semicolons
  const statements = splitSqlStatements(sql);
  
  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt || stmt.startsWith('--')) continue;
    
    // Get first line for logging
    const firstLine = stmt.split('\n')[0].substring(0, 60);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });
      
      if (error) {
        // Try direct query for DDL statements
        const { error: error2 } = await supabase.from('_migrations').select().limit(0);
        
        // For Supabase, we need to use the management API or SQL editor
        // Let's try a different approach - execute via REST
        console.log(`⚠️  Statement ${i + 1}: ${firstLine}...`);
        console.log(`   Note: Complex DDL may need manual execution in Supabase SQL Editor`);
        errorCount++;
      } else {
        console.log(`✅ Statement ${i + 1}: ${firstLine}...`);
        successCount++;
      }
    } catch (err) {
      console.log(`⚠️  Statement ${i + 1}: ${firstLine}...`);
      console.log(`   Error: ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ⚠️  Need manual: ${errorCount}`);
  
  if (errorCount > 0) {
    console.log(`\n💡 To complete migration, copy the SQL from:`);
    console.log(`   ${sqlPath}`);
    console.log(`   And paste into Supabase SQL Editor:`);
    console.log(`   ${supabaseUrl.replace('.supabase.co', '')}/sql`);
  }
}

/**
 * Split SQL into statements, handling functions with semicolons
 */
function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inFunction = false;
  let dollarQuoteCount = 0;
  
  const lines = sql.split('\n');
  
  for (const line of lines) {
    // Skip pure comment lines
    if (line.trim().startsWith('--') && !current.trim()) {
      continue;
    }
    
    current += line + '\n';
    
    // Track $$ for function bodies
    const dollarMatches = line.match(/\$\$/g);
    if (dollarMatches) {
      dollarQuoteCount += dollarMatches.length;
    }
    
    // Check if we're inside a function body
    inFunction = dollarQuoteCount % 2 !== 0;
    
    // If line ends with semicolon and we're not in a function
    if (line.trim().endsWith(';') && !inFunction) {
      if (current.trim()) {
        statements.push(current.trim());
      }
      current = '';
    }
  }
  
  // Add any remaining content
  if (current.trim()) {
    statements.push(current.trim());
  }
  
  return statements;
}

runMigration().catch(console.error);
