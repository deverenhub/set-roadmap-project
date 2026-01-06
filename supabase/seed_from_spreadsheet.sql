-- COMPLETE DATABASE SEED FROM SPREADSHEET DATA
-- Run this in Supabase SQL Editor after running the initial schema

-- Clear existing data (preserving users)
TRUNCATE public.technology_options CASCADE;
TRUNCATE public.maturity_definitions CASCADE;
TRUNCATE public.quick_wins CASCADE;
TRUNCATE public.milestones CASCADE;
TRUNCATE public.capabilities CASCADE;

-- ============================================
-- MATURITY DEFINITIONS (5 Levels)
-- ============================================
INSERT INTO public.maturity_definitions (level, name, description, characteristics) VALUES
(1, 'Ad-hoc', 'Undocumented, reactive, tribal knowledge, heroic individual efforts',
  ARRAY['Standalone tools, Excel/paper-based, no integration', 'Manual data entry, no real-time visibility, 70% accuracy', 'High turnover risk, knowledge concentrated in few people', 'E-work order captures 70% of vehicles, manual cycle counts']),
(2, 'Planning & Control', 'Basic documentation, some standard procedures, inconsistent execution',
  ARRAY['Point solutions, limited automation, partial integration', 'Periodic reporting, delayed visibility, 80% accuracy', 'Some cross-training, documented procedures exist', 'Monthly inventory counts, basic scheduling, GPS partially deployed']),
(3, 'Standardized', 'Documented and controlled processes, consistent execution across sites',
  ARRAY['Integrated systems (ERP), automated data capture, standard tools', 'Daily/shift reporting, 90% accuracy, exception-based alerts', 'Defined roles, training programs, succession planning', 'All VPCs using same processes, Drive 1.0 fully implemented']),
(4, 'Predictable (ETA Target)', 'Process metrics managed, statistical control, predictable outcomes',
  ARRAY['MES/APS integrated, real-time monitoring, full track & trace', 'Real-time dashboards, predictive analytics, 99% accuracy', 'Cross-functional teams, continuous learning culture', 'Dominos-style ETA tracking, dealer portal shows real-time status']),
(5, 'Continuous Improvement', 'Self-optimizing processes, innovation culture, industry benchmark',
  ARRAY['AI/ML optimization, digital twin, autonomous operations', 'Prescriptive analytics, automated decision support', 'Innovation incentives, external benchmarking, thought leadership', 'AI-driven scheduling, predictive maintenance, zero-touch operations']);

-- ============================================
-- CAPABILITIES (7 from spreadsheet)
-- ============================================
INSERT INTO public.capabilities (id, name, description, priority, current_level, target_level, owner, color, qol_impact) VALUES
('c1000000-0000-0000-0000-000000000001', 'Inventory Management', 'Track and manage vehicle inventory across all VPC locations with real-time visibility', 'HIGH', 2, 4, 'TSVMap', '#3b82f6', 'HIGH - Reduces manual counting, enables proactive inventory management, predictable schedules'),
('c1000000-0000-0000-0000-000000000002', 'Vehicle Management', 'End-to-end vehicle tracking from receipt through delivery with full visibility', 'HIGH', 2, 4, 'SET', '#10b981', 'HIGH - Better visibility into vehicle location and status throughout processing'),
('c1000000-0000-0000-0000-000000000003', 'Production Monitoring', 'Real-time visibility into processing operations, throughput, and worker productivity', 'CRITICAL', 1, 4, 'TSVMap', '#ef4444', 'CRITICAL - Real-time insights mean proactive management and predictable workdays'),
('c1000000-0000-0000-0000-000000000004', 'Accessory Installation', 'Standardized accessory installation workflows with work instructions and quality checks', 'HIGH', 1, 4, 'SET', '#8b5cf6', 'MEDIUM - Standard work instructions reduce guesswork and training time'),
('c1000000-0000-0000-0000-000000000005', 'Quality Assurance', 'Quality control, inspection tracking, and compliance management', 'HIGH', 2, 4, 'SET', '#ec4899', 'HIGH - Automated inspections reduce rework and ensure consistent quality'),
('c1000000-0000-0000-0000-000000000006', 'Planning & Scheduling', 'Capacity planning, resource scheduling, and workload optimization', 'CRITICAL', 1, 4, 'TSVMap', '#f59e0b', 'CRITICAL - Predictable schedules improve work-life balance, advance notice of workload'),
('c1000000-0000-0000-0000-000000000007', 'Safety Management', 'Safety tracking, incident management, proactive alerts, and compliance', 'MEDIUM', 2, 4, 'SET', '#06b6d4', 'HIGH - Proactive alerts create safer environment, faster incident response');

