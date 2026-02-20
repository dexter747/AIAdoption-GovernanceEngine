#!/usr/bin/env node

/**
 * Database Migration Script using Supabase Client
 * This reads the SQL file and executes it via Supabase's REST API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read environment variables from .env file
const envPath = path.join(__dirname, '../apps/express-api/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

const SUPABASE_URL = env.SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log('\n🔄 Velanova - Database Migration Tool\n');
console.log('📍 Supabase URL:', SUPABASE_URL);

if (!SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL not found in environment');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === 'your_service_role_key_here') {
  console.error('\n❌ Error: SUPABASE_SERVICE_KEY not configured');
  console.error('\n📝 To fix this:');
  console.error('   1. Go to https://supabase.com/dashboard/project/lwounfzhkuuqvgkvwxvt/settings/api');
  console.error('   2. Copy the "service_role" key (not the anon key)');
  console.error('   3. Update SUPABASE_SERVICE_KEY in apps/express-api/.env');
  console.error('\n   OR run with: SUPABASE_SERVICE_KEY=your_key node scripts/migrate-with-supabase.js\n');
  process.exit(1);
}

// Read the SQL migration file
const sqlFilePath = path.join(__dirname, '../database/schema-v3-byok.sql');
console.log('📄 Reading SQL file:', sqlFilePath);

if (!fs.existsSync(sqlFilePath)) {
  console.error('❌ Error: SQL file not found:', sqlFilePath);
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

// Execute SQL via Supabase Management API
const projectRef = SUPABASE_URL.match(/https:\/\/(.+?)\.supabase\.co/)[1];

// Split SQL into individual statements
const statements = sqlContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`\n🚀 Executing ${statements.length} SQL statements...\n`);

// Use pg-promise style approach via PostgREST
const data = JSON.stringify({
  query: sqlContent
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Prefer': 'return=minimal'
  }
};

const req = https.request(url, options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration completed successfully!');
      console.log('\n📊 Tables created:');
      console.log('   - user_provider_keys (BYOK API keys)');
      console.log('   - user_connections (Database connections)');
      console.log('\n🎉 Database is ready for BYOK features!\n');
    } else {
      console.error('❌ Migration failed');
      console.error('Status:', res.statusCode);
      console.error('Response:', responseData);
      console.log('\n💡 Alternative: Run SQL directly in Supabase SQL Editor');
      console.log('   URL: https://supabase.com/dashboard/project/lwounfzhkuuqvgkvwxvt/sql/new');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n💡 Please run the SQL manually in Supabase SQL Editor:');
  console.log('   1. Go to https://supabase.com/dashboard/project/lwounfzhkuuqvgkvwxvt/sql/new');
  console.log('   2. Copy contents of database/schema-v3-byok.sql');
  console.log('   3. Click "Run"\n');
  process.exit(1);
});

req.write(data);
req.end();
