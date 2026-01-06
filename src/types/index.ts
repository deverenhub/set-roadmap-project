// src/types/index.ts
// Application types

import type { Database } from './database';

// Extract row types from database
export type Capability = Database['public']['Tables']['capabilities']['Row'];
export type CapabilityInsert = Database['public']['Tables']['capabilities']['Insert'];
export type CapabilityUpdate = Database['public']['Tables']['capabilities']['Update'];

export type Milestone = Database['public']['Tables']['milestones']['Row'];
export type MilestoneInsert = Database['public']['Tables']['milestones']['Insert'];
export type MilestoneUpdate = Database['public']['Tables']['milestones']['Update'];

export type QuickWin = Database['public']['Tables']['quick_wins']['Row'];
export type QuickWinInsert = Database['public']['Tables']['quick_wins']['Insert'];
export type QuickWinUpdate = Database['public']['Tables']['quick_wins']['Update'];

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
export type ChatHistory = Database['public']['Tables']['chat_history']['Row'];
export type MaturityDefinition = Database['public']['Tables']['maturity_definitions']['Row'];
export type MaturityDefinitionUpdate = Database['public']['Tables']['maturity_definitions']['Update'];
export type TechnologyOption = Database['public']['Tables']['technology_options']['Row'];
export type TechnologyOptionInsert = Database['public']['Tables']['technology_options']['Insert'];
export type TechnologyOptionUpdate = Database['public']['Tables']['technology_options']['Update'];
export type QoLImpact = Database['public']['Tables']['qol_impacts']['Row'];
export type QoLImpactInsert = Database['public']['Tables']['qol_impacts']['Insert'];
export type QoLImpactUpdate = Database['public']['Tables']['qol_impacts']['Update'];
export type RoadmapPath = Database['public']['Tables']['roadmap_paths']['Row'];
export type RoadmapPathInsert = Database['public']['Tables']['roadmap_paths']['Insert'];
export type RoadmapPathUpdate = Database['public']['Tables']['roadmap_paths']['Update'];
export type RoadmapType = 'inventory' | 'production' | 'planning';

// Enum types
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type UserRole = 'admin' | 'editor' | 'viewer';
export type TimelinePath = 'A' | 'B' | 'C';
export type InvestmentLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ROILevel = 'LOW' | 'MEDIUM' | 'HIGH';

// Extended types with relations
export interface CapabilityWithRelations extends Capability {
  milestones?: Milestone[];
  quick_wins?: QuickWin[];
}

export interface MilestoneWithCapability extends Milestone {
  capability?: Pick<Capability, 'id' | 'name' | 'priority' | 'color'> | null;
}

export interface QuickWinWithCapability extends QuickWin {
  capability?: Pick<Capability, 'id' | 'name'> | null;
}

export interface ActivityLogWithUser extends ActivityLog {
  user?: Pick<User, 'id' | 'full_name' | 'email'> | null;
}

// Dashboard types
export interface DashboardKPIs {
  overallProgress: number;
  activeMilestones: number;
  completedQuickWins: number;
  totalQuickWins: number;
  criticalCapabilities: number;
  blockedMilestones: number;
  daysToNextMilestone?: number | null;
}

// Timeline types
export interface TimelineItem {
  id: string;
  name: string;
  capability: string;
  capabilityColor: string;
  priority: Priority;
  startDate: Date;
  endDate: Date;
  duration: number;
  status: Status;
  progress: number;
  dependencies: string[];
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

// Form types
export interface CapabilityFormData {
  name: string;
  description: string;
  priority: Priority;
  current_level: number;
  target_level: number;
  owner: string;
  color: string;
  qol_impact: string;
}

export interface MilestoneFormData {
  name: string;
  description: string;
  capability_id: string;
  from_level: number;
  to_level: number;
  path_a_months: number;
  path_b_months: number;
  path_c_months: number;
  deliverables: string[];
}

export interface QuickWinFormData {
  name: string;
  description: string;
  capability_id: string | null;
  timeline_months: number;
  investment: InvestmentLevel;
  roi: ROILevel;
  category: string;
}

// Filter types
export interface CapabilityFilters {
  priority?: Priority | null;
  owner?: string | null;
  search?: string;
}

export interface MilestoneFilters {
  capabilityId?: string | null;
  status?: Status | null;
}

export interface QuickWinFilters {
  status?: Status | null;
  capabilityId?: string | null;
  category?: string | null;
}

// API response types
export interface APIResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Re-export database types
export type { Database } from './database';
