// src/components/attachments/FileUpload.tsx
// Drag-and-drop file upload component

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, Table, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  useUploadAttachment,
  formatFileSize,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from '@/hooks/useAttachments';
import type { AttachmentEntityType } from '@/types';

interface FileUploadProps {
  entityType: AttachmentEntityType;
  entityId: string;
  onUploadComplete?: () => void;
  className?: string;
  compact?: boolean;
}

interface PendingFile {
  file: File;
  progress: number;
  error?: string;
}

export function FileUpload({
  entityType,
  entityId,
  onUploadComplete,
  className,
  compact = false,
}: FileUploadProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const uploadMutation = useUploadAttachment();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Add files to pending list
      const newPending = acceptedFiles.map((file) => ({
        file,
        progress: 0,
      }));
      setPendingFiles((prev) => [...prev, ...newPending]);

      // Upload each file
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        try {
          await uploadMutation.mutateAsync({
            file,
            entityType,
            entityId,
          });
          // Remove from pending on success
          setPendingFiles((prev) =>
            prev.filter((p) => p.file !== file)
          );
        } catch (error) {
          // Mark as error
          setPendingFiles((prev) =>
            prev.map((p) =>
              p.file === file
                ? { ...p, error: error instanceof Error ? error.message : 'Upload failed' }
                : p
            )
          );
        }
      }

      onUploadComplete?.();
    },
    [entityType, entityId, uploadMutation, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.keys(ALLOWED_FILE_TYPES).reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const removePendingFile = (file: File) => {
    setPendingFiles((prev) => prev.filter((p) => p.file !== file));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('spreadsheet') || type.includes('excel') || type === 'text/csv')
      return <Table className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (compact) {
    return (
      <div className={className}>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Attach File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          uploadMutation.isPending && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm text-primary font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-1">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Max {formatFileSize(MAX_FILE_SIZE)} per file. Supported: images, PDF, Word, Excel, CSV
            </p>
          </>
        )}
      </div>

      {/* Pending uploads */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          {pendingFiles.map((pending, index) => (
            <div
              key={`${pending.file.name}-${index}`}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                pending.error ? 'border-destructive bg-destructive/5' : 'border-border'
              )}
            >
              {getFileIcon(pending.file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{pending.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(pending.file.size)}
                </p>
                {pending.error ? (
                  <p className="text-xs text-destructive">{pending.error}</p>
                ) : (
                  <Progress value={pending.progress} className="h-1 mt-1" />
                )}
              </div>
              {pending.error ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removePendingFile(pending.file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
