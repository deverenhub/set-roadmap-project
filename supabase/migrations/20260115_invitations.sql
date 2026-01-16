-- Migration: User Invitations System
-- Description: Create invitations table for email-based user invitations

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);

-- Create index on token for faster lookups during acceptance
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON public.invitations(expires_at);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all invitations
CREATE POLICY "Admins can view all invitations"
  ON public.invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can create invitations
CREATE POLICY "Admins can create invitations"
  ON public.invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can update invitations (to revoke/mark as accepted)
CREATE POLICY "Admins can update invitations"
  ON public.invitations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can delete invitations
CREATE POLICY "Admins can delete invitations"
  ON public.invitations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Anyone can read their own invitation by token (for acceptance)
-- This is handled via service role in the accept function

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invitations_updated_at_trigger
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitations_updated_at();

-- Function to generate secure invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a secure random token (32 bytes = 64 hex chars)
  token := encode(gen_random_bytes(32), 'hex');
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to accept an invitation (called by Edge Function with service role)
CREATE OR REPLACE FUNCTION accept_invitation(
  p_token TEXT,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_invitation RECORD;
  v_result JSON;
BEGIN
  -- Find the invitation
  SELECT * INTO v_invitation
  FROM public.invitations
  WHERE token = p_token
  AND accepted_at IS NULL
  AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired invitation'
    );
  END IF;

  -- Mark invitation as accepted
  UPDATE public.invitations
  SET accepted_at = NOW()
  WHERE id = v_invitation.id;

  -- Update user role to match invitation
  UPDATE public.users
  SET role = v_invitation.role
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'email', v_invitation.email,
    'role', v_invitation.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log invitation activity
CREATE OR REPLACE FUNCTION log_invitation_activity()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_type := 'INSERT';
    INSERT INTO activity_log (table_name, record_id, action, new_values, user_id)
    VALUES ('invitations', NEW.id, action_type, row_to_json(NEW), NEW.invited_by);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'UPDATE';
    INSERT INTO activity_log (table_name, record_id, action, old_values, new_values, user_id)
    VALUES ('invitations', NEW.id, action_type, row_to_json(OLD), row_to_json(NEW), NEW.invited_by);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    INSERT INTO activity_log (table_name, record_id, action, old_values, user_id)
    VALUES ('invitations', OLD.id, action_type, row_to_json(OLD), OLD.invited_by);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invitation_activity_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION log_invitation_activity();

-- Grant permissions
GRANT ALL ON public.invitations TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.invitations TO anon;
