#!/bin/bash

# Test Payment Flow
# Simulates a complete payment and license activation flow

set -e

echo "🧪 Velanova - Payment Flow Test"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL=${API_URL:-"http://localhost:5500"}
LANDING_URL=${LANDING_URL:-"http://localhost:3000"}

# Check if services are running
echo "🔍 Checking if services are running..."
echo ""

check_service() {
    local url=$1
    local name=$2
    
    if curl -s "$url/health" > /dev/null 2>&1 || curl -s "$url/api/status" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is NOT running${NC}"
        return 1
    fi
}

EXPRESS_RUNNING=false
LANDING_RUNNING=false

if check_service "$API_URL" "Express API (port 5500)"; then
    EXPRESS_RUNNING=true
fi

if check_service "$LANDING_URL" "Landing Site (port 3000)"; then
    LANDING_RUNNING=true
fi

echo ""

if [ "$EXPRESS_RUNNING" = false ] || [ "$LANDING_RUNNING" = false ]; then
    echo -e "${YELLOW}⚠️  Some services are not running${NC}"
    echo ""
    echo "Start them with:"
    echo "  Terminal 1: cd apps/landing-site && pnpm run dev"
    echo "  Terminal 2: cd apps/express-api && pnpm run dev"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test Scenarios${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Create payment session (Starter plan)"
echo "2. Create payment session (Professional plan)"
echo "3. Create payment session (Enterprise plan)"
echo "4. Validate license key"
echo "5. Check subscription status"
echo "6. Track usage"
echo "7. Full end-to-end test"
echo ""
read -p "Choose test scenario (1-7): " SCENARIO

# Test functions
test_create_payment_session() {
    local plan=$1
    local billing_cycle=${2:-"monthly"}
    
    echo ""
    echo -e "${BLUE}Testing: Create Payment Session ($plan, $billing_cycle)${NC}"
    echo ""
    
    # Generate test user ID
    USER_ID="test-user-$(date +%s)"
    
    echo "Creating payment session..."
    RESPONSE=$(curl -s -X POST "$LANDING_URL/api/payments/create-checkout" \
        -H "Content-Type: application/json" \
        -d "{
            \"planType\": \"$plan\",
            \"billingCycle\": \"$billing_cycle\",
            \"userId\": \"$USER_ID\"
        }")
    
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    
    # Extract session ID
    SESSION_ID=$(echo "$RESPONSE" | jq -r '.sessionId // .session_id // empty' 2>/dev/null)
    
    if [ -n "$SESSION_ID" ]; then
        echo -e "${GREEN}✅ Payment session created: $SESSION_ID${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Visit the checkout URL to complete payment"
        echo "2. Use Lemon Squeezy test mode"
        echo "3. Check webhook logs for payment.succeeded event"
    else
        echo -e "${RED}❌ Failed to create payment session${NC}"
    fi
}

test_validate_license() {
    echo ""
    read -p "Enter license key to validate: " LICENSE_KEY
    read -p "Enter device ID (or press enter for test device): " DEVICE_ID
    DEVICE_ID=${DEVICE_ID:-"test-device-$(hostname)"}
    
    echo ""
    echo -e "${BLUE}Testing: Validate License${NC}"
    echo "License: $LICENSE_KEY"
    echo "Device: $DEVICE_ID"
    echo ""
    
    RESPONSE=$(curl -s -X POST "$API_URL/api/licenses/validate" \
        -H "Content-Type: application/json" \
        -d "{
            \"licenseKey\": \"$LICENSE_KEY\",
            \"deviceId\": \"$DEVICE_ID\",
            \"deviceInfo\": {
                \"platform\": \"darwin\",
                \"hostname\": \"$(hostname)\",
                \"appVersion\": \"1.0.0\"
            }
        }")
    
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    
    IS_VALID=$(echo "$RESPONSE" | jq -r '.valid // false' 2>/dev/null)
    
    if [ "$IS_VALID" = "true" ]; then
        echo -e "${GREEN}✅ License is valid${NC}"
        PLAN=$(echo "$RESPONSE" | jq -r '.license.planType // .plan // empty' 2>/dev/null)
        echo "Plan: $PLAN"
    else
        echo -e "${RED}❌ License is invalid or expired${NC}"
    fi
}

