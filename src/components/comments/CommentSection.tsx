// src/components/comments/CommentSection.tsx
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useComments, useCommentsSubscription } from '@/hooks/useComments';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { CommentEntityType } from '@/types';

interface CommentSectionProps {
  entityType: CommentEntityType;
  entityId: string;
  className?: string;
}

export function CommentSection({ entityType, entityId, className }: CommentSectionProps) {
  const { data: comments, isLoading } = useComments(entityType, entityId);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Subscribe to real-time comment updates
  useCommentsSubscription(entityType, entityId);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>Comments</span>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>Comments ({comments?.length || 0})</span>
      </div>

      {/* Comment list */}
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              entityType={entityType}
              entityId={entityId}
              onReply={() => setReplyingTo(comment.id)}
              isReplying={replyingTo === comment.id}
              onCancelReply={() => setReplyingTo(null)}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      {/* New comment input */}
      {!replyingTo && (
        <CommentInput
          entityType={entityType}
          entityId={entityId}
          placeholder="Add a comment..."
        />
      )}
    </div>
  );
}
