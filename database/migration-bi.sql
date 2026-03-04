-- =============================================================================
-- Business Intelligence & Legacy System Query — Migration
-- =============================================================================
-- Tables: saved_queries, query_history, query_visualizations
-- Depends on: users, user_connections (from schema-unified.sql)
-- =============================================================================

-- 1. SAVED QUERIES
CREATE TABLE IF NOT EXISTS public.saved_queries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID,
  title       TEXT NOT NULL,
  description TEXT,
  natural_language TEXT NOT NULL,
  generated_sql TEXT,
  connection_type TEXT,
  tags        TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  run_count   INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_queries_user ON public.saved_queries(user_id);
CREATE INDEX idx_saved_queries_favorite ON public.saved_queries(user_id, is_favorite) WHERE is_favorite = TRUE;

-- 2. QUERY HISTORY
CREATE TABLE IF NOT EXISTS public.query_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  connection_id   UUID,
  connection_name TEXT,
  connection_type TEXT,
  natural_language TEXT NOT NULL,
  generated_sql   TEXT,
  result_summary  TEXT,
  row_count       INTEGER,
  execution_ms    INTEGER,
  ai_model        TEXT,
  ai_provider     TEXT,
  tokens_used     INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout')),
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_query_history_user ON public.query_history(user_id);
CREATE INDEX idx_query_history_created ON public.query_history(created_at DESC);
CREATE INDEX idx_query_history_connection ON public.query_history(connection_id);

-- 3. QUERY VISUALIZATIONS (saved chart configs)
CREATE TABLE IF NOT EXISTS public.query_visualizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  saved_query_id UUID REFERENCES public.saved_queries(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  chart_type    TEXT NOT NULL CHECK (chart_type IN ('bar', 'line', 'pie', 'area', 'scatter', 'table')),
  chart_config  JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_query_viz_user ON public.query_visualizations(user_id);

-- RLS Policies
ALTER TABLE public.saved_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_visualizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_queries_user_policy ON public.saved_queries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY query_history_user_policy ON public.query_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY query_viz_user_policy ON public.query_visualizations
  FOR ALL USING (auth.uid() = user_id);

-- Service role bypass
CREATE POLICY saved_queries_service ON public.saved_queries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY query_history_service ON public.query_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY query_viz_service ON public.query_visualizations
  FOR ALL USING (auth.role() = 'service_role');

-- Updated_at triggers
CREATE TRIGGER set_saved_queries_updated_at
  BEFORE UPDATE ON public.saved_queries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_query_viz_updated_at
  BEFORE UPDATE ON public.query_visualizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