-- ============================================
-- MILESTONES - INVENTORY MANAGEMENT
-- ============================================
INSERT INTO public.milestones (capability_id, name, description, from_level, to_level, status, path_a_months, path_b_months, path_c_months, deliverables) VALUES
('c1000000-0000-0000-0000-000000000001', 'Standardize Inventory Processes', 'Deploy RFID/barcode scanning, standardize processes across VPCs', 2, 3, 'not_started', 5, 8, 11,
  ARRAY['RFID deployment at all VPCs', 'Standardized counting procedures', 'Barcode scanning enhancement', 'Process documentation']),
('c1000000-0000-0000-0000-000000000001', 'Real-time Inventory Visibility', 'Full WMS integration with Dynamics 365 for real-time tracking', 3, 4, 'not_started', 7, 11, 15,
  ARRAY['WMS integration with D365', 'Real-time dashboard', 'Exception-based alerts', 'Mobile inventory access']),
('c1000000-0000-0000-0000-000000000001', 'Predictive Inventory Analytics', 'AI-driven demand forecasting and automated replenishment', 4, 5, 'not_started', 10, 15, 21,
  ARRAY['Azure ML integration', 'Demand forecasting models', 'Automated replenishment', 'SIMIO simulation optimization']);

-- ============================================
-- MILESTONES - VEHICLE MANAGEMENT
-- ============================================
INSERT INTO public.milestones (capability_id, name, description, from_level, to_level, status, path_a_months, path_b_months, path_c_months, deliverables) VALUES
('c1000000-0000-0000-0000-000000000002', 'Basic Vehicle Tracking', 'Deploy tracking technology for vehicle location throughout VPC', 2, 3, 'not_started', 4, 7, 10,
  ARRAY['GPS/RFID vehicle tracking', 'Location zone mapping', 'Basic status updates', 'Mobile scanning app']),
('c1000000-0000-0000-0000-000000000002', 'Full Vehicle Traceability', 'Complete track-and-trace from receipt to delivery', 3, 4, 'not_started', 6, 9, 12,
  ARRAY['End-to-end tracking', 'Event history logging', 'Integration with dealer systems', 'Real-time status portal']);

-- ============================================
-- MILESTONES - PRODUCTION MONITORING
-- ============================================
INSERT INTO public.milestones (capability_id, name, description, from_level, to_level, status, path_a_months, path_b_months, path_c_months, deliverables) VALUES
('c1000000-0000-0000-0000-000000000003', 'Basic Visibility', 'Deploy handheld scanners + geofencing, close 30% visibility gap', 1, 2, 'in_progress', 5, 8, 11,
  ARRAY['Mobile device scanning', 'RFID vehicle tags', 'Camera-based passive tracking', 'E-work order compliance 95%+']),
('c1000000-0000-0000-0000-000000000003', 'MES Foundation', 'Full MES deployment across all VPCs, integrated with Drive 1.0', 2, 3, 'not_started', 11, 15, 21,
  ARRAY['Tulip low-code MES', 'Real-time work instructions', 'Integration with D365', 'Operator dashboards']),
('c1000000-0000-0000-0000-000000000003', 'Real-time ETA (Pizza Tracker)', 'Full Pizza Tracker implementation: internal + dealer-facing dashboards', 3, 4, 'not_started', 8, 11, 14,
  ARRAY['Internal status tracker', 'Dealer-facing portal', 'Power BI dashboards', 'ETA calculation engine']),
