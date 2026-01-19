// src/types/database.ts
// Auto-generated types for Supabase database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      capabilities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          priority: string;
          current_level: number;
          target_level: number;
          owner: string | null;
          color: string | null;
          qol_impact: string | null;
          facility_id: string | null;
          is_enterprise: boolean;
          mission: 'mission_1' | 'mission_2' | 'mission_3' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          priority?: string;
          current_level?: number;
          target_level?: number;
          owner?: string | null;
          color?: string | null;
          qol_impact?: string | null;
          facility_id?: string | null;
          is_enterprise?: boolean;
          mission?: 'mission_1' | 'mission_2' | 'mission_3' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          priority?: string;
          current_level?: number;
          target_level?: number;
          owner?: string | null;
          color?: string | null;
          qol_impact?: string | null;
          facility_id?: string | null;
          is_enterprise?: boolean;
          mission?: 'mission_1' | 'mission_2' | 'mission_3' | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      milestones: {
        Row: {
          id: string;
          capability_id: string;
          name: string;
          description: string | null;
          from_level: number;
          to_level: number;
          status: string;
          path_a_months: number | null;
          path_b_months: number | null;
          path_c_months: number | null;
          timeline_offset: number | null;
          dependencies: string[] | null;
          deliverables: string[] | null;
          start_date: string | null;
          end_date: string | null;
          notes: string | null;
          facility_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          capability_id: string;
          name: string;
          description?: string | null;
          from_level: number;
          to_level: number;
          status?: string;
          path_a_months?: number | null;
          path_b_months?: number | null;
          path_c_months?: number | null;
          timeline_offset?: number | null;
          dependencies?: string[] | null;
          deliverables?: string[] | null;
          start_date?: string | null;
          end_date?: string | null;
          notes?: string | null;
          facility_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          capability_id?: string;
          name?: string;
          description?: string | null;
          from_level?: number;
          to_level?: number;
          status?: string;
          path_a_months?: number | null;
          path_b_months?: number | null;
          path_c_months?: number | null;
          timeline_offset?: number | null;
          dependencies?: string[] | null;
          deliverables?: string[] | null;
          start_date?: string | null;
          end_date?: string | null;
          notes?: string | null;
          facility_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'milestones_capability_id_fkey';
            columns: ['capability_id'];
            referencedRelation: 'capabilities';
            referencedColumns: ['id'];
          }
        ];
      };
      quick_wins: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          capability_id: string | null;
          status: string;
          timeline_months: number;
          investment: string | null;
          roi: string | null;
          category: string | null;
          progress_percent: number;
          order: number;
          facility_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          capability_id?: string | null;
          status?: string;
          timeline_months: number;
          investment?: string | null;
          roi?: string | null;
          category?: string | null;
          progress_percent?: number;
          order?: number;
          facility_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          capability_id?: string | null;
          status?: string;
          timeline_months?: number;
          investment?: string | null;
          roi?: string | null;
          category?: string | null;
          progress_percent?: number;
          order?: number;
          facility_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'quick_wins_capability_id_fkey';
            columns: ['capability_id'];
            referencedRelation: 'capabilities';
            referencedColumns: ['id'];
          }
        ];
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string | null;
          table_name: string;
          record_id: string;
          action: string;
          old_values: Json | null;
          new_values: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          table_name: string;
          record_id: string;
          action: string;
          old_values?: Json | null;
          new_values?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          table_name?: string;
          record_id?: string;
          action?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          role: string;
          content: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          role: string;
          content: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          role?: string;
          content?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      maturity_definitions: {
        Row: {
          id: string;
          level: number;
          name: string;
          description: string;
          characteristics: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          level: number;
          name: string;
          description: string;
          characteristics: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          level?: number;
          name?: string;
          description?: string;
          characteristics?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      technology_options: {
        Row: {
          id: string;
          category: string;
          name: string;
          vendor: string | null;
          description: string | null;
          pros: string[];
          cons: string[];
          estimated_cost: string | null;
          survivability_score: number | null;
          implementation_months: number | null;
          integration_type: string | null;
          recommended: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          name: string;
          vendor?: string | null;
          description?: string | null;
          pros?: string[];
          cons?: string[];
          estimated_cost?: string | null;
          survivability_score?: number | null;
          implementation_months?: number | null;
          integration_type?: string | null;
          recommended?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          name?: string;
          vendor?: string | null;
          description?: string | null;
          pros?: string[];
          cons?: string[];
          estimated_cost?: string | null;
          survivability_score?: number | null;
          implementation_months?: number | null;
          integration_type?: string | null;
          recommended?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      qol_impacts: {
        Row: {
          id: string;
          category: string;
          description: string;
          metrics: string[];
          target: string | null;
          capability_id: string | null;
          impact_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          description: string;
          metrics?: string[];
          target?: string | null;
          capability_id?: string | null;
          impact_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          description?: string;
          metrics?: string[];
          target?: string | null;
          capability_id?: string | null;
          impact_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'qol_impacts_capability_id_fkey';
            columns: ['capability_id'];
            referencedRelation: 'capabilities';
            referencedColumns: ['id'];
          }
        ];
      };
      roadmap_paths: {
        Row: {
          id: string;
          roadmap_type: 'inventory' | 'production' | 'planning';
          from_level: number;
          to_level: number;
          path_name: 'A' | 'B' | 'C';
          path_label: string;
          description: string | null;
          duration_months_min: number | null;
          duration_months_max: number | null;
          key_activities: string[];
          technology_options: string[];
          qol_impact: string | null;
          risks: string[];
          capability_id: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          roadmap_type: 'inventory' | 'production' | 'planning';
          from_level: number;
          to_level: number;
          path_name: 'A' | 'B' | 'C';
          path_label: string;
          description?: string | null;
          duration_months_min?: number | null;
          duration_months_max?: number | null;
          key_activities?: string[];
          technology_options?: string[];
          qol_impact?: string | null;
          risks?: string[];
          capability_id?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          roadmap_type?: 'inventory' | 'production' | 'planning';
          from_level?: number;
          to_level?: number;
          path_name?: 'A' | 'B' | 'C';
          path_label?: string;
          description?: string | null;
          duration_months_min?: number | null;
          duration_months_max?: number | null;
          key_activities?: string[];
          technology_options?: string[];
          qol_impact?: string | null;
          risks?: string[];
          capability_id?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'roadmap_paths_capability_id_fkey';
            columns: ['capability_id'];
            referencedRelation: 'capabilities';
            referencedColumns: ['id'];
          }
        ];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          entity_type: 'capability' | 'milestone' | 'quick_win';
          entity_id: string;
          parent_id: string | null;
          content: string;
          mentions: string[];
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type: 'capability' | 'milestone' | 'quick_win';
          entity_id: string;
          parent_id?: string | null;
          content: string;
          mentions?: string[];
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_type?: 'capability' | 'milestone' | 'quick_win';
          entity_id?: string;
          parent_id?: string | null;
          content?: string;
          mentions?: string[];
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_parent_id_fkey';
            columns: ['parent_id'];
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'comment' | 'mention' | 'status_change' | 'blocked' | 'milestone_due' | 'assignment' | 'system';
          title: string;
          message: string;
          entity_type: 'capability' | 'milestone' | 'quick_win' | 'comment' | null;
          entity_id: string | null;
          actor_id: string | null;
          is_read: boolean;
          read_at: string | null;
          metadata: Json;
          created_at: string;
          facility_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'comment' | 'mention' | 'status_change' | 'blocked' | 'milestone_due' | 'assignment' | 'system';
          title: string;
          message: string;
          entity_type?: 'capability' | 'milestone' | 'quick_win' | 'comment' | null;
          entity_id?: string | null;
          actor_id?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          metadata?: Json;
          created_at?: string;
          facility_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'comment' | 'mention' | 'status_change' | 'blocked' | 'milestone_due' | 'assignment' | 'system';
          title?: string;
          message?: string;
          entity_type?: 'capability' | 'milestone' | 'quick_win' | 'comment' | null;
          entity_id?: string | null;
          actor_id?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          metadata?: Json;
          created_at?: string;
          facility_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_actor_id_fkey';
            columns: ['actor_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      facilities: {
        Row: {
          id: string;
          code: string;
          name: string;
          location_city: string | null;
          location_state: string | null;
          status: 'active' | 'planning' | 'onboarding' | 'inactive';
          maturity_score: number;
          description: string | null;
          timezone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          location_city?: string | null;
          location_state?: string | null;
          status?: 'active' | 'planning' | 'onboarding' | 'inactive';
          maturity_score?: number;
          description?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          location_city?: string | null;
          location_state?: string | null;
          status?: 'active' | 'planning' | 'onboarding' | 'inactive';
          maturity_score?: number;
          description?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_facilities: {
        Row: {
          id: string;
          user_id: string;
          facility_id: string;
          role: 'viewer' | 'editor' | 'facility_admin';
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          facility_id: string;
          role?: 'viewer' | 'editor' | 'facility_admin';
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          facility_id?: string;
          role?: 'viewer' | 'editor' | 'facility_admin';
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_facilities_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_facilities_facility_id_fkey';
            columns: ['facility_id'];
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          }
        ];
      };
      capability_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          priority: string;
          target_level: number;
          owner: string | null;
          qol_impact: string | null;
          color: string | null;
          is_enterprise: boolean;
          category: 'operations' | 'technology' | 'process' | null;
          mission: 'mission_1' | 'mission_2' | 'mission_3' | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          priority?: string;
          target_level?: number;
          owner?: string | null;
          qol_impact?: string | null;
          color?: string | null;
          is_enterprise?: boolean;
          category?: 'operations' | 'technology' | 'process' | null;
          mission?: 'mission_1' | 'mission_2' | 'mission_3' | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          priority?: string;
          target_level?: number;
          owner?: string | null;
          qol_impact?: string | null;
          color?: string | null;
          is_enterprise?: boolean;
          category?: 'operations' | 'technology' | 'process' | null;
          mission?: 'mission_1' | 'mission_2' | 'mission_3' | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      capability_facility_progress: {
        Row: {
          id: string;
          capability_id: string;
          facility_id: string;
          current_level: number;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          capability_id: string;
          facility_id: string;
          current_level?: number;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          capability_id?: string;
          facility_id?: string;
          current_level?: number;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'capability_facility_progress_capability_id_fkey';
            columns: ['capability_id'];
            referencedRelation: 'capabilities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'capability_facility_progress_facility_id_fkey';
            columns: ['facility_id'];
            referencedRelation: 'facilities';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Helper types for table rows
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
