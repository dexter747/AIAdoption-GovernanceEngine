-- ============================================================================
-- UC5: Project Intelligence Dashboard
-- Tables: projects, project_tasks, project_risks, project_insights
-- ============================================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  budget NUMERIC(12, 2),
  spent NUMERIC(12, 2) DEFAULT 0,
  health_score INTEGER DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assignee TEXT,
  due_date DATE,
  estimated_hours NUMERIC(6, 1),
  actual_hours NUMERIC(6, 1),
  dependencies UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risks table
CREATE TABLE IF NOT EXISTS project_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('technical', 'resource', 'schedule', 'budget', 'scope', 'external', 'general')),
  likelihood TEXT NOT NULL DEFAULT 'medium' CHECK (likelihood IN ('low', 'medium', 'high', 'critical')),
  impact TEXT NOT NULL DEFAULT 'medium' CHECK (impact IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'mitigating', 'resolved', 'accepted')),
  mitigation TEXT,
  owner TEXT,
  ai_detected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI-generated insights
CREATE TABLE IF NOT EXISTS project_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('health', 'risk', 'recommendation', 'forecast', 'anomaly')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  ai_model TEXT,
  ai_provider TEXT,
  is_dismissed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_risks_project ON project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_insights_project ON project_insights(project_id);
CREATE INDEX IF NOT EXISTS idx_project_insights_type ON project_insights(type);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_owner" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "project_tasks_owner" ON project_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "project_risks_owner" ON project_risks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "project_insights_owner" ON project_insights FOR ALL USING (auth.uid() = user_id);

-- Service role bypass
CREATE POLICY "projects_service" ON projects FOR ALL TO service_role USING (true);
CREATE POLICY "project_tasks_service" ON project_tasks FOR ALL TO service_role USING (true);
CREATE POLICY "project_risks_service" ON project_risks FOR ALL TO service_role USING (true);
CREATE POLICY "project_insights_service" ON project_insights FOR ALL TO service_role USING (true);

-- Triggers
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_project_tasks_updated_at BEFORE UPDATE ON project_tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_project_risks_updated_at BEFORE UPDATE ON project_risks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
