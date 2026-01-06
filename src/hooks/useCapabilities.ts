// src/hooks/useCapabilities.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Capability, CapabilityInsert, CapabilityUpdate } from '@/types';

// Query keys factory
export const capabilityKeys = {
  all: ['capabilities'] as const,
  lists: () => [...capabilityKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...capabilityKeys.lists(), filters] as const,
  details: () => [...capabilityKeys.all, 'detail'] as const,
  detail: (id: string) => [...capabilityKeys.details(), id] as const,
};

interface CapabilityFilters {
  priority?: string | null;
  owner?: string | null;
  [key: string]: string | null | undefined;
}

interface CapabilityWithCounts extends Capability {
  milestone_count: number;
  completed_milestones: number;
  quick_win_count: number;
}

// Fetch all capabilities with optional filters
export function useCapabilities(filters: CapabilityFilters = {}) {
  return useQuery({
    queryKey: capabilityKeys.list(filters),
    queryFn: async (): Promise<CapabilityWithCounts[]> => {
      let query = supabase
        .from('capabilities')
        .select(`
          *,
          milestones(id, status),
          quick_wins(id)
        `)
        .order('priority', { ascending: true })
        .order('name', { ascending: true });

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.owner) {
        query = query.eq('owner', filters.owner);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to include counts
      return (data || []).map((cap: any) => ({
        ...cap,
        milestone_count: cap.milestones?.length || 0,
        completed_milestones: cap.milestones?.filter((m: any) => m.status === 'completed').length || 0,
        quick_win_count: cap.quick_wins?.length || 0,
        milestones: undefined,
        quick_wins: undefined,
      }));
    },
  });
}

// Fetch single capability by ID
export function useCapability(id: string) {
  return useQuery({
    queryKey: capabilityKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capabilities')
        .select(`
          *,
          milestones(*),
          quick_wins(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Create capability
export function useCreateCapability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CapabilityInsert) => {
      const { data: result, error } = await supabase
        .from('capabilities')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capabilityKeys.all });
      toast.success('Capability created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create capability: ${error.message}`);
    },
  });
}

// Update capability
export function useUpdateCapability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: CapabilityUpdate & { id: string }) => {
      const { data: result, error } = await supabase
        .from('capabilities')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: capabilityKeys.all });
      queryClient.setQueryData(capabilityKeys.detail(data.id), data);
      toast.success('Capability updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update capability: ${error.message}`);
    },
  });
}

// Delete capability
export function useDeleteCapability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('capabilities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: capabilityKeys.all });
      queryClient.removeQueries({ queryKey: capabilityKeys.detail(id) });
      toast.success('Capability deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete capability: ${error.message}`);
    },
  });
}
