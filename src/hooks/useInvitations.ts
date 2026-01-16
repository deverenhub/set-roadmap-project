// src/hooks/useInvitations.ts
// Hook for managing user invitations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Invitation, InvitationWithInviter, UserRole } from '@/types';

// Query keys
export const invitationKeys = {
  all: ['invitations'] as const,
  list: () => [...invitationKeys.all, 'list'] as const,
  pending: () => [...invitationKeys.all, 'pending'] as const,
  detail: (id: string) => [...invitationKeys.all, 'detail', id] as const,
  byToken: (token: string) => [...invitationKeys.all, 'token', token] as const,
};

// Get all invitations (admin only)
export function useInvitations() {
  return useQuery({
    queryKey: invitationKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          inviter:users!invited_by(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InvitationWithInviter[];
    },
  });
}

// Get pending invitations only
export function usePendingInvitations() {
  return useQuery({
    queryKey: invitationKeys.pending(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          inviter:users!invited_by(id, full_name, email)
        `)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InvitationWithInviter[];
    },
  });
}

// Get invitation by token (for accept page - uses anon access)
export function useInvitationByToken(token: string | null) {
  return useQuery({
    queryKey: invitationKeys.byToken(token || ''),
    queryFn: async () => {
      if (!token) return null;

      const { data, error } = await supabase
        .from('invitations')
        .select('id, email, role, expires_at, accepted_at')
        .eq('token', token)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data as Pick<Invitation, 'id' | 'email' | 'role' | 'expires_at' | 'accepted_at'>;
    },
    enabled: !!token,
  });
}

// Send invitation (calls Edge Function)
export function useSendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      role,
      message,
    }: {
      email: string;
      role: UserRole;
      message?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('send-invitation', {
        body: { email, role, message },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send invitation');
      }

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to send invitation');
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all });
      if (data.emailSent) {
        toast.success('Invitation sent successfully');
      } else {
        toast.success('Invitation created (email not configured)');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });
}

// Resend invitation
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      // Get the existing invitation
      const { data: invitation, error: fetchError } = await supabase
        .from('invitations')
        .select('email, role')
        .eq('id', invitationId)
        .single();

      if (fetchError || !invitation) {
        throw new Error('Invitation not found');
      }

      // Delete the old invitation
      const { error: deleteError } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (deleteError) {
        throw new Error('Failed to update invitation');
      }

      // Send a new invitation
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('send-invitation', {
        body: { email: invitation.email, role: invitation.role },
      });

      if (response.error || !response.data.success) {
        throw new Error(response.data?.error || 'Failed to resend invitation');
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all });
      if (data.emailSent) {
        toast.success('Invitation resent successfully');
      } else {
        toast.success('Invitation renewed (email not configured)');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend invitation');
    },
  });
}

// Revoke/delete invitation
export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all });
      toast.success('Invitation revoked');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke invitation');
    },
  });
}

// Accept invitation (for the accept page)
export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async ({
      token,
      password,
      fullName,
    }: {
      token: string;
      password: string;
      fullName: string;
    }) => {
      // First, get the invitation to get the email
      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .select('id, email, role, expires_at, accepted_at')
        .eq('token', token)
        .single();

      if (invError || !invitation) {
        throw new Error('Invalid invitation token');
      }

      if (invitation.accepted_at) {
        throw new Error('This invitation has already been accepted');
      }

      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('This invitation has expired');
      }

      // Create the user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create user account');

      // Mark invitation as accepted and update user role using RPC
      const { data: acceptResult, error: acceptError } = await supabase
        .rpc('accept_invitation', {
          p_token: token,
          p_user_id: authData.user.id,
        });

      if (acceptError) {
        console.error('Accept invitation error:', acceptError);
        throw new Error('Failed to accept invitation');
      }

      if (!acceptResult?.success) {
        throw new Error(acceptResult?.error || 'Failed to accept invitation');
      }

      return {
        user: authData.user,
        role: invitation.role,
      };
    },
    onSuccess: () => {
      toast.success('Account created successfully! Please check your email to verify.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept invitation');
    },
  });
}

// Get invitation status helper
export function getInvitationStatus(invitation: Invitation): 'pending' | 'accepted' | 'expired' {
  if (invitation.accepted_at) {
    return 'accepted';
  }
  if (new Date(invitation.expires_at) < new Date()) {
    return 'expired';
  }
  return 'pending';
}

// Format time until expiration
export function getTimeUntilExpiration(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
  }
  return `${diffHours} hour${diffHours !== 1 ? 's' : ''} left`;
}
