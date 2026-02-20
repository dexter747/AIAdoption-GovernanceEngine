#!/bin/bash
# Database Migration Script for Velanova
# Runs schema-v3-byok.sql against Supabase PostgreSQL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        Velanova Database Migration Script                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Database connection details
DB_HOST="db.lwounfzhkuuqvgkvwxvt.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

# Schema file path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="$SCRIPT_DIR/../database/schema-v3-byok.sql"

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}Error: Schema file not found at $SCHEMA_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Database: $DB_NAME @ $DB_HOST:$DB_PORT${NC}"
echo -e "${YELLOW}Schema File: $SCHEMA_FILE${NC}"
echo ""

# Check for password in environment variable
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo -e "${YELLOW}Enter your Supabase database password:${NC}"
    echo -e "(Find it at: https://supabase.com/dashboard/project/lwounfzhkuuqvgkvwxvt/settings/database)"
    read -s DB_PASSWORD
    echo ""
else
    DB_PASSWORD="$SUPABASE_DB_PASSWORD"
    echo -e "${GREEN}Using password from SUPABASE_DB_PASSWORD environment variable${NC}"
fi

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: Password is required${NC}"
    exit 1
fi

# Build connection string
export PGPASSWORD="$DB_PASSWORD"

echo -e "${YELLOW}Testing connection...${NC}"

# Test connection
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connection successful!${NC}"
else
    echo -e "${RED}✗ Connection failed. Please check your password.${NC}"
    unset PGPASSWORD
    exit 1
fi

echo ""
echo -e "${YELLOW}Running migration...${NC}"
echo ""

# Run the migration
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE" 2>&1; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║        Migration completed successfully! ✓                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
else
    echo ""
    echo -e "${RED}Migration failed. Check the errors above.${NC}"
    unset PGPASSWORD
    exit 1
fi

# Verify tables were created
echo ""
echo -e "${YELLOW}Verifying tables...${NC}"

TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('user_provider_keys', 'user_connections')
    ORDER BY table_name;
")

echo -e "${GREEN}Tables created:${NC}"
echo "$TABLES" | while read -r table; do
    if [ -n "$table" ]; then
        echo -e "  ${GREEN}✓${NC} $table"
    fi
done

# Clean up
unset PGPASSWORD

echo ""
echo -e "${GREEN}Migration complete! You can now use the BYOK features.${NC}"
