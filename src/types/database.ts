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
          created_at?: string;
          updated_at?: string;
        };
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
          dependencies: string[] | null;
          deliverables: string[] | null;
          start_date: string | null;
          end_date: string | null;
          notes: string | null;
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
          dependencies?: string[] | null;
          deliverables?: string[] | null;
          start_date?: string | null;
          end_date?: string | null;
          notes?: string | null;
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
          dependencies?: string[] | null;
          deliverables?: string[] | null;
          start_date?: string | null;
          end_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
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
          created_at?: string;
          updated_at?: string;
        };
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
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
