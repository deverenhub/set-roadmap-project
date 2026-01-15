// src/components/comments/CommentItem.tsx
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, MoreHorizontal, Reply, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useDeleteComment, useUpdateComment } from '@/hooks/useComments';
import { useCurrentUser } from '@/hooks';
import { CommentInput } from './CommentInput';
import { cn } from '@/lib/utils';
import type { CommentWithUser, CommentEntityType } from '@/types';

interface CommentItemProps {
  comment: CommentWithUser;
  entityType: CommentEntityType;
  entityId: string;
  isReply?: boolean;
  onReply?: () => void;
  isReplying?: boolean;
  onCancelReply?: () => void;
}

export function CommentItem({
  comment,
  entityType,
  entityId,
  isReply = false,
  onReply,
  isReplying = false,
  onCancelReply,
}: CommentItemProps) {
  const { data: user } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const isOwner = user?.id === comment.user_id;
  const initials = comment.user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      updateComment.mutate({
        id: comment.id,
        content: editContent.trim(),
        entityType,
        entityId,
      });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteComment.mutate({
      id: comment.id,
      entityType,
      entityId,
    });
  };

  return (
    <div className={cn('space-y-3', isReply && 'ml-10')}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium',
            isReply && 'h-6 w-6'
          )}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium truncate">
                {comment.user?.full_name || 'Unknown User'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>

            {/* Actions menu */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Comment text or edit mode */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={updateComment.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* Reply button for top-level comments */}
              {!isReply && onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 mt-1 text-muted-foreground hover:text-foreground"
                  onClick={onReply}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              entityType={entityType}
              entityId={entityId}
              isReply
            />
          ))}
        </div>
      )}

      {/* Reply input */}
      {isReplying && (
        <div className="ml-10">
          <CommentInput
            entityType={entityType}
            entityId={entityId}
            parentId={comment.id}
            placeholder="Write a reply..."
            onCancel={onCancelReply}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
