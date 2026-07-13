-- ============================================================================
-- UC6: Resource Allocation & Capacity Planning
-- Tables: resources, resource_allocations, capacity_plans
-- ============================================================================

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'developer',
  department TEXT,
  skills TEXT[] DEFAULT '{}',
  cost_rate NUMERIC(8, 2) DEFAULT 0,
  available_hours_week NUMERIC(4, 1) DEFAULT 40,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'offboarded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resource_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  allocated_hours NUMERIC(6, 1) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  role_on_project TEXT,
  utilization_pct NUMERIC(5, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS capacity_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  ai_analysis JSONB DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resources_user ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_user ON resource_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_resource ON resource_allocations(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_dates ON resource_allocations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_capacity_plans_user ON capacity_plans(user_id);

-- RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_owner" ON resources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "resource_allocations_owner" ON resource_allocations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "capacity_plans_owner" ON capacity_plans FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "resources_service" ON resources FOR ALL TO service_role USING (true);
CREATE POLICY "resource_allocations_service" ON resource_allocations FOR ALL TO service_role USING (true);
CREATE POLICY "capacity_plans_service" ON capacity_plans FOR ALL TO service_role USING (true);

CREATE TRIGGER set_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_resource_allocations_updated_at BEFORE UPDATE ON resource_allocations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_capacity_plans_updated_at BEFORE UPDATE ON capacity_plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
