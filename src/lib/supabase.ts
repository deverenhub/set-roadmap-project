// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Typed table helpers
export const db = {
  capabilities: () => supabase.from('capabilities'),
  milestones: () => supabase.from('milestones'),
  quickWins: () => supabase.from('quick_wins'),
  activityLog: () => supabase.from('activity_log'),
  chatHistory: () => supabase.from('chat_history'),
  users: () => supabase.from('users'),
  maturityDefinitions: () => supabase.from('maturity_definitions'),
  technologyOptions: () => supabase.from('technology_options'),
};
