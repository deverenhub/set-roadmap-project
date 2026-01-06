// src/hooks/useQuickWins.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { QuickWin, QuickWinInsert, QuickWinUpdate, QuickWinWithCapability, Status } from '@/types';

// Query keys factory
export const quickWinKeys = {
  all: ['quickWins'] as const,
  lists: () => [...quickWinKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...quickWinKeys.lists(), filters] as const,
  byStatus: (status: string) => [...quickWinKeys.all, 'status', status] as const,
  grouped: () => [...quickWinKeys.all, 'grouped'] as const,
  details: () => [...quickWinKeys.all, 'detail'] as const,
  detail: (id: string) => [...quickWinKeys.details(), id] as const,
  stats: () => [...quickWinKeys.all, 'stats'] as const,
};

interface QuickWinFilters {
  status?: string | null;
  capabilityId?: string | null;
  category?: string | null;
  [key: string]: string | null | undefined;
}

// Fetch all quick wins with optional filters
export function useQuickWins(filters: QuickWinFilters = {}) {
  return useQuery({
    queryKey: quickWinKeys.list(filters),
    queryFn: async (): Promise<QuickWinWithCapability[]> => {
      let query = supabase
        .from('quick_wins')
        .select(`
          *,
          capability:capabilities(id, name)
        `)
        .order('order', { ascending: true });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.capabilityId) {
        query = query.eq('capability_id', filters.capabilityId);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as QuickWinWithCapability[];
    },
  });
}

// Fetch quick wins grouped by status (for Kanban)
export function useQuickWinsGrouped() {
  return useQuery({
    queryKey: quickWinKeys.grouped(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quick_wins')
        .select(`
          *,
          capability:capabilities(id, name)
        `)
        .order('order', { ascending: true });

      if (error) throw error;

      // Group by status
      const grouped: Record<Status, QuickWinWithCapability[]> = {
        not_started: [],
        in_progress: [],
        completed: [],
        blocked: [],
      };

      ((data || []) as QuickWinWithCapability[]).forEach((qw) => {
        const status = qw.status as Status;
        if (grouped[status]) {
          grouped[status].push(qw);
        }
      });

      return grouped;
    },
  });
}

// Get quick win statistics
export function useQuickWinStats() {
  return useQuery({
    queryKey: quickWinKeys.stats(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quick_wins')
        .select('status, roi');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        not_started: 0,
        in_progress: 0,
        completed: 0,
        blocked: 0,
        high_roi: 0,
      };

      (data || []).forEach((qw) => {
        const status = qw.status as keyof typeof stats;
        if (status in stats) {
          stats[status]++;
        }
        if (qw.roi === 'HIGH') {
          stats.high_roi++;
        }
      });

      return stats;
    },
  });
}

// Fetch single quick win by ID
export function useQuickWin(id: string) {
  return useQuery({
    queryKey: quickWinKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quick_wins')
        .select(`
          *,
          capability:capabilities(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Create quick win
export function useCreateQuickWin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: QuickWinInsert) => {
      // Get max order for the status
      const { data: maxOrder } = await supabase
        .from('quick_wins')
        .select('order')
        .eq('status', data.status || 'not_started')
        .order('order', { ascending: false })
        .limit(1)
        .single();

      const newOrder = (maxOrder?.order || 0) + 1;

      const { data: result, error } = await supabase
        .from('quick_wins')
        .insert({ ...data, order: newOrder })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickWinKeys.all });
      toast.success('Quick win created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create quick win: ${error.message}`);
    },
  });
}

// Update quick win
export function useUpdateQuickWin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: QuickWinUpdate & { id: string }) => {
      const { data: result, error } = await supabase
        .from('quick_wins')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: quickWinKeys.all });
      queryClient.setQueryData(quickWinKeys.detail(data.id), data);
      toast.success('Quick win updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update quick win: ${error.message}`);
    },
  });
}

// Move quick win (for Kanban drag & drop)
export function useMoveQuickWin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, order }: { id: string; status: Status; order: number }) => {
      const { data: result, error } = await supabase
        .from('quick_wins')
        .update({
          status,
          order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickWinKeys.all });
    },
    onError: (error: Error) => {
      toast.error(`Failed to move quick win: ${error.message}`);
    },
  });
}

// Delete quick win
export function useDeleteQuickWin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quick_wins')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickWinKeys.all });
      toast.success('Quick win deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete quick win: ${error.message}`);
    },
  });
}
