// src/hooks/useComments.ts
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { CommentInsert, CommentEntityType, CommentWithUser } from '@/types';

// Query keys factory
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (entityType: CommentEntityType, entityId: string) =>
    [...commentKeys.lists(), entityType, entityId] as const,
};

// Fetch comments for an entity
export function useComments(entityType: CommentEntityType, entityId: string) {
  return useQuery({
    queryKey: commentKeys.list(entityType, entityId),
    queryFn: async (): Promise<CommentWithUser[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users!comments_user_id_fkey(id, full_name, email)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('is_deleted', false)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment: any) => {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              *,
              user:users!comments_user_id_fkey(id, full_name, email)
            `)
            .eq('parent_id', comment.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || [],
          };
        })
      );

      return commentsWithReplies;
    },
    enabled: !!entityId,
  });
}

// Get comment count for an entity
export function useCommentCount(entityType: CommentEntityType, entityId: string) {
  return useQuery({
    queryKey: [...commentKeys.list(entityType, entityId), 'count'],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('is_deleted', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!entityId,
  });
}

// Create comment
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<CommentInsert, 'user_id'> & { user_id?: string }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('comments')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select(`
          *,
          user:users!comments_user_id_fkey(id, full_name, email)
        `)
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(data.entity_type, data.entity_id),
      });
      toast.success('Comment added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });
}

// Update comment
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      content,
      entityType,
      entityId,
    }: {
      id: string;
      content: string;
      entityType: CommentEntityType;
      entityId: string;
    }) => {
      const { data: result, error } = await supabase
        .from('comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...result, entityType, entityId };
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(data.entityType, data.entityId),
      });
      toast.success('Comment updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update comment: ${error.message}`);
    },
  });
}

// Soft delete comment
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      entityType,
      entityId,
    }: {
      id: string;
      entityType: CommentEntityType;
      entityId: string;
    }) => {
      const { error } = await supabase
        .from('comments')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { id, entityType, entityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(data.entityType, data.entityId),
      });
      toast.success('Comment deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    },
  });
}

// Fetch all users for @mentions
export function useUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

// Real-time subscription for comments
export function useCommentsSubscription(entityType: CommentEntityType, entityId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!entityId) return;

    const channel = supabase
      .channel(`comments-${entityType}-${entityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `entity_type=eq.${entityType}`,
        },
        (payload) => {
          // Check if the change is for our entity
          const record = payload.new as any || payload.old as any;
          if (record?.entity_id === entityId) {
            // Invalidate the comments query to refetch
            queryClient.invalidateQueries({
              queryKey: commentKeys.list(entityType, entityId),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entityType, entityId, queryClient]);
}
