// src/hooks/useCapabilityTemplates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type {
  CapabilityTemplate,
  CapabilityTemplateInsert,
  CapabilityTemplateUpdate,
  Mission,
} from '@/types';

// Query keys factory
export const capabilityTemplateKeys = {
  all: ['capabilityTemplates'] as const,
  lists: () => [...capabilityTemplateKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...capabilityTemplateKeys.lists(), filters] as const,
  byMission: (mission: Mission) => [...capabilityTemplateKeys.all, 'mission', mission] as const,
  details: () => [...capabilityTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...capabilityTemplateKeys.details(), id] as const,
};

interface TemplateFilters {
  mission?: Mission | null;
  isEnterprise?: boolean | null;
  category?: string | null;
}

// Fetch all capability templates
export function useCapabilityTemplates(filters: TemplateFilters = {}) {
  return useQuery({
    queryKey: capabilityTemplateKeys.list(filters),
    queryFn: async (): Promise<CapabilityTemplate[]> => {
      let query = supabase
        .from('capability_templates')
        .select('*')
        .order('order_index', { ascending: true });

      if (filters.mission) {
        query = query.eq('mission', filters.mission);
      }
      if (filters.isEnterprise !== undefined && filters.isEnterprise !== null) {
        query = query.eq('is_enterprise', filters.isEnterprise);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as CapabilityTemplate[];
    },
  });
}

// Fetch templates by mission
export function useCapabilityTemplatesByMission(mission: Mission) {
  return useQuery({
    queryKey: capabilityTemplateKeys.byMission(mission),
    queryFn: async (): Promise<CapabilityTemplate[]> => {
      const { data, error } = await supabase
        .from('capability_templates')
        .select('*')
        .eq('mission', mission)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as CapabilityTemplate[];
    },
  });
}

// Fetch single template by ID
export function useCapabilityTemplate(id: string | null) {
  return useQuery({
    queryKey: capabilityTemplateKeys.detail(id || ''),
    queryFn: async (): Promise<CapabilityTemplate | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('capability_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as CapabilityTemplate;
    },
    enabled: !!id,
  });
}

// Create capability template
export function useCreateCapabilityTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CapabilityTemplateInsert) => {
      const { data: result, error } = await supabase
        .from('capability_templates')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capabilityTemplateKeys.all });
      toast.success('Capability template created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
}

// Update capability template
export function useUpdateCapabilityTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: CapabilityTemplateUpdate & { id: string }) => {
      const { data: result, error } = await supabase
        .from('capability_templates')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: capabilityTemplateKeys.all });
      queryClient.setQueryData(capabilityTemplateKeys.detail(data.id), data);
      toast.success('Capability template updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
}

// Delete capability template
export function useDeleteCapabilityTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('capability_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capabilityTemplateKeys.all });
      toast.success('Capability template deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
}

// Instantiate templates for a facility (calls database function)
export function useInstantiateTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ facilityId, enterpriseOnly = true }: { facilityId: string; enterpriseOnly?: boolean }) => {
      const { data, error } = await supabase.rpc('instantiate_capability_templates', {
        p_facility_id: facilityId,
        p_enterprise_only: enterpriseOnly,
      });

      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['capabilities'] });
      toast.success(`Created ${count} capabilities from templates`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to instantiate templates: ${error.message}`);
    },
  });
}
