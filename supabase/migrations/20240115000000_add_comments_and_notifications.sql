-- supabase/migrations/20240115000000_add_comments_and_notifications.sql
-- Add Comments and Notifications tables for stakeholder collaboration

-- =============================================================================
-- COMMENTS TABLE
-- =============================================================================
-- Comments can be attached to capabilities, milestones, or quick wins
-- Supports nested replies via parent_id

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Polymorphic relationship - comment can be on any entity type
  entity_type TEXT NOT NULL CHECK (entity_type IN ('capability', 'milestone', 'quick_win')),
  entity_id UUID NOT NULL,

  -- For nested replies
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,

  -- Mentions (array of user IDs mentioned in the comment)
  mentions UUID[] DEFAULT '{}',

  -- Soft delete support
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Users can view comments"
  ON public.comments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users and admins can update comments"
  ON public.comments FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- NOTIFICATIONS TABLE
-- =============================================================================
-- In-app notifications for various events

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Notification type
  type TEXT NOT NULL CHECK (type IN (
    'comment',           -- Someone commented on your item
    'mention',           -- You were mentioned in a comment
    'status_change',     -- An item's status changed
    'blocked',           -- An item became blocked
    'milestone_due',     -- A milestone is due soon
    'assignment',        -- You were assigned to something
    'system'             -- System notification
  )),

  -- Title and message
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Link to related entity
  entity_type TEXT CHECK (entity_type IN ('capability', 'milestone', 'quick_win', 'comment')),
  entity_id UUID,

  -- Actor who triggered the notification (null for system notifications)
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Read status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Metadata for additional context
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- =============================================================================
-- NOTIFICATION TRIGGER FUNCTIONS
-- =============================================================================

-- Function to create notifications when a comment is added
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  entity_owner_name TEXT;
  entity_name TEXT;
  commenter_name TEXT;
  mentioned_user UUID;
BEGIN
  -- Get commenter name
  SELECT full_name INTO commenter_name
  FROM public.users WHERE id = NEW.user_id;

  -- Get entity details based on type
  IF NEW.entity_type = 'capability' THEN
    SELECT owner, name INTO entity_owner_name, entity_name
    FROM public.capabilities WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'milestone' THEN
    SELECT c.owner, m.name INTO entity_owner_name, entity_name
    FROM public.milestones m
    JOIN public.capabilities c ON m.capability_id = c.id
    WHERE m.id = NEW.entity_id;
  ELSIF NEW.entity_type = 'quick_win' THEN
    SELECT c.owner, q.name INTO entity_owner_name, entity_name
    FROM public.quick_wins q
    LEFT JOIN public.capabilities c ON q.capability_id = c.id
    WHERE q.id = NEW.entity_id;
  END IF;

  -- Notify mentioned users
  IF NEW.mentions IS NOT NULL AND array_length(NEW.mentions, 1) > 0 THEN
    FOREACH mentioned_user IN ARRAY NEW.mentions
    LOOP
      IF mentioned_user != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id, actor_id)
        VALUES (
          mentioned_user,
          'mention',
          'You were mentioned in a comment',
          COALESCE(commenter_name, 'Someone') || ' mentioned you on ' || COALESCE(entity_name, 'an item'),
          NEW.entity_type,
          NEW.entity_id,
          NEW.user_id
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comment notifications
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

-- Function to create notifications when milestone status changes to blocked
CREATE OR REPLACE FUNCTION notify_on_milestone_blocked()
RETURNS TRIGGER AS $$
DECLARE
  capability_owner TEXT;
  milestone_name TEXT;
  owner_user_id UUID;
BEGIN
  -- Only notify when status changes to blocked
  IF NEW.status = 'blocked' AND (OLD.status IS NULL OR OLD.status != 'blocked') THEN
    -- Get capability owner and milestone name
    SELECT c.owner, m.name INTO capability_owner, milestone_name
    FROM public.milestones m
    JOIN public.capabilities c ON m.capability_id = c.id
    WHERE m.id = NEW.id;

    -- Find user by owner name (if exists)
    SELECT id INTO owner_user_id
    FROM public.users
    WHERE full_name = capability_owner
    LIMIT 1;

    -- Create notification for all admins and editors about blocked item
    INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id, metadata)
    SELECT
      u.id,
      'blocked',
      'Milestone Blocked',
      COALESCE(milestone_name, 'A milestone') || ' has been marked as blocked',
      'milestone',
      NEW.id,
      jsonb_build_object('old_status', OLD.status, 'capability_owner', capability_owner)
    FROM public.users u
    WHERE u.role IN ('admin', 'editor');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for blocked milestone notifications
CREATE TRIGGER on_milestone_blocked
  AFTER UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION notify_on_milestone_blocked();

-- =============================================================================
-- ENABLE REALTIME FOR NEW TABLES
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
