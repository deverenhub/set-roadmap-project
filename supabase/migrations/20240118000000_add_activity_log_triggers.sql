-- supabase/migrations/20240118000000_add_activity_log_triggers.sql
-- Add automatic activity logging triggers for all main tables

-- =============================================================================
-- ACTIVITY LOGGING FUNCTION
-- =============================================================================
-- Generic function to log activity for any table

CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values JSONB := NULL;
  v_new_values JSONB := NULL;
  v_record_id TEXT;
  v_user_id UUID;
BEGIN
  -- Get the current user ID from the session
  v_user_id := auth.uid();

  -- Determine action and values
  IF TG_OP = 'INSERT' THEN
    v_new_values := to_jsonb(NEW);
    v_record_id := NEW.id::TEXT;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
    v_record_id := NEW.id::TEXT;
  ELSIF TG_OP = 'DELETE' THEN
    v_old_values := to_jsonb(OLD);
    v_record_id := OLD.id::TEXT;
  END IF;

  -- Insert into activity log
  INSERT INTO public.activity_log (
    user_id,
    table_name,
    record_id,
    action,
    old_values,
    new_values
  ) VALUES (
    v_user_id,
    TG_TABLE_NAME,
    v_record_id,
    TG_OP,
    v_old_values,
    v_new_values
  );

  -- Return appropriate value
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- CREATE ACTIVITY LOG TRIGGERS
-- =============================================================================

-- Capabilities activity logging
DROP TRIGGER IF EXISTS log_capabilities_activity ON public.capabilities;
CREATE TRIGGER log_capabilities_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.capabilities
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Milestones activity logging
DROP TRIGGER IF EXISTS log_milestones_activity ON public.milestones;
CREATE TRIGGER log_milestones_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Quick Wins activity logging
DROP TRIGGER IF EXISTS log_quick_wins_activity ON public.quick_wins;
CREATE TRIGGER log_quick_wins_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.quick_wins
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Technology Options activity logging
DROP TRIGGER IF EXISTS log_technology_options_activity ON public.technology_options;
CREATE TRIGGER log_technology_options_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.technology_options
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Comments activity logging
DROP TRIGGER IF EXISTS log_comments_activity ON public.comments;
CREATE TRIGGER log_comments_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- =============================================================================
-- ADD INDEXES FOR BETTER QUERY PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_activity_log_table_name ON public.activity_log(table_name);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_record_id ON public.activity_log(record_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);

-- =============================================================================
-- UPDATE RLS POLICIES FOR ADMIN ACCESS
-- =============================================================================

-- Allow admins to view all users (for activity log display)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR id = auth.uid()
);

-- =============================================================================
-- NOTES
-- =============================================================================
-- This migration adds automatic activity logging for:
-- - capabilities
-- - milestones
-- - quick_wins
-- - technology_options
-- - comments
--
-- Each INSERT, UPDATE, or DELETE operation will be logged with:
-- - The user who performed the action
-- - The table affected
-- - The record ID
-- - The action type (INSERT/UPDATE/DELETE)
-- - Old values (for UPDATE and DELETE)
-- - New values (for INSERT and UPDATE)
