// src/hooks/useAttachments.ts
// Hook to manage file attachments for capabilities, milestones, and quick wins

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Attachment, AttachmentInsert, AttachmentWithUser, AttachmentEntityType } from '@/types';

// Query keys factory
export const attachmentKeys = {
  all: ['attachments'] as const,
  lists: () => [...attachmentKeys.all, 'list'] as const,
  byEntity: (entityType: AttachmentEntityType, entityId: string) =>
    [...attachmentKeys.all, entityType, entityId] as const,
};

// Allowed file types for display
export const ALLOWED_FILE_TYPES = {
  'image/jpeg': { ext: '.jpg', icon: 'image' },
  'image/png': { ext: '.png', icon: 'image' },
  'image/gif': { ext: '.gif', icon: 'image' },
  'image/webp': { ext: '.webp', icon: 'image' },
  'application/pdf': { ext: '.pdf', icon: 'file-text' },
  'application/msword': { ext: '.doc', icon: 'file-text' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', icon: 'file-text' },
  'application/vnd.ms-excel': { ext: '.xls', icon: 'table' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', icon: 'table' },
  'text/plain': { ext: '.txt', icon: 'file-text' },
  'text/csv': { ext: '.csv', icon: 'table' },
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get file icon based on type
export function getFileIcon(mimeType: string): string {
  const typeInfo = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
  return typeInfo?.icon || 'file';
}

// Check if file type is an image
export function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

// Fetch attachments for an entity
export function useAttachments(entityType: AttachmentEntityType, entityId: string) {
  return useQuery({
    queryKey: attachmentKeys.byEntity(entityType, entityId),
    queryFn: async (): Promise<AttachmentWithUser[]> => {
      const { data, error } = await supabase
        .from('attachments')
        .select(`
          *,
          user:users!uploaded_by(id, full_name, email)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as AttachmentWithUser[];
    },
    enabled: !!entityId,
  });
}

// Upload a file attachment
export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      entityType,
      entityId,
      description,
    }: {
      file: File;
      entityType: AttachmentEntityType;
      entityId: string;
      description?: string;
    }) => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`);
      }

      // Validate file type
      if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
        throw new Error('File type not allowed');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${entityType}/${entityId}/${timestamp}_${sanitizedName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create attachment record in database
      const attachmentData: AttachmentInsert = {
        entity_type: entityType,
        entity_id: entityId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: storagePath,
        uploaded_by: user.id,
        description,
      };

      const { data, error } = await supabase
        .from('attachments')
        .insert(attachmentData)
        .select(`
          *,
          user:users!uploaded_by(id, full_name, email)
        `)
        .single();

      if (error) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('attachments').remove([storagePath]);
        throw error;
      }

      return data as AttachmentWithUser;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: attachmentKeys.byEntity(data.entity_type as AttachmentEntityType, data.entity_id),
      });
      toast.success('File uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });
}

// Delete an attachment
export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachment: Attachment) => {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([attachment.storage_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with database delete even if storage fails
      }

      // Delete from database
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) throw error;

      return attachment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: attachmentKeys.byEntity(data.entity_type as AttachmentEntityType, data.entity_id),
      });
      toast.success('File deleted');
    },
    onError: (error: Error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });
}

// Get signed URL for downloading/viewing an attachment
export async function getAttachmentUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('attachments')
    .createSignedUrl(storagePath, 3600); // 1 hour expiry

  if (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

// Hook to get attachment URL
export function useAttachmentUrl(storagePath: string | null) {
  return useQuery({
    queryKey: ['attachment-url', storagePath],
    queryFn: async () => {
      if (!storagePath) return null;
      return getAttachmentUrl(storagePath);
    },
    enabled: !!storagePath,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Count attachments for an entity
export function useAttachmentCount(entityType: AttachmentEntityType, entityId: string) {
  return useQuery({
    queryKey: [...attachmentKeys.byEntity(entityType, entityId), 'count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('attachments')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!entityId,
  });
}
