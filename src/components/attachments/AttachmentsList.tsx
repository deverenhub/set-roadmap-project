// src/components/attachments/AttachmentsList.tsx
// List of attachments with download and delete functionality

import { useState } from 'react';
import {
  FileText,
  Image,
  Table,
  Download,
  Trash2,
  ExternalLink,
  Loader2,
  Paperclip,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useAttachments,
  useDeleteAttachment,
  getAttachmentUrl,
  formatFileSize,
  isImageType,
} from '@/hooks/useAttachments';
import { usePermissions } from '@/hooks/useUser';
import type { AttachmentEntityType, AttachmentWithUser } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface AttachmentsListProps {
  entityType: AttachmentEntityType;
  entityId: string;
  className?: string;
}

export function AttachmentsList({ entityType, entityId, className }: AttachmentsListProps) {
  const { data: attachments, isLoading, error } = useAttachments(entityType, entityId);
  const deleteMutation = useDeleteAttachment();
  const { canEdit } = usePermissions();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');

  const handleDownload = async (attachment: AttachmentWithUser) => {
    const url = await getAttachmentUrl(attachment.storage_path);
    if (url) {
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreview = async (attachment: AttachmentWithUser) => {
    const url = await getAttachmentUrl(attachment.storage_path);
    if (url) {
      if (isImageType(attachment.file_type)) {
        setPreviewName(attachment.file_name);
        setPreviewUrl(url);
      } else {
        // Open in new tab for non-images
        window.open(url, '_blank');
      }
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (type.includes('spreadsheet') || type.includes('excel') || type === 'text/csv')
      return <Table className="h-5 w-5 text-green-500" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-sm text-destructive p-4 border rounded-lg', className)}>
        Failed to load attachments
      </div>
    );
  }

  if (!attachments || attachments.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center', className)}>
        <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No attachments yet</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-2', className)}>
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
          >
            {/* File icon / thumbnail */}
            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
              {getFileIcon(attachment.file_type)}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.file_size)}
                {attachment.user?.full_name && (
                  <>
                    {' '}&bull;{' '}
                    Uploaded by {attachment.user.full_name}
                  </>
                )}
                {' '}&bull;{' '}
                {formatDistanceToNow(new Date(attachment.created_at), { addSuffix: true })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Preview (for images and PDFs) */}
              {(isImageType(attachment.file_type) || attachment.file_type === 'application/pdf') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePreview(attachment)}
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}

              {/* Download */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDownload(attachment)}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>

              {/* Delete (only for editors/admins) */}
              {canEdit && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{attachment.file_name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(attachment)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Delete'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewName}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewUrl}
                alt={previewName}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
