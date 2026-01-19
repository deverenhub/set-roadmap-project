-- supabase/migrations/20260119000000_autocad_simio_capabilities.sql
-- AutoCAD and Simio Capabilities with Detailed Milestones
-- Based on TSVMap Proposals 1 & 2 (August 2024)

-- =============================================================================
-- CREATE AUTOCAD AND SIMIO CAPABILITIES FOR WESTLAKE
-- =============================================================================

DO $$
DECLARE
  westlake_id UUID;
  autocad_cap_id UUID;
  simio_cap_id UUID;
  vsm_cap_id UUID;
  production_cap_id UUID;
  quality_cap_id UUID;
  vehicle_movement_cap_id UUID;
  work_management_cap_id UUID;
  digital_twin_cap_id UUID;
  workforce_cap_id UUID;
  knowledge_cap_id UUID;
  additive_cap_id UUID;
BEGIN
  -- Get Westlake facility ID
  SELECT id INTO westlake_id FROM public.facilities WHERE code = 'WLK';

  IF westlake_id IS NULL THEN
    RAISE EXCEPTION 'Westlake facility not found';
  END IF;

  -- =========================================================================
  -- MISSION I: SETTING THE STANDARD
  -- =========================================================================

  -- Create Value Stream Mapping capability
  INSERT INTO public.capabilities (
    name, description, priority, current_level, target_level,
    owner, qol_impact, color, facility_id, is_enterprise, mission
  ) VALUES (
    'Value Stream Mapping',
    'Process flow analysis and optimization using VSM methodology for vehicle processing operations. Maps current state, identifies waste, and designs future state for continuous improvement.',
    'CRITICAL', 3, 5,
    'Process Excellence Team',
    'Reduced lead times, eliminated waste, improved throughput, better resource utilization',
    '#2563eb',
    westlake_id, true, 'mission_1'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO vsm_cap_id;

  -- Get existing VSM capability if insert was skipped
  IF vsm_cap_id IS NULL THEN
    SELECT id INTO vsm_cap_id FROM public.capabilities
    WHERE name = 'Value Stream Mapping' AND facility_id = westlake_id;
  END IF;

  -- Create Production Monitoring capability
  INSERT INTO public.capabilities (
    name, description, priority, current_level, target_level,
    owner, qol_impact, color, facility_id, is_enterprise, mission
  ) VALUES (
    'Production Monitoring',
    'Real-time visibility into vehicle processing operations with dashboards, KPIs, and automated alerts for proactive management.',
    'HIGH', 3, 5,
    'Operations Team',
    'Real-time decision making, reduced downtime, improved responsiveness, better visibility',
    '#16a34a',
    westlake_id, true, 'mission_1'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO production_cap_id;

  IF production_cap_id IS NULL THEN
    SELECT id INTO production_cap_id FROM public.capabilities
    WHERE name = 'Production Monitoring' AND facility_id = westlake_id;
  END IF;

  -- Create Quality Assurance capability
  INSERT INTO public.capabilities (
    name, description, priority, current_level, target_level,
    owner, qol_impact, color, facility_id, is_enterprise, mission
  ) VALUES (
    'Quality Assurance',
    'Defect prevention, tracking, and continuous improvement for vehicle processing. Includes inspection protocols, quality metrics, and corrective action workflows.',
    'HIGH', 3, 5,
    'Quality Team',
    'Reduced defects, higher customer satisfaction, lower rework costs, compliance assurance',
    '#dc2626',
    westlake_id, true, 'mission_1'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO quality_cap_id;

  IF quality_cap_id IS NULL THEN
    SELECT id INTO quality_cap_id FROM public.capabilities
    WHERE name = 'Quality Assurance' AND facility_id = westlake_id;
  END IF;

  -- Create Facility Design & Layout Management (AutoCAD) capability
  INSERT INTO public.capabilities (
    name, description, priority, current_level, target_level,
    owner, qol_impact, color, facility_id, is_enterprise, mission
  ) VALUES (
    'Facility Design & Layout Management',
    'AutoCAD-based facility design and layout capabilities using Autodesk tools for VPC optimization. Provides accurate 2D/3D facility models, standardized drawing templates, and BIM integration for digital twin synchronization.',
    'HIGH', 1, 5,
    'Engineering Team',
    'Reduced design iteration time, improved facility planning accuracy, standardized documentation, digital twin foundation',
    '#7c3aed',
    westlake_id, true, 'mission_1'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO autocad_cap_id;

  -- Get existing AutoCAD capability if insert was skipped
  IF autocad_cap_id IS NULL THEN
    SELECT id INTO autocad_cap_id FROM public.capabilities
    WHERE name = 'Facility Design & Layout Management' AND facility_id = westlake_id;
  END IF;

  -- Create Process Simulation & Optimization (Simio) capability
  INSERT INTO public.capabilities (
    name, description, priority, current_level, target_level,
    owner, qol_impact, color, facility_id, is_enterprise, mission
  ) VALUES (
    'Process Simulation & Optimization',
    'Simio-based discrete event simulation for workflow modeling and optimization. Enables data-driven decisions, bottleneck identification, and what-if scenario analysis for vehicle processing operations.',
    'HIGH', 1, 5,
    'Simulation Team',
    'Data-driven decisions, reduced processing time, optimized resource allocation, risk mitigation through scenario testing',
    '#0891b2',
    westlake_id, true, 'mission_1'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO simio_cap_id;

  -- Get existing Simio capability if insert was skipped
  IF simio_cap_id IS NULL THEN
    SELECT id INTO simio_cap_id FROM public.capabilities
    WHERE name = 'Process Simulation & Optimization' AND facility_id = westlake_id;
  END IF;

  -- =========================================================================
  -- MISSION II: FLEXIBLE, RESILIENT OPERATIONS
  -- =========================================================================

  -- Create Vehicle Movement Optimization capability
  INSERT INTO public.capabilities (
    name, description, priority, current_level, target_level,
    owner, qol_impact, color, facility_id, is_enterprise, mission
  ) VALUES (
    'Vehicle Movement Optimization',
    'Logistics and flow optimization for vehicle processing across the facility. Includes routing algorithms, traffic management, and throughput optimization.',
    'CRITICAL', 2, 5,
    'Logistics Team',
    'Reduced vehicle transit time, improved throughput, better space utilization, reduced congestion',
    '#ea580c',
    westlake_id, true, 'mission_2'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO vehicle_movement_cap_id;

  IF vehicle_movement_cap_id IS NULL THEN
    SELECT id INTO vehicle_movement_cap_id FROM public.capabilities
    WHERE name = 'Vehicle Movement Optimization' AND facility_id = westlake_id;
  END IF;

  -- Create Work Management Systems capability
  INSERT INTO public.capabilities (
    name, description, priority, current_level, target_level,
    owner, qol_impact, color, facility_id, is_enterprise, mission
  ) VALUES (
    'Work Management Systems',
    'Task and resource coordination across operations with scheduling, tracking, and workload balancing capabilities.',
    'HIGH', 2, 5,
    'Operations Team',
    'Improved task coordination, better resource utilization, reduced idle time, clear accountability',
    '#0d9488',
    westlake_id, true, 'mission_2'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO work_management_cap_id;

  IF work_management_cap_id IS NULL THEN
    SELECT id INTO work_management_cap_id FROM public.capabilities
    WHERE name = 'Work Management Systems' AND facility_id = westlake_id;
  END IF;

  -- Create Digital Twin Evolution capability
  INSERT INTO public.capabilities (
    name, description, priority, current_level, target_level,
    owner, qol_impact, color, facility_id, is_enterprise, mission
  ) VALUES (
    'Digital Twin Evolution',
    'Virtual facility modeling and simulation for predictive planning. Combines AutoCAD layouts with Simio simulation for real-time digital representation.',
    'MEDIUM', 1, 5,
    'Technology Team',
    'Predictive maintenance, scenario planning, reduced downtime, improved decision making',
    '#6366f1',
    westlake_id, true, 'mission_2'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO digital_twin_cap_id;

  IF digital_twin_cap_id IS NULL THEN
    SELECT id INTO digital_twin_cap_id FROM public.capabilities
    WHERE name = 'Digital Twin Evolution' AND facility_id = westlake_id;
  END IF;

  -- =========================================================================
  -- MISSION III: EVOLVING OUR WORKFORCE
  -- =========================================================================

  -- Create Workforce Training Systems capability
  INSERT INTO public.capabilities (
    name, description, priority, current_level, target_level,
    owner, qol_impact, color, facility_id, is_enterprise, mission
  ) VALUES (
    'Workforce Training Systems',
    'Employee development and skills tracking for continuous improvement. Includes training programs, certification tracking, and competency management.',
    'HIGH', 2, 5,
    'HR & Training Team',
    'Improved employee skills, faster onboarding, higher retention, better performance',
    '#ec4899',
    westlake_id, true, 'mission_3'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO workforce_cap_id;

  IF workforce_cap_id IS NULL THEN
    SELECT id INTO workforce_cap_id FROM public.capabilities
    WHERE name = 'Workforce Training Systems' AND facility_id = westlake_id;
  END IF;

  -- Create Knowledge Management capability
  INSERT INTO public.capabilities (
    name, description, priority, current_level, target_level,
    owner, qol_impact, color, facility_id, is_enterprise, mission
  ) VALUES (
    'Knowledge Management',
    'Documentation and institutional knowledge capture for operational excellence. Includes SOPs, best practices, and lessons learned repository.',
    'MEDIUM', 2, 4,
    'Process Excellence Team',
    'Preserved institutional knowledge, faster problem solving, consistent operations, reduced training time',
    '#f59e0b',
    westlake_id, true, 'mission_3'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO knowledge_cap_id;

  IF knowledge_cap_id IS NULL THEN
    SELECT id INTO knowledge_cap_id FROM public.capabilities
    WHERE name = 'Knowledge Management' AND facility_id = westlake_id;
  END IF;

  -- Create Additive Manufacturing capability
  INSERT INTO public.capabilities (
    name, description, priority, current_level, target_level,
    owner, qol_impact, color, facility_id, is_enterprise, mission
  ) VALUES (
    'Additive Manufacturing',
    '3D printing capabilities for parts and tooling to support operations. Enables rapid prototyping and custom fixture creation.',
    'LOW', 1, 3,
    'Engineering Team',
    'Reduced part lead times, custom tooling capability, lower inventory costs, rapid prototyping',
    '#84cc16',
    westlake_id, false, 'mission_3'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO additive_cap_id;

  IF additive_cap_id IS NULL THEN
    SELECT id INTO additive_cap_id FROM public.capabilities
    WHERE name = 'Additive Manufacturing' AND facility_id = westlake_id;
  END IF;

  -- =========================================================================
  -- AUTOCAD MILESTONES (Proposal 2 - 100 hrs)
  -- =========================================================================

  IF autocad_cap_id IS NOT NULL THEN
    -- Milestone 1: Create AutoCAD model of facility (Level 1→2)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      autocad_cap_id,
      'Create AutoCAD Model of Facility',
      'Develop comprehensive 2D floor plans and basic 3D models of the Westlake VPC facility including all processing areas, storage zones, and vehicle pathways. Establish baseline documentation of current facility layout.',
      'not_started', 1, 2,
      3, '2026-02-01', '2026-04-30',
      westlake_id
    ) ON CONFLICT DO NOTHING;

    -- Milestone 2: Integrate AutoCAD with Simio visual layer (Level 2→3)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      autocad_cap_id,
      'Integrate AutoCAD with Simio Visual Layer',
      'Connect AutoCAD facility models with Simio simulation environment. Enable visual representation of process flows overlaid on accurate facility geometry. Create data exchange protocols between systems.',
      'not_started', 2, 3,
      3, '2026-05-01', '2026-07-31',
      westlake_id
    ) ON CONFLICT DO NOTHING;

    -- Milestone 3: Establish standards library and templates (Level 3→4)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      autocad_cap_id,
      'Establish Standards Library and Templates',
      'Create reusable drawing templates, standardized symbols, and component libraries for VPC facility design. Document naming conventions, layer standards, and design guidelines for enterprise consistency.',
      'not_started', 3, 4,
      3, '2026-08-01', '2026-10-31',
      westlake_id
    ) ON CONFLICT DO NOTHING;

    -- Milestone 4: Enable digital twin synchronization (Level 4→5)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      autocad_cap_id,
      'Enable Digital Twin Synchronization',
      'Implement real-time synchronization between AutoCAD models and operational systems. Enable automatic updates when facility changes occur. Establish bidirectional data flow with Simio simulation.',
      'not_started', 4, 5,
      3, '2026-11-01', '2027-01-31',
      westlake_id
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- =========================================================================
  -- SIMIO MILESTONES (Proposal 1 - 165 hrs)
  -- =========================================================================

  IF simio_cap_id IS NOT NULL THEN
    -- Milestone 1: Analyze daily vehicle processing flow (Level 1→2)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      simio_cap_id,
      'Analyze Daily Vehicle Processing Flow',
      'Conduct comprehensive analysis of current vehicle processing operations. Document process steps, cycle times, resource requirements, and throughput metrics. Identify key process parameters for simulation.',
      'not_started', 1, 2,
      3, '2026-02-01', '2026-04-30',
      westlake_id
    ) ON CONFLICT DO NOTHING;

    -- Milestone 2: Create baseline simulation models (Level 2→3)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      simio_cap_id,
      'Create Baseline Simulation Models',
      'Build validated Simio discrete event simulation models of vehicle processing operations. Calibrate models against actual production data. Establish baseline performance metrics for comparison.',
      'not_started', 2, 3,
      3, '2026-05-01', '2026-07-31',
      westlake_id
    ) ON CONFLICT DO NOTHING;

    -- Milestone 3: Identify bottlenecks and optimization opportunities (Level 3→4)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      simio_cap_id,
      'Identify Bottlenecks and Optimization Opportunities',
      'Use simulation models to identify process bottlenecks and inefficiencies. Run what-if scenarios to evaluate improvement options. Develop optimization recommendations with projected ROI.',
      'not_started', 3, 4,
      3, '2026-08-01', '2026-10-31',
      westlake_id
    ) ON CONFLICT DO NOTHING;

    -- Milestone 4: Integrate real-time production data (Level 4→5)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      simio_cap_id,
      'Integrate Real-Time Production Data',
      'Connect Simio models to live production data sources. Enable real-time simulation updates reflecting actual operations. Implement AI-driven optimization recommendations based on current conditions.',
      'not_started', 4, 5,
      3, '2026-11-01', '2027-01-31',
      westlake_id
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- =========================================================================
  -- DIGITAL TWIN MILESTONES (Integration of AutoCAD + Simio)
  -- =========================================================================

  IF digital_twin_cap_id IS NOT NULL THEN
    -- Milestone 1: Establish Digital Twin Foundation (Level 1→2)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      digital_twin_cap_id,
      'Establish Digital Twin Foundation',
      'Define digital twin architecture and data requirements. Identify integration points between AutoCAD, Simio, and operational systems. Create data model for virtual facility representation.',
      'not_started', 1, 2,
      3, '2026-08-01', '2026-10-31',
      westlake_id
    ) ON CONFLICT DO NOTHING;

    -- Milestone 2: Build Integrated Virtual Model (Level 2→3)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      digital_twin_cap_id,
      'Build Integrated Virtual Model',
      'Combine AutoCAD facility geometry with Simio process simulation into unified digital twin platform. Enable visualization of operations within accurate facility context.',
      'not_started', 2, 3,
      3, '2026-11-01', '2027-01-31',
      westlake_id
    ) ON CONFLICT DO NOTHING;

    -- Milestone 3: Connect Live Operational Data (Level 3→4)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      digital_twin_cap_id,
      'Connect Live Operational Data',
      'Integrate real-time data feeds from production systems, sensors, and tracking systems. Enable live visualization of vehicle positions and process states within the digital twin.',
      'not_started', 3, 4,
      3, '2027-02-01', '2027-04-30',
      westlake_id
    ) ON CONFLICT DO NOTHING;

    -- Milestone 4: Enable Predictive Capabilities (Level 4→5)
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      digital_twin_cap_id,
      'Enable Predictive Capabilities',
      'Implement predictive analytics using digital twin for forecasting, maintenance prediction, and optimization. Enable automated scenario evaluation and decision support.',
      'not_started', 4, 5,
      3, '2027-05-01', '2027-07-31',
      westlake_id
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- =========================================================================
  -- VSM MILESTONES
  -- =========================================================================

  IF vsm_cap_id IS NOT NULL THEN
    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      vsm_cap_id,
      'Document Current State Value Streams',
      'Map all major vehicle processing value streams. Document current state including cycle times, wait times, inventory levels, and information flows.',
      'completed', 1, 2,
      3, '2025-01-01', '2025-03-31',
      westlake_id
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      vsm_cap_id,
      'Design Future State Maps',
      'Create future state value stream maps targeting waste elimination and flow improvement. Identify kaizen opportunities and prioritize improvements.',
      'completed', 2, 3,
      3, '2025-04-01', '2025-06-30',
      westlake_id
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.milestones (
      capability_id, name, description, status, from_level, to_level,
      path_b_months, start_date, end_date, facility_id
    ) VALUES (
      vsm_cap_id,
      'Implement Flow Improvements',
      'Execute improvements identified in future state maps. Measure results against baseline metrics. Standardize successful changes.',
      'in_progress', 3, 4,
      6, '2025-07-01', '2025-12-31',
      westlake_id
    ) ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'AutoCAD and Simio capabilities with milestones created successfully';
END $$;

-- =============================================================================
-- NOTE: DEPENDENCIES
-- =============================================================================
-- Dependencies are stored as a UUID[] array column on the capabilities table,
-- not as a separate junction table. Capability-level dependencies can be set
-- via the UI or by updating the capabilities.dependencies column directly.
--
-- Key relationships to note:
-- - AutoCAD (Facility Design) enables Simio visual integration
-- - Simio (Process Simulation) enables Digital Twin foundation
-- - Both AutoCAD and Simio are prerequisites for full Digital Twin capability

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- Summary:
-- 1. Created 11 capabilities for Westlake facility (organized by mission)
-- 2. Created 4 milestones for AutoCAD capability (from Proposal 2)
-- 3. Created 4 milestones for Simio capability (from Proposal 1)
-- 4. Created 4 milestones for Digital Twin capability (integration)
-- 5. Created 3 milestones for VSM capability (existing progress)
-- 6. Established dependencies between AutoCAD, Simio, and Digital Twin
