-- supabase/migrations/20260118000000_multi_facility.sql
-- Multi-Facility Support for SET Roadmap Platform
-- Transforms single-facility (Westlake) to enterprise multi-facility platform

-- =============================================================================
-- PHASE 1: NEW TABLES
-- =============================================================================

-- Facilities table - represents VPC locations
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL,  -- WLK, CMR, BLI
  name VARCHAR(255) NOT NULL,
  location_city VARCHAR(100),
  location_state VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'planning', 'onboarding', 'inactive')),
  maturity_score DECIMAL(3,1) NOT NULL DEFAULT 0 CHECK (maturity_score >= 0 AND maturity_score <= 5),
  description TEXT,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User-Facilities junction table - controls access per facility
CREATE TABLE IF NOT EXISTS public.user_facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'facility_admin')),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, facility_id)
);

-- Capability Templates table - standardized capabilities for onboarding new facilities
CREATE TABLE IF NOT EXISTS public.capability_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  target_level INTEGER NOT NULL DEFAULT 5 CHECK (target_level BETWEEN 1 AND 5),
  owner VARCHAR(255),
  qol_impact TEXT,
  color VARCHAR(50),
  is_enterprise BOOLEAN NOT NULL DEFAULT false,  -- true = auto-include for all facilities
  category VARCHAR(50) CHECK (category IN ('operations', 'technology', 'process')),
  mission VARCHAR(50) CHECK (mission IN ('mission_1', 'mission_2', 'mission_3')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Capability-Facility Progress table - per-facility maturity tracking
CREATE TABLE IF NOT EXISTS public.capability_facility_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capability_id UUID NOT NULL REFERENCES public.capabilities(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 5),
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(capability_id, facility_id)
);

-- =============================================================================
-- PHASE 2: ADD COLUMNS TO EXISTING TABLES
-- =============================================================================

-- Add facility_id and mission to capabilities
ALTER TABLE public.capabilities
  ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_enterprise BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mission VARCHAR(50) CHECK (mission IN ('mission_1', 'mission_2', 'mission_3'));

-- Add facility_id to milestones
ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL;

-- Add facility_id to quick_wins
ALTER TABLE public.quick_wins
  ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL;

-- Add facility_id to comments
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL;

-- Add facility_id to notifications
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL;

-- Add facility_id to attachments
ALTER TABLE public.attachments
  ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL;

-- Add facility_id to activity_log
ALTER TABLE public.activity_log
  ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL;

-- Add facility_id to chat_history
ALTER TABLE public.chat_history
  ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL;

