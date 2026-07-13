#!/usr/bin/env bash
# Seed test data for all 7 use cases
# Usage: bash scripts/seed-use-cases.sh

BASE="http://localhost:5500"

# Generate JWT with valid UUID
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

H="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

post() {
  local label="$1"; local url="$2"; local body="$3"
  local code=$(curl -s -o /tmp/seed_resp -w "%{http_code}" -X POST -H "$H" -H "$CT" -d "$body" "$url")
  local resp=$(cat /tmp/seed_resp)
  if [[ "$code" == "201" || "$code" == "200" ]]; then
    echo "✅ $label → $code"
  else
    echo "❌ $label → $code: $(echo $resp | head -c 120)"
  fi
}

echo "======= Seeding Use-Case Test Data ======="

# ── KYC ──────────────────────────────
echo ""
echo "--- KYC ---"
post "KYC: Create client Acme Corp" "$BASE/api/kyc/clients" \
  '{"name":"Acme Corp","entity_type":"corporate","email":"compliance@acme.com","jurisdiction":"US","industry":"Technology"}'
post "KYC: Create client Tech Ltd" "$BASE/api/kyc/clients" \
  '{"name":"Tech Solutions Ltd","entity_type":"corporate","email":"legal@techsol.com","jurisdiction":"GB","industry":"Finance"}'
post "KYC: Create individual client" "$BASE/api/kyc/clients" \
  '{"name":"John Doe","entity_type":"individual","email":"jdoe@example.com","jurisdiction":"US"}'

# ── Fraud Detection ───────────────────
echo ""
echo "--- Fraud Detection ---"
post "Fraud: Add transaction 1" "$BASE/api/fraud/transactions" \
  '{"transaction_ref":"TXN-001","amount":1250.00,"currency":"USD","type":"payment","counterparty":"Vendor A","country_code":"US","channel":"online"}'
post "Fraud: Add transaction 2 (high risk)" "$BASE/api/fraud/transactions" \
  '{"transaction_ref":"TXN-002","amount":99999.99,"currency":"USD","type":"transfer","counterparty":"Unknown Entity","country_code":"XX","channel":"api"}'
post "Fraud: Add fraud pattern" "$BASE/api/fraud/patterns" \
  '{"name":"Unusual large transfer","pattern_type":"amount","description":"Transfers over $50,000 to unknown entities","severity":"high"}'

# ── Business Intelligence ─────────────
echo ""
echo "--- BI Queries ---"
post "BI: Save query 1" "$BASE/api/bi/saved" \
  '{"title":"Monthly Revenue by Region","naturalLanguage":"Show me monthly revenue breakdown by region for the last 6 months","generatedSQL":"SELECT region, DATE_TRUNC(month, date) as month, SUM(revenue) FROM sales GROUP BY 1,2","tags":["revenue","regional"]}'
post "BI: Save query 2" "$BASE/api/bi/saved" \
  '{"title":"Top 10 Customers","naturalLanguage":"Who are our top 10 customers by revenue this year","generatedSQL":"SELECT customer, SUM(revenue) FROM orders WHERE year=2025 GROUP BY 1 ORDER BY 2 DESC LIMIT 10","tags":["customers","revenue"]}'

# ── Project Intelligence ──────────────
echo ""
echo "--- Projects ---"
post "Project: Create AI Adoption Project" "$BASE/api/projects/" \
  '{"name":"AI Governance Implementation","description":"Implement AI governance framework across all business units","status":"active","priority":"high","start_date":"2025-01-01","target_end_date":"2025-12-31","budget":500000,"tags":["ai","governance","compliance"]}'
post "Project: Create Data Platform Project" "$BASE/api/projects/" \
  '{"name":"Unified Data Platform","description":"Build a centralized data platform for enterprise analytics","status":"planning","priority":"critical","start_date":"2025-03-01","target_end_date":"2026-06-30","budget":1200000,"tags":["data","platform","analytics"]}'

# ── Resource Planning ─────────────────
echo ""
echo "--- Resources ---"
post "Resource: Add AI Engineer" "$BASE/api/resources/" \
  '{"name":"Sarah Chen","email":"sarah.chen@velanova.ai","role":"AI Engineer","department":"Technology","skills":["Python","TensorFlow","MLOps"],"cost_rate":150,"available_hours_week":40}'
post "Resource: Add Data Scientist" "$BASE/api/resources/" \
  '{"name":"Marcus Johnson","email":"marcus.johnson@velanova.ai","role":"Senior Data Scientist","department":"Analytics","skills":["Python","R","SQL","Machine Learning"],"cost_rate":130,"available_hours_week":40}'
post "Resource: Add PM" "$BASE/api/resources/" \
  '{"name":"Priya Patel","email":"priya.patel@velanova.ai","role":"Project Manager","department":"PMO","skills":["project management","agile","stakeholder management"],"cost_rate":110,"available_hours_week":40}'

# ── Regulatory Intelligence ───────────
echo ""
echo "--- Regulatory ---"
post "Regulatory: Add change 1 EU AI Act" "$BASE/api/regulatory/changes" \
  '{"title":"EU AI Act Article 13 - Transparency Requirements","summary":"New requirements for transparency and documentation of high-risk AI systems","change_type":"new_regulation","jurisdiction":"EU","severity":"high","effective_date":"2025-08-01","tags":["AI","governance","compliance"]}'
post "Regulatory: Add change 2 GDPR" "$BASE/api/regulatory/changes" \
  '{"title":"GDPR Article 22 Automated Decision Making Update","summary":"Updated guidance on automated decision making in financial services","change_type":"amendment","jurisdiction":"EU","severity":"medium","effective_date":"2025-06-15","tags":["GDPR","data","privacy"]}'

# ── Procurement ───────────────────────
echo ""
echo "--- Procurement ---"
post "Procurement: Create contract 1" "$BASE/api/procurement/contracts" \
  '{"title":"Cloud Infrastructure Services Agreement","vendor":"Amazon Web Services","contract_type":"service","value":240000,"currency":"USD","start_date":"2025-01-01","end_date":"2025-12-31","auto_renew":true,"department":"Technology","tags":["cloud","infrastructure"]}'
post "Procurement: Create contract 2" "$BASE/api/procurement/contracts" \
  '{"title":"AI Model Licensing Agreement","vendor":"OpenAI","contract_type":"license","value":120000,"currency":"USD","start_date":"2025-03-01","end_date":"2026-02-28","auto_renew":false,"department":"Technology","tags":["AI","licensing"]}'
post "Procurement: Create contract 3 (expiring soon)" "$BASE/api/procurement/contracts" \
  '{"title":"Security Audit Services","vendor":"Deloitte Cyber","contract_type":"consulting","value":75000,"currency":"USD","start_date":"2025-01-15","end_date":"2025-06-30","auto_renew":false,"department":"Security","tags":["security","audit"]}'

echo ""
echo "======= Seed Complete ======="
echo "Run: bash scripts/test-use-cases.sh to verify data"
