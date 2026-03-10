-- =============================================================================
-- ESG & Sustainability Reporting Module — Database Migration
-- =============================================================================
-- Tables for Environmental, Social, and Governance data aggregation,
-- metrics tracking, framework compliance, and report generation.
-- =============================================================================

-- L1. ESG_FRAMEWORKS — Compliance frameworks being tracked
CREATE TABLE IF NOT EXISTS public.esg_frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  version TEXT,
  description TEXT,
  framework_type TEXT DEFAULT 'reporting' CHECK (framework_type IN ('reporting', 'regulation', 'standard', 'taxonomy', 'benchmark')),
  jurisdiction TEXT DEFAULT 'global',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sunset', 'inactive')),
  compliance_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esg_frameworks_user ON public.esg_frameworks(user_id);

-- L2. ESG_METRICS — Individual ESG data points / KPIs
CREATE TABLE IF NOT EXISTS public.esg_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  metric_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('environmental', 'social', 'governance')),
  subcategory TEXT,
  unit TEXT,
  value NUMERIC(18,4),
  target_value NUMERIC(18,4),
  previous_value NUMERIC(18,4),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  reporting_year INTEGER,
  data_source TEXT,
  data_quality TEXT DEFAULT 'estimated' CHECK (data_quality IN ('measured', 'calculated', 'estimated', 'third_party_verified')),
  framework_id UUID REFERENCES public.esg_frameworks(id) ON DELETE SET NULL,
  framework_ref TEXT,
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'approved', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esg_metrics_user ON public.esg_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_esg_metrics_category ON public.esg_metrics(category);
CREATE INDEX IF NOT EXISTS idx_esg_metrics_year ON public.esg_metrics(reporting_year);

-- L3. ESG_DATA_SOURCES — Connected data sources for ESG data
CREATE TABLE IF NOT EXISTS public.esg_data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual', 'api', 'database', 'file_upload', 'iot_sensor', 'utility_provider', 'survey')),
  category TEXT NOT NULL CHECK (category IN ('environmental', 'social', 'governance', 'mixed')),
  connection_config JSONB DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'monthly' CHECK (sync_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'manual')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'pending_setup')),
  metrics_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esg_sources_user ON public.esg_data_sources(user_id);

-- L4. ESG_REPORTS — Generated ESG / Sustainability reports
CREATE TABLE IF NOT EXISTS public.esg_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  report_type TEXT DEFAULT 'annual' CHECK (report_type IN ('annual', 'quarterly', 'ad_hoc', 'board_pack', 'regulatory_filing', 'investor_update')),
  framework_id UUID REFERENCES public.esg_frameworks(id) ON DELETE SET NULL,
  reporting_year INTEGER,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
  overall_score NUMERIC(5,2),
  environmental_score NUMERIC(5,2),
  social_score NUMERIC(5,2),
  governance_score NUMERIC(5,2),
  ai_executive_summary TEXT,
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  ai_risk_areas JSONB DEFAULT '[]'::jsonb,
  metrics_included JSONB DEFAULT '[]'::jsonb,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esg_reports_user ON public.esg_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_esg_reports_year ON public.esg_reports(reporting_year);

-- L5. ESG_TARGETS — ESG goals and targets
CREATE TABLE IF NOT EXISTS public.esg_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  target_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('environmental', 'social', 'governance')),
  metric_name TEXT,
  baseline_value NUMERIC(18,4),
  baseline_year INTEGER,
  target_value NUMERIC(18,4),
  target_year INTEGER,
  current_value NUMERIC(18,4),
  progress_pct NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'behind', 'achieved', 'not_started')),
  description TEXT,
  science_based BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esg_targets_user ON public.esg_targets(user_id);

-- Triggers
CREATE TRIGGER set_esg_frameworks_updated_at BEFORE UPDATE ON public.esg_frameworks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_esg_metrics_updated_at BEFORE UPDATE ON public.esg_metrics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_esg_sources_updated_at BEFORE UPDATE ON public.esg_data_sources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_esg_reports_updated_at BEFORE UPDATE ON public.esg_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_esg_targets_updated_at BEFORE UPDATE ON public.esg_targets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.esg_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY esg_frameworks_user_policy ON public.esg_frameworks USING (user_id = auth.uid());
CREATE POLICY esg_metrics_user_policy ON public.esg_metrics USING (user_id = auth.uid());
CREATE POLICY esg_sources_user_policy ON public.esg_data_sources USING (user_id = auth.uid());
CREATE POLICY esg_reports_user_policy ON public.esg_reports USING (user_id = auth.uid());
CREATE POLICY esg_targets_user_policy ON public.esg_targets USING (user_id = auth.uid());
