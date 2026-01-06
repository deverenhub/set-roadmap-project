# Data Model Specification

TypeScript interfaces and data model definitions for the SET Interactive Roadmap Platform.

## 📋 Table of Contents

- [Core Types](#core-types)
- [Database Types](#database-types)
- [API Types](#api-types)
- [UI State Types](#ui-state-types)
- [Validation Rules](#validation-rules)
- [Computed Fields](#computed-fields)

---

## Core Types

### Enums

```typescript
// Priority levels for capabilities
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Status for milestones and quick wins
export type Status = 'not_started' | 'in_progress' | 'completed' | 'blocked';

// Investment and ROI levels
export type InvestmentLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ROILevel = 'LOW' | 'MEDIUM' | 'HIGH';

// User roles
export type UserRole = 'admin' | 'editor' | 'viewer';

// Timeline paths
export type TimelinePath = 'A' | 'B' | 'C';

// Maturity levels
export type MaturityLevel = 1 | 2 | 3 | 4 | 5;
```

### Base Types

```typescript
// UUID type alias
export type UUID = string;

// ISO timestamp
export type Timestamp = string;

// ISO date (YYYY-MM-DD)
export type DateString = string;
```

---

## Database Types

### User

```typescript
export interface User {
  id: UUID;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  department: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserInsert {
  id: UUID; // Must match auth.users.id
  email: string;
  full_name?: string | null;
  role?: UserRole;
  avatar_url?: string | null;
  department?: string | null;
}

export interface UserUpdate {
  full_name?: string | null;
  role?: UserRole;
  avatar_url?: string | null;
  department?: string | null;
}
```

---

### Capability

```typescript
export interface Capability {
  id: UUID;
  name: string;
  description: string | null;
  current_level: MaturityLevel;
  target_level: MaturityLevel;
  owner: string | null;
  priority: Priority;
  qol_impact: string | null;
  color: string | null;
  icon: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CapabilityInsert {
  name: string;
  description?: string | null;
  current_level?: MaturityLevel;
  target_level?: MaturityLevel;
  owner?: string | null;
  priority?: Priority;
  qol_impact?: string | null;
  color?: string | null;
  icon?: string | null;
}

export interface CapabilityUpdate {
  name?: string;
  description?: string | null;
  current_level?: MaturityLevel;
  target_level?: MaturityLevel;
  owner?: string | null;
  priority?: Priority;
  qol_impact?: string | null;
  color?: string | null;
  icon?: string | null;
}

// Capability with related data
export interface CapabilityWithRelations extends Capability {
  milestones?: Milestone[];
  quick_wins?: QuickWin[];
}
```

---

### Milestone

```typescript
export interface Milestone {
  id: UUID;
  capability_id: UUID;
  name: string;
  description: string | null;
  from_level: MaturityLevel;
  to_level: MaturityLevel;
  path_a_months: number | null;
  path_b_months: number | null;
  path_c_months: number | null;
  status: Status;
  dependencies: UUID[];
  notes: string | null;
  start_date: DateString | null;
  end_date: DateString | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface MilestoneInsert {
  capability_id: UUID;
  name: string;
  description?: string | null;
  from_level: MaturityLevel;
  to_level: MaturityLevel;
  path_a_months?: number | null;
  path_b_months?: number | null;
  path_c_months?: number | null;
  status?: Status;
  dependencies?: UUID[];
  notes?: string | null;
  start_date?: DateString | null;
  end_date?: DateString | null;
}

export interface MilestoneUpdate {
  name?: string;
  description?: string | null;
  from_level?: MaturityLevel;
  to_level?: MaturityLevel;
  path_a_months?: number | null;
  path_b_months?: number | null;
  path_c_months?: number | null;
  status?: Status;
  dependencies?: UUID[];
  notes?: string | null;
  start_date?: DateString | null;
  end_date?: DateString | null;
}

// Milestone with capability data
export interface MilestoneWithCapability extends Milestone {
  capability: Pick<Capability, 'id' | 'name' | 'priority'>;
}
```

---

### Quick Win

```typescript
export interface QuickWin {
  id: UUID;
  name: string;
  description: string | null;
  capability_id: UUID | null;
  timeline_months: number;
  investment: InvestmentLevel | null;
  roi: ROILevel | null;
  status: Status;
  progress_percent: number | null;
  assigned_to: string | null;
  category: string | null;
  order: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface QuickWinInsert {
  name: string;
  description?: string | null;
  capability_id?: UUID | null;
  timeline_months: number;
  investment?: InvestmentLevel | null;
  roi?: ROILevel | null;
  status?: Status;
  progress_percent?: number | null;
  assigned_to?: string | null;
  category?: string | null;
  order?: number;
}

export interface QuickWinUpdate {
  name?: string;
  description?: string | null;
  capability_id?: UUID | null;
  timeline_months?: number;
  investment?: InvestmentLevel | null;
  roi?: ROILevel | null;
  status?: Status;
  progress_percent?: number | null;
  assigned_to?: string | null;
  category?: string | null;
  order?: number;
}

// Quick win with capability data
export interface QuickWinWithCapability extends QuickWin {
  capability: Pick<Capability, 'id' | 'name'> | null;
}
```

---

### Technology Option

```typescript
export interface TechnologyOption {
  id: UUID;
  category: string;
  option_name: string;
  vendor: string | null;
  survivability_score: number | null;
  cost_range: string | null;
  implementation_time: string | null;
  recommendation: string | null;
  pros: string[];
  cons: string[];
  created_at: Timestamp;
}

export interface TechnologyOptionInsert {
  category: string;
  option_name: string;
  vendor?: string | null;
  survivability_score?: number | null;
  cost_range?: string | null;
  implementation_time?: string | null;
  recommendation?: string | null;
  pros?: string[];
  cons?: string[];
}
```

---

### Maturity Definition

```typescript
export interface MaturityDefinition {
  level: MaturityLevel;
  name: string;
  process_characteristics: string;
  technology_characteristics: string;
  data_characteristics: string;
  people_characteristics: string;
}
```

---

### Activity Log

```typescript
export interface ActivityLog {
  id: UUID;
  user_id: UUID | null;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: UUID | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ai_generated: boolean;
  created_at: Timestamp;
}

// Activity with user info
export interface ActivityLogWithUser extends ActivityLog {
  user: Pick<User, 'id' | 'full_name' | 'email'> | null;
}
```

---

### Chat History

```typescript
export interface ChatMessage {
  id: UUID;
  user_id: UUID;
  session_id: UUID;
  role: 'user' | 'assistant';
  content: string;
  metadata: ChatMessageMetadata | null;
  created_at: Timestamp;
}

export interface ChatMessageMetadata {
  tool_calls?: ToolCall[];
  tool_results?: ToolResult[];
  model?: string;
  tokens_used?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
}

export interface ToolResult {
  tool_call_id: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ChatMessageInsert {
  user_id: UUID;
  session_id: UUID;
  role: 'user' | 'assistant';
  content: string;
  metadata?: ChatMessageMetadata | null;
}
```

---

## API Types

### API Response Wrapper

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    total_count?: number;
    page?: number;
    per_page?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

### Pagination

```typescript
export interface PaginationParams {
  page?: number;
  per_page?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
```

### Filter Types

```typescript
export interface CapabilityFilters {
  priority?: Priority | Priority[];
  owner?: string;
  current_level?: MaturityLevel | MaturityLevel[];
  search?: string;
}

export interface MilestoneFilters {
  capability_id?: UUID;
  status?: Status | Status[];
  from_level?: MaturityLevel;
  to_level?: MaturityLevel;
}

export interface QuickWinFilters {
  status?: Status | Status[];
  capability_id?: UUID;
  investment?: InvestmentLevel;
  roi?: ROILevel;
  assigned_to?: string;
}
```

---

## UI State Types

### Dashboard State

```typescript
export interface DashboardState {
  isLoading: boolean;
  selectedPath: TimelinePath;
  filters: {
    priority: Priority | null;
    owner: string | null;
  };
  view: 'grid' | 'list';
}
```

### Timeline State

```typescript
export interface TimelineState {
  selectedPath: TimelinePath;
  zoom: number;
  startDate: DateString;
  endDate: DateString;
  highlightedMilestone: UUID | null;
}
```

### Dependency Graph State

```typescript
export interface DependencyGraphState {
  selectedNode: UUID | null;
  highlightedPath: 'upstream' | 'downstream' | null;
  zoom: number;
  position: { x: number; y: number };
}
```

### Kanban State

```typescript
export interface KanbanState {
  columns: KanbanColumn[];
  draggedItem: UUID | null;
}

export interface KanbanColumn {
  id: Status;
  title: string;
  items: QuickWin[];
}
```

### Chat State

```typescript
export interface ChatState {
  isOpen: boolean;
  sessionId: UUID | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
```

---

## Validation Rules

### Capability Validation

```typescript
import { z } from 'zod';

export const capabilitySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .nullable()
    .optional(),
  current_level: z
    .number()
    .int()
    .min(1)
    .max(5),
  target_level: z
    .number()
    .int()
    .min(1)
    .max(5),
  owner: z
    .string()
    .max(255)
    .nullable()
    .optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  qol_impact: z
    .string()
    .max(1000)
    .nullable()
    .optional(),
}).refine(
  (data) => data.target_level >= data.current_level,
  { message: 'Target level must be >= current level' }
);
```

### Milestone Validation

```typescript
export const milestoneSchema = z.object({
  capability_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).nullable().optional(),
  from_level: z.number().int().min(1).max(5),
  to_level: z.number().int().min(1).max(5),
  path_a_months: z.number().int().min(1).max(60).nullable().optional(),
  path_b_months: z.number().int().min(1).max(60).nullable().optional(),
  path_c_months: z.number().int().min(1).max(60).nullable().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']),
  dependencies: z.array(z.string().uuid()).optional(),
  notes: z.string().max(5000).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
}).refine(
  (data) => data.to_level > data.from_level,
  { message: 'to_level must be greater than from_level' }
);
```

### Quick Win Validation

```typescript
export const quickWinSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).nullable().optional(),
  capability_id: z.string().uuid().nullable().optional(),
  timeline_months: z.number().int().min(1).max(12),
  investment: z.enum(['LOW', 'MEDIUM', 'HIGH']).nullable().optional(),
  roi: z.enum(['LOW', 'MEDIUM', 'HIGH']).nullable().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  progress_percent: z.number().int().min(0).max(100).nullable().optional(),
  assigned_to: z.string().max(255).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  order: z.number().int().min(0).optional(),
});
```

---

## Computed Fields

### Capability Computed Fields

```typescript
export interface CapabilityComputed extends Capability {
  // Progress percentage toward target
  progress_percent: number; // (current - 1) / (target - 1) * 100
  
  // Levels remaining to reach target
  levels_remaining: number; // target - current
  
  // Is at or above target
  target_achieved: boolean; // current >= target
  
  // Number of related milestones
  milestone_count: number;
  
  // Number of completed milestones
  completed_milestone_count: number;
  
  // Related quick wins count
  quick_win_count: number;
}

// Calculation functions
export function computeCapabilityProgress(cap: Capability): number {
  if (cap.target_level <= 1) return 100;
  return ((cap.current_level - 1) / (cap.target_level - 1)) * 100;
}

export function computeLevelsRemaining(cap: Capability): number {
  return Math.max(0, cap.target_level - cap.current_level);
}
```

### Milestone Computed Fields

```typescript
export interface MilestoneComputed extends Milestone {
  // Duration in months for selected path
  duration_months: number;
  
  // Projected start date (based on dependencies)
  projected_start: DateString | null;
  
  // Projected end date
  projected_end: DateString | null;
  
  // Is blocking other milestones
  is_blocking: boolean;
  
  // Is blocked by incomplete dependencies
  is_blocked: boolean;
  
  // Dependency names for display
  dependency_names: string[];
}

export function getMilestoneDuration(
  milestone: Milestone, 
  path: TimelinePath
): number | null {
  switch (path) {
    case 'A': return milestone.path_a_months;
    case 'B': return milestone.path_b_months;
    case 'C': return milestone.path_c_months;
  }
}
```

### Quick Win Computed Fields

```typescript
export interface QuickWinComputed extends QuickWin {
  // Effective progress (0 for not_started, 100 for completed)
  effective_progress: number;
  
  // Days since last update
  days_since_update: number;
  
  // Is stale (no update in 14+ days and not completed)
  is_stale: boolean;
  
  // ROI/Investment ratio for sorting
  roi_score: number;
}

export function computeROIScore(qw: QuickWin): number {
  const roiValues = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  const investValues = { LOW: 3, MEDIUM: 2, HIGH: 1 };
  
  const roiVal = qw.roi ? roiValues[qw.roi] : 2;
  const invVal = qw.investment ? investValues[qw.investment] : 2;
  
  return roiVal * invVal;
}
```

---

## Type Guards

```typescript
// Check if user has edit permission
export function canEdit(user: User): boolean {
  return user.role === 'admin' || user.role === 'editor';
}

// Check if user is admin
export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

// Type guard for capability with relations
export function hasRelations(
  cap: Capability | CapabilityWithRelations
): cap is CapabilityWithRelations {
  return 'milestones' in cap || 'quick_wins' in cap;
}

// Check if milestone is actionable
export function isActionable(milestone: Milestone): boolean {
  return milestone.status !== 'completed' && milestone.status !== 'blocked';
}
```

---

## Related Documentation

- [Database Schema](../docs/DATABASE.md)
- [API Reference](../docs/API.md)
- [MCP Tools Spec](./MCP_TOOLS_SPEC.md)
