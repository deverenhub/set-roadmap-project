// src/components/comments/CommentInput.tsx
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateComment } from '@/hooks/useComments';
import { cn } from '@/lib/utils';
import type { CommentEntityType } from '@/types';

interface CommentInputProps {
  entityType: CommentEntityType;
  entityId: string;
  parentId?: string;
  placeholder?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export function CommentInput({
  entityType,
  entityId,
  parentId,
  placeholder = 'Write a comment...',
  onCancel,
  autoFocus = false,
  className,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createComment = useCreateComment();

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    if (!content.trim()) return;

    createComment.mutate(
      {
        entity_type: entityType,
        entity_id: entityId,
        parent_id: parentId || null,
        content: content.trim(),
        mentions: [],
      },
      {
        onSuccess: () => {
          setContent('');
          if (onCancel) {
            onCancel();
          }
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    // Cancel on Escape
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[60px] resize-none"
          rows={2}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Cmd+Enter</kbd> to submit
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!content.trim() || createComment.isPending}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
        {onCancel && (
          <Button size="icon" variant="outline" onClick={onCancel} className="shrink-0">
            <span className="sr-only">Cancel</span>
            <span className="text-xs">&times;</span>
          </Button>
        )}
      </div>
    </div>
  );
}
