-- =============================================================================
-- Client Reporting Module — Database Migration
-- =============================================================================
-- Tables for automated client & board reporting: templates and generated reports.
-- =============================================================================

-- R1. REPORT_TEMPLATES — Reusable report templates
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'client_report' CHECK (type IN ('client_report', 'board_pack', 'fund_report', 'investor_letter', 'regulatory', 'esg_report', 'custom')),
  format TEXT DEFAULT 'PDF' CHECK (format IN ('PDF', 'PPTX', 'XLSX', 'HTML')),
  frequency TEXT DEFAULT 'quarterly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'ad_hoc')),
  sections INTEGER DEFAULT 1,
  config JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_templates_user ON public.report_templates(user_id);

-- R2. CLIENT_REPORTS — Generated reports
CREATE TABLE IF NOT EXISTS public.client_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.report_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  report_type TEXT DEFAULT 'client_report' CHECK (report_type IN ('client_report', 'board_pack', 'fund_report', 'investor_letter', 'regulatory', 'esg_report', 'custom')),
  client_name TEXT,
  reporting_period TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'published', 'archived')),
  pages INTEGER,
  data_sources TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  content JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_reports_user ON public.client_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_client_reports_status ON public.client_reports(status);
CREATE INDEX IF NOT EXISTS idx_client_reports_type ON public.client_reports(report_type);

-- Triggers for updated_at
CREATE TRIGGER trg_report_templates_updated
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_client_reports_updated
  BEFORE UPDATE ON public.client_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS policies
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY report_templates_user_policy ON public.report_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY client_reports_user_policy ON public.client_reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
