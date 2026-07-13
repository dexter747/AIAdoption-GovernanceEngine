-- Fraud Detection & Analytics Migration
-- Use Case 3: Fraud Detection & Anomaly Analytics

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_ref TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'payment' CHECK (type IN ('payment', 'transfer', 'withdrawal', 'deposit', 'refund', 'adjustment')),
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  source_account TEXT,
  destination_account TEXT,
  counterparty TEXT,
  country_code TEXT DEFAULT 'JE',
  channel TEXT DEFAULT 'online' CHECK (channel IN ('online', 'mobile', 'branch', 'atm', 'wire', 'api')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed', 'flagged', 'blocked')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  flagged BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fraud alerts table
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('anomaly', 'pattern', 'velocity', 'amount', 'geographic', 'behavioral', 'sanctions', 'rules_based')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'confirmed_fraud', 'false_positive', 'escalated', 'resolved')),
  title TEXT NOT NULL,
  description TEXT,
  ai_confidence NUMERIC(4,2),
  ai_reasoning TEXT,
  ai_recommended_action TEXT,
  indicators JSONB DEFAULT '[]',
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fraud patterns table
CREATE TABLE IF NOT EXISTS fraud_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('velocity', 'amount', 'geographic', 'temporal', 'network', 'behavioral', 'custom')),
  description TEXT,
  detection_rules JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  severity TEXT DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  matches_count INTEGER DEFAULT 0,
  false_positive_rate NUMERIC(5,2) DEFAULT 0,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fraud investigations table
CREATE TABLE IF NOT EXISTS fraud_investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES fraud_alerts(id) ON DELETE SET NULL,
  case_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending_info', 'escalated', 'closed_fraud', 'closed_legitimate')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  title TEXT NOT NULL,
  summary TEXT,
  findings JSONB DEFAULT '[]',
  total_exposure NUMERIC(15,2) DEFAULT 0,
  ai_analysis TEXT,
  ai_risk_assessment JSONB DEFAULT '{}',
  assigned_to TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_txn_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_txn_flagged ON transactions(flagged) WHERE flagged = true;
CREATE INDEX IF NOT EXISTS idx_txn_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON fraud_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_patterns_user ON fraud_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_investigations_user ON fraud_investigations(user_id);

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_investigations ENABLE ROW LEVEL SECURITY;

CREATE POLICY txn_user ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY alerts_user ON fraud_alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY patterns_user ON fraud_patterns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY investigations_user ON fraud_investigations FOR ALL USING (auth.uid() = user_id);

-- Service role bypass
CREATE POLICY txn_service ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY alerts_service ON fraud_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY patterns_service ON fraud_patterns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY investigations_service ON fraud_investigations FOR ALL USING (true) WITH CHECK (true);

-- Triggers
CREATE TRIGGER set_txn_updated BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_alerts_updated BEFORE UPDATE ON fraud_alerts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_patterns_updated BEFORE UPDATE ON fraud_patterns FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_investigations_updated BEFORE UPDATE ON fraud_investigations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
