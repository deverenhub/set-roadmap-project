-- supabase/migrations/20240117000000_add_milestone_timeline_offset.sql
-- Add timeline offset for custom milestone positioning

-- =============================================================================
-- TIMELINE OFFSET COLUMN
-- =============================================================================
-- Add timeline_offset to milestones table for custom start positioning
-- This allows admins/editors to drag milestones to different start positions

ALTER TABLE public.milestones
ADD COLUMN IF NOT EXISTS timeline_offset INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.milestones.timeline_offset IS
  'Offset in months from the default sequential position. Positive values delay start, negative values advance start.';

-- =============================================================================
-- NOTES
-- =============================================================================
-- The timeline_offset column allows milestones to be positioned independently
-- on the Gantt chart. By default (0), milestones are sequenced automatically
-- based on their from_level within each capability. A positive offset delays
-- the start, while a negative offset advances it.
