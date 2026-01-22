#!/bin/bash

# Simple migration script using environment variables
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="$SCRIPT_DIR/../database/schema-v3-byok.sql"

echo ""
echo "🔄 AI Nexus - Database Migration"
echo "=================================="
echo ""

# Check if SQL file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Error: SQL file not found at $SCHEMA_FILE"
    exit 1
fi

# Load environment variables from .env file
ENV_FILE="$SCRIPT_DIR/../apps/express-api/.env"
if [ -f "$ENV_FILE" ]; then
    export $(cat "$ENV_FILE" | grep -v '^#' | grep -v '^$' | xargs)
fi

# Check for required environment variables
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: SUPABASE_URL not set"
    exit 1
fi

# Extract project reference from URL
PROJECT_REF=$(echo "$SUPABASE_URL" | sed -n 's/.*\/\/\([^.]*\).*/\1/p')
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo "📍 Database: $DB_HOST"
echo "📄 SQL File: schema-v3-byok.sql"
echo ""

# Prompt for password
echo "🔑 Enter your Supabase database password:"
echo "   (Find it in: Dashboard → Settings → Database → Connection string)"
read -s DB_PASSWORD

if [ -z "$DB_PASSWORD" ]; then
    echo ""
    echo "❌ Password cannot be empty"
    exit 1
fi

echo ""
echo "🧪 Testing connection..."

# Test connection
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Connection successful"
else
    echo "❌ Connection failed. Please check your password."
    exit 1
fi

echo ""
echo "🚀 Running migration..."
echo ""

# Execute the SQL file
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 Tables created:"
    echo "   - user_provider_keys (BYOK API keys)"
    echo "   - user_connections (Database connections)"
    echo ""
    echo "🎉 Database is ready for BYOK features!"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Check the error messages above."
    exit 1
fi