('c1000000-0000-0000-0000-000000000003', 'AI Optimization', 'AI-driven capacity planning, predictive maintenance, automated scheduling', 4, 5, 'not_started', 15, 21, 30,
  ARRAY['Azure AI integration', 'SIMIO digital twin', 'Predictive maintenance', 'Automated scheduling']);

-- ============================================
-- MILESTONES - ACCESSORY INSTALLATION
-- ============================================
INSERT INTO public.milestones (capability_id, name, description, from_level, to_level, status, path_a_months, path_b_months, path_c_months, deliverables) VALUES
('c1000000-0000-0000-0000-000000000004', 'Documented Work Instructions', 'Create and deploy standard work instructions for all accessories', 1, 2, 'not_started', 3, 5, 8,
  ARRAY['Work instruction library', 'Photo/video guides', 'Training materials', 'Quality checklists']),
('c1000000-0000-0000-0000-000000000004', 'Digital Work Instructions', 'MES-delivered instructions with quality gates', 2, 3, 'not_started', 6, 9, 12,
  ARRAY['MES work instruction delivery', 'Quality gate enforcement', 'Time tracking per task', 'Defect capture']);

-- ============================================
-- MILESTONES - QUALITY ASSURANCE
-- ============================================
INSERT INTO public.milestones (capability_id, name, description, from_level, to_level, status, path_a_months, path_b_months, path_c_months, deliverables) VALUES
('c1000000-0000-0000-0000-000000000005', 'Digital Quality Checklists', 'Replace paper checklists with digital inspection forms', 2, 3, 'not_started', 4, 6, 9,
  ARRAY['Digital inspection forms', 'Photo capture for defects', 'D365 Quality Module', 'Defect trending reports']),
('c1000000-0000-0000-0000-000000000005', 'Integrated Quality Management', 'Full QMS with automated workflows and analytics', 3, 4, 'not_started', 6, 9, 12,
  ARRAY['QMS integration', 'Automated NCR workflows', 'Supplier quality tracking', 'Quality analytics dashboard']);

-- ============================================
-- MILESTONES - PLANNING & SCHEDULING
-- ============================================
INSERT INTO public.milestones (capability_id, name, description, from_level, to_level, status, path_a_months, path_b_months, path_c_months, deliverables) VALUES
('c1000000-0000-0000-0000-000000000006', 'Basic Capacity Understanding', 'Time studies, document routing logic, basic planning tools', 1, 2, 'not_started', 5, 8, 11,
  ARRAY['Time studies at all VPCs', 'Documented routing logic', 'SIMIO simulation model', 'Baseline capacity metrics']),
('c1000000-0000-0000-0000-000000000006', 'Formal Scheduling System', 'APS system deployment, integrated with Drive 1.0 and MES', 2, 3, 'not_started', 14, 18, 26,
  ARRAY['D365 Planning Optimization', 'Finite scheduling', 'Constraint management', 'What-if scenarios']),
('c1000000-0000-0000-0000-000000000006', 'Predictive Planning', 'Real-time constraint management, ETA accuracy >95%', 3, 4, 'not_started', 11, 15, 21,
  ARRAY['AI-driven ETA calculation', 'Real-time constraint visibility', 'Dealer ETA portal', 'Schedule optimization']),
('c1000000-0000-0000-0000-000000000006', 'Autonomous Optimization', 'AI-driven scheduling, self-optimizing based on real-time conditions', 4, 5, 'not_started', 21, 30, 42,
  ARRAY['Azure ML optimization', 'Digital twin with SIMIO', 'Autonomous scheduling', 'Continuous improvement loop']);

-- ============================================
-- MILESTONES - SAFETY MANAGEMENT
-- ============================================
INSERT INTO public.milestones (capability_id, name, description, from_level, to_level, status, path_a_months, path_b_months, path_c_months, deliverables) VALUES
('c1000000-0000-0000-0000-000000000007', 'Digital Safety Reporting', 'Mobile app for incident reporting and near-miss tracking', 2, 3, 'in_progress', 3, 5, 7,
  ARRAY['Mobile safety app', 'Incident reporting workflow', 'Near-miss tracking', 'Safety dashboard']),