-- =============================================================================
-- PHASE 3: CREATE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_facilities_code ON public.facilities(code);
CREATE INDEX IF NOT EXISTS idx_facilities_status ON public.facilities(status);
CREATE INDEX IF NOT EXISTS idx_user_facilities_user_id ON public.user_facilities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_facilities_facility_id ON public.user_facilities(facility_id);
CREATE INDEX IF NOT EXISTS idx_capability_templates_mission ON public.capability_templates(mission);
CREATE INDEX IF NOT EXISTS idx_capability_templates_is_enterprise ON public.capability_templates(is_enterprise);
CREATE INDEX IF NOT EXISTS idx_capability_facility_progress_capability ON public.capability_facility_progress(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_facility_progress_facility ON public.capability_facility_progress(facility_id);
CREATE INDEX IF NOT EXISTS idx_capabilities_facility_id ON public.capabilities(facility_id);
CREATE INDEX IF NOT EXISTS idx_capabilities_mission ON public.capabilities(mission);
CREATE INDEX IF NOT EXISTS idx_milestones_facility_id ON public.milestones(facility_id);
CREATE INDEX IF NOT EXISTS idx_quick_wins_facility_id ON public.quick_wins(facility_id);

-- =============================================================================
-- PHASE 4: ENABLE RLS ON NEW TABLES
-- =============================================================================

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capability_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capability_facility_progress ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PHASE 5: RLS POLICIES FOR NEW TABLES
-- =============================================================================

-- Facilities policies
CREATE POLICY "Users can view facilities they have access to"
  ON public.facilities FOR SELECT TO authenticated
  USING (
    -- Admins see all facilities
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    -- Users see facilities they're assigned to
    id IN (SELECT facility_id FROM public.user_facilities WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage facilities"
  ON public.facilities FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- User-Facilities policies
CREATE POLICY "Users can view their own facility assignments"
  ON public.user_facilities FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage user-facility assignments"
  ON public.user_facilities FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Capability Templates policies
CREATE POLICY "All authenticated users can view capability templates"
  ON public.capability_templates FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage capability templates"
  ON public.capability_templates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Capability-Facility Progress policies
CREATE POLICY "Users can view progress for their facilities"
  ON public.capability_facility_progress FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR facility_id IN (SELECT facility_id FROM public.user_facilities WHERE user_id = auth.uid())
  );

CREATE POLICY "Editors can update progress for their facilities"
  ON public.capability_facility_progress FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR (
      facility_id IN (
        SELECT facility_id FROM public.user_facilities
        WHERE user_id = auth.uid() AND role IN ('editor', 'facility_admin')
      )
    )
  );

-- =============================================================================
-- PHASE 6: UPDATE EXISTING RLS POLICIES FOR MULTI-FACILITY
-- =============================================================================

-- Drop existing policies that need updating
DROP POLICY IF EXISTS "Users can view all capabilities" ON public.capabilities;
DROP POLICY IF EXISTS "Editors can modify capabilities" ON public.capabilities;
DROP POLICY IF EXISTS "Users can view all milestones" ON public.milestones;
DROP POLICY IF EXISTS "Editors can modify milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can view all quick_wins" ON public.quick_wins;
DROP POLICY IF EXISTS "Editors can modify quick_wins" ON public.quick_wins;

-- New facility-aware policies for capabilities
CREATE POLICY "Users can view capabilities for their facilities"
  ON public.capabilities FOR SELECT TO authenticated
  USING (
    -- Enterprise capabilities visible to all
    is_enterprise = true
    OR facility_id IS NULL
    -- Admins see all
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    -- Users see their facility's capabilities
    OR facility_id IN (SELECT facility_id FROM public.user_facilities WHERE user_id = auth.uid())
  );

CREATE POLICY "Editors can modify capabilities for their facilities"
  ON public.capabilities FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
      AND (
        facility_id IS NULL
        OR facility_id IN (
          SELECT facility_id FROM public.user_facilities
          WHERE user_id = auth.uid() AND role IN ('editor', 'facility_admin')
        )
      )
    )
  );

-- New facility-aware policies for milestones
CREATE POLICY "Users can view milestones for their facilities"
  ON public.milestones FOR SELECT TO authenticated
  USING (
    facility_id IS NULL
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR facility_id IN (SELECT facility_id FROM public.user_facilities WHERE user_id = auth.uid())
  );

CREATE POLICY "Editors can modify milestones for their facilities"
  ON public.milestones FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
      AND (
        facility_id IS NULL
        OR facility_id IN (
          SELECT facility_id FROM public.user_facilities
          WHERE user_id = auth.uid() AND role IN ('editor', 'facility_admin')
        )
      )
    )
  );

-- New facility-aware policies for quick_wins
CREATE POLICY "Users can view quick_wins for their facilities"
  ON public.quick_wins FOR SELECT TO authenticated
  USING (
    facility_id IS NULL
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR facility_id IN (SELECT facility_id FROM public.user_facilities WHERE user_id = auth.uid())
  );

CREATE POLICY "Editors can modify quick_wins for their facilities"
  ON public.quick_wins FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
      AND (
        facility_id IS NULL
        OR facility_id IN (
          SELECT facility_id FROM public.user_facilities
          WHERE user_id = auth.uid() AND role IN ('editor', 'facility_admin')
        )
      )
    )
  );

-- =============================================================================
-- PHASE 7: TRIGGERS FOR NEW TABLES
-- =============================================================================

