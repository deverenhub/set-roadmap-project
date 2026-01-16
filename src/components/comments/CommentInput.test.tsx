// src/components/comments/CommentInput.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentInput } from './CommentInput';

// Mock hooks
const mockCreateComment = vi.fn();

vi.mock('@/hooks/useComments', () => ({
  useCreateComment: () => ({
    mutate: mockCreateComment,
    isPending: false,
  }),
}));

describe('CommentInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders textarea', () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders default placeholder', () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    });

    it('renders custom placeholder', () => {
      render(<CommentInput entityType="capability" entityId="cap-1" placeholder="Add a note..." />);
      expect(screen.getByPlaceholderText('Add a note...')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders keyboard shortcut hint', () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      expect(screen.getByText('Cmd+Enter')).toBeInTheDocument();
    });
  });

  describe('cancel button', () => {
    it('does not render cancel button by default', () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      expect(screen.queryByText('Cancel', { exact: false })).not.toBeInTheDocument();
    });

    it('renders cancel button when onCancel provided', () => {
      render(<CommentInput entityType="capability" entityId="cap-1" onCancel={vi.fn()} />);
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('calls onCancel when cancel button clicked', () => {
      const onCancel = vi.fn();
      render(<CommentInput entityType="capability" entityId="cap-1" onCancel={onCancel} />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]); // Second button is cancel
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('submit functionality', () => {
    it('disables submit button when textarea is empty', () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      const submitButton = screen.getAllByRole('button')[0];
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when textarea has content', async () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      await userEvent.type(screen.getByRole('textbox'), 'Test comment');
      const submitButton = screen.getAllByRole('button')[0];
      expect(submitButton).not.toBeDisabled();
    });

    it('calls createComment when submit button clicked', async () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      await userEvent.type(screen.getByRole('textbox'), 'Test comment');
      fireEvent.click(screen.getAllByRole('button')[0]);

      expect(mockCreateComment).toHaveBeenCalledWith(
        expect.objectContaining({
          entity_type: 'capability',
          entity_id: 'cap-1',
          content: 'Test comment',
          parent_id: null,
        }),
        expect.any(Object)
      );
    });

    it('includes parentId when provided', async () => {
      render(<CommentInput entityType="capability" entityId="cap-1" parentId="parent-1" />);
      await userEvent.type(screen.getByRole('textbox'), 'Reply');
      fireEvent.click(screen.getAllByRole('button')[0]);

      expect(mockCreateComment).toHaveBeenCalledWith(
        expect.objectContaining({
          parent_id: 'parent-1',
        }),
        expect.any(Object)
      );
    });

    it('does not submit when content is only whitespace', async () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      await userEvent.type(screen.getByRole('textbox'), '   ');
      fireEvent.click(screen.getAllByRole('button')[0]);

      expect(mockCreateComment).not.toHaveBeenCalled();
    });
  });

  describe('keyboard shortcuts', () => {
    it('submits on Ctrl+Enter', async () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, 'Test comment');
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(mockCreateComment).toHaveBeenCalled();
    });

    it('submits on Meta+Enter', async () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, 'Test comment');
      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

      expect(mockCreateComment).toHaveBeenCalled();
    });

    it('cancels on Escape when onCancel provided', async () => {
      const onCancel = vi.fn();
      render(<CommentInput entityType="capability" entityId="cap-1" onCancel={onCancel} />);
      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalled();
    });

    it('does not cancel on Escape when onCancel not provided', () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Escape' });
      // Should not throw error
    });
  });

  describe('autoFocus', () => {
    it('focuses textarea when autoFocus is true', () => {
      render(<CommentInput entityType="capability" entityId="cap-1" autoFocus />);
      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('does not focus textarea by default', () => {
      render(<CommentInput entityType="capability" entityId="cap-1" />);
      expect(screen.getByRole('textbox')).not.toHaveFocus();
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CommentInput entityType="capability" entityId="cap-1" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
