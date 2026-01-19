-- =============================================================================
-- FIX FACILITY IDS ON MILESTONES AND QUICK WINS
-- =============================================================================
-- Ensure all milestones and quick_wins have their facility_id set
-- based on their parent capability's facility_id

-- Update milestones to inherit facility_id from their capability
UPDATE public.milestones m
SET facility_id = c.facility_id
FROM public.capabilities c
WHERE m.capability_id = c.id
  AND m.facility_id IS NULL
  AND c.facility_id IS NOT NULL;

-- Update quick_wins to inherit facility_id from their capability
UPDATE public.quick_wins q
SET facility_id = c.facility_id
FROM public.capabilities c
WHERE q.capability_id = c.id
  AND q.facility_id IS NULL
  AND c.facility_id IS NOT NULL;

-- For any capabilities still without facility_id, assign to Westlake
UPDATE public.capabilities
SET facility_id = (SELECT id FROM public.facilities WHERE code = 'WLK')
WHERE facility_id IS NULL AND is_enterprise = false;

-- Then update their milestones
UPDATE public.milestones m
SET facility_id = c.facility_id
FROM public.capabilities c
WHERE m.capability_id = c.id
  AND m.facility_id IS NULL
  AND c.facility_id IS NOT NULL;

-- And their quick_wins
UPDATE public.quick_wins q
SET facility_id = c.facility_id
FROM public.capabilities c
WHERE q.capability_id = c.id
  AND q.facility_id IS NULL
  AND c.facility_id IS NOT NULL;

-- Log counts
DO $$
DECLARE
  cap_count INTEGER;
  ms_count INTEGER;
  qw_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cap_count FROM public.capabilities WHERE facility_id IS NOT NULL;
  SELECT COUNT(*) INTO ms_count FROM public.milestones WHERE facility_id IS NOT NULL;
  SELECT COUNT(*) INTO qw_count FROM public.quick_wins WHERE facility_id IS NOT NULL;

  RAISE NOTICE 'Facility IDs fixed: % capabilities, % milestones, % quick_wins', cap_count, ms_count, qw_count;
END $$;
