-- Create attachments table for file uploads on capabilities and milestones
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('capability', 'milestone', 'quick_win')),
  entity_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

-- Enable RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attachments
-- Everyone can view attachments
CREATE POLICY "attachments_select_policy" ON attachments
  FOR SELECT USING (true);

-- Admins and editors can insert attachments
CREATE POLICY "attachments_insert_policy" ON attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'editor')
    )
  );

-- Admins and uploaders can delete their own attachments
CREATE POLICY "attachments_delete_policy" ON attachments
  FOR DELETE USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create activity log trigger for attachments
CREATE OR REPLACE FUNCTION log_attachment_activity()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  record_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_type := 'INSERT';
    record_name := NEW.file_name;

    INSERT INTO activity_log (
      table_name, record_id, action, record_name, new_data, user_id
    ) VALUES (
      'attachments', NEW.id, action_type, record_name, row_to_json(NEW), NEW.uploaded_by
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    record_name := OLD.file_name;

    INSERT INTO activity_log (
      table_name, record_id, action, record_name, old_data, user_id
    ) VALUES (
      'attachments', OLD.id, action_type, record_name, row_to_json(OLD), OLD.uploaded_by
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER attachments_activity_trigger
  AFTER INSERT OR DELETE ON attachments
  FOR EACH ROW EXECUTE FUNCTION log_attachment_activity();

-- Create storage bucket for attachments (run in Supabase Dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'attachments',
--   'attachments',
--   false,
--   52428800, -- 50MB limit
--   ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/csv']
-- );
