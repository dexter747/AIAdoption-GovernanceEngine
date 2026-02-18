#!/bin/bash

# System Check - Verify all prerequisites are installed

echo "🔍 AI Nexus - System Check"
echo "==========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

check_command() {
    local cmd=$1
    local name=$2
    local install_cmd=$3
    local required=$4
    
    if command -v $cmd &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -n1)
        echo -e "${GREEN}✅ $name${NC} - $version"
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ $name not found${NC}"
            echo "   Install: $install_cmd"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${YELLOW}⚠️  $name not found (optional)${NC}"
            echo "   Install: $install_cmd"
            WARNINGS=$((WARNINGS + 1))
        fi
        return 1
    fi
}

echo "📦 Checking required tools..."
echo ""

# Node.js
check_command "node" "Node.js" "https://nodejs.org/" "true"

# pnpm
check_command "pnpm" "pnpm" "npm install -g pnpm" "true"

# Git
check_command "git" "Git" "https://git-scm.com/" "true"

# PostgreSQL client
check_command "psql" "PostgreSQL Client" "brew install postgresql (macOS)" "false"

echo ""
echo "🔧 Checking optional tools..."
echo ""

# OpenSSL (for token generation)
check_command "openssl" "OpenSSL" "brew install openssl (macOS)" "false"

# jq (for JSON parsing in scripts)
check_command "jq" "jq" "brew install jq (macOS)" "false"

# curl (usually pre-installed)
check_command "curl" "curl" "brew install curl (macOS)" "false"

echo ""
echo "📁 Checking project structure..."
echo ""

check_dir() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $name${NC}"
        return 0
    else
        echo -e "${RED}❌ $name not found${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_dir "apps/landing-site" "Landing Site"
check_dir "apps/admin-dashboard" "Admin Dashboard"
check_dir "apps/express-api" "Express API"
check_dir "apps/desktop-app" "Desktop App"
check_dir "packages/mcp-servers" "MCP Servers"
check_dir "database" "Database Scripts"

echo ""
echo "📝 Checking for dependencies..."
echo ""

check_node_modules() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir/node_modules" ]; then
        local package_count=$(ls -1 "$dir/node_modules" | wc -l | xargs)
        echo -e "${GREEN}✅ $name${NC} - $package_count packages"
        return 0
    else
        echo -e "${YELLOW}⚠️  $name${NC} - dependencies not installed"
        echo "   Run: cd $dir && pnpm install"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

check_node_modules "apps/landing-site" "Landing Site"
check_node_modules "apps/admin-dashboard" "Admin Dashboard"
check_node_modules "apps/express-api" "Express API"
check_node_modules "apps/desktop-app" "Desktop App"

echo ""
echo "⚙️  Checking environment configuration..."
echo ""

check_env() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $name${NC}"
        
        # Check for placeholder values
        if grep -q "YOUR_PROJECT\|your_.*_here\|REPLACE_WITH" "$file" 2>/dev/null; then
            echo -e "${YELLOW}   ⚠️  Contains placeholder values${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
        return 0
    else
        echo -e "${YELLOW}⚠️  $name${NC} - not configured"
        echo "   Run: ./scripts/setup-env.sh"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

check_env "apps/landing-site/.env.local" "Landing Site .env"
check_env "apps/admin-dashboard/.env.local" "Admin Dashboard .env"
check_env "apps/express-api/.env" "Express API .env"
check_env "apps/desktop-app/.env" "Desktop App .env"

echo ""
echo "🗄️  Checking database status..."
echo ""

if [ -f "apps/express-api/.env" ]; then
    source apps/express-api/.env
    
    if [ -n "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "https://YOUR_PROJECT.supabase.co" ]; then
        echo -e "${GREEN}✅ Supabase URL configured${NC}"
        echo "   URL: $SUPABASE_URL"
        
        # Try to ping Supabase
        if curl -s "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_SERVICE_KEY" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Supabase is accessible${NC}"
        else
            echo -e "${YELLOW}⚠️  Cannot reach Supabase (might be normal if not running)${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  Supabase URL not configured${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Express API .env not found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "🏗️  Checking build outputs..."
echo ""

check_build() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        local file_count=$(find "$dir" -type f | wc -l | xargs)
        echo -e "${GREEN}✅ $name${NC} - $file_count files"
        return 0
    else
        echo -e "${YELLOW}⚠️  $name${NC} - not built"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

# Check a few MCP servers as samples
if [ -d "packages/mcp-servers" ]; then
    BUILT_COUNT=0
    TOTAL_COUNT=$(ls -1 packages/mcp-servers | wc -l | xargs)
    
    for server in packages/mcp-servers/*/; do
        if [ -d "${server}dist" ]; then
            BUILT_COUNT=$((BUILT_COUNT + 1))
        fi
    done
    
    if [ $BUILT_COUNT -eq $TOTAL_COUNT ]; then
        echo -e "${GREEN}✅ MCP Servers${NC} - All $TOTAL_COUNT built"
    elif [ $BUILT_COUNT -eq 0 ]; then
        echo -e "${YELLOW}⚠️  MCP Servers${NC} - None built (0/$TOTAL_COUNT)"
        echo "   Run: ./scripts/build-all-mcp-servers.sh"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${YELLOW}⚠️  MCP Servers${NC} - Partially built ($BUILT_COUNT/$TOTAL_COUNT)"
        echo "   Run: ./scripts/build-all-mcp-servers.sh"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! System is ready.${NC}"
    echo ""
    echo "Start development:"
    echo "  ./scripts/start-dev.sh"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warnings found${NC}"
    echo ""
    echo "System is functional but needs configuration."
    echo "Run these commands to complete setup:"
    echo "  1. ./scripts/setup-env.sh"
    echo "  2. ./scripts/migrate-database.sh"
    echo "  3. ./scripts/build-all-mcp-servers.sh"
else
    echo -e "${RED}❌ $ERRORS critical errors found${NC}"
    echo -e "${YELLOW}⚠️  $WARNINGS warnings${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
fi

echo ""
