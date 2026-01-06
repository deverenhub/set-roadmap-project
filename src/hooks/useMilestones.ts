// src/hooks/useMilestones.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Milestone, MilestoneInsert, MilestoneUpdate, MilestoneWithCapability } from '@/types';
import { capabilityKeys } from './useCapabilities';

// Query keys factory
export const milestoneKeys = {
  all: ['milestones'] as const,
  lists: () => [...milestoneKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...milestoneKeys.lists(), filters] as const,
  byCapability: (capabilityId: string) => [...milestoneKeys.all, 'capability', capabilityId] as const,
  details: () => [...milestoneKeys.all, 'detail'] as const,
  detail: (id: string) => [...milestoneKeys.details(), id] as const,
  timeline: (path: string) => [...milestoneKeys.all, 'timeline', path] as const,
};

interface MilestoneFilters {
  capabilityId?: string | null;
  status?: string | null;
  [key: string]: string | null | undefined;
}

// Fetch all milestones with optional filters
export function useMilestones(filters: MilestoneFilters = {}) {
  return useQuery({
    queryKey: milestoneKeys.list(filters),
    queryFn: async (): Promise<MilestoneWithCapability[]> => {
      let query = supabase
        .from('milestones')
        .select(`
          *,
          capability:capabilities(id, name, priority, color)
        `)
        .order('from_level', { ascending: true });

      if (filters.capabilityId) {
        query = query.eq('capability_id', filters.capabilityId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as MilestoneWithCapability[];
    },
  });
}

// Fetch milestones by capability
export function useMilestonesByCapability(capabilityId: string) {
  return useQuery({
    queryKey: milestoneKeys.byCapability(capabilityId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('capability_id', capabilityId)
        .order('from_level', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!capabilityId,
  });
}

// Fetch single milestone by ID
export function useMilestone(id: string) {
  return useQuery({
    queryKey: milestoneKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
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

// Timeline data for Gantt chart
export function useTimelineData(path: 'A' | 'B' | 'C' = 'B') {
  return useQuery({
    queryKey: milestoneKeys.timeline(path),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select(`
          id,
          name,
          status,
          from_level,
          to_level,
          path_a_months,
          path_b_months,
          path_c_months,
          capability:capabilities(id, name, color, priority)
        `)
        .order('from_level', { ascending: true });

      if (error) throw error;

      // Transform for timeline
      return (data || []).map((ms: any) => {
        const durationKey = `path_${path.toLowerCase()}_months` as keyof typeof ms;
        return {
          id: ms.id,
          name: ms.name,
          capability: ms.capability?.name || 'Unknown',
          capabilityColor: ms.capability?.color || '#3b82f6',
          priority: ms.capability?.priority || 'MEDIUM',
          duration: ms[durationKey] || 3,
          status: ms.status,
        };
      });
    },
  });
}

// Create milestone
export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MilestoneInsert) => {
      const { data: result, error } = await supabase
        .from('milestones')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.all });
      queryClient.invalidateQueries({ queryKey: capabilityKeys.detail(data.capability_id) });
      toast.success('Milestone created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create milestone: ${error.message}`);
    },
  });
}

// Update milestone
export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: MilestoneUpdate & { id: string }) => {
      // Auto-set dates based on status changes
      const updates: MilestoneUpdate = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      if (data.status === 'in_progress' && !data.start_date) {
        updates.start_date = new Date().toISOString();
      }
      if (data.status === 'completed' && !data.end_date) {
        updates.end_date = new Date().toISOString();
      }

      const { data: result, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.all });
      queryClient.setQueryData(milestoneKeys.detail(data.id), data);
      toast.success('Milestone updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update milestone: ${error.message}`);
    },
  });
}

// Delete milestone
export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.all });
      queryClient.invalidateQueries({ queryKey: capabilityKeys.all });
      toast.success('Milestone deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete milestone: ${error.message}`);
    },
  });
}