('c1000000-0000-0000-0000-000000000007', 'Proactive Safety Analytics', 'Predictive safety alerts and trend analysis', 3, 4, 'not_started', 6, 9, 12,
  ARRAY['Safety trend analytics', 'Proactive alerts', 'Risk scoring', 'Compliance tracking']);

-- ============================================
-- QUICK WINS (6 from spreadsheet)
-- ============================================
INSERT INTO public.quick_wins (name, description, capability_id, status, timeline_months, investment, roi, category, progress_percent, "order") VALUES
('Close 30% Visibility Gap', 'Improve E-work order compliance from 70% to 95%+ vehicles tracked', 'c1000000-0000-0000-0000-000000000003', 'in_progress', 3, 'LOW', 'HIGH', 'Operations', 35, 1),
('Document Tribal Knowledge', 'Capture routing logic and process knowledge from experienced workers into written procedures', 'c1000000-0000-0000-0000-000000000006', 'not_started', 2, 'LOW', 'MEDIUM', 'Process', 0, 2),
('Time Studies at Commerce', 'Conduct 30-day time study to establish baseline capacity metrics and cycle times', 'c1000000-0000-0000-0000-000000000006', 'not_started', 1, 'LOW', 'HIGH', 'Operations', 0, 3),
('Technology Champion Program', 'Identify and train 6-9 technology champions across VPCs to drive adoption', NULL, 'in_progress', 1, 'LOW', 'HIGH', 'People', 50, 4),
('Basic Status Dashboard', 'Deploy Power BI dashboard for production visibility at daily stand-ups', 'c1000000-0000-0000-0000-000000000003', 'in_progress', 2, 'MEDIUM', 'HIGH', 'Technology', 60, 5),
('Process Standardization Workshop', 'Cross-VPC workshop to agree on standard processes and eliminate variations', NULL, 'not_started', 1, 'LOW', 'MEDIUM', 'Process', 0, 6);

-- ============================================
-- TECHNOLOGY OPTIONS (from spreadsheet by category)
-- ============================================

-- MES Options
INSERT INTO public.technology_options (category, name, vendor, description, pros, cons, estimated_cost, survivability_score) VALUES
('MES', 'Tulip (Low-Code)', 'Tulip', 'Low-code manufacturing execution system for rapid deployment',
  ARRAY['Low-code platform - VPC can own', 'Rapid deployment 6-9 months', 'API integration with D365', 'High survivability'],
  ARRAY['Limited complex manufacturing features', 'Requires internal development skills'], '$150K-300K/yr', 9),
('MES', 'Plex MES', 'Rockwell/Plex', 'Full-featured MES with native Rockwell integration',
  ARRAY['Native Rockwell integration', 'Comprehensive MES features', 'Proven in automotive'],
  ARRAY['Longer implementation 9-12 months', 'Higher dependency on vendor', 'More complex'], '$200K-400K/yr', 7),
('MES', 'Custom D365 Module', 'Microsoft', 'Custom MES functionality built within Dynamics 365',
  ARRAY['Native D365 integration', 'Single platform strategy', 'Full ownership'],
  ARRAY['Longest implementation 12-18 months', 'Requires D365 expertise', 'Higher initial cost'], '$300K-500K', 8);

-- APS Options
INSERT INTO public.technology_options (category, name, vendor, description, pros, cons, estimated_cost, survivability_score) VALUES
('APS', 'D365 Planning Optimization', 'Microsoft', 'Native Dynamics 365 planning and optimization module',
  ARRAY['Native D365 integration', 'Included with license', 'Fast deployment 3-6 months', 'Full ownership'],
  ARRAY['May need customization', 'Limited advanced features'], 'Included', 9),
