// src/hooks/useRoadmapData.ts
// Hooks for Maturity Definitions, Technology Options, QoL Impact, and Roadmap Paths

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  MaturityDefinition,
  MaturityDefinitionUpdate,
  TechnologyOption,
  TechnologyOptionInsert,
  TechnologyOptionUpdate,
  QoLImpact,
  QoLImpactInsert,
  QoLImpactUpdate,
  RoadmapPath,
  RoadmapPathInsert,
  RoadmapPathUpdate,
  RoadmapType,
} from '@/types';
import { toast } from 'sonner';

// ===========================================
// Query Keys
// ===========================================
export const roadmapKeys = {
  maturityDefinitions: ['maturity-definitions'] as const,
  technologyOptions: ['technology-options'] as const,
  technologyOptionsByCategory: (category: string) => ['technology-options', category] as const,
  qolImpacts: ['qol-impacts'] as const,
  roadmapPaths: ['roadmap-paths'] as const,
  roadmapPathsByType: (type: RoadmapType) => ['roadmap-paths', type] as const,
};

// ===========================================
// Maturity Definitions Hooks
// ===========================================
export function useMaturityDefinitions() {
  return useQuery({
    queryKey: roadmapKeys.maturityDefinitions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maturity_definitions')
        .select('*')
        .order('level');

      if (error) throw error;
      return data as MaturityDefinition[];
    },
  });
}

export function useUpdateMaturityDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: MaturityDefinitionUpdate }) => {
      const { data, error } = await supabase
        .from('maturity_definitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.maturityDefinitions });
      toast.success('Maturity definition updated');
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
}

// ===========================================
// Technology Options Hooks
// ===========================================
export function useTechnologyOptions(category?: string) {
  return useQuery({
    queryKey: category ? roadmapKeys.technologyOptionsByCategory(category) : roadmapKeys.technologyOptions,
    queryFn: async () => {
      let query = supabase
        .from('technology_options')
        .select('*')
        .order('category')
        .order('recommended', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TechnologyOption[];
    },
  });
}

export function useCreateTechnologyOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (option: TechnologyOptionInsert) => {
      const { data, error } = await supabase
        .from('technology_options')
        .insert(option)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.technologyOptions });
      toast.success('Technology option added');
    },
    onError: (error) => {
      toast.error(`Failed to add: ${error.message}`);
    },
  });
}

export function useUpdateTechnologyOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TechnologyOptionUpdate }) => {
      const { data, error } = await supabase
        .from('technology_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.technologyOptions });
      toast.success('Technology option updated');
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
}

export function useDeleteTechnologyOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('technology_options')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.technologyOptions });
      toast.success('Technology option deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
}

// ===========================================
// QoL Impact Hooks
// ===========================================
export function useQoLImpacts() {
  return useQuery({
    queryKey: roadmapKeys.qolImpacts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qol_impacts')
        .select('*, capability:capabilities(id, name)')
        .order('impact_score', { ascending: false });

      if (error) throw error;
      return data as (QoLImpact & { capability?: { id: string; name: string } | null })[];
    },
  });
}

export function useCreateQoLImpact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (impact: QoLImpactInsert) => {
      const { data, error } = await supabase
        .from('qol_impacts')
        .insert(impact)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.qolImpacts });
      toast.success('QoL impact added');
    },
    onError: (error) => {
      toast.error(`Failed to add: ${error.message}`);
    },
  });
}

export function useUpdateQoLImpact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: QoLImpactUpdate }) => {
      const { data, error } = await supabase
        .from('qol_impacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.qolImpacts });
      toast.success('QoL impact updated');
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
}

export function useDeleteQoLImpact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('qol_impacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.qolImpacts });
      toast.success('QoL impact deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
}

// ===========================================
// Roadmap Paths Hooks
// ===========================================
export function useRoadmapPaths(type?: RoadmapType) {
  return useQuery({
    queryKey: type ? roadmapKeys.roadmapPathsByType(type) : roadmapKeys.roadmapPaths,
    queryFn: async () => {
      let query = supabase
        .from('roadmap_paths')
        .select('*, capability:capabilities(id, name)')
        .order('roadmap_type')
        .order('from_level')
        .order('order_index');

      if (type) {
        query = query.eq('roadmap_type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (RoadmapPath & { capability?: { id: string; name: string } | null })[];
    },
  });
}

export function useCreateRoadmapPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (path: RoadmapPathInsert) => {
      const { data, error } = await supabase
        .from('roadmap_paths')
        .insert(path)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.roadmapPaths });
      toast.success('Roadmap path added');
    },
    onError: (error) => {
      toast.error(`Failed to add: ${error.message}`);
    },
  });
}

export function useUpdateRoadmapPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: RoadmapPathUpdate }) => {
      const { data, error } = await supabase
        .from('roadmap_paths')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.roadmapPaths });
      toast.success('Roadmap path updated');
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
}

export function useDeleteRoadmapPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('roadmap_paths')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.roadmapPaths });
      toast.success('Roadmap path deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
}

// Helper to group roadmap paths by level transition
export function groupPathsByLevel(paths: RoadmapPath[]) {
  const grouped: Record<string, RoadmapPath[]> = {};

  paths.forEach((path) => {
    const key = `${path.from_level}-${path.to_level}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(path);
  });

  return grouped;
}
