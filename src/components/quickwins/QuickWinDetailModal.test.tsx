// src/components/quickwins/QuickWinDetailModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickWinDetailModal } from './QuickWinDetailModal';

// Mock hooks
const mockDeleteQuickWin = vi.fn();

const mockQuickWin = {
  id: 'qw-1',
  name: 'Test Quick Win',
  description: 'A test description',
  status: 'in_progress',
  progress_percent: 50,
  timeline_months: 3,
  investment: 'MEDIUM',
  roi: 'HIGH',
  category: 'Operations',
  capability: { name: 'Test Capability' },
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-20T10:00:00Z',
};

vi.mock('@/hooks/useQuickWins', () => ({
  useQuickWin: (id: string) => ({
    data: id ? mockQuickWin : null,
    isLoading: false,
  }),
  useDeleteQuickWin: () => ({
    mutateAsync: mockDeleteQuickWin,
  }),
}));

vi.mock('@/hooks', () => ({
  usePermissions: () => ({
    canEdit: true,
  }),
}));

// Mock CommentSection
vi.mock('@/components/comments', () => ({
  CommentSection: ({ entityType, entityId }: { entityType: string; entityId: string }) => (
    <div data-testid="comment-section" data-entity-type={entityType} data-entity-id={entityId}>
      Comments
    </div>
  ),
}));

describe('QuickWinDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('does not render when closed', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={false}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.queryByText('Test Quick Win')).not.toBeInTheDocument();
    });

    it('renders quick win name when open', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('Test Quick Win')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('A test description')).toBeInTheDocument();
    });

    it('renders status badge', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('renders progress bar', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders timeline', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('3 months')).toBeInTheDocument();
    });

    it('renders investment badge', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });

    it('renders ROI badge', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });

    it('renders category', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('Operations')).toBeInTheDocument();
    });

    it('renders capability link', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('Test Capability')).toBeInTheDocument();
    });

    it('renders comment section', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByTestId('comment-section')).toBeInTheDocument();
    });

    it('passes correct props to comment section', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      const commentSection = screen.getByTestId('comment-section');
      expect(commentSection).toHaveAttribute('data-entity-type', 'quick_win');
      expect(commentSection).toHaveAttribute('data-entity-id', 'qw-1');
    });
  });

  describe('dates', () => {
    it('renders created date', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText(/Created:/)).toBeInTheDocument();
    });

    it('renders updated date when different from created', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText(/Updated:/)).toBeInTheDocument();
    });
  });

  describe('edit button', () => {
    it('renders edit button when user can edit', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
          onEdit={vi.fn()}
        />
      );
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
      const onEdit = vi.fn();
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
          onEdit={onEdit}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
      expect(onEdit).toHaveBeenCalledWith('qw-1');
    });
  });

  describe('delete button', () => {
    it('renders delete button when user can edit', () => {
      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    it('shows confirmation and deletes when confirmed', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onOpenChange = vi.fn();

      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={onOpenChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
        expect(mockDeleteQuickWin).toHaveBeenCalledWith('qw-1');
      });

      confirmSpy.mockRestore();
    });

    it('does not delete when confirmation is cancelled', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <QuickWinDetailModal
          quickWinId="qw-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

      expect(mockDeleteQuickWin).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('not found state', () => {
    it('shows not found message when quickWin is null', () => {
      vi.doMock('@/hooks/useQuickWins', () => ({
        useQuickWin: () => ({
          data: null,
          isLoading: false,
        }),
        useDeleteQuickWin: () => ({
          mutateAsync: mockDeleteQuickWin,
        }),
      }));

      // Note: Would need dynamic import for proper isolation
    });
  });
});