('APS', 'Preactor/Opcenter', 'Siemens', 'Advanced planning and scheduling with detailed finite scheduling',
  ARRAY['Powerful finite scheduling', 'Industry proven', 'Good D365 integration available'],
  ARRAY['API integration required', 'Vendor dependency', 'Complex configuration'], '$100K-200K/yr', 7),
('APS', 'SIMIO Simulation', 'SIMIO LLC', 'Discrete event simulation for capacity planning and what-if analysis',
  ARRAY['Already piloted at Westlake', 'SET has experience', 'Excellent for planning analysis', 'Visual modeling'],
  ARRAY['Simulation tool not scheduling system', 'Specialized skill required'], '$50K-100K/yr', 8);

-- QMS Options
INSERT INTO public.technology_options (category, name, vendor, description, pros, cons, estimated_cost, survivability_score) VALUES
('QMS', 'D365 Quality Module', 'Microsoft', 'Native Dynamics 365 quality management module',
  ARRAY['Native D365 integration', 'Included with license', 'Fast deployment', 'Full ownership'],
  ARRAY['Basic QMS features', 'May need enhancement'], 'Included', 9),
('QMS', 'Complient Pro', 'Complient', 'Specialized quality management system with strong compliance features',
  ARRAY['Strong compliance features', 'Audit trail', 'Document control'],
  ARRAY['API integration required', 'Additional cost', 'Vendor dependency'], '$50K-100K/yr', 7),
('QMS', 'ETQ Reliance', 'ETQ/Hexagon', 'Enterprise quality management for complex organizations',
  ARRAY['Enterprise-grade features', 'Comprehensive compliance', 'Strong reporting'],
  ARRAY['Complex implementation', 'Higher cost', 'Longer timeline'], '$75K-150K/yr', 6);

-- WMS Options
INSERT INTO public.technology_options (category, name, vendor, description, pros, cons, estimated_cost, survivability_score) VALUES
('WMS', 'D365 Warehouse', 'Microsoft', 'Native Dynamics 365 warehouse management module',
  ARRAY['Native D365 integration', 'Drive 1.0 aligned', 'Full ownership', 'Standard support'],
  ARRAY['May need customization for VPC-specific needs'], 'Included', 9),
('WMS', 'Manhattan Associates', 'Manhattan', 'Leading WMS for complex warehouse operations',
  ARRAY['Industry leading features', 'Strong automotive presence', 'Advanced optimization'],
  ARRAY['API integration required', 'High cost', 'Long implementation', 'Vendor dependency'], '$200K-400K/yr', 5),
('WMS', 'SAP EWM', 'SAP', 'Enterprise warehouse management from SAP',
  ARRAY['Enterprise-grade', 'Complex warehouse handling'],
  ARRAY['Not D365 native', 'Complex integration', 'Very high cost', 'Long timeline'], '$300K-500K/yr', 4);

-- Data Capture Options
INSERT INTO public.technology_options (category, name, vendor, description, pros, cons, estimated_cost, survivability_score) VALUES
('Data Capture', 'Camera-based Passive', 'Various', 'Camera-based vehicle tracking with edge computing and AI',
  ARRAY['Passive - no tags required', 'VIN/license plate recognition', 'API integration', 'High survivability'],
  ARRAY['Infrastructure installation', 'Calibration required', 'Higher upfront cost'], '$100K-200K', 9),
('Data Capture', 'RFID/Geofencing', 'Zebra/Various', 'RFID tags on vehicles with geofencing zones',
  ARRAY['Proven technology', 'Zone-level tracking', 'API available', 'VPC can own'],
  ARRAY['Tags required on vehicles', 'Reader infrastructure', 'Maintenance overhead'], '$150K-300K', 8),
('Data Capture', 'Mobile Devices', 'Microsoft/Various', 'Mobile scanning with D365 mobile app or Power Apps',
  ARRAY['Native D365 integration', 'Low cost to start', 'Fast deployment', 'Full ownership'],
  ARRAY['Requires manual scanning', 'Dependent on worker compliance'], '$50K-100K', 9);
