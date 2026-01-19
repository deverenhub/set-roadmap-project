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

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];
export type CommentEntityType = 'capability' | 'milestone' | 'quick_win';

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];
export type NotificationType = 'comment' | 'mention' | 'status_change' | 'blocked' | 'milestone_due' | 'assignment' | 'system';

// Facility types (Multi-facility support)
export type Facility = Database['public']['Tables']['facilities']['Row'];
export type FacilityInsert = Database['public']['Tables']['facilities']['Insert'];
export type FacilityUpdate = Database['public']['Tables']['facilities']['Update'];

export type UserFacility = Database['public']['Tables']['user_facilities']['Row'];
export type UserFacilityInsert = Database['public']['Tables']['user_facilities']['Insert'];
export type UserFacilityUpdate = Database['public']['Tables']['user_facilities']['Update'];

export type CapabilityTemplate = Database['public']['Tables']['capability_templates']['Row'];
export type CapabilityTemplateInsert = Database['public']['Tables']['capability_templates']['Insert'];
export type CapabilityTemplateUpdate = Database['public']['Tables']['capability_templates']['Update'];

export type CapabilityFacilityProgress = Database['public']['Tables']['capability_facility_progress']['Row'];
export type CapabilityFacilityProgressInsert = Database['public']['Tables']['capability_facility_progress']['Insert'];
export type CapabilityFacilityProgressUpdate = Database['public']['Tables']['capability_facility_progress']['Update'];

// Facility-related enums
export type FacilityStatus = 'active' | 'planning' | 'onboarding' | 'inactive';
export type FacilityRole = 'viewer' | 'editor' | 'facility_admin';
export type Mission = 'mission_1' | 'mission_2' | 'mission_3';
export type CapabilityCategory = 'operations' | 'technology' | 'process';

// Attachment types
export type AttachmentEntityType = 'capability' | 'milestone' | 'quick_win';

export interface Attachment {
  id: string;
  entity_type: AttachmentEntityType;
  entity_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_by: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttachmentInsert {
  entity_type: AttachmentEntityType;
  entity_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_by?: string;
  description?: string;
}

export interface AttachmentWithUser extends Attachment {
  user?: Pick<User, 'id' | 'full_name' | 'email'> | null;
}

// Invitation types
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvitationInsert {
  email: string;
  role: UserRole;
  token: string;
  invited_by?: string;
  expires_at: string;
}

export interface InvitationWithInviter extends Invitation {
  inviter?: Pick<User, 'id' | 'full_name' | 'email'> | null;
}

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

export interface CommentWithUser extends Comment {
  user: Pick<User, 'id' | 'full_name' | 'email'>;
  replies?: CommentWithUser[];
}

export interface NotificationWithActor extends Notification {
  actor?: Pick<User, 'id' | 'full_name' | 'email'> | null;
}

// Facility extended types
export interface FacilityWithStats extends Facility {
  capability_count?: number;
  milestone_count?: number;
  quick_win_count?: number;
  user_count?: number;
}

export interface UserFacilityWithDetails extends UserFacility {
  facility?: Facility;
  user?: Pick<User, 'id' | 'full_name' | 'email'>;
}

export interface CapabilityWithFacility extends Capability {
  facility?: Pick<Facility, 'id' | 'code' | 'name'> | null;
}

export interface CapabilityTemplateWithProgress extends CapabilityTemplate {
  facility_progress?: CapabilityFacilityProgress[];
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
  facilityId?: string | null;
  mission?: Mission | null;
  isEnterprise?: boolean | null;
}

export interface MilestoneFilters {
  capabilityId?: string | null;
  status?: Status | null;
  facilityId?: string | null;
}

export interface QuickWinFilters {
  status?: Status | null;
  capabilityId?: string | null;
  category?: string | null;
  facilityId?: string | null;
}

export interface FacilityFilters {
  status?: FacilityStatus | null;
  search?: string;
  [key: string]: string | null | undefined;
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