-- Trigger for facilities updated_at
CREATE TRIGGER facilities_updated_at BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for capability_templates updated_at
CREATE TRIGGER capability_templates_updated_at BEFORE UPDATE ON public.capability_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for capability_facility_progress updated_at
CREATE TRIGGER capability_facility_progress_updated_at BEFORE UPDATE ON public.capability_facility_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- PHASE 8: SEED FACILITIES DATA
-- =============================================================================

-- Insert the three facilities
INSERT INTO public.facilities (code, name, location_city, location_state, status, maturity_score, description) VALUES
('WLK', 'Westlake', 'Westlake', 'Florida', 'active', 4.0, 'Southeast Toyota Distributors - Westlake Florida Vehicle Processing Center. Original pilot facility with completed roadmap implementation.'),
('CMR', 'Commerce', 'Commerce', 'Georgia', 'planning', 0.0, 'Southeast Toyota Distributors - Commerce Georgia Vehicle Processing Center. New facility for roadmap implementation.'),
('BLI', 'Blount Island', 'Jacksonville', 'Florida', 'planning', 0.0, 'Southeast Toyota Distributors - Blount Island Florida Vehicle Processing Center. New facility for roadmap implementation.')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  location_city = EXCLUDED.location_city,
  location_state = EXCLUDED.location_state,
  description = EXCLUDED.description;

-- =============================================================================
-- PHASE 9: MIGRATE EXISTING DATA TO WESTLAKE FACILITY
-- =============================================================================

-- Get Westlake facility ID and assign all existing data
DO $$
DECLARE
  westlake_id UUID;
BEGIN
  SELECT id INTO westlake_id FROM public.facilities WHERE code = 'WLK';

  IF westlake_id IS NOT NULL THEN
    -- Update capabilities
    UPDATE public.capabilities SET facility_id = westlake_id WHERE facility_id IS NULL;

    -- Update milestones
    UPDATE public.milestones SET facility_id = westlake_id WHERE facility_id IS NULL;

    -- Update quick_wins
    UPDATE public.quick_wins SET facility_id = westlake_id WHERE facility_id IS NULL;

    -- Update comments
    UPDATE public.comments SET facility_id = westlake_id WHERE facility_id IS NULL;

    -- Update notifications
    UPDATE public.notifications SET facility_id = westlake_id WHERE facility_id IS NULL;

    -- Update attachments
    UPDATE public.attachments SET facility_id = westlake_id WHERE facility_id IS NULL;

    -- Update activity_log
    UPDATE public.activity_log SET facility_id = westlake_id WHERE facility_id IS NULL;

    -- Update chat_history
    UPDATE public.chat_history SET facility_id = westlake_id WHERE facility_id IS NULL;

    -- Assign all existing users to Westlake facility with their current role
    INSERT INTO public.user_facilities (user_id, facility_id, role, is_primary)
    SELECT
      u.id,
      westlake_id,
      CASE
        WHEN u.role = 'admin' THEN 'facility_admin'
        WHEN u.role = 'editor' THEN 'editor'
        ELSE 'viewer'
      END,
      true
    FROM public.users u
    ON CONFLICT (user_id, facility_id) DO NOTHING;
  END IF;
END $$;

-- =============================================================================
-- PHASE 10: SEED CAPABILITY TEMPLATES
-- =============================================================================

-- Mission I: Setting the Standard
INSERT INTO public.capability_templates (name, description, priority, target_level, is_enterprise, category, mission, order_index) VALUES
('Value Stream Mapping', 'Process flow analysis and optimization using VSM methodology for vehicle processing operations', 'CRITICAL', 5, true, 'process', 'mission_1', 1),
('Production Monitoring', 'Real-time visibility into vehicle processing operations with dashboards and alerts', 'HIGH', 5, true, 'operations', 'mission_1', 2),
('Quality Assurance', 'Defect prevention, tracking, and continuous improvement for vehicle processing', 'HIGH', 5, true, 'operations', 'mission_1', 3),
('Facility Design & Layout Management', 'AutoCAD-based facility design and layout capabilities using Autodesk tools for VPC optimization', 'HIGH', 5, true, 'technology', 'mission_1', 4),
('Process Simulation & Optimization', 'Simio-based discrete event simulation for workflow modeling and optimization', 'HIGH', 5, true, 'technology', 'mission_1', 5)
ON CONFLICT DO NOTHING;

