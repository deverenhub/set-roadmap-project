-- supabase/seed.sql
-- Seed data for SET VPC Roadmap Platform

-- Insert Maturity Definitions
INSERT INTO public.maturity_definitions (level, name, description, characteristics) VALUES
(1, 'Initial', 'Ad-hoc processes with limited visibility and manual operations', 
  ARRAY['Manual data entry', 'Paper-based tracking', 'Reactive decision making', 'Limited KPIs']),
(2, 'Managed', 'Defined processes with basic tracking and some automation',
  ARRAY['Basic digital tools', 'Defined workflows', 'Some automated alerts', 'Regular reporting']),
(3, 'Standardized', 'Integrated systems with real-time data and proactive monitoring',
  ARRAY['Integrated systems', 'Real-time dashboards', 'Standardized processes', 'Cross-functional visibility']),
(4, 'Predictive', 'Analytics-driven operations with optimization and forecasting capabilities',
  ARRAY['Predictive analytics', 'Automated scheduling', 'Resource optimization', 'ETA-based operations']),
(5, 'Autonomous', 'AI-powered self-optimizing systems with continuous improvement',
  ARRAY['AI/ML integration', 'Self-optimizing processes', 'Continuous improvement', 'Industry leadership']);

-- Insert Capabilities
INSERT INTO public.capabilities (id, name, description, priority, current_level, target_level, owner, color, qol_impact) VALUES
('c1000000-0000-0000-0000-000000000001', 'Inventory Management', 'Track and manage vehicle inventory across all VPC locations', 'CRITICAL', 2, 4, 'Operations', '#3b82f6', 'Reduces manual counting, enables proactive inventory management'),
('c1000000-0000-0000-0000-000000000002', 'Production Monitoring', 'Real-time visibility into processing operations and throughput', 'CRITICAL', 1, 4, 'Operations', '#10b981', 'Provides clear workload visibility, reduces stress from surprises'),
('c1000000-0000-0000-0000-000000000003', 'Planning & Scheduling', 'Optimize resource allocation and production scheduling', 'HIGH', 1, 4, 'Planning', '#f59e0b', 'Enables predictable work schedules, better resource planning'),
('c1000000-0000-0000-0000-000000000004', 'Vehicle Processing', 'End-to-end vehicle processing workflow management', 'HIGH', 2, 4, 'Operations', '#8b5cf6', 'Streamlines daily tasks, reduces confusion on priorities'),
('c1000000-0000-0000-0000-000000000005', 'Quality Assurance', 'Quality control and compliance tracking', 'MEDIUM', 2, 4, 'Quality', '#ec4899', 'Clear quality standards, reduces rework'),
('c1000000-0000-0000-0000-000000000006', 'Safety Management', 'Safety tracking, incident management, and compliance', 'HIGH', 2, 3, 'Safety', '#ef4444', 'Improved safety culture, faster incident response'),
('c1000000-0000-0000-0000-000000000007', 'Dealer Communication', 'Communication and coordination with dealer network', 'MEDIUM', 2, 4, 'Customer Service', '#06b6d4', 'Better dealer relationships, reduced inquiry volume');

-- Insert Milestones for each capability
-- Inventory Management Milestones
INSERT INTO public.milestones (capability_id, name, description, from_level, to_level, status, path_a_months, path_b_months, path_c_months, deliverables) VALUES
('c1000000-0000-0000-0000-000000000001', 'Digital Inventory Foundation', 'Implement basic digital inventory tracking', 2, 3, 'in_progress', 3, 4, 6, ARRAY['Inventory database', 'Barcode scanning', 'Basic reports']),
('c1000000-0000-0000-0000-000000000001', 'Real-time Inventory Dashboard', 'Deploy real-time inventory visibility across locations', 3, 4, 'not_started', 4, 6, 8, ARRAY['Real-time dashboard', 'Location tracking', 'Alert system']);

-- Production Monitoring Milestones
INSERT INTO public.milestones (capability_id, name, description, from_level, to_level, status, path_a_months, path_b_months, path_c_months, deliverables) VALUES
('c1000000-0000-0000-0000-000000000002', 'Basic Production Tracking', 'Implement foundational production data collection', 1, 2, 'not_started', 2, 3, 4, ARRAY['Production counters', 'Shift reports', 'Basic metrics']),
('c1000000-0000-0000-0000-000000000002', 'Operations Dashboard', 'Deploy production monitoring dashboards', 2, 3, 'not_started', 3, 4, 6, ARRAY['Live dashboards', 'KPI tracking', 'Supervisor views']),
('c1000000-0000-0000-0000-000000000002', 'Predictive Production Analytics', 'Enable predictive capabilities for production planning', 3, 4, 'not_started', 4, 6, 8, ARRAY['ML models', 'Throughput forecasting', 'Bottleneck detection']);

