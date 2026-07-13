-- ============================================================================
-- UC4: Procurement & Contract Risk
-- Tables: contracts, contract_clauses, procurement_reviews
-- ============================================================================

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  vendor TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'service' CHECK (contract_type IN ('service', 'license', 'maintenance', 'consulting', 'procurement', 'lease', 'other')),
  value NUMERIC(14, 2),
  currency TEXT DEFAULT 'GBP',
  start_date DATE,
  end_date DATE,
  renewal_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'active', 'expiring', 'expired', 'terminated')),
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  department TEXT,
  owner TEXT,
  document_url TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contract_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clause_type TEXT NOT NULL DEFAULT 'general' CHECK (clause_type IN ('termination', 'liability', 'indemnity', 'sla', 'data_protection', 'ip', 'confidentiality', 'payment', 'force_majeure', 'general')),
  title TEXT NOT NULL,
  content TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  ai_assessment TEXT,
  ai_recommendation TEXT,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS procurement_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL DEFAULT 'risk' CHECK (review_type IN ('risk', 'compliance', 'value', 'renewal')),
  overall_risk TEXT DEFAULT 'medium' CHECK (overall_risk IN ('low', 'medium', 'high', 'critical')),
  findings JSONB DEFAULT '[]',
  recommendations TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'action_required')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contracts_user ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_vendor ON contracts(vendor);
CREATE INDEX IF NOT EXISTS idx_contract_clauses_contract ON contract_clauses(contract_id);
CREATE INDEX IF NOT EXISTS idx_procurement_reviews_contract ON procurement_reviews(contract_id);

-- RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contracts_owner" ON contracts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "contract_clauses_owner" ON contract_clauses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "procurement_reviews_owner" ON procurement_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "contracts_service" ON contracts FOR ALL TO service_role USING (true);
CREATE POLICY "contract_clauses_service" ON contract_clauses FOR ALL TO service_role USING (true);
CREATE POLICY "procurement_reviews_service" ON procurement_reviews FOR ALL TO service_role USING (true);

CREATE TRIGGER set_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_procurement_reviews_updated_at BEFORE UPDATE ON procurement_reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();
