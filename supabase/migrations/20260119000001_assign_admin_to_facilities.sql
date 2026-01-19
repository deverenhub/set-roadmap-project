-- =============================================================================
-- ASSIGN ADMIN USERS TO ALL FACILITIES
-- =============================================================================
-- This migration ensures admin users have access to all facilities

-- Insert admin users into all facilities (if not already there)
INSERT INTO public.user_facilities (user_id, facility_id, role, is_primary)
SELECT
  u.id as user_id,
  f.id as facility_id,
  'facility_admin' as role,
  CASE WHEN f.code = 'WLK' THEN true ELSE false END as is_primary
FROM public.users u
CROSS JOIN public.facilities f
WHERE u.role = 'admin'
ON CONFLICT (user_id, facility_id) DO UPDATE SET
  role = 'facility_admin';

-- Also ensure Westlake facility has the correct initial capabilities associated
-- Update any capabilities that don't have a facility_id to be assigned to Westlake
UPDATE public.capabilities
SET facility_id = (SELECT id FROM public.facilities WHERE code = 'WLK')
WHERE facility_id IS NULL AND is_enterprise = false;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Admin users assigned to all facilities successfully';
END $$;
