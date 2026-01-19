// src/hooks/useMilestones.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { sendBlockedMilestoneEmails } from '@/lib/email';
import { notifyTeamsBlockedMilestone, notifyTeamsMilestoneCompleted } from './useTeamsNotifications';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useFacilityStore } from '@/stores/facilityStore';
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
  timeline: (path: string, facilityId?: string | null) => [...milestoneKeys.all, 'timeline', path, facilityId] as const,
};

interface MilestoneFilters {
  capabilityId?: string | null;
  status?: string | null;
  facilityId?: string | null;
  [key: string]: string | null | undefined;
}

// Fetch all milestones with optional filters
// If facilityId is not provided, uses current facility from store
export function useMilestones(filters: MilestoneFilters = {}) {
  const { currentFacilityId } = useFacilityStore();

  // Use provided facilityId or fall back to current facility
  const effectiveFacilityId = filters.facilityId !== undefined ? filters.facilityId : currentFacilityId;

  const effectiveFilters = {
    ...filters,
    facilityId: effectiveFacilityId,
  };

  return useQuery({
    queryKey: milestoneKeys.list(effectiveFilters),
    queryFn: async (): Promise<MilestoneWithCapability[]> => {
      let query = supabase
        .from('milestones')
        .select(`
          *,
          capability:capabilities(id, name, priority, color, facility_id, is_enterprise)
        `)
        .order('from_level', { ascending: true });

      // Facility filtering - filter milestones by their direct facility_id
      if (effectiveFacilityId) {
        query = query.eq('facility_id', effectiveFacilityId);
      }

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
export function useMilestone(id: string | null) {
  return useQuery({
    queryKey: milestoneKeys.detail(id || ''),
    queryFn: async (): Promise<MilestoneWithCapability | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('milestones')
        .select(`
          *,
          capability:capabilities(id, name, priority, color)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as MilestoneWithCapability;
    },
    enabled: !!id,
  });
}

// Timeline data for Gantt chart
// If facilityId is not provided, uses current facility from store
export function useTimelineData(path: 'A' | 'B' | 'C' = 'B', facilityId?: string | null) {
  const { currentFacilityId } = useFacilityStore();

  // Use provided facilityId or fall back to current facility
  const effectiveFacilityId = facilityId !== undefined ? facilityId : currentFacilityId;

  return useQuery({
    queryKey: milestoneKeys.timeline(path, effectiveFacilityId),
    queryFn: async () => {
      // First try with timeline_offset, fallback to without if column doesn't exist
      let data;
      let error;

      // Build base query with facility filtering
      let baseQuery = supabase
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
          timeline_offset,
          facility_id,
          capability:capabilities(id, name, color, priority, facility_id, is_enterprise)
        `)
        .order('from_level', { ascending: true });

      // Apply facility filter
      if (effectiveFacilityId) {
        baseQuery = baseQuery.eq('facility_id', effectiveFacilityId);
      }

      const result = await baseQuery;

      // If timeline_offset column doesn't exist, query without it
      if (result.error && result.error.message.includes('timeline_offset')) {
        let fallbackQuery = supabase
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
            facility_id,
            capability:capabilities(id, name, color, priority, facility_id, is_enterprise)
          `)
          .order('from_level', { ascending: true });

        // Apply facility filter to fallback query too
        if (effectiveFacilityId) {
          fallbackQuery = fallbackQuery.eq('facility_id', effectiveFacilityId);
        }

        const fallbackResult = await fallbackQuery;
        data = fallbackResult.data;
        error = fallbackResult.error;
      } else {
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      // Transform for timeline
      return (data || []).map((ms: any) => {
        const durationKey = `path_${path.toLowerCase()}_months` as keyof typeof ms;
        return {
          id: ms.id,
          name: ms.name,
          capability: ms.capability?.name || 'Unknown',
          capabilityId: ms.capability?.id,
          capabilityColor: ms.capability?.color || '#3b82f6',
          priority: ms.capability?.priority || 'MEDIUM',
          duration: ms[durationKey] || 3,
          status: ms.status,
          timelineOffset: ms.timeline_offset || 0,
        };
      });
    },
  });
}

// Update milestone timeline position (drag to move start)
export function useUpdateMilestonePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, timelineOffset }: { id: string; timelineOffset: number }) => {
      const { data: result, error } = await supabase
        .from('milestones')
        .update({
          timeline_offset: timelineOffset,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.all });
      toast.success('Milestone position updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update position: ${error.message}`);
    },
  });
}

// Update milestone duration (resize)
export function useUpdateMilestoneDuration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      path,
      duration
    }: {
      id: string;
      path: 'A' | 'B' | 'C';
      duration: number;
    }) => {
      const pathColumn = `path_${path.toLowerCase()}_months` as const;
      const { data: result, error } = await supabase
        .from('milestones')
        .update({
          [pathColumn]: duration,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.all });
      toast.success('Milestone duration updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update duration: ${error.message}`);
    },
  });
}

// Create milestone
// Automatically assigns to current facility if not specified
export function useCreateMilestone() {
  const queryClient = useQueryClient();
  const { currentFacilityId } = useFacilityStore();

  return useMutation({
    mutationFn: async (data: MilestoneInsert) => {
      // Assign to current facility if not explicitly set
      const insertData = {
        ...data,
        facility_id: data.facility_id !== undefined ? data.facility_id : currentFacilityId,
      };

      const { data: result, error } = await supabase
        .from('milestones')
        .insert(insertData)
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
      // Get current milestone to check status change
      const { data: currentMilestone } = await supabase
        .from('milestones')
        .select('name, status')
        .eq('id', id)
        .single();

      const oldStatus = currentMilestone?.status;
      const milestoneName = currentMilestone?.name || 'Milestone';

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

      // Get Teams notification preferences (use getState for non-component context)
      const { preferences } = usePreferencesStore.getState();
      const teamsEnabled = preferences.teamsNotifications && preferences.teamsWebhookUrl;

      // Send email notifications if milestone was marked as blocked
      if (data.status === 'blocked' && oldStatus !== 'blocked') {
        sendBlockedMilestoneEmails(milestoneName, id, oldStatus || 'unknown');

        // Send Teams notification for blocked milestone
        if (teamsEnabled && preferences.teamsNotifyOnBlockedItems) {
          notifyTeamsBlockedMilestone(
            preferences.teamsWebhookUrl,
            milestoneName,
            id,
            oldStatus || 'unknown'
          ).catch(err => console.error('Teams notification error:', err));
        }
      }

      // Send Teams notification for completed milestone
      if (data.status === 'completed' && oldStatus !== 'completed') {
        if (teamsEnabled && preferences.teamsNotifyOnMilestoneComplete) {
          notifyTeamsMilestoneCompleted(
            preferences.teamsWebhookUrl,
            milestoneName,
            id,
            oldStatus || 'unknown'
          ).catch(err => console.error('Teams notification error:', err));
        }
      }

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
