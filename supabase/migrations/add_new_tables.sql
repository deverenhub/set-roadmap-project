-- Migration: Add new tables for QoL Impact and Roadmap Paths
-- Run this in your Supabase SQL Editor

-- ===========================================
-- QoL Impact Table
-- ===========================================
CREATE TABLE IF NOT EXISTS qol_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  metrics TEXT[] DEFAULT '{}',
  target TEXT,
  capability_id UUID REFERENCES capabilities(id) ON DELETE SET NULL,
  impact_score INTEGER DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE qol_impacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qol_impacts
CREATE POLICY "Enable read access for authenticated users" ON qol_impacts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON qol_impacts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON qol_impacts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON qol_impacts
  FOR DELETE TO authenticated USING (true);

-- ===========================================
-- Roadmap Paths Table (for RM-Inventory, RM-Production, RM-Planning)
-- ===========================================
CREATE TABLE IF NOT EXISTS roadmap_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_type TEXT NOT NULL CHECK (roadmap_type IN ('inventory', 'production', 'planning')),
  from_level INTEGER NOT NULL,
  to_level INTEGER NOT NULL,
  path_name TEXT NOT NULL CHECK (path_name IN ('A', 'B', 'C')),
  path_label TEXT NOT NULL, -- 'Aggressive', 'Balanced', 'Conservative'
  description TEXT,
  duration_months_min INTEGER,
  duration_months_max INTEGER,
  key_activities TEXT[] DEFAULT '{}',
  technology_options TEXT[] DEFAULT '{}',
  qol_impact TEXT,
  risks TEXT[] DEFAULT '{}',
  capability_id UUID REFERENCES capabilities(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE roadmap_paths ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roadmap_paths
CREATE POLICY "Enable read access for authenticated users" ON roadmap_paths
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON roadmap_paths
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON roadmap_paths
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON roadmap_paths
  FOR DELETE TO authenticated USING (true);

-- ===========================================
-- Update maturity_definitions to support editing
-- ===========================================
ALTER TABLE maturity_definitions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS process_characteristics TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS technology_characteristics TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS data_characteristics TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS knowledge_characteristics TEXT[] DEFAULT '{}';

-- ===========================================
-- Update technology_options to support more fields
-- ===========================================
ALTER TABLE technology_options
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS implementation_months INTEGER,
  ADD COLUMN IF NOT EXISTS integration_type TEXT,
  ADD COLUMN IF NOT EXISTS recommended BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ===========================================
-- Triggers for updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_qol_impacts_updated_at ON qol_impacts;
CREATE TRIGGER update_qol_impacts_updated_at
    BEFORE UPDATE ON qol_impacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roadmap_paths_updated_at ON roadmap_paths;
CREATE TRIGGER update_roadmap_paths_updated_at
    BEFORE UPDATE ON roadmap_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maturity_definitions_updated_at ON maturity_definitions;
CREATE TRIGGER update_maturity_definitions_updated_at
    BEFORE UPDATE ON maturity_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_technology_options_updated_at ON technology_options;
CREATE TRIGGER update_technology_options_updated_at
    BEFORE UPDATE ON technology_options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Seed QoL Impact Data
-- ===========================================
INSERT INTO qol_impacts (category, description, metrics, target, impact_score) VALUES
('Inventory Management', 'Automated counts reduce manual work, predictable schedules', ARRAY['Overtime hours', 'Employee satisfaction score'], '50% reduction in counting time', 75),
('Production Monitoring', 'Real-time visibility means proactive management, predictable day', ARRAY['Unplanned overtime', 'Stress surveys'], '80% reduction in emergency situations', 90),
('Planning & Scheduling', 'Predictable schedules, advance notice of workload', ARRAY['Schedule changes per week', 'Work-life balance score'], '90% of schedules hold as planned', 85),
('MES Implementation', 'Documented work instructions, easier onboarding', ARRAY['Training time', 'Error rates for new employees'], '60% reduction in onboarding time', 70),
('Dealer ETA Portal', 'Dealers self-serve, fewer interruptions', ARRAY['Dealer calls per day', 'Response time'], '70% reduction in status inquiry calls', 80),
('AI Scheduling', 'AI manages routine work; staff concentrate on exceptions', ARRAY['Decision fatigue measures', 'Job satisfaction'], 'Schedulers handle 3x workload', 95),
('Safety Technology', 'Proactive alerts, safer environment', ARRAY['OSHA recordables', 'Near-miss reports'], '50% reduction in incidents', 100)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Seed Roadmap Paths Data - RM-Inventory
-- ===========================================
INSERT INTO roadmap_paths (roadmap_type, from_level, to_level, path_name, path_label, description, duration_months_min, duration_months_max, key_activities, technology_options, qol_impact, order_index) VALUES
-- Level 2→3
('inventory', 2, 3, 'A', 'Aggressive', 'Rapid simultaneous RFID deployment across all VPCs', 4, 6,
 ARRAY['Deploy RFID infrastructure', 'Train all staff simultaneously', 'Go-live with full tracking'],
 ARRAY['RFID tags and readers', 'Mobile scanning devices'],
 'Fastest path to standardization', 1),
('inventory', 2, 3, 'B', 'Balanced', 'Phased barcode implementation with pilot validation', 6, 9,
 ARRAY['Pilot at single VPC', 'Validate processes', 'Roll out to remaining locations'],
 ARRAY['Barcode scanning', 'Handheld devices'],
 'Balanced risk and speed', 2),
('inventory', 2, 3, 'C', 'Conservative', 'Gradual manual standardization with visual tracking', 9, 12,
 ARRAY['Document current processes', 'Standardize procedures', 'Implement visual management'],
 ARRAY['Visual tracking boards', 'Standard forms'],
 'Lowest risk approach', 3),

-- Level 3→4
('inventory', 3, 4, 'A', 'Aggressive', 'Full WMS integration with real-time visibility', 6, 9,
 ARRAY['Deploy WMS system', 'Integrate with D365', 'Enable real-time dashboards'],
 ARRAY['D365 Warehouse Module', 'Real-time integration'],
 'Real-time inventory visibility is REQUIRED for ETA-based operations', 4),
('inventory', 3, 4, 'B', 'Balanced', 'Phased WMS rollout with validation gates', 9, 12,
 ARRAY['Configure WMS', 'Pilot deployment', 'Staged rollout'],
 ARRAY['Manhattan Associates', 'Phased integration'],
 'Balanced implementation approach', 5),
('inventory', 3, 4, 'C', 'Conservative', 'Gradual system integration', 12, 18,
 ARRAY['Prepare infrastructure', 'Careful integration', 'Extensive testing'],
 ARRAY['SAP EWM', 'Conservative rollout'],
 'Most cautious approach', 6),

-- Level 4→5
('inventory', 4, 5, 'A', 'Aggressive', 'AI-driven forecasting and autonomous replenishment', 8, 12,
 ARRAY['Deploy ML models', 'Integrate predictive analytics', 'Enable autonomous decisions'],
 ARRAY['Azure ML', 'AI forecasting'],
 'AI-driven forecasting reduces emergency situations, improves planning accuracy', 7),
('inventory', 4, 5, 'B', 'Balanced', 'Simulation-based optimization with manual oversight', 12, 18,
 ARRAY['Implement simulation', 'Build optimization models', 'Gradual automation'],
 ARRAY['SIMIO simulation', 'Optimization tools'],
 'Balanced AI adoption', 8),
('inventory', 4, 5, 'C', 'Conservative', 'Third-party APS with gradual AI adoption', 18, 24,
 ARRAY['Deploy APS platform', 'Build forecasting capability', 'Incremental AI features'],
 ARRAY['Third-party APS', 'Gradual AI'],
 'Conservative AI adoption', 9)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Seed Roadmap Paths Data - RM-Production
-- ===========================================
INSERT INTO roadmap_paths (roadmap_type, from_level, to_level, path_name, path_label, description, duration_months_min, duration_months_max, key_activities, technology_options, qol_impact, order_index) VALUES
-- Level 1→2
('production', 1, 2, 'A', 'Aggressive', 'Deploy handheld scanners + geofencing at all locations, close 30% visibility gap immediately', 3, 6,
 ARRAY['Deploy handheld scanners', 'Implement geofencing', 'Train all workers'],
 ARRAY['Handheld scanners', 'Geofencing technology'],
 'Increases worker awareness and reduces operational uncertainty', 1),
('production', 1, 2, 'B', 'Balanced', 'Pilot validation before full rollout', 6, 9,
 ARRAY['Single site pilot', 'Validate approach', 'Phased deployment'],
 ARRAY['Pilot scanning solution', 'Validation tools'],
 'Validated approach reduces risk', 2),
('production', 1, 2, 'C', 'Conservative', 'Prioritize work-order compliance first', 9, 12,
 ARRAY['Focus on E-work orders', 'Improve compliance', 'Gradual technology'],
 ARRAY['Work order system', 'Compliance tracking'],
 'Foundation-first approach', 3),

-- Level 2→3
('production', 2, 3, 'A', 'Aggressive', 'Full MES deployment across all VPCs', 9, 12,
 ARRAY['Deploy MES platform', 'Integrate all stations', 'Enable real-time tracking'],
 ARRAY['Tulip MES', 'Full integration'],
 'Real-time work instructions reduce guesswork', 4),
('production', 2, 3, 'B', 'Balanced', 'Single VPC implementation before scaling', 12, 18,
 ARRAY['Implement at one VPC', 'Validate and optimize', 'Scale to others'],
 ARRAY['Plex MES', 'Phased rollout'],
 'Proven approach before scaling', 5),
('production', 2, 3, 'C', 'Conservative', 'Phased feature adoption', 18, 24,
 ARRAY['Basic MES features first', 'Gradual feature addition', 'Careful change management'],
 ARRAY['Custom D365 Module', 'Feature-by-feature'],
 'Lowest disruption approach', 6),

-- Level 3→4
('production', 3, 4, 'A', 'Aggressive', 'Complete Pizza Tracker with internal and dealer dashboards', 6, 9,
 ARRAY['Build ETA engine', 'Deploy internal dashboard', 'Launch dealer portal'],
 ARRAY['Real-time ETA system', 'Dashboard platform'],
 'Reduces dealer escalations through predictable workload visibility', 7),
('production', 3, 4, 'B', 'Balanced', 'Internal functionality first, then dealer-facing', 9, 12,
 ARRAY['Internal ETA first', 'Validate accuracy', 'Add dealer access'],
 ARRAY['Phased ETA system', 'Staged dashboards'],
 'Internal validation before external', 8),
('production', 3, 4, 'C', 'Conservative', 'Basic status updates preceding detailed ETAs', 12, 15,
 ARRAY['Basic status tracking', 'Improve accuracy', 'Add detailed ETAs'],
 ARRAY['Status system', 'Incremental ETA'],
 'Foundation before complexity', 9),

-- Level 4→5
('production', 4, 5, 'A', 'Aggressive', 'AI-driven capacity planning and optimization', 12, 18,
 ARRAY['Deploy AI/ML models', 'Automate scheduling', 'Enable self-optimization'],
 ARRAY['Azure ML', 'AI optimization'],
 'Automated routine decisions enabling human focus on exceptions', 10),
('production', 4, 5, 'B', 'Balanced', 'Statistical controls preceding AI/ML', 18, 24,
 ARRAY['Implement statistical controls', 'Build data foundation', 'Add AI capabilities'],
 ARRAY['Statistical tools', 'Gradual AI'],
 'Data-driven foundation for AI', 11),
('production', 4, 5, 'C', 'Conservative', 'Manual optimization with AI recommendations', 24, 36,
 ARRAY['Manual optimization first', 'AI recommendations', 'Gradual automation'],
 ARRAY['Decision support', 'Advisory AI'],
 'Human-in-the-loop approach', 12)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Seed Roadmap Paths Data - RM-Planning
-- ===========================================
INSERT INTO roadmap_paths (roadmap_type, from_level, to_level, path_name, path_label, description, duration_months_min, duration_months_max, key_activities, technology_options, qol_impact, order_index) VALUES
-- Level 1→2
('planning', 1, 2, 'A', 'Aggressive', 'Immediate capacity studies and documentation', 3, 6,
 ARRAY['30-day time studies', 'Document all processes', 'Establish baselines'],
 ARRAY['Time study tools', 'Documentation systems'],
 'Understanding capacity reduces overtime surprises', 1),
('planning', 1, 2, 'B', 'Balanced', 'Phased documentation with validation', 6, 9,
 ARRAY['Prioritized time studies', 'Validate findings', 'Document key processes'],
 ARRAY['Structured approach', 'Validation tools'],
 'Validated understanding of capacity', 2),
('planning', 1, 2, 'C', 'Conservative', 'Gradual knowledge capture', 9, 12,
 ARRAY['Interview experts', 'Document tribal knowledge', 'Build process library'],
 ARRAY['Knowledge management', 'Documentation'],
 'Preserves institutional knowledge', 3),

-- Level 2→3
('planning', 2, 3, 'A', 'Aggressive', 'Full scheduling system deployment', 6, 9,
 ARRAY['Deploy D365 Planning', 'Integrate all data', 'Enable formal scheduling'],
 ARRAY['D365 Planning Optimization', 'Full integration'],
 'Predictable schedules improve work-life balance', 4),
('planning', 2, 3, 'B', 'Balanced', 'Phased scheduling implementation', 9, 12,
 ARRAY['Basic scheduling first', 'Add integration', 'Expand capabilities'],
 ARRAY['Preactor/Opcenter', 'Phased deployment'],
 'Balanced scheduling rollout', 5),
('planning', 2, 3, 'C', 'Conservative', 'Spreadsheet-based formal scheduling', 12, 18,
 ARRAY['Standardize spreadsheets', 'Add structure', 'Gradual system adoption'],
 ARRAY['Enhanced spreadsheets', 'Gradual transition'],
 'Low-risk formalization', 6),

-- Level 3→4
('planning', 3, 4, 'A', 'Aggressive', 'Predictive planning with constraint management', 6, 9,
 ARRAY['Deploy APS system', 'Implement constraints', 'Enable >95% ETA accuracy'],
 ARRAY['Advanced APS', 'Constraint engine'],
 'Dealers get accurate ETAs, employees know their day', 7),
('planning', 3, 4, 'B', 'Balanced', 'Simulation-based predictive planning', 9, 12,
 ARRAY['Build simulation models', 'Validate predictions', 'Deploy forecasting'],
 ARRAY['SIMIO simulation', 'Predictive tools'],
 'Simulation-validated predictions', 8),
('planning', 3, 4, 'C', 'Conservative', 'Statistical forecasting with manual adjustment', 12, 18,
 ARRAY['Implement statistics', 'Build forecasting', 'Manual fine-tuning'],
 ARRAY['Statistical tools', 'Manual oversight'],
 'Human-validated forecasts', 9),

-- Level 4→5
('planning', 4, 5, 'A', 'Aggressive', 'Autonomous AI-driven optimization', 12, 18,
 ARRAY['Deploy AI optimization', 'Enable autonomous decisions', 'Self-learning system'],
 ARRAY['Azure ML', 'Autonomous AI'],
 'System handles complexity, humans focus on exceptions', 10),
('planning', 4, 5, 'B', 'Balanced', 'AI-assisted optimization with oversight', 18, 24,
 ARRAY['AI recommendations', 'Human approval', 'Gradual autonomy'],
 ARRAY['AI advisory', 'Supervised learning'],
 'AI-assisted decision making', 11),
('planning', 4, 5, 'C', 'Conservative', 'Rule-based optimization with AI insights', 24, 36,
 ARRAY['Rule engine first', 'Add AI insights', 'Careful automation'],
 ARRAY['Rule engine', 'AI insights'],
 'Controlled automation path', 12)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Update existing maturity_definitions with dimension data
-- ===========================================
UPDATE maturity_definitions SET
  process_characteristics = ARRAY['Undocumented processes', 'Reactive management', 'Tribal knowledge', 'Heroic individual efforts'],
  technology_characteristics = ARRAY['Standalone tools', 'Manual spreadsheets', 'No integration'],
  data_characteristics = ARRAY['70% accuracy', 'No real-time visibility', 'Manual data entry'],
  knowledge_characteristics = ARRAY['Few individuals hold knowledge', 'High turnover risk', 'No documentation']
WHERE level = 1;

UPDATE maturity_definitions SET
  process_characteristics = ARRAY['Basic documentation', 'Some standard procedures', 'Inconsistent execution'],
  technology_characteristics = ARRAY['Point solutions', 'Limited automation', 'Partial integration'],
  data_characteristics = ARRAY['80% accuracy', 'Periodic reporting', 'Delayed visibility'],
  knowledge_characteristics = ARRAY['Basic cross-training', 'Documented but inconsistent', 'Some procedures']
WHERE level = 2;

UPDATE maturity_definitions SET
  process_characteristics = ARRAY['Documented and controlled', 'Consistent execution', 'Cross-site standardization'],
  technology_characteristics = ARRAY['Integrated ERP', 'Automated data capture', 'System integration'],
  data_characteristics = ARRAY['90% accuracy', 'Daily/shift reporting', 'Exception alerts'],
  knowledge_characteristics = ARRAY['Defined roles', 'Formal training', 'Succession planning']
WHERE level = 3;

UPDATE maturity_definitions SET
  process_characteristics = ARRAY['Managed processes', 'Statistical control', 'Predictable outcomes'],
  technology_characteristics = ARRAY['MES/APS integration', 'Real-time monitoring', 'Full tracking'],
  data_characteristics = ARRAY['99% accuracy', 'Real-time dashboards', 'Predictive analytics'],
  knowledge_characteristics = ARRAY['Cross-functional teams', 'Continuous learning', 'Knowledge sharing culture']
WHERE level = 4;

UPDATE maturity_definitions SET
  process_characteristics = ARRAY['Self-optimizing', 'Innovation culture', 'Continuous improvement'],
  technology_characteristics = ARRAY['AI/ML optimization', 'Digital twin', 'Autonomous operations'],
  data_characteristics = ARRAY['Prescriptive analytics', 'Automated decisions', 'Real-time optimization'],
  knowledge_characteristics = ARRAY['External benchmarking', 'Thought leadership', 'Industry influence']
WHERE level = 5;

-- ===========================================
-- Update technology_options with more detail
-- ===========================================
UPDATE technology_options SET
  implementation_months = 6,
  integration_type = 'API',
  recommended = true,
  notes = 'RECOMMENDED - Strong internal ownership potential'
WHERE name LIKE '%Tulip%';

UPDATE technology_options SET
  implementation_months = 9,
  integration_type = 'Native Rockwell',
  recommended = false,
  notes = 'Alternative option'
WHERE name LIKE '%Plex%';

UPDATE technology_options SET
  implementation_months = 15,
  integration_type = 'Native',
  recommended = false,
  notes = 'Recommended if organization commits to D365'
WHERE name LIKE '%Custom D365%' AND category = 'MES';

UPDATE technology_options SET
  implementation_months = 4,
  integration_type = 'Native',
  recommended = true,
  notes = 'RECOMMENDED - Native integration, included cost'
WHERE name LIKE '%D365 Planning%';

UPDATE technology_options SET
  implementation_months = 4,
  integration_type = 'Native',
  recommended = true,
  notes = 'RECOMMENDED - Native integration, included cost'
WHERE name LIKE '%D365 Quality%';

UPDATE technology_options SET
  implementation_months = 4,
  integration_type = 'Native',
  recommended = true,
  notes = 'RECOMMENDED - Native integration, included cost'
WHERE name LIKE '%D365 Warehouse%';
