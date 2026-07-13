#!/usr/bin/env bash
# Test all 7 use-case API endpoints
# Usage: bash scripts/test-use-cases.sh

BASE="http://localhost:5500"

# Generate a fresh JWT using the API secret
cd "$(dirname "$0")/../apps/express-api"
TOKEN=$(node --input-type=module <<'JSEOF'
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const token = jwt.sign(
  { sub: '00000000-0000-0000-0000-000000000001', id: '00000000-0000-0000-0000-000000000001', email: 'test@velanova.ai', role: 'user', plan: 'professional' },
  secret,
  { expiresIn: '24h' }
);
console.log(token);
JSEOF
)
cd - > /dev/null

echo "✅ Generated JWT: ${TOKEN:0:40}..."
echo ""

pass=0
fail=0

check() {
  local label="$1"
  local url="$2"
  local response
  local http_code
  response=$(curl -s -o /tmp/uc_resp -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$url")
  http_code="$response"
  local body=$(cat /tmp/uc_resp)

  if [[ "$http_code" == "200" ]]; then
    echo "✅ $label → HTTP $http_code"
    echo "   $(echo "$body" | head -c 120)"
    ((pass++))
  else
    echo "❌ $label → HTTP $http_code"
    echo "   $(echo "$body" | head -c 200)"
    ((fail++))
  fi
  echo ""
}

echo "======= Testing 7 Use-Case Endpoints ======="
echo ""
check "KYC - List Clients"            "$BASE/api/kyc/clients"
check "KYC - Dashboard Stats"         "$BASE/api/kyc/dashboard"
check "Fraud - Transactions"          "$BASE/api/fraud/transactions"
check "Fraud - Alerts"                "$BASE/api/fraud/alerts"
check "BI - Query History"            "$BASE/api/bi/history"
check "BI - Saved Queries"            "$BASE/api/bi/saved"
check "Projects - List"               "$BASE/api/projects/"
check "Projects - Dashboard"          "$BASE/api/projects/dashboard"
check "Resources - List"              "$BASE/api/resources/"
check "Resources - Allocations"       "$BASE/api/resources/allocations"
check "Regulatory - Changes"          "$BASE/api/regulatory/changes"
check "Regulatory - Dashboard"        "$BASE/api/regulatory/dashboard"
check "Procurement - Contracts"       "$BASE/api/procurement/contracts"
check "Procurement - Dashboard"       "$BASE/api/procurement/dashboard"
echo "======================================="
echo "PASSED: $pass  FAILED: $fail  TOTAL: $((pass+fail))"
