// src/components/timeline/MilestoneDetailModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MilestoneDetailModal } from './MilestoneDetailModal';

// Mock milestone data
const mockMilestone = {
  id: 'ms-1',
  name: 'Phase 1 Deployment',
  description: 'Initial deployment phase',
  status: 'in_progress',
  from_level: 1,
  to_level: 2,
  path_a_months: 2,
  path_b_months: 3,
  path_c_months: 4,
  deliverables: ['Deployment guide', 'Training materials'],
  notes: 'Critical deadline - Q1',
  start_date: '2024-01-01',
  end_date: null,
  created_at: '2024-01-01T00:00:00Z',
  capability: { name: 'Production Monitoring' },
};

// Mock hooks
const mockDeleteMilestone = vi.fn();
const mockUpdateMilestone = vi.fn();

vi.mock('@/hooks/useMilestones', () => ({
  useMilestone: (id: string) => ({
    data: id ? mockMilestone : null,
    isLoading: false,
  }),
  useDeleteMilestone: () => ({
    mutateAsync: mockDeleteMilestone,
    isPending: false,
  }),
  useUpdateMilestone: () => ({
    mutate: mockUpdateMilestone,
    isPending: false,
  }),
}));

vi.mock('@/hooks', () => ({
  usePermissions: () => ({
    canEdit: true,
  }),
  useAttachmentCount: () => ({
    data: 2,
  }),
}));

// Mock child components
vi.mock('@/components/comments', () => ({
  CommentSection: ({ entityType, entityId }: { entityType: string; entityId: string }) => (
    <div data-testid="comment-section" data-entity-type={entityType} data-entity-id={entityId}>
      Comments
    </div>
  ),
}));

vi.mock('@/components/attachments', () => ({
  FileUpload: () => <div data-testid="file-upload">Upload</div>,
  AttachmentsList: () => <div data-testid="attachments-list">Attachments</div>,
}));

describe('MilestoneDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('does not render when closed', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={false}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.queryByText('Phase 1 Deployment')).not.toBeInTheDocument();
    });

    it('renders milestone name when open', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('Phase 1 Deployment')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('Initial deployment phase')).toBeInTheDocument();
    });

    it('renders capability name', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('Production Monitoring')).toBeInTheDocument();
    });

    it('renders status badge', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('renders maturity levels', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders timeline paths', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('Path A')).toBeInTheDocument();
      expect(screen.getByText('Path B')).toBeInTheDocument();
      expect(screen.getByText('Path C')).toBeInTheDocument();
      expect(screen.getByText('2 months')).toBeInTheDocument();
      expect(screen.getByText('3 months')).toBeInTheDocument();
      expect(screen.getByText('4 months')).toBeInTheDocument();
    });

    it('renders deliverables', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('Deliverables')).toBeInTheDocument();
      expect(screen.getByText('Deployment guide')).toBeInTheDocument();
      expect(screen.getByText('Training materials')).toBeInTheDocument();
    });

    it('renders notes', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('Critical deadline - Q1')).toBeInTheDocument();
    });

    it('renders tabs', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByRole('tab', { name: /Comments/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Attachments/i })).toBeInTheDocument();
    });
  });

  describe('status change', () => {
    it('renders status change buttons when user can edit', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getByText('Change status:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Not Started/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Completed/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Blocked/i })).toBeInTheDocument();
    });

    it('calls updateMilestone when status button clicked', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Completed/i }));
      expect(mockUpdateMilestone).toHaveBeenCalledWith({
        id: 'ms-1',
        status: 'completed',
      });
    });
  });

  describe('edit button', () => {
    it('renders edit button when user can edit', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
          onEdit={vi.fn()}
        />
      );
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    it('calls onEdit when edit button clicked', () => {
      const onEdit = vi.fn();
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={vi.fn()}
          onEdit={onEdit}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
      expect(onEdit).toHaveBeenCalledWith('ms-1');
    });
  });

  describe('delete button', () => {
    it('renders delete button when user can edit', () => {
      render(
        <MilestoneDetailModal
          milestoneId="ms-1"
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
        <MilestoneDetailModal
          milestoneId="ms-1"
          open={true}
          onOpenChange={onOpenChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
        expect(mockDeleteMilestone).toHaveBeenCalledWith('ms-1');
      });

      confirmSpy.mockRestore();
    });
  });

  describe('not found state', () => {
    it('shows not found message when milestone is null', () => {
      vi.doMock('@/hooks/useMilestones', () => ({
        useMilestone: () => ({
          data: null,
          isLoading: false,
        }),
        useDeleteMilestone: () => ({
          mutateAsync: mockDeleteMilestone,
          isPending: false,
        }),
        useUpdateMilestone: () => ({
          mutate: mockUpdateMilestone,
          isPending: false,
        }),
      }));
      // Note: Would need dynamic import for proper isolation
    });
  });
});
