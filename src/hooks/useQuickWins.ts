// src/hooks/useQuickWins.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useFacilityStore } from '@/stores/facilityStore';
import type { QuickWin, QuickWinInsert, QuickWinUpdate, QuickWinWithCapability, Status } from '@/types';

// Query keys factory
export const quickWinKeys = {
  all: ['quickWins'] as const,
  lists: () => [...quickWinKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...quickWinKeys.lists(), filters] as const,
  byStatus: (status: string) => [...quickWinKeys.all, 'status', status] as const,
  grouped: (facilityId?: string | null) => [...quickWinKeys.all, 'grouped', facilityId] as const,
  details: () => [...quickWinKeys.all, 'detail'] as const,
  detail: (id: string) => [...quickWinKeys.details(), id] as const,
  stats: (facilityId?: string | null) => [...quickWinKeys.all, 'stats', facilityId] as const,
};

interface QuickWinFilters {
  status?: string | null;
  capabilityId?: string | null;
  category?: string | null;
  facilityId?: string | null;
  [key: string]: string | null | undefined;
}

// Fetch all quick wins with optional filters
// If facilityId is not provided, uses current facility from store
export function useQuickWins(filters: QuickWinFilters = {}) {
  const { currentFacilityId } = useFacilityStore();

  // Use provided facilityId or fall back to current facility
  const effectiveFacilityId = filters.facilityId !== undefined ? filters.facilityId : currentFacilityId;

  const effectiveFilters = {
    ...filters,
    facilityId: effectiveFacilityId,
  };

  return useQuery({
    queryKey: quickWinKeys.list(effectiveFilters),
    queryFn: async (): Promise<QuickWinWithCapability[]> => {
      let query = supabase
        .from('quick_wins')
        .select(`
          *,
          capability:capabilities(id, name, facility_id, is_enterprise)
        `)
        .order('order', { ascending: true });

      // Facility filtering - filter quick wins by their direct facility_id
      if (effectiveFacilityId) {
        query = query.eq('facility_id', effectiveFacilityId);
      }

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
// If facilityId is not provided, uses current facility from store
export function useQuickWinsGrouped(facilityId?: string | null) {
  const { currentFacilityId } = useFacilityStore();

  // Use provided facilityId or fall back to current facility
  const effectiveFacilityId = facilityId !== undefined ? facilityId : currentFacilityId;

  return useQuery({
    queryKey: quickWinKeys.grouped(effectiveFacilityId),
    queryFn: async () => {
      let query = supabase
        .from('quick_wins')
        .select(`
          *,
          capability:capabilities(id, name, facility_id, is_enterprise)
        `)
        .order('order', { ascending: true });

      // Facility filtering
      if (effectiveFacilityId) {
        query = query.eq('facility_id', effectiveFacilityId);
      }

      const { data, error } = await query;

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
// If facilityId is not provided, uses current facility from store
export function useQuickWinStats(facilityId?: string | null) {
  const { currentFacilityId } = useFacilityStore();

  // Use provided facilityId or fall back to current facility
  const effectiveFacilityId = facilityId !== undefined ? facilityId : currentFacilityId;

  return useQuery({
    queryKey: quickWinKeys.stats(effectiveFacilityId),
    queryFn: async () => {
      let query = supabase
        .from('quick_wins')
        .select('status, roi, facility_id, capability:capabilities(facility_id, is_enterprise)');

      // Facility filtering
      if (effectiveFacilityId) {
        query = query.eq('facility_id', effectiveFacilityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        not_started: 0,
        in_progress: 0,
        completed: 0,
        blocked: 0,
        high_roi: 0,
      };

      (data || []).forEach((qw: any) => {
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
export function useQuickWin(id: string | null) {
  return useQuery({
    queryKey: quickWinKeys.detail(id || ''),
    queryFn: async (): Promise<QuickWinWithCapability | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('quick_wins')
        .select(`
          *,
          capability:capabilities(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as QuickWinWithCapability;
    },
    enabled: !!id,
  });
}

// Create quick win
// Automatically assigns to current facility if not specified
export function useCreateQuickWin() {
  const queryClient = useQueryClient();
  const { currentFacilityId } = useFacilityStore();

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

      // Assign to current facility if not explicitly set
      const insertData = {
        ...data,
        order: newOrder,
        facility_id: data.facility_id !== undefined ? data.facility_id : currentFacilityId,
      };

      const { data: result, error } = await supabase
        .from('quick_wins')
        .insert(insertData)
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
