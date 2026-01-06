-- supabase/migrations/20240106000000_improve_rls_policies.sql
-- Improved RLS Policies for proper role-based access control

-- First, drop existing policies that are too permissive
DROP POLICY IF EXISTS "Editors can modify capabilities" ON public.capabilities;
DROP POLICY IF EXISTS "Editors can modify milestones" ON public.milestones;
DROP POLICY IF EXISTS "Editors can modify quick_wins" ON public.quick_wins;
DROP POLICY IF EXISTS "System can insert activity_log" ON public.activity_log;

-- Capabilities: Separate policies for INSERT, UPDATE, DELETE
CREATE POLICY "Editors can insert capabilities" ON public.capabilities
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Editors can update capabilities" ON public.capabilities
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins can delete capabilities" ON public.capabilities
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Milestones: Separate policies for INSERT, UPDATE, DELETE
CREATE POLICY "Editors can insert milestones" ON public.milestones
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Editors can update milestones" ON public.milestones
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins can delete milestones" ON public.milestones
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Quick Wins: Separate policies for INSERT, UPDATE, DELETE
CREATE POLICY "Editors can insert quick_wins" ON public.quick_wins
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Editors can update quick_wins" ON public.quick_wins
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins can delete quick_wins" ON public.quick_wins
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Activity Log: Allow system inserts via service role key or from triggers
CREATE POLICY "Allow activity_log inserts" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Users table: Allow admins to view all users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update user roles
CREATE POLICY "Admins can update user roles" ON public.users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can manage maturity definitions
CREATE POLICY "Admins can insert maturity_definitions" ON public.maturity_definitions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update maturity_definitions" ON public.maturity_definitions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete maturity_definitions" ON public.maturity_definitions
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can manage technology options
CREATE POLICY "Admins can insert technology_options" ON public.technology_options
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update technology_options" ON public.technology_options
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete technology_options" ON public.technology_options
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Add helpful function to check current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Grant execute on the function
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
