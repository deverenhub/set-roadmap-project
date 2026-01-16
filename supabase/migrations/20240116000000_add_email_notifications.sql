-- supabase/migrations/20240116000000_add_email_notifications.sql
-- Add email notification preferences and triggers

-- =============================================================================
-- EMAIL PREFERENCES COLUMNS
-- =============================================================================
-- Add email notification preferences to users table

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notify_on_mentions BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notify_on_blocked BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notify_on_status_change BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- EXTENSION FOR HTTP CALLS
-- =============================================================================
-- Enable pg_net extension for making HTTP calls to edge functions
-- Note: This may already be enabled in your Supabase project

CREATE EXTENSION IF NOT EXISTS pg_net;

-- =============================================================================
-- FUNCTION TO SEND EMAIL VIA EDGE FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION send_notification_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  email_enabled BOOLEAN;
  notify_mentions BOOLEAN;
  notify_blocked BOOLEAN;
  entity_name TEXT;
  entity_type_name TEXT;
  actor_name TEXT;
  supabase_url TEXT;
  service_key TEXT;
  request_id BIGINT;
BEGIN
  -- Get Supabase URL and service key from environment
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);

  -- If settings not available, skip email
  IF supabase_url IS NULL OR service_key IS NULL THEN
    RAISE NOTICE 'Email settings not configured, skipping email notification';
    RETURN NEW;
  END IF;

  -- Get user's email preferences
  SELECT
    email,
    full_name,
    COALESCE(email_notifications, TRUE),
    COALESCE(notify_on_mentions, TRUE),
    COALESCE(notify_on_blocked, TRUE)
  INTO
    user_email,
    user_name,
    email_enabled,
    notify_mentions,
    notify_blocked
  FROM public.users
  WHERE id = NEW.user_id;

  -- Skip if user doesn't have email or has disabled notifications
  IF user_email IS NULL OR NOT email_enabled THEN
    RETURN NEW;
  END IF;

  -- Check specific notification preferences
  IF NEW.type = 'mention' AND NOT notify_mentions THEN
    RETURN NEW;
  END IF;

  IF NEW.type = 'blocked' AND NOT notify_blocked THEN
    RETURN NEW;
  END IF;

  -- Get actor name if available
  IF NEW.actor_id IS NOT NULL THEN
    SELECT full_name INTO actor_name
    FROM public.users
    WHERE id = NEW.actor_id;
  END IF;

  -- Get entity name based on type
  IF NEW.entity_type = 'capability' THEN
    SELECT name INTO entity_name FROM public.capabilities WHERE id = NEW.entity_id;
    entity_type_name := 'capabilities';
  ELSIF NEW.entity_type = 'milestone' THEN
    SELECT name INTO entity_name FROM public.milestones WHERE id = NEW.entity_id;
    entity_type_name := 'timeline';
  ELSIF NEW.entity_type = 'quick_win' THEN
    SELECT name INTO entity_name FROM public.quick_wins WHERE id = NEW.entity_id;
    entity_type_name := 'quick-wins';
  END IF;

  -- Make HTTP request to edge function
  SELECT net.http_post(
    url := supabase_url || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object(
      'to', user_email,
      'type', NEW.type,
      'subject', NEW.title,
      'data', jsonb_build_object(
        'recipientName', user_name,
        'actorName', actor_name,
        'entityName', entity_name,
        'entityType', NEW.entity_type,
        'entityId', NEW.entity_id,
        'message', NEW.message,
        'oldStatus', NEW.metadata->>'old_status',
        'newStatus', NEW.metadata->>'new_status'
      )
    )
  ) INTO request_id;

  RAISE NOTICE 'Email notification queued with request_id: %', request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGER FOR EMAIL NOTIFICATIONS
-- =============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_notification_send_email ON public.notifications;

-- Create trigger to send email when notification is inserted
CREATE TRIGGER on_notification_send_email
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  WHEN (NEW.type IN ('mention', 'blocked'))
  EXECUTE FUNCTION send_notification_email();

-- =============================================================================
-- COMMENT ON FUNCTIONS
-- =============================================================================

COMMENT ON FUNCTION send_notification_email() IS
  'Sends email notifications via Supabase Edge Function when notifications are created';

-- =============================================================================
-- NOTES
-- =============================================================================
-- To enable email notifications, you need to:
-- 1. Deploy the send-email edge function
-- 2. Set up a Resend account and get an API key
-- 3. Configure the following secrets in Supabase:
--    - RESEND_API_KEY: Your Resend API key
--    - FROM_EMAIL: The email address to send from (must be verified in Resend)
--    - APP_URL: Your application URL for links in emails
