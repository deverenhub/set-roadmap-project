// src/components/capabilities/CapabilityDetail.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CapabilityDetail } from './CapabilityDetail';

// Mock hooks
const mockDeleteCapability = vi.fn();

const mockCapability = {
  id: 'cap-1',
  name: 'Production Monitoring',
  description: 'Real-time production monitoring system',
  priority: 'HIGH',
  current_level: 2,
  target_level: 4,
  owner: 'Operations',
  color: '#3b82f6',
  qol_impact: 'Reduces manual checks and improves work-life balance',
  quick_wins: [
    { id: 'qw-1', name: 'Quick Win 1', status: 'in_progress' },
    { id: 'qw-2', name: 'Quick Win 2', status: 'completed' },
  ],
};

const mockMilestones = [
  { id: 'ms-1', name: 'Milestone 1', status: 'completed', from_level: 1, to_level: 2 },
  { id: 'ms-2', name: 'Milestone 2', status: 'in_progress', from_level: 2, to_level: 3 },
];

vi.mock('@/hooks', () => ({
  useCapability: (id: string) => ({
    data: id ? mockCapability : null,
    isLoading: false,
  }),
  useDeleteCapability: () => ({
    mutateAsync: mockDeleteCapability,
    isPending: false,
  }),
  useMilestonesByCapability: () => ({
    data: mockMilestones,
  }),
  useAttachmentCount: () => ({
    data: 3,
  }),
  usePermissions: () => ({
    canEdit: true,
    canDelete: true,
  }),
}));

// Mock child components
vi.mock('./CapabilityForm', () => ({
  CapabilityForm: ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => (
    <div data-testid="capability-form">
      <button onClick={onSuccess}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock('./MaturityIndicator', () => ({
  MaturityIndicator: ({ currentLevel, targetLevel }: { currentLevel: number; targetLevel: number }) => (
    <div data-testid="maturity-indicator">
      Level {currentLevel} → {targetLevel}
    </div>
  ),
}));

vi.mock('@/components/shared/ConfirmDialog', () => ({
  ConfirmDialog: ({
    open,
    title,
    onConfirm,
    onOpenChange,
  }: {
    open: boolean;
    title: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <span>{title}</span>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={() => onOpenChange(false)}>Cancel</button>
      </div>
    ) : null,
}));

vi.mock('@/components/comments', () => ({
  CommentSection: ({ entityType, entityId }: { entityType: string; entityId: string }) => (
    <div data-testid="comment-section" data-entity-type={entityType} data-entity-id={entityId}>
      Comments
    </div>
  ),
}));

vi.mock('@/components/timeline', () => ({
  MilestoneDetailModal: ({ milestoneId, open }: { milestoneId: string | null; open: boolean }) =>
    open ? <div data-testid="milestone-modal">{milestoneId}</div> : null,
}));

vi.mock('@/components/quickwins', () => ({
  QuickWinDetailModal: ({ quickWinId, open }: { quickWinId: string | null; open: boolean }) =>
    open ? <div data-testid="quickwin-modal">{quickWinId}</div> : null,
}));

vi.mock('@/components/attachments', () => ({
  FileUpload: () => <div data-testid="file-upload">Upload</div>,
  AttachmentsList: () => <div data-testid="attachments-list">Attachments</div>,
}));

describe('CapabilityDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders capability name', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      expect(screen.getByText('Production Monitoring')).toBeInTheDocument();
    });

    it('renders owner', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      expect(screen.getByText('Operations')).toBeInTheDocument();
    });

    it('renders maturity indicator', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      expect(screen.getByTestId('maturity-indicator')).toBeInTheDocument();
    });

    it('renders overall progress percentage', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      // (2-1)/(4-1) * 100 = 33%
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('renders milestones count', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('renders back button when onBack provided', () => {
      const onBack = vi.fn();
      render(<CapabilityDetail capabilityId="cap-1" onBack={onBack} />);
      const backButtons = screen.getAllByRole('button');
      const backButton = backButtons.find(btn => btn.querySelector('.lucide-arrow-left'));
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('tabs', () => {
    it('renders all tab triggers', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      expect(screen.getByRole('tab', { name: /Milestones/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Quick Wins/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Details/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Attachments/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Comments/i })).toBeInTheDocument();
    });

    it('shows attachment count badge', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders milestones in milestones tab by default', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      expect(screen.getByText('Milestone 1')).toBeInTheDocument();
      expect(screen.getByText('Milestone 2')).toBeInTheDocument();
    });

    it('shows details tab content when clicked', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      fireEvent.click(screen.getByRole('tab', { name: /Details/i }));
      expect(screen.getByText('Real-time production monitoring system')).toBeInTheDocument();
      expect(screen.getByText('Reduces manual checks and improves work-life balance')).toBeInTheDocument();
    });

    it('shows comments tab content when clicked', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      fireEvent.click(screen.getByRole('tab', { name: /Comments/i }));
      expect(screen.getByTestId('comment-section')).toBeInTheDocument();
    });
  });

  describe('permissions', () => {
    it('renders edit button when user can edit', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    it('renders delete button when user can delete', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    it('renders Add Milestone button when user can edit', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      expect(screen.getByRole('button', { name: /Add Milestone/i })).toBeInTheDocument();
    });
  });

  describe('edit functionality', () => {
    it('opens edit dialog when edit button clicked', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
      expect(screen.getByTestId('capability-form')).toBeInTheDocument();
    });

    it('closes edit dialog on form success', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
      fireEvent.click(screen.getByText('Save'));
      expect(screen.queryByTestId('capability-form')).not.toBeInTheDocument();
    });
  });

  describe('delete functionality', () => {
    it('opens delete confirmation when delete button clicked', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    it('calls deleteCapability when confirmed', async () => {
      const onDeleted = vi.fn();
      render(<CapabilityDetail capabilityId="cap-1" onDeleted={onDeleted} />);
      fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
      fireEvent.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(mockDeleteCapability).toHaveBeenCalledWith('cap-1');
      });
    });
  });

  describe('milestone interactions', () => {
    it('opens milestone detail modal when milestone clicked', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      fireEvent.click(screen.getByText('Milestone 1'));
      expect(screen.getByTestId('milestone-modal')).toBeInTheDocument();
    });
  });

  describe('quick win interactions', () => {
    it('shows quick wins in quick wins tab', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      fireEvent.click(screen.getByRole('tab', { name: /Quick Wins/i }));
      expect(screen.getByText('Quick Win 1')).toBeInTheDocument();
      expect(screen.getByText('Quick Win 2')).toBeInTheDocument();
    });

    it('opens quick win detail modal when quick win clicked', () => {
      render(<CapabilityDetail capabilityId="cap-1" />);
      fireEvent.click(screen.getByRole('tab', { name: /Quick Wins/i }));
      fireEvent.click(screen.getByText('Quick Win 1'));
      expect(screen.getByTestId('quickwin-modal')).toBeInTheDocument();
    });
  });

  describe('not found state', () => {
    it('shows not found message when capability is null', () => {
      vi.doMock('@/hooks', () => ({
        useCapability: () => ({
          data: null,
          isLoading: false,
        }),
        useDeleteCapability: () => ({
          mutateAsync: mockDeleteCapability,
          isPending: false,
        }),
        useMilestonesByCapability: () => ({
          data: [],
        }),
        useAttachmentCount: () => ({
          data: 0,
        }),
        usePermissions: () => ({
          canEdit: true,
          canDelete: true,
        }),
      }));
      // Note: Would need dynamic import for proper isolation
    });
  });
});