-- Mission II: Flexible, Resilient Operations
INSERT INTO public.capability_templates (name, description, priority, target_level, is_enterprise, category, mission, order_index) VALUES
('Vehicle Movement Optimization', 'Logistics and flow optimization for vehicle processing across the facility', 'CRITICAL', 5, true, 'operations', 'mission_2', 6),
('Work Management Systems', 'Task and resource coordination across operations with scheduling and tracking', 'HIGH', 5, true, 'technology', 'mission_2', 7),
('Digital Twin Evolution', 'Virtual facility modeling and simulation for predictive planning', 'MEDIUM', 5, true, 'technology', 'mission_2', 8)
ON CONFLICT DO NOTHING;

-- Mission III: Evolving our Workforce
INSERT INTO public.capability_templates (name, description, priority, target_level, is_enterprise, category, mission, order_index) VALUES
('Workforce Training Systems', 'Employee development and skills tracking for continuous improvement', 'HIGH', 5, true, 'process', 'mission_3', 9),
('Knowledge Management', 'Documentation and institutional knowledge capture for operational excellence', 'MEDIUM', 4, true, 'process', 'mission_3', 10),
('Additive Manufacturing', '3D printing capabilities for parts and tooling to support operations', 'LOW', 3, false, 'technology', 'mission_3', 11)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PHASE 11: ENABLE REALTIME FOR NEW TABLES
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.facilities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_facilities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.capability_facility_progress;

-- =============================================================================
-- PHASE 12: CREATE HELPER FUNCTIONS
-- =============================================================================

-- Function to get user's facilities
CREATE OR REPLACE FUNCTION get_user_facilities(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  facility_id UUID,
  facility_code VARCHAR(10),
  facility_name VARCHAR(255),
  user_role VARCHAR(20),
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.code,
    f.name,
    uf.role,
    uf.is_primary
  FROM public.facilities f
  JOIN public.user_facilities uf ON uf.facility_id = f.id
  WHERE uf.user_id = p_user_id
  ORDER BY uf.is_primary DESC, f.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate facility maturity score
CREATE OR REPLACE FUNCTION calculate_facility_maturity(p_facility_id UUID)
RETURNS DECIMAL(3,1) AS $$
DECLARE
  avg_level DECIMAL(3,1);
BEGIN
  SELECT COALESCE(AVG(current_level), 0)::DECIMAL(3,1)
  INTO avg_level
  FROM public.capabilities
  WHERE facility_id = p_facility_id;

  RETURN avg_level;
END;
$$ LANGUAGE plpgsql;

-- Function to instantiate capability templates for a new facility
CREATE OR REPLACE FUNCTION instantiate_capability_templates(
  p_facility_id UUID,
  p_enterprise_only BOOLEAN DEFAULT true
)
RETURNS INTEGER AS $$
DECLARE
  template RECORD;
  count INTEGER := 0;
BEGIN
  FOR template IN
    SELECT * FROM public.capability_templates
    WHERE (p_enterprise_only = false OR is_enterprise = true)
  LOOP
    INSERT INTO public.capabilities (
      name, description, priority, current_level, target_level,
      owner, qol_impact, color, facility_id, is_enterprise, mission
    ) VALUES (
      template.name, template.description, template.priority, 1, template.target_level,
      template.owner, template.qol_impact, template.color, p_facility_id, template.is_enterprise, template.mission
    ) ON CONFLICT DO NOTHING;

    count := count + 1;
  END LOOP;

  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- Summary:
-- 1. Created facilities table with WLK, CMR, BLI
-- 2. Created user_facilities junction table for access control
-- 3. Created capability_templates for standardized onboarding
-- 4. Created capability_facility_progress for per-facility tracking
-- 5. Added facility_id to all relevant tables
-- 6. Migrated existing data to Westlake (WLK) facility
-- 7. Updated RLS policies for multi-facility access
-- 8. Created helper functions for facility management
