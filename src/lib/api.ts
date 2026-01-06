// src/lib/api.ts
import { supabase } from './supabase';
import type { Capability, Milestone, QuickWin } from '@/types';

export class APIError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Dashboard KPIs
export async function fetchDashboardKPIs() {
  const [capRes, msRes, qwRes] = await Promise.all([
    supabase.from('capabilities').select('current_level, target_level, priority'),
    supabase.from('milestones').select('status'),
    supabase.from('quick_wins').select('status'),
  ]);

  if (capRes.error || msRes.error || qwRes.error) {
    throw new APIError('Failed to fetch KPIs');
  }

  const capabilities = (capRes.data || []) as Pick<Capability, 'current_level' | 'target_level' | 'priority'>[];
  const milestones = (msRes.data || []) as Pick<Milestone, 'status'>[];
  const quickWins = (qwRes.data || []) as Pick<QuickWin, 'status'>[];

  const overallProgress = capabilities.reduce((sum, c) => {
    const progress = c.target_level > 1
      ? ((c.current_level - 1) / (c.target_level - 1)) * 100
      : 100;
    return sum + progress;
  }, 0) / (capabilities.length || 1);

  return {
    overallProgress: Math.round(overallProgress),
    activeMilestones: milestones.filter((m) => m.status === 'in_progress').length,
    completedQuickWins: quickWins.filter((q) => q.status === 'completed').length,
    totalQuickWins: quickWins.length,
    criticalCapabilities: capabilities.filter((c) => c.priority === 'CRITICAL').length,
    blockedMilestones: milestones.filter((m) => m.status === 'blocked').length,
  };
}
