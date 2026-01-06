-- supabase/migrations/20240101000000_initial_schema.sql
-- SET VPC Roadmap Platform - Initial Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Capabilities table
CREATE TABLE IF NOT EXISTS public.capabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 5),
  target_level INTEGER NOT NULL DEFAULT 4 CHECK (target_level BETWEEN 1 AND 5),
  owner TEXT,
  color TEXT,
  qol_impact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capability_id UUID NOT NULL REFERENCES public.capabilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  from_level INTEGER NOT NULL CHECK (from_level BETWEEN 1 AND 5),
  to_level INTEGER NOT NULL CHECK (to_level BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
  path_a_months INTEGER,
  path_b_months INTEGER,
  path_c_months INTEGER,
  dependencies UUID[],
  deliverables TEXT[],
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quick Wins table
CREATE TABLE IF NOT EXISTS public.quick_wins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  capability_id UUID REFERENCES public.capabilities(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  timeline_months INTEGER NOT NULL DEFAULT 1,
  investment TEXT CHECK (investment IN ('LOW', 'MEDIUM', 'HIGH')),
  roi TEXT CHECK (roi IN ('LOW', 'MEDIUM', 'HIGH')),
  category TEXT,
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat History table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maturity Definitions table
CREATE TABLE IF NOT EXISTS public.maturity_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level INTEGER NOT NULL UNIQUE CHECK (level BETWEEN 1 AND 5),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  characteristics TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Technology Options table
CREATE TABLE IF NOT EXISTS public.technology_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  vendor TEXT,
  description TEXT,
  pros TEXT[] NOT NULL DEFAULT '{}',
  cons TEXT[] NOT NULL DEFAULT '{}',
  estimated_cost TEXT,
  survivability_score INTEGER CHECK (survivability_score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_capabilities_priority ON public.capabilities(priority);
CREATE INDEX IF NOT EXISTS idx_milestones_capability_id ON public.milestones(capability_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.milestones(status);
CREATE INDEX IF NOT EXISTS idx_quick_wins_status ON public.quick_wins(status);
CREATE INDEX IF NOT EXISTS idx_quick_wins_capability_id ON public.quick_wins(capability_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_session ON public.chat_history(user_id, session_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maturity_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technology_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read all data, editors and admins can write
CREATE POLICY "Users can view all capabilities" ON public.capabilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Editors can modify capabilities" ON public.capabilities FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Users can view all milestones" ON public.milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Editors can modify milestones" ON public.milestones FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Users can view all quick_wins" ON public.quick_wins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Editors can modify quick_wins" ON public.quick_wins FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Users can view activity_log" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert activity_log" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view own chat_history" ON public.chat_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own chat_history" ON public.chat_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view maturity_definitions" ON public.maturity_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view technology_options" ON public.technology_options FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (id = auth.uid());

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER capabilities_updated_at BEFORE UPDATE ON public.capabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER milestones_updated_at BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER quick_wins_updated_at BEFORE UPDATE ON public.quick_wins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Activity log trigger function
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_log (user_id, table_name, record_id, action, old_values, new_values)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply activity log triggers
CREATE TRIGGER log_capabilities_changes AFTER INSERT OR UPDATE OR DELETE ON public.capabilities
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_milestones_changes AFTER INSERT OR UPDATE OR DELETE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_quick_wins_changes AFTER INSERT OR UPDATE OR DELETE ON public.quick_wins
  FOR EACH ROW EXECUTE FUNCTION log_activity();
