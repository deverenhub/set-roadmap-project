// src/components/comments/CommentItem.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentItem } from './CommentItem';

// Mock hooks
const mockUpdateComment = vi.fn();
const mockDeleteComment = vi.fn();

vi.mock('@/hooks/useComments', () => ({
  useUpdateComment: () => ({
    mutate: mockUpdateComment,
    isPending: false,
  }),
  useDeleteComment: () => ({
    mutate: mockDeleteComment,
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    it('shows actions menu for comment owner', () => {
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

  describe('edit functionality', () => {
    it('shows edit textarea when editing', async () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );

      // Open dropdown and click Edit
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      // Should show textarea in edit mode
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test comment content')).toBeInTheDocument();
      });
    });

    it('shows Save and Cancel buttons when editing', async () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });

    it('calls updateComment when Save clicked with changed content', async () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test comment content')).toBeInTheDocument();
      });

      const textarea = screen.getByDisplayValue('Test comment content');
      fireEvent.change(textarea, { target: { value: 'Updated content' } });
      fireEvent.click(screen.getByText('Save'));

      expect(mockUpdateComment).toHaveBeenCalledWith({
        id: 'comment-1',
        content: 'Updated content',
        entityType: 'capability',
        entityId: 'cap-1',
      });
    });

    it('cancels edit mode when Cancel clicked', async () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));

      // Should show original content, not edit textarea
      await waitFor(() => {
        expect(screen.getByText('Test comment content')).toBeInTheDocument();
      });
    });
  });

  describe('delete functionality', () => {
    it('calls deleteComment when Delete clicked', async () => {
      render(
        <CommentItem
          comment={mockComment}
          entityType="capability"
          entityId="cap-1"
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Delete'));

      expect(mockDeleteComment).toHaveBeenCalledWith({
        id: 'comment-1',
        entityType: 'capability',
        entityId: 'cap-1',
      });
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
