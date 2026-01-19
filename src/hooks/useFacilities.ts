// src/hooks/useFacilities.ts
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Facility, FacilityInsert, FacilityUpdate, FacilityWithStats, FacilityFilters, UserFacility } from '@/types';
import { useFacilityStore, type FacilityMembership } from '@/stores/facilityStore';
import { useSession } from './useUser';

// Query keys factory
export const facilityKeys = {
  all: ['facilities'] as const,
  lists: () => [...facilityKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...facilityKeys.lists(), filters] as const,
  details: () => [...facilityKeys.all, 'detail'] as const,
  detail: (id: string) => [...facilityKeys.details(), id] as const,
  userFacilities: (userId: string) => [...facilityKeys.all, 'user', userId] as const,
  templates: () => [...facilityKeys.all, 'templates'] as const,
};

// Fetch all facilities (admin only)
export function useAllFacilities(filters: FacilityFilters = {}) {
  return useQuery({
    queryKey: facilityKeys.list(filters),
    queryFn: async (): Promise<FacilityWithStats[]> => {
      let query = supabase
        .from('facilities')
        .select(`
          *,
          capabilities(id),
          milestones(id),
          quick_wins(id),
          user_facilities(id)
        `)
        .order('name', { ascending: true });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to include counts
      return (data || []).map((facility: any) => ({
        ...facility,
        capability_count: facility.capabilities?.length || 0,
        milestone_count: facility.milestones?.length || 0,
        quick_win_count: facility.quick_wins?.length || 0,
        user_count: facility.user_facilities?.length || 0,
        capabilities: undefined,
        milestones: undefined,
        quick_wins: undefined,
        user_facilities: undefined,
      }));
    },
  });
}

// Fetch facilities for current user
export function useUserFacilities() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: facilityKeys.userFacilities(userId || ''),
    queryFn: async (): Promise<FacilityMembership[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_facilities')
        .select(`
          id,
          role,
          is_primary,
          facility:facilities(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map((uf: any) => ({
        facility: uf.facility,
        role: uf.role,
        isPrimary: uf.is_primary,
      }));
    },
    enabled: !!userId,
  });
}

// Initialize facility store with user's facilities
export function useFacilityInit() {
  const { data: memberships, isLoading, isSuccess } = useUserFacilities();
  const { setFacilities, setLoading, setInitialized, isInitialized } = useFacilityStore();

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (isSuccess && memberships && !isInitialized) {
      setFacilities(memberships);
      setInitialized(true);
    }
  }, [isSuccess, memberships, isInitialized, setFacilities, setInitialized]);

  return { isLoading, isInitialized };
}

// Fetch single facility by ID
export function useFacility(id: string | null) {
  return useQuery({
    queryKey: facilityKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Facility;
    },
    enabled: !!id,
  });
}

// Fetch facility by code
export function useFacilityByCode(code: string | null) {
  return useQuery({
    queryKey: ['facility', 'code', code],
    queryFn: async () => {
      if (!code) return null;

      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error) throw error;
      return data as Facility;
    },
    enabled: !!code,
  });
}

// Create facility (admin only)
export function useCreateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FacilityInsert) => {
      const { data: result, error } = await supabase
        .from('facilities')
        .insert({
          ...data,
          code: data.code.toUpperCase(),
        })
        .select()
        .single();

      if (error) throw error;
      return result as Facility;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      toast.success('Facility created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create facility: ${error.message}`);
    },
  });
}

// Update facility
export function useUpdateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: FacilityUpdate & { id: string }) => {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      if (data.code) {
        updateData.code = data.code.toUpperCase();
      }

      const { data: result, error } = await supabase
        .from('facilities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as Facility;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      queryClient.setQueryData(facilityKeys.detail(data.id), data);
      toast.success('Facility updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update facility: ${error.message}`);
    },
  });
}

// Delete facility (admin only)
export function useDeleteFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      queryClient.removeQueries({ queryKey: facilityKeys.detail(id) });
      toast.success('Facility deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete facility: ${error.message}`);
    },
  });
}

// Assign user to facility
export function useAssignUserToFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      facilityId,
      role,
      isPrimary = false,
    }: {
      userId: string;
      facilityId: string;
      role: 'viewer' | 'editor' | 'facility_admin';
      isPrimary?: boolean;
    }) => {
      // If setting as primary, unset other primaries first
      if (isPrimary) {
        await supabase
          .from('user_facilities')
          .update({ is_primary: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('user_facilities')
        .upsert({
          user_id: userId,
          facility_id: facilityId,
          role,
          is_primary: isPrimary,
        }, {
          onConflict: 'user_id,facility_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserFacility;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.userFacilities(variables.userId) });
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      toast.success('User assigned to facility successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign user to facility: ${error.message}`);
    },
  });
}

// Remove user from facility
export function useRemoveUserFromFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      facilityId,
    }: {
      userId: string;
      facilityId: string;
    }) => {
      const { error } = await supabase
        .from('user_facilities')
        .delete()
        .eq('user_id', userId)
        .eq('facility_id', facilityId);

      if (error) throw error;
      return { userId, facilityId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.userFacilities(variables.userId) });
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      toast.success('User removed from facility');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove user from facility: ${error.message}`);
    },
  });
}

// Update user's facility role
export function useUpdateUserFacilityRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      facilityId,
      role,
    }: {
      userId: string;
      facilityId: string;
      role: 'viewer' | 'editor' | 'facility_admin';
    }) => {
      const { data, error } = await supabase
        .from('user_facilities')
        .update({ role })
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .select()
        .single();

      if (error) throw error;
      return data as UserFacility;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.userFacilities(variables.userId) });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });
}

// Get facility users
export function useFacilityUsers(facilityId: string | null) {
  return useQuery({
    queryKey: ['facility', facilityId, 'users'],
    queryFn: async () => {
      if (!facilityId) return [];

      const { data, error } = await supabase
        .from('user_facilities')
        .select(`
          id,
          role,
          is_primary,
          created_at,
          user:users(id, full_name, email, role)
        `)
        .eq('facility_id', facilityId);

      if (error) throw error;

      return (data || []).map((uf: any) => ({
        ...uf,
        user: uf.user,
      }));
    },
    enabled: !!facilityId,
  });
}
