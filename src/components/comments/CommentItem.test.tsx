// src/components/comments/CommentItem.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentItem } from './CommentItem';

// Mock hooks
vi.mock('@/hooks/useComments', () => ({
  useUpdateComment: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteComment: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks', () => ({
  useCurrentUser: () => ({
    data: { id: 'user-1' },
  }),
}));

// Mock CommentInput child component
vi.mock('./CommentInput', () => ({
  CommentInput: ({ placeholder, onCancel }: { placeholder: string; onCancel?: () => void }) => (
    <div data-testid="comment-input" data-placeholder={placeholder}>
      <button onClick={onCancel}>Cancel Reply</button>
    </div>
  ),
}));

const mockComment = {
  id: 'comment-1',
  content: 'Test comment content',
  user_id: 'user-1',
  user: { full_name: 'John Doe' },
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  replies: [],
};

describe('CommentItem', () => {
  describe('rendering', () => {
    it('renders comment content', () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );
      expect(screen.getByText('Test comment content')).toBeInTheDocument();
    });

    it('renders user name', () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders user initials', () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders timestamp', () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );
      // formatDistanceToNow will produce relative text like "X days ago"
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });

    it('shows (edited) when updated_at differs from created_at', () => {
      const editedComment = {
        ...mockComment,
        updated_at: '2024-01-16T10:00:00Z',
      };
      render(
        <CommentItem
          comment={editedComment}
          entityType="capability"
          entityId="cap-1"
        />
      );
      expect(screen.getByText('(edited)')).toBeInTheDocument();
    });

    it('does not show (edited) when comment is not edited', () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );
      expect(screen.queryByText('(edited)')).not.toBeInTheDocument();
    });
  });

  describe('reply button', () => {
    it('shows reply button for top-level comments', () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
          onReply={vi.fn()}
        />
      );
      expect(screen.getByText('Reply')).toBeInTheDocument();
    });

    it('hides reply button for reply comments', () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
          isReply
        />
      );
      expect(screen.queryByText('Reply')).not.toBeInTheDocument();
    });

    it('calls onReply when reply button clicked', () => {
      const onReply = vi.fn();
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
          onReply={onReply}
        />
      );
      fireEvent.click(screen.getByText('Reply'));
      expect(onReply).toHaveBeenCalled();
    });

    it('shows reply input when isReplying is true', () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
          isReplying
          onCancelReply={vi.fn()}
        />
      );
      expect(screen.getByTestId('comment-input')).toBeInTheDocument();
    });
  });

  describe('owner actions', () => {
    it('shows actions menu button for comment owner', () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );
      // The MoreHorizontal button should be visible
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('replies', () => {
    it('renders nested replies', () => {
      const commentWithReplies = {
        ...mockComment,
        replies: [
          {
            id: 'reply-1',
            content: 'Reply content',
            user_id: 'user-2',
            user: { full_name: 'Jane Smith' },
            created_at: '2024-01-16T10:00:00Z',
            updated_at: '2024-01-16T10:00:00Z',
            replies: [],
          },
        ],
      };

      render(
        <CommentItem
          comment={commentWithReplies}
          entityType="capability"
          entityId="cap-1"
        />
      );

      expect(screen.getByText('Reply content')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('isReply styling', () => {
    it('applies indentation for reply comments', () => {
      const { container } = render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
          isReply
        />
      );
      expect(container.firstChild).toHaveClass('ml-10');
    });

    it('does not apply indentation for top-level comments', () => {
      const { container } = render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );
      expect(container.firstChild).not.toHaveClass('ml-10');
    });
  });
});
