-- =============================================================================
-- AML & SAR Automation Module — Database Migration
-- =============================================================================
-- Tables for Anti-Money Laundering transaction monitoring,
-- Suspicious Activity Report generation, compliance rule engine,
-- and case review workflow.
-- =============================================================================

-- K1. AML_MONITORED_ACCOUNTS — Customer accounts under AML monitoring
CREATE TABLE IF NOT EXISTS public.aml_monitored_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  account_ref TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  account_type TEXT DEFAULT 'individual' CHECK (account_type IN ('individual', 'corporate', 'trust', 'joint', 'correspondent')),
  jurisdiction TEXT DEFAULT 'JE',
  risk_tier TEXT DEFAULT 'standard' CHECK (risk_tier IN ('low', 'standard', 'enhanced', 'high', 'prohibited')),
  pep_flag BOOLEAN DEFAULT FALSE,
  sanctions_flag BOOLEAN DEFAULT FALSE,
  adverse_media_flag BOOLEAN DEFAULT FALSE,
  last_review_date TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed', 'under_review', 'blocked')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aml_accounts_user ON public.aml_monitored_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_aml_accounts_risk ON public.aml_monitored_accounts(risk_tier);

-- K2. AML_TRANSACTIONS — Financial transactions for AML monitoring
CREATE TABLE IF NOT EXISTS public.aml_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.aml_monitored_accounts(id) ON DELETE SET NULL,
  transaction_ref TEXT NOT NULL,
  transaction_type TEXT DEFAULT 'transfer' CHECK (transaction_type IN ('transfer', 'deposit', 'withdrawal', 'wire', 'cash', 'trade', 'currency_exchange', 'loan_payment', 'card_payment')),
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  counterparty_name TEXT,
  counterparty_account TEXT,
  counterparty_jurisdiction TEXT,
  originator_country TEXT,
  beneficiary_country TEXT,
  channel TEXT DEFAULT 'online' CHECK (channel IN ('online', 'branch', 'atm', 'wire', 'swift', 'mobile', 'api')),
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  flagged BOOLEAN DEFAULT FALSE,
  screening_status TEXT DEFAULT 'pending' CHECK (screening_status IN ('pending', 'cleared', 'flagged', 'escalated', 'blocked')),
  ai_risk_factors JSONB DEFAULT '[]'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aml_txn_user ON public.aml_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_aml_txn_account ON public.aml_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_aml_txn_flagged ON public.aml_transactions(flagged);

-- K3. AML_RULES — AML monitoring rules / thresholds
CREATE TABLE IF NOT EXISTS public.aml_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rule_name TEXT NOT NULL,
  rule_type TEXT DEFAULT 'threshold' CHECK (rule_type IN ('threshold', 'velocity', 'pattern', 'geographic', 'behavioral', 'structuring', 'sanctions', 'pep')),
  description TEXT,
  conditions JSONB DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT TRUE,
  matches_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aml_rules_user ON public.aml_rules(user_id);

-- K4. AML_ALERTS — Triggered AML alerts
CREATE TABLE IF NOT EXISTS public.aml_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES public.aml_transactions(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.aml_monitored_accounts(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES public.aml_rules(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold_breach', 'velocity_anomaly', 'structuring', 'sanctions_match', 'pep_transaction', 'geographic_risk', 'behavioral_anomaly', 'cash_intensive', 'layering', 'round_tripping')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'escalated', 'sar_filed', 'false_positive', 'resolved')),
  title TEXT NOT NULL,
  description TEXT,
  ai_confidence NUMERIC(5,2),
  ai_reasoning TEXT,
  ai_recommended_action TEXT,
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aml_alerts_user ON public.aml_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_aml_alerts_status ON public.aml_alerts(status);

-- K5. SAR_REPORTS — Suspicious Activity Reports
CREATE TABLE IF NOT EXISTS public.sar_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  report_ref TEXT NOT NULL,
  report_type TEXT DEFAULT 'SAR' CHECK (report_type IN ('SAR', 'STR', 'CTR', 'MLRO_escalation')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'submitted', 'acknowledged', 'rejected')),
  priority TEXT DEFAULT 'standard' CHECK (priority IN ('standard', 'urgent', 'critical')),
  subject_name TEXT NOT NULL,
  subject_account TEXT,
  subject_type TEXT DEFAULT 'individual' CHECK (subject_type IN ('individual', 'corporate', 'trust')),
  reporting_period_start TIMESTAMPTZ,
  reporting_period_end TIMESTAMPTZ,
  total_suspicious_amount NUMERIC(18,2) DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  narrative TEXT,
  ai_generated_narrative TEXT,
  ai_risk_assessment JSONB DEFAULT '{}'::jsonb,
  supporting_transactions JSONB DEFAULT '[]'::jsonb,
  supporting_alerts JSONB DEFAULT '[]'::jsonb,
  filed_with TEXT,
  filed_at TIMESTAMPTZ,
  acknowledgement_ref TEXT,
  reviewer TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sar_user ON public.sar_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_sar_status ON public.sar_reports(status);

-- Triggers
CREATE TRIGGER set_aml_accounts_updated_at BEFORE UPDATE ON public.aml_monitored_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_aml_rules_updated_at BEFORE UPDATE ON public.aml_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_aml_alerts_updated_at BEFORE UPDATE ON public.aml_alerts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_sar_reports_updated_at BEFORE UPDATE ON public.sar_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.aml_monitored_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aml_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aml_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aml_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sar_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY aml_accounts_user_policy ON public.aml_monitored_accounts USING (user_id = auth.uid());
CREATE POLICY aml_transactions_user_policy ON public.aml_transactions USING (user_id = auth.uid());
CREATE POLICY aml_rules_user_policy ON public.aml_rules USING (user_id = auth.uid());
CREATE POLICY aml_alerts_user_policy ON public.aml_alerts USING (user_id = auth.uid());
CREATE POLICY sar_reports_user_policy ON public.sar_reports USING (user_id = auth.uid());
