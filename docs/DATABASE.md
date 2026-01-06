# Database Schema

Complete database documentation for the SET Interactive Roadmap Platform.

## 📋 Table of Contents

- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Tables](#tables)
- [Enums and Types](#enums-and-types)
- [Indexes](#indexes)
- [Row Level Security](#row-level-security)
- [Triggers and Functions](#triggers-and-functions)
- [Views](#views)
- [Migrations](#migrations)
- [Seed Data](#seed-data)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    │
│  │    users     │         │ capabilities │         │  milestones  │    │
│  ├──────────────┤         ├──────────────┤         ├──────────────┤    │
│  │ id (PK)      │    ┌───▶│ id (PK)      │◀───┐    │ id (PK)      │    │
│  │ email        │    │    │ name         │    │    │ capability_id│────┘
│  │ role         │    │    │ current_level│    │    │ from_level   │    │
│  │ created_at   │    │    │ target_level │    │    │ to_level     │    │
│  └──────┬───────┘    │    │ owner        │    │    │ status       │    │
│         │            │    │ priority     │    │    │ dependencies │    │
│         │            │    └──────────────┘    │    └──────────────┘    │
│         │            │                        │                         │
│         │            │    ┌──────────────┐    │    ┌──────────────┐    │
│         │            │    │  quick_wins  │    │    │ tech_options │    │
│         │            │    ├──────────────┤    │    ├──────────────┤    │
│         │            └────│ capability_id│    │    │ id (PK)      │    │
│         │                 │ name         │    │    │ category     │    │
│         │                 │ status       │    │    │ option_name  │    │
│         │                 │ progress     │    │    │ score        │    │
│         │                 └──────────────┘    │    └──────────────┘    │
│         │                                     │                         │
│         │            ┌────────────────────────┘                         │
│         │            │                                                  │
│         ▼            ▼                                                  │
│  ┌──────────────────────────┐         ┌──────────────────────────┐    │
│  │      activity_log        │         │     maturity_defs        │    │
│  ├──────────────────────────┤         ├──────────────────────────┤    │
│  │ id (PK)                  │         │ level (PK)               │    │
│  │ user_id (FK)             │         │ name                     │    │
│  │ action                   │         │ process_char             │    │
│  │ table_name               │         │ tech_char                │    │
│  │ record_id                │         │ data_char                │    │
│  │ old_values               │         │ people_char              │    │
│  │ new_values               │         └──────────────────────────┘    │
│  │ created_at               │                                          │
│  └──────────────────────────┘         ┌──────────────────────────┐    │
│                                        │      chat_history        │    │
│                                        ├──────────────────────────┤    │
│                                        │ id (PK)                  │    │
│                                        │ user_id (FK)             │    │
│                                        │ session_id               │    │
│                                        │ role                     │    │
│                                        │ content                  │    │
│                                        │ created_at               │    │
│                                        └──────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tables

### users

Extended user profile information (supplements Supabase Auth).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | - | Primary key, references auth.users |
| `email` | `text` | NO | - | User email address |
| `full_name` | `text` | YES | - | Display name |
| `role` | `user_role` | NO | 'viewer' | User role (admin/editor/viewer) |
| `avatar_url` | `text` | YES | - | Profile image URL |
| `department` | `text` | YES | - | User's department |
| `created_at` | `timestamptz` | NO | now() | Creation timestamp |
| `updated_at` | `timestamptz` | NO | now() | Last update timestamp |

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  avatar_url TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### capabilities

Core roadmap capability areas with maturity tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | gen_random_uuid() | Primary key |
| `name` | `text` | NO | - | Capability name |
| `description` | `text` | YES | - | Detailed description |
| `current_level` | `integer` | NO | 1 | Current maturity (1-5) |
| `target_level` | `integer` | NO | 4 | Target maturity (1-5) |
| `owner` | `text` | YES | - | Responsible person/dept |
| `priority` | `priority_level` | NO | 'MEDIUM' | Priority level |
| `qol_impact` | `text` | YES | - | Quality of life impact description |
| `color` | `text` | YES | - | Display color (hex) |
| `icon` | `text` | YES | - | Icon identifier |
| `created_at` | `timestamptz` | NO | now() | Creation timestamp |
| `updated_at` | `timestamptz` | NO | now() | Last update timestamp |

```sql
CREATE TABLE capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 5),
  target_level INTEGER NOT NULL DEFAULT 4 CHECK (target_level BETWEEN 1 AND 5),
  owner TEXT,
  priority priority_level NOT NULL DEFAULT 'MEDIUM',
  qol_impact TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### milestones

Level progression milestones with multiple timeline paths.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | gen_random_uuid() | Primary key |
| `capability_id` | `uuid` | NO | - | FK to capabilities |
| `name` | `text` | NO | - | Milestone name |
| `description` | `text` | YES | - | Detailed description |
| `from_level` | `integer` | NO | - | Starting maturity level |
| `to_level` | `integer` | NO | - | Target maturity level |
| `path_a_months` | `integer` | YES | - | Aggressive timeline (months) |
| `path_b_months` | `integer` | YES | - | Moderate timeline (months) |
| `path_c_months` | `integer` | YES | - | Conservative timeline (months) |
| `status` | `milestone_status` | NO | 'not_started' | Current status |
| `dependencies` | `uuid[]` | YES | '{}' | Array of dependent milestone IDs |
| `notes` | `text` | YES | - | Progress notes |
| `start_date` | `date` | YES | - | Actual start date |
| `end_date` | `date` | YES | - | Actual end date |
| `created_at` | `timestamptz` | NO | now() | Creation timestamp |
| `updated_at` | `timestamptz` | NO | now() | Last update timestamp |

```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  from_level INTEGER NOT NULL CHECK (from_level BETWEEN 1 AND 5),
  to_level INTEGER NOT NULL CHECK (to_level BETWEEN 1 AND 5),
  path_a_months INTEGER,
  path_b_months INTEGER,
  path_c_months INTEGER,
  status milestone_status NOT NULL DEFAULT 'not_started',
  dependencies UUID[] DEFAULT '{}',
  notes TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_level_progression CHECK (to_level > from_level)
);
```

---

### quick_wins

6-month initiative tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | gen_random_uuid() | Primary key |
| `name` | `text` | NO | - | Initiative name |
| `description` | `text` | YES | - | Detailed description |
| `capability_id` | `uuid` | YES | - | FK to capabilities (optional) |
| `timeline_months` | `integer` | NO | - | Expected duration |
| `investment` | `investment_level` | YES | - | Investment level |
| `roi` | `roi_level` | YES | - | Expected ROI |
| `status` | `milestone_status` | NO | 'not_started' | Current status |
| `progress_percent` | `integer` | YES | 0 | Progress (0-100) |
| `assigned_to` | `text` | YES | - | Owner/assignee |
| `category` | `text` | YES | - | Category grouping |
| `order` | `integer` | YES | 0 | Display order |
| `created_at` | `timestamptz` | NO | now() | Creation timestamp |
| `updated_at` | `timestamptz` | NO | now() | Last update timestamp |

```sql
CREATE TABLE quick_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  capability_id UUID REFERENCES capabilities(id) ON DELETE SET NULL,
  timeline_months INTEGER NOT NULL,
  investment investment_level,
  roi roi_level,
  status milestone_status NOT NULL DEFAULT 'not_started',
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  assigned_to TEXT,
  category TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### technology_options

Available technology solutions by category.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | gen_random_uuid() | Primary key |
| `category` | `text` | NO | - | Technology category |
| `option_name` | `text` | NO | - | Solution name |
| `vendor` | `text` | YES | - | Vendor/provider |
| `survivability_score` | `integer` | YES | - | Survivability rating (1-100) |
| `cost_range` | `text` | YES | - | Cost range estimate |
| `implementation_time` | `text` | YES | - | Implementation timeline |
| `recommendation` | `text` | YES | - | Recommendation notes |
| `pros` | `text[]` | YES | '{}' | List of advantages |
| `cons` | `text[]` | YES | '{}' | List of disadvantages |
| `created_at` | `timestamptz` | NO | now() | Creation timestamp |

```sql
CREATE TABLE technology_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  option_name TEXT NOT NULL,
  vendor TEXT,
  survivability_score INTEGER CHECK (survivability_score BETWEEN 0 AND 100),
  cost_range TEXT,
  implementation_time TEXT,
  recommendation TEXT,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### maturity_definitions

Reference definitions for maturity levels 1-5.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `level` | `integer` | NO | - | Maturity level (1-5), Primary key |
| `name` | `text` | NO | - | Level name |
| `process_characteristics` | `text` | NO | - | Process characteristics |
| `technology_characteristics` | `text` | NO | - | Technology characteristics |
| `data_characteristics` | `text` | NO | - | Data characteristics |
| `people_characteristics` | `text` | NO | - | People characteristics |

```sql
CREATE TABLE maturity_definitions (
  level INTEGER PRIMARY KEY CHECK (level BETWEEN 1 AND 5),
  name TEXT NOT NULL,
  process_characteristics TEXT NOT NULL,
  technology_characteristics TEXT NOT NULL,
  data_characteristics TEXT NOT NULL,
  people_characteristics TEXT NOT NULL
);
```

---

### activity_log

Audit trail for all changes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | gen_random_uuid() | Primary key |
| `user_id` | `uuid` | YES | - | FK to users (null for system) |
| `action` | `text` | NO | - | Action type (INSERT/UPDATE/DELETE) |
| `table_name` | `text` | NO | - | Affected table |
| `record_id` | `uuid` | YES | - | Affected record ID |
| `old_values` | `jsonb` | YES | - | Previous values |
| `new_values` | `jsonb` | YES | - | New values |
| `ai_generated` | `boolean` | NO | false | Was this change from AI? |
| `created_at` | `timestamptz` | NO | now() | Timestamp |

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### chat_history

AI conversation history.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | gen_random_uuid() | Primary key |
| `user_id` | `uuid` | NO | - | FK to users |
| `session_id` | `uuid` | NO | - | Chat session identifier |
| `role` | `text` | NO | - | 'user' or 'assistant' |
| `content` | `text` | NO | - | Message content |
| `metadata` | `jsonb` | YES | - | Tool calls, etc. |
| `created_at` | `timestamptz` | NO | now() | Timestamp |

```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Enums and Types

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- Priority levels
CREATE TYPE priority_level AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- Milestone/Quick win status
CREATE TYPE milestone_status AS ENUM ('not_started', 'in_progress', 'completed', 'blocked');

-- Investment level
CREATE TYPE investment_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- ROI level
CREATE TYPE roi_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
```

---

## Indexes

```sql
-- Capabilities
CREATE INDEX idx_capabilities_priority ON capabilities(priority);
CREATE INDEX idx_capabilities_owner ON capabilities(owner);

-- Milestones
CREATE INDEX idx_milestones_capability ON milestones(capability_id);
CREATE INDEX idx_milestones_status ON milestones(status);

-- Quick Wins
CREATE INDEX idx_quickwins_status ON quick_wins(status);
CREATE INDEX idx_quickwins_capability ON quick_wins(capability_id);

-- Activity Log
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_table ON activity_log(table_name);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- Chat History
CREATE INDEX idx_chat_user ON chat_history(user_id);
CREATE INDEX idx_chat_session ON chat_history(session_id);
CREATE INDEX idx_chat_created ON chat_history(created_at DESC);
```

---

## Row Level Security

### Enable RLS on All Tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE maturity_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
```

### Policies

```sql
-- ============================================
-- CAPABILITIES
-- ============================================

-- Anyone authenticated can read
CREATE POLICY "capabilities_select" ON capabilities
  FOR SELECT
  TO authenticated
  USING (true);

-- Editors and admins can insert
CREATE POLICY "capabilities_insert" ON capabilities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'editor')
    )
  );

-- Editors and admins can update
CREATE POLICY "capabilities_update" ON capabilities
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'editor')
    )
  );

-- Only admins can delete
CREATE POLICY "capabilities_delete" ON capabilities
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- MILESTONES (same pattern)
-- ============================================

CREATE POLICY "milestones_select" ON milestones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "milestones_modify" ON milestones
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- ============================================
-- ACTIVITY LOG
-- ============================================

-- Users can see their own activity, admins see all
CREATE POLICY "activity_select" ON activity_log
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- System inserts (via triggers) always allowed
CREATE POLICY "activity_insert" ON activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- CHAT HISTORY
-- ============================================

-- Users can only see their own chats
CREATE POLICY "chat_select" ON chat_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can only insert their own chats
CREATE POLICY "chat_insert" ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

---

## Triggers and Functions

### Updated At Trigger

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER capabilities_updated_at
  BEFORE UPDATE ON capabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER quick_wins_updated_at
  BEFORE UPDATE ON quick_wins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Activity Log Trigger

```sql
-- Function to log changes
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to audited tables
CREATE TRIGGER capabilities_audit
  AFTER INSERT OR UPDATE OR DELETE ON capabilities
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER milestones_audit
  AFTER INSERT OR UPDATE OR DELETE ON milestones
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER quick_wins_audit
  AFTER INSERT OR UPDATE OR DELETE ON quick_wins
  FOR EACH ROW EXECUTE FUNCTION log_activity();
```

---

## Views

### Capability Summary View

```sql
CREATE OR REPLACE VIEW capability_summary AS
SELECT 
  c.id,
  c.name,
  c.current_level,
  c.target_level,
  c.priority,
  c.owner,
  COUNT(m.id) as milestone_count,
  COUNT(m.id) FILTER (WHERE m.status = 'completed') as completed_milestones,
  COUNT(qw.id) as quick_win_count
FROM capabilities c
LEFT JOIN milestones m ON m.capability_id = c.id
LEFT JOIN quick_wins qw ON qw.capability_id = c.id
GROUP BY c.id;
```

### Timeline View

```sql
CREATE OR REPLACE VIEW timeline_view AS
SELECT 
  m.id,
  m.name as milestone_name,
  c.name as capability_name,
  m.from_level,
  m.to_level,
  m.path_a_months,
  m.path_b_months,
  m.path_c_months,
  m.status,
  m.dependencies,
  c.priority
FROM milestones m
JOIN capabilities c ON c.id = m.capability_id
ORDER BY c.priority DESC, m.from_level;
```

---

## Migrations

Migrations are stored in `supabase/migrations/` with timestamps:

```
supabase/migrations/
├── 20240101000000_initial_schema.sql
├── 20240101000001_create_enums.sql
├── 20240101000002_create_tables.sql
├── 20240101000003_create_indexes.sql
├── 20240101000004_enable_rls.sql
├── 20240101000005_create_policies.sql
├── 20240101000006_create_triggers.sql
└── 20240101000007_create_views.sql
```

### Running Migrations

```bash
# Push migrations to database
supabase db push

# Create new migration
supabase migration new my_migration_name

# Reset database (DANGER: deletes all data)
supabase db reset
```

---

## Seed Data

Seed data file: `supabase/seed.sql`

See [seed.sql](../supabase/seed.sql) for complete initial data including:
- 7 capability areas
- Maturity level definitions
- Quick win initiatives
- Technology options

```bash
# Run seed data
pnpm db:seed
```

---

## Related Documentation

- [API Reference](./API.md)
- [Architecture](./ARCHITECTURE.md)
- [Data Model Spec](../specs/DATA_MODEL_SPEC.md)