test_check_subscription() {
    echo ""
    read -p "Enter user ID: " USER_ID
    
    echo ""
    echo -e "${BLUE}Testing: Check Subscription Status${NC}"
    echo ""
    
    RESPONSE=$(curl -s "$API_URL/api/subscriptions/$USER_ID")
    
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    
    STATUS=$(echo "$RESPONSE" | jq -r '.subscription.status // empty' 2>/dev/null)
    
    if [ -n "$STATUS" ]; then
        echo -e "${GREEN}✅ Subscription found${NC}"
        echo "Status: $STATUS"
        PLAN=$(echo "$RESPONSE" | jq -r '.subscription.plan_type // empty' 2>/dev/null)
        echo "Plan: $PLAN"
    else
        echo -e "${YELLOW}⚠️  No active subscription found${NC}"
    fi
}

test_track_usage() {
    echo ""
    read -p "Enter user ID: " USER_ID
    read -p "Usage type (query/tokens/connection): " USAGE_TYPE
    read -p "Amount (default 100): " AMOUNT
    AMOUNT=${AMOUNT:-100}
    
    echo ""
    echo -e "${BLUE}Testing: Track Usage${NC}"
    echo ""
    
    RESPONSE=$(curl -s -X POST "$API_URL/api/usage/log" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$USER_ID\",
            \"eventType\": \"$USAGE_TYPE\",
            \"amount\": $AMOUNT,
            \"provider\": \"openai\",
            \"model\": \"gpt-4\",
            \"metadata\": {
                \"test\": true
            }
        }")
    
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    
    if echo "$RESPONSE" | jq -e '.success // .logged' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Usage tracked successfully${NC}"
    else
        echo -e "${RED}❌ Failed to track usage${NC}"
    fi
}

test_full_flow() {
    echo ""
    echo -e "${BLUE}Running Full End-to-End Test${NC}"
    echo ""
    
    # Step 1: Create payment session
    echo "Step 1: Creating payment session..."
    test_create_payment_session "starter" "monthly"
    
    echo ""
    echo -e "${YELLOW}⚠️  Manual step required:${NC}"
    echo "1. Complete the payment in Lemon Squeezy test mode"
    echo "2. Wait for webhook to process"
    echo "3. Check your email for license key"
    echo ""
    read -p "Press enter when payment is complete and you have the license key..."
    
    # Step 2: Validate license
    test_validate_license
    
    # Step 3: Check subscription
    echo ""
    read -p "Press enter to check subscription status..."
    test_check_subscription
    
    # Step 4: Track usage
    echo ""
    read -p "Press enter to track test usage..."
    read -p "Enter user ID: " USER_ID
    
    echo ""
    echo "Tracking 100 tokens..."
    curl -s -X POST "$API_URL/api/usage/log" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$USER_ID\",
            \"eventType\": \"tokens\",
            \"amount\": 100,
            \"provider\": \"openai\",
            \"model\": \"gpt-4\"
        }" > /dev/null
    
    echo -e "${GREEN}✅ Full flow test complete!${NC}"
}

# Run selected scenario
case $SCENARIO in
    1)
        test_create_payment_session "starter" "monthly"
        ;;
    2)
        test_create_payment_session "professional" "monthly"
        ;;
    3)
        test_create_payment_session "enterprise" "yearly"
        ;;
    4)
        test_validate_license
        ;;
    5)
        test_check_subscription
        ;;
    6)
        test_track_usage
        ;;
    7)
        test_full_flow
        ;;
    *)
        echo -e "${RED}❌ Invalid scenario${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Test complete!${NC}"
echo ""
