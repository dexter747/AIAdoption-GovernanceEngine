-- ============================================================================
-- UC2: Regulatory Change Intelligence
-- Tables: regulatory_sources, regulatory_changes, compliance_assessments
-- ============================================================================

CREATE TABLE IF NOT EXISTS regulatory_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  type TEXT NOT NULL DEFAULT 'website' CHECK (type IN ('website', 'rss', 'api', 'document', 'manual')),
  jurisdiction TEXT DEFAULT 'Jersey',
  sector TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  check_frequency TEXT DEFAULT 'daily' CHECK (check_frequency IN ('hourly', 'daily', 'weekly', 'manual')),
  last_checked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS regulatory_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id UUID REFERENCES regulatory_sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  change_type TEXT NOT NULL DEFAULT 'update' CHECK (change_type IN ('new_regulation', 'amendment', 'guidance', 'consultation', 'enforcement', 'update')),
  jurisdiction TEXT DEFAULT 'Jersey',
  sector TEXT[] DEFAULT '{}',
  effective_date DATE,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'assessed', 'implemented', 'dismissed')),
  ai_impact_summary TEXT,
  ai_action_items TEXT[] DEFAULT '{}',
  ai_risk_score INTEGER CHECK (ai_risk_score BETWEEN 0 AND 100),
  tags TEXT[] DEFAULT '{}',
  external_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  change_id UUID NOT NULL REFERENCES regulatory_changes(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL DEFAULT 'impact' CHECK (assessment_type IN ('impact', 'gap', 'action_plan')),
  current_compliance TEXT DEFAULT 'unknown' CHECK (current_compliance IN ('compliant', 'partial', 'non_compliant', 'unknown')),
  required_actions JSONB DEFAULT '[]',
  deadline DATE,
  assigned_to TEXT,
  ai_analysis JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reg_sources_user ON regulatory_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_reg_changes_user ON regulatory_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_reg_changes_status ON regulatory_changes(status);
CREATE INDEX IF NOT EXISTS idx_reg_changes_severity ON regulatory_changes(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_user ON compliance_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_change ON compliance_assessments(change_id);

-- RLS
ALTER TABLE regulatory_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reg_sources_owner" ON regulatory_sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reg_changes_owner" ON regulatory_changes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "comp_assessments_owner" ON compliance_assessments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "reg_sources_service" ON regulatory_sources FOR ALL TO service_role USING (true);
CREATE POLICY "reg_changes_service" ON regulatory_changes FOR ALL TO service_role USING (true);
CREATE POLICY "comp_assessments_service" ON compliance_assessments FOR ALL TO service_role USING (true);

CREATE TRIGGER set_reg_sources_updated_at BEFORE UPDATE ON regulatory_sources FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_reg_changes_updated_at BEFORE UPDATE ON regulatory_changes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_comp_assessments_updated_at BEFORE UPDATE ON compliance_assessments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
