// src/hooks/useActivityLog.ts
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ActivityLogWithUser } from '@/types';

// Query keys factory
export const activityLogKeys = {
  all: ['activityLog'] as const,
  lists: () => [...activityLogKeys.all, 'list'] as const,
  list: (filters: ActivityLogFilters) => [...activityLogKeys.lists(), filters] as const,
  infinite: (filters: ActivityLogFilters) => [...activityLogKeys.all, 'infinite', filters] as const,
  byRecord: (tableName: string, recordId: string) => [...activityLogKeys.all, 'record', tableName, recordId] as const,
  byUser: (userId: string) => [...activityLogKeys.all, 'user', userId] as const,
  stats: () => [...activityLogKeys.all, 'stats'] as const,
};

export interface ActivityLogFilters {
  tableName?: string | null;
  action?: 'INSERT' | 'UPDATE' | 'DELETE' | null;
  userId?: string | null;
  recordId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  search?: string | null;
}

const PAGE_SIZE = 20;

// Fetch activity log with filters
export function useActivityLog(filters: ActivityLogFilters = {}, limit = 50) {
  return useQuery({
    queryKey: activityLogKeys.list({ ...filters, limit }),
    queryFn: async (): Promise<ActivityLogWithUser[]> => {
      let query = supabase
        .from('activity_log')
        .select(`
          *,
          user:users(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filters.tableName) {
        query = query.eq('table_name', filters.tableName);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.recordId) {
        query = query.eq('record_id', filters.recordId);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ActivityLogWithUser[];
    },
  });
}

// Infinite scroll activity log
export function useInfiniteActivityLog(filters: ActivityLogFilters = {}) {
  return useInfiniteQuery({
    queryKey: activityLogKeys.infinite(filters),
    queryFn: async ({ pageParam = 0 }): Promise<{
      data: ActivityLogWithUser[];
      nextPage: number | null;
    }> => {
      let query = supabase
        .from('activity_log')
        .select(`
          *,
          user:users(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (filters.tableName) {
        query = query.eq('table_name', filters.tableName);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.recordId) {
        query = query.eq('record_id', filters.recordId);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const activities = (data || []) as ActivityLogWithUser[];
      const nextPage = activities.length === PAGE_SIZE ? pageParam + PAGE_SIZE : null;

      return { data: activities, nextPage };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

// Fetch activity for a specific record
export function useRecordActivity(tableName: string, recordId: string) {
  return useQuery({
    queryKey: activityLogKeys.byRecord(tableName, recordId),
    queryFn: async (): Promise<ActivityLogWithUser[]> => {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          user:users(id, full_name, email)
        `)
        .eq('table_name', tableName)
        .eq('record_id', recordId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ActivityLogWithUser[];
    },
    enabled: !!tableName && !!recordId,
  });
}

// Fetch activity by user
export function useUserActivity(userId: string, limit = 20) {
  return useQuery({
    queryKey: activityLogKeys.byUser(userId),
    queryFn: async (): Promise<ActivityLogWithUser[]> => {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          user:users(id, full_name, email)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as ActivityLogWithUser[];
    },
    enabled: !!userId,
  });
}

// Activity statistics
export interface ActivityStats {
  totalChanges: number;
  changesThisWeek: number;
  changesToday: number;
  byAction: { action: string; count: number }[];
  byTable: { table_name: string; count: number }[];
  mostActiveUsers: { user_id: string; full_name: string | null; email: string; count: number }[];
}

export function useActivityStats() {
  return useQuery({
    queryKey: activityLogKeys.stats(),
    queryFn: async (): Promise<ActivityStats> => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Get total count
      const { count: totalChanges } = await supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true });

      // Get this week count
      const { count: changesThisWeek } = await supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfWeek);

      // Get today count
      const { count: changesToday } = await supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay);

      // Get counts by action
      const { data: actionData } = await supabase
        .from('activity_log')
        .select('action')
        .gte('created_at', startOfWeek);

      const byAction = Object.entries(
        (actionData || []).reduce((acc: Record<string, number>, item) => {
          acc[item.action] = (acc[item.action] || 0) + 1;
          return acc;
        }, {})
      ).map(([action, count]) => ({ action, count }));

      // Get counts by table
      const { data: tableData } = await supabase
        .from('activity_log')
        .select('table_name')
        .gte('created_at', startOfWeek);

      const byTable = Object.entries(
        (tableData || []).reduce((acc: Record<string, number>, item) => {
          acc[item.table_name] = (acc[item.table_name] || 0) + 1;
          return acc;
        }, {})
      ).map(([table_name, count]) => ({ table_name, count }));

      // Get most active users
      const { data: userData } = await supabase
        .from('activity_log')
        .select(`
          user_id,
          user:users(full_name, email)
        `)
        .gte('created_at', startOfWeek)
        .not('user_id', 'is', null);

      const userCounts = (userData || []).reduce((acc: Record<string, { count: number; full_name: string | null; email: string }>, item: any) => {
        if (item.user_id) {
          if (!acc[item.user_id]) {
            acc[item.user_id] = {
              count: 0,
              full_name: item.user?.full_name || null,
              email: item.user?.email || 'Unknown',
            };
          }
          acc[item.user_id].count++;
        }
        return acc;
      }, {});

      const mostActiveUsers = Object.entries(userCounts)
        .map(([user_id, data]) => ({
          user_id,
          full_name: data.full_name,
          email: data.email,
          count: data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalChanges: totalChanges || 0,
        changesThisWeek: changesThisWeek || 0,
        changesToday: changesToday || 0,
        byAction,
        byTable,
        mostActiveUsers,
      };
    },
  });
}

// Hook to invalidate activity log queries
export function useInvalidateActivityLog() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: activityLogKeys.all });
}

// Helper to format activity description
export function formatActivityDescription(
  action: string,
  tableName: string,
  newValues: Record<string, unknown> | null,
  oldValues: Record<string, unknown> | null
): string {
  const itemName = (newValues?.name as string) || (oldValues?.name as string) || 'item';
  const tableLabel = formatTableName(tableName);

  switch (action) {
    case 'INSERT':
      return `Created ${tableLabel} "${itemName}"`;
    case 'UPDATE':
      return `Updated ${tableLabel} "${itemName}"`;
    case 'DELETE':
      return `Deleted ${tableLabel} "${itemName}"`;
    default:
      return `Modified ${tableLabel}`;
  }
}

// Helper to format table names for display
export function formatTableName(tableName: string): string {
  const labels: Record<string, string> = {
    capabilities: 'capability',
    milestones: 'milestone',
    quick_wins: 'quick win',
    technology_options: 'technology option',
    comments: 'comment',
    users: 'user',
  };
  return labels[tableName] || tableName.replace(/_/g, ' ');
}

// Helper to get changed fields between old and new values
export function getChangedFields(
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null
): { field: string; oldValue: unknown; newValue: unknown }[] {
  if (!oldValues || !newValues) return [];

  const changes: { field: string; oldValue: unknown; newValue: unknown }[] = [];
  const ignoredFields = ['updated_at', 'created_at'];

  for (const key of Object.keys(newValues)) {
    if (ignoredFields.includes(key)) continue;

    const oldVal = oldValues[key];
    const newVal = newValues[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, oldValue: oldVal, newValue: newVal });
    }
  }

  return changes;
}