-- Planning & Scheduling Milestones
INSERT INTO public.milestones (capability_id, name, description, from_level, to_level, status, path_a_months, path_b_months, path_c_months, deliverables) VALUES
('c1000000-0000-0000-0000-000000000003', 'Basic Scheduling System', 'Implement foundational scheduling capabilities', 1, 2, 'not_started', 2, 3, 4, ARRAY['Digital schedule board', 'Resource calendar', 'Capacity tracking']),
('c1000000-0000-0000-0000-000000000003', 'Integrated Planning Platform', 'Deploy integrated planning with SIMIO', 2, 3, 'not_started', 4, 6, 8, ARRAY['SIMIO integration', 'What-if scenarios', 'Automated scheduling']),
('c1000000-0000-0000-0000-000000000003', 'Optimized Resource Allocation', 'Enable AI-driven resource optimization', 3, 4, 'not_started', 4, 6, 8, ARRAY['AI scheduling', 'Dynamic reallocation', 'Cost optimization']);

-- Insert Quick Wins
INSERT INTO public.quick_wins (name, description, capability_id, status, timeline_months, investment, roi, category, progress_percent, "order") VALUES
('Daily Stand-up Dashboards', 'Implement visual dashboards for daily production meetings', 'c1000000-0000-0000-0000-000000000002', 'in_progress', 2, 'LOW', 'HIGH', 'Operations', 40, 1),
('Mobile Inventory Scanning', 'Deploy mobile devices for inventory spot checks', 'c1000000-0000-0000-0000-000000000001', 'not_started', 1, 'MEDIUM', 'HIGH', 'Technology', 0, 2),
('Safety Incident App', 'Mobile app for safety incident reporting', 'c1000000-0000-0000-0000-000000000006', 'completed', 2, 'LOW', 'MEDIUM', 'Safety', 100, 3),
('Dealer Portal MVP', 'Basic dealer portal for order status visibility', 'c1000000-0000-0000-0000-000000000007', 'in_progress', 3, 'MEDIUM', 'HIGH', 'Technology', 25, 4),
('Shift Handoff Digitization', 'Digital shift handoff process and documentation', 'c1000000-0000-0000-0000-000000000002', 'not_started', 1, 'LOW', 'MEDIUM', 'Process', 0, 5),
('Quality Checklist App', 'Digital quality inspection checklists', 'c1000000-0000-0000-0000-000000000005', 'not_started', 2, 'LOW', 'MEDIUM', 'Quality', 0, 6);

-- Insert Technology Options
INSERT INTO public.technology_options (category, name, vendor, description, pros, cons, estimated_cost, survivability_score) VALUES
('ERP', 'Dynamics 365', 'Microsoft', 'Enterprise resource planning system', ARRAY['SET standard', 'Integration ecosystem', 'Scalable'], ARRAY['Complex implementation', 'High cost', 'Long timeline'], '$$$', 9),
('Simulation', 'SIMIO', 'SIMIO LLC', 'Discrete event simulation platform', ARRAY['Already implemented at Westlake', 'SET experience', 'Visual modeling'], ARRAY['Specialized skill required', 'Maintenance overhead'], '$$', 8),
('RTLS', 'Zebra RTLS', 'Zebra Technologies', 'Real-time location services', ARRAY['Vehicle tracking', 'Zone management', 'API available'], ARRAY['Infrastructure required', 'Calibration needs'], '$$', 7),
('Mobile', 'Power Apps', 'Microsoft', 'Low-code mobile app platform', ARRAY['D365 integration', 'Rapid development', 'No-code options'], ARRAY['Limited offline', 'Microsoft dependency'], '$', 8),
('Analytics', 'Power BI', 'Microsoft', 'Business intelligence platform', ARRAY['D365 native', 'SET standard', 'Self-service'], ARRAY['Data modeling required', 'Refresh limits'], '$', 9),
('IoT', 'Azure IoT Hub', 'Microsoft', 'IoT device management platform', ARRAY['Scalable', 'Secure', 'D365 integration'], ARRAY['Requires development', 'Ongoing costs'], '$$', 8);
