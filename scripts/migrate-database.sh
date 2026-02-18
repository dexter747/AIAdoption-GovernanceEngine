#!/bin/bash

# Database Migration Helper Script
# Runs database migrations on Supabase

set -e

echo "🗄️  AI Nexus - Database Migration"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f "apps/express-api/.env" ]; then
    echo -e "${RED}❌ Error: apps/express-api/.env not found${NC}"
    echo "Run ./scripts/setup-env.sh first"
    exit 1
fi

# Load environment variables
source apps/express-api/.env

# Check if Supabase URL is set
if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "https://YOUR_PROJECT.supabase.co" ]; then
    echo -e "${RED}❌ Error: SUPABASE_URL not configured${NC}"
    echo "Edit apps/express-api/.env and set your Supabase URL"
    exit 1
fi

# Extract project ref from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')

echo -e "${BLUE}🔍 Detected Supabase project: $PROJECT_REF${NC}"
echo ""

# Check for psql
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  psql not found. Attempting to install...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "Installing PostgreSQL client via Homebrew..."
            brew install postgresql
        else
            echo -e "${RED}❌ Homebrew not found. Please install PostgreSQL manually:${NC}"
            echo "brew install postgresql"
            exit 1
        fi
    else
        echo -e "${RED}❌ Please install PostgreSQL client manually:${NC}"
        echo "Ubuntu/Debian: sudo apt-get install postgresql-client"
        echo "Fedora/RHEL: sudo dnf install postgresql"
        exit 1
    fi
fi

echo -e "${GREEN}✅ PostgreSQL client found${NC}"
echo ""

# List available migrations
echo "📋 Available migrations:"
echo ""
MIGRATIONS=(
    "schema.sql|Base schema (users, profiles)"
    "schema-v2-safe.sql|V2 - Auth improvements"
    "schema-v3-byok.sql|V3 - BYOK (Bring Your Own Keys)"
    "schema-v4-payments.sql|V4 - Payment tables"
    "schema-v5-nextauth-users.sql|V5 - NextAuth integration"
    "schema-v6-complete-payments.sql|V6 - Complete payment system (RECOMMENDED)"
)

i=1
for migration in "${MIGRATIONS[@]}"; do
    IFS='|' read -r file desc <<< "$migration"
    if [ -f "database/$file" ]; then
        echo "  $i. $desc"
        echo "     File: $file"
        echo ""
    fi
    ((i++))
done

# Prompt for migration choice
echo -e "${YELLOW}Which migration do you want to run?${NC}"
echo -e "Enter number (or 'all' for all migrations, or 'latest' for v6): "
read -r CHOICE

case $CHOICE in
    latest|6)
        FILES=("schema-v6-complete-payments.sql")
        ;;
    all)
        FILES=("schema.sql" "schema-v2-safe.sql" "schema-v3-byok.sql" "schema-v4-payments.sql" "schema-v5-nextauth-users.sql" "schema-v6-complete-payments.sql")
        ;;
    1)
        FILES=("schema.sql")
        ;;
    2)
        FILES=("schema-v2-safe.sql")
        ;;
    3)
        FILES=("schema-v3-byok.sql")
        ;;
    4)
        FILES=("schema-v4-payments.sql")
        ;;
    5)
        FILES=("schema-v5-nextauth-users.sql")
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Migration Method${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Choose migration method:"
echo "1. Via Supabase Dashboard SQL Editor (RECOMMENDED)"
echo "2. Via psql command line (requires direct DB access)"
echo ""
read -p "Enter choice (1 or 2): " METHOD

if [ "$METHOD" = "1" ]; then
    echo ""
    echo -e "${GREEN}📋 Copy and paste the following SQL into Supabase Dashboard:${NC}"
    echo ""
    echo -e "${YELLOW}1. Go to: https://app.supabase.com/project/$PROJECT_REF/sql/new${NC}"
    echo -e "${YELLOW}2. Copy the SQL from the files listed below${NC}"
    echo -e "${YELLOW}3. Paste into the SQL editor${NC}"
    echo -e "${YELLOW}4. Click 'Run'${NC}"
    echo ""
    echo "Files to copy:"
    for file in "${FILES[@]}"; do
        if [ -f "database/$file" ]; then
            echo -e "  ${BLUE}• database/$file${NC}"
        fi
    done
    echo ""
    echo "Or use this command to view the SQL:"
    for file in "${FILES[@]}"; do
        if [ -f "database/$file" ]; then
            echo "  cat database/$file"
        fi
    done
    
elif [ "$METHOD" = "2" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  You'll need database credentials.${NC}"
    echo "Get them from: https://app.supabase.com/project/$PROJECT_REF/settings/database"
    echo ""
    read -p "Database host (e.g., db.xxxxx.supabase.co): " DB_HOST
    read -p "Database port [5432]: " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    read -p "Database name [postgres]: " DB_NAME
    DB_NAME=${DB_NAME:-postgres}
    read -p "Database user [postgres]: " DB_USER
    DB_USER=${DB_USER:-postgres}
    read -sp "Database password: " DB_PASSWORD
    echo ""
    echo ""
    
    # Run migrations
    for file in "${FILES[@]}"; do
        if [ -f "database/$file" ]; then
            echo -e "${BLUE}Running migration: $file${NC}"
            PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "database/$file"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ $file completed successfully${NC}"
            else
                echo -e "${RED}❌ $file failed${NC}"
                exit 1
            fi
            echo ""
        fi
    done
    
    echo -e "${GREEN}✅ All migrations completed successfully!${NC}"
else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Database migration complete!${NC}"
echo ""
