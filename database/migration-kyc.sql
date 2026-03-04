-- KYC & Client Onboarding Migration
-- Use Case 1: KYC & Client Onboarding Automation

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'individual' CHECK (entity_type IN ('individual', 'corporate', 'trust', 'fund')),
  jurisdiction TEXT DEFAULT 'JE',
  email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',
  risk_rating TEXT DEFAULT 'standard' CHECK (risk_rating IN ('low', 'standard', 'enhanced', 'high', 'pep')),
  overall_risk_score INTEGER CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'onboarding', 'active', 'suspended', 'offboarded')),
  source_of_wealth TEXT,
  source_of_funds TEXT,
  industry TEXT,
  pep_status BOOLEAN DEFAULT false,
  sanctions_checked BOOLEAN DEFAULT false,
  adverse_media_checked BOOLEAN DEFAULT false,
  last_review_date TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- KYC checks table
CREATE TABLE IF NOT EXISTS kyc_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL CHECK (check_type IN ('identity', 'address', 'sanctions', 'pep', 'adverse_media', 'source_of_wealth', 'source_of_funds', 'ubo', 'enhanced_due_diligence')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'expired', 'needs_review')),
  result JSONB DEFAULT '{}',
  ai_assessment TEXT,
  ai_risk_flags TEXT[] DEFAULT '{}',
  ai_confidence NUMERIC(4,2),
  provider TEXT,
  reference_id TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- KYC documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'national_id', 'driving_license', 'utility_bill', 'bank_statement', 'tax_return', 'incorporation_cert', 'shareholder_register', 'trust_deed', 'financial_statement', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  ai_extracted_data JSONB DEFAULT '{}',
  ai_verification_result JSONB DEFAULT '{}',
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Onboarding workflows table
CREATE TABLE IF NOT EXISTS onboarding_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template TEXT DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'blocked', 'completed', 'cancelled')),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  steps JSONB DEFAULT '[]',
  completion_pct NUMERIC(5,2) DEFAULT 0,
  ai_recommendations TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_risk ON clients(risk_rating);
CREATE INDEX IF NOT EXISTS idx_kyc_checks_client ON kyc_checks(client_id);
CREATE INDEX IF NOT EXISTS idx_kyc_checks_status ON kyc_checks(status);
CREATE INDEX IF NOT EXISTS idx_kyc_docs_client ON kyc_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_client ON onboarding_workflows(client_id);

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY clients_user ON clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY kyc_checks_user ON kyc_checks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY kyc_docs_user ON kyc_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY onboarding_user ON onboarding_workflows FOR ALL USING (auth.uid() = user_id);

-- Service role bypass
CREATE POLICY clients_service ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY kyc_checks_service ON kyc_checks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY kyc_docs_service ON kyc_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY onboarding_service ON onboarding_workflows FOR ALL USING (true) WITH CHECK (true);

-- Triggers
CREATE TRIGGER set_clients_updated BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_kyc_checks_updated BEFORE UPDATE ON kyc_checks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_kyc_docs_updated BEFORE UPDATE ON kyc_documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_onboarding_updated BEFORE UPDATE ON onboarding_workflows FOR EACH ROW EXECUTE FUNCTION set_updated_at();
