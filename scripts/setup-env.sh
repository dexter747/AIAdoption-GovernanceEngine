#!/bin/bash

# Environment Setup Script for AI Nexus
# This script creates .env files from templates

set -e

echo "🔧 AI Nexus - Environment Setup"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Generate random token
generate_token() {
    openssl rand -hex 32
}

# Check if file exists and ask to overwrite
check_file() {
    if [ -f "$1" ]; then
        echo -e "${YELLOW}⚠️  $1 already exists${NC}"
        read -p "Overwrite? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    return 0
}

# Landing Site .env.local
echo "📝 Setting up Landing Site environment..."
if check_file "apps/landing-site/.env.local"; then
    cat > apps/landing-site/.env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=REPLACE_WITH_GENERATED_SECRET

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Dodo Payments
DODO_API_KEY=your_dodo_api_key
DODO_WEBHOOK_SECRET=your_dodo_webhook_secret

# Resend Email
RESEND_API_KEY=your_resend_api_key

# General
NODE_ENV=development
EOF
    
    # Generate and replace NEXTAUTH_SECRET
    SECRET=$(generate_token)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/REPLACE_WITH_GENERATED_SECRET/$SECRET/" apps/landing-site/.env.local
    else
        sed -i "s/REPLACE_WITH_GENERATED_SECRET/$SECRET/" apps/landing-site/.env.local
    fi
    
    echo -e "${GREEN}✅ Created apps/landing-site/.env.local${NC}"
fi

# Admin Dashboard .env.local
echo ""
echo "📝 Setting up Admin Dashboard environment..."
if check_file "apps/admin-dashboard/.env.local"; then
    cat > apps/admin-dashboard/.env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# API
NEXT_PUBLIC_API_URL=http://localhost:5500

# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=REPLACE_WITH_GENERATED_SECRET

# General
NODE_ENV=development
EOF
    
    # Generate and replace NEXTAUTH_SECRET
    SECRET=$(generate_token)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/REPLACE_WITH_GENERATED_SECRET/$SECRET/" apps/admin-dashboard/.env.local
    else
        sed -i "s/REPLACE_WITH_GENERATED_SECRET/$SECRET/" apps/admin-dashboard/.env.local
    fi
    
    echo -e "${GREEN}✅ Created apps/admin-dashboard/.env.local${NC}"
fi

# Express API .env
echo ""
echo "📝 Setting up Express API environment..."
if check_file "apps/express-api/.env"; then
    cat > apps/express-api/.env << 'EOF'
# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here

# Server
PORT=5500
NODE_ENV=development

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Admin
ADMIN_SECRET_TOKEN=REPLACE_WITH_GENERATED_TOKEN

# JWT
JWT_SECRET=REPLACE_WITH_GENERATED_SECRET
EOF
    
    # Generate and replace tokens
    ADMIN_TOKEN=$(generate_token)
    JWT_SECRET=$(generate_token)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/REPLACE_WITH_GENERATED_TOKEN/$ADMIN_TOKEN/" apps/express-api/.env
        sed -i '' "s/REPLACE_WITH_GENERATED_SECRET/$JWT_SECRET/" apps/express-api/.env
    else
        sed -i "s/REPLACE_WITH_GENERATED_TOKEN/$ADMIN_TOKEN/" apps/express-api/.env
        sed -i "s/REPLACE_WITH_GENERATED_SECRET/$JWT_SECRET/" apps/express-api/.env
    fi
    
    echo -e "${GREEN}✅ Created apps/express-api/.env${NC}"
    echo -e "${YELLOW}📋 Admin Token: $ADMIN_TOKEN${NC}"
    echo -e "${YELLOW}   (Save this for admin dashboard access)${NC}"
fi

# Desktop App .env
echo ""
echo "📝 Setting up Desktop App environment..."
if check_file "apps/desktop-app/.env"; then
    cat > apps/desktop-app/.env << 'EOF'
# API
API_BASE_URL=http://localhost:5500

# Environment
NODE_ENV=development

# Update Server (for production)
UPDATE_SERVER_URL=https://releases.ainexus.com
EOF
    
    echo -e "${GREEN}✅ Created apps/desktop-app/.env${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Edit the .env files and replace placeholder values"
echo "2. Add your Supabase credentials"
echo "3. Add your Dodo Payments API keys"
echo "4. Add your Resend API key"
echo "5. Add your Google OAuth credentials"
echo ""
echo "🔐 Generated secure tokens have been automatically set for:"
echo "   - NEXTAUTH_SECRET (both apps)"
echo "   - ADMIN_SECRET_TOKEN"
echo "   - JWT_SECRET"
echo ""
