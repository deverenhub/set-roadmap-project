// src/pages/QuickWins.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickWins from './QuickWins';

// Mock hooks
const mockStats = {
  total: 10,
  in_progress: 4,
  completed: 5,
  high_roi: 3,
};

vi.mock('@/hooks', () => ({
  useQuickWinStats: () => ({
    data: mockStats,
    isLoading: false,
  }),
  usePermissions: () => ({
    canEdit: true,
  }),
}));

// Mock QuickWins components
vi.mock('@/components/quickwins', () => ({
  KanbanBoard: ({ onQuickWinClick, readOnly }: { onQuickWinClick: (id: string) => void; readOnly: boolean }) => (
    <div data-testid="kanban-board" data-readonly={readOnly}>
      <button
        data-testid="quick-win-item"
        onClick={() => onQuickWinClick('qw-123')}
      >
        Quick Win Item
      </button>
    </div>
  ),
  QuickWinForm: ({
    quickWinId,
    onSuccess,
    onCancel,
  }: {
    quickWinId: string | null;
    onSuccess: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="quick-win-form" data-quick-win-id={quickWinId || ''}>
      <button data-testid="form-success" onClick={onSuccess}>Success</button>
      <button data-testid="form-cancel" onClick={onCancel}>Cancel</button>
    </div>
  ),
  QuickWinDetailModal: ({
    quickWinId,
    open,
    onOpenChange,
    onEdit,
  }: {
    quickWinId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (id: string) => void;
  }) => (
    open ? (
      <div data-testid="detail-modal" data-quick-win-id={quickWinId || ''}>
        <button data-testid="close-modal" onClick={() => onOpenChange(false)}>Close</button>
        <button data-testid="edit-btn" onClick={() => onEdit(quickWinId || '')}>Edit</button>
      </div>
    ) : null
  ),
}));

describe('QuickWins', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders page title', () => {
      render(<QuickWins />);
      expect(screen.getByRole('heading', { name: 'Quick Wins' })).toBeInTheDocument();
    });

    it('renders page description', () => {
      render(<QuickWins />);
      expect(screen.getByText('Track short-term initiatives and improvements')).toBeInTheDocument();
    });

    it('renders add button when user can edit', () => {
      render(<QuickWins />);
      expect(screen.getByRole('button', { name: /Add Quick Win/i })).toBeInTheDocument();
    });

    it('renders KanbanBoard', () => {
      render(<QuickWins />);
      expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
    });
  });

  describe('stats cards', () => {
    it('renders total stat', () => {
      render(<QuickWins />);
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('renders in progress stat', () => {
      render(<QuickWins />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('renders completed stat', () => {
      render(<QuickWins />);
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders high ROI stat', () => {
      render(<QuickWins />);
      expect(screen.getByText('High ROI')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('add quick win dialog', () => {
    it('opens form dialog when add button is clicked', () => {
      render(<QuickWins />);
      fireEvent.click(screen.getByRole('button', { name: /Add Quick Win/i }));
      expect(screen.getByTestId('quick-win-form')).toBeInTheDocument();
    });

    it('form has no quickWinId when adding new', () => {
      render(<QuickWins />);
      fireEvent.click(screen.getByRole('button', { name: /Add Quick Win/i }));
      expect(screen.getByTestId('quick-win-form')).toHaveAttribute('data-quick-win-id', '');
    });

    it('closes form on success', () => {
      render(<QuickWins />);
      fireEvent.click(screen.getByRole('button', { name: /Add Quick Win/i }));
      fireEvent.click(screen.getByTestId('form-success'));
      expect(screen.queryByTestId('quick-win-form')).not.toBeInTheDocument();
    });

    it('closes form on cancel', () => {
      render(<QuickWins />);
      fireEvent.click(screen.getByRole('button', { name: /Add Quick Win/i }));
      fireEvent.click(screen.getByTestId('form-cancel'));
      expect(screen.queryByTestId('quick-win-form')).not.toBeInTheDocument();
    });
  });

  describe('detail modal', () => {
    it('opens detail modal when quick win is clicked', () => {
      render(<QuickWins />);
      fireEvent.click(screen.getByTestId('quick-win-item'));
      expect(screen.getByTestId('detail-modal')).toBeInTheDocument();
    });

    it('passes correct quickWinId to detail modal', () => {
      render(<QuickWins />);
      fireEvent.click(screen.getByTestId('quick-win-item'));
      expect(screen.getByTestId('detail-modal')).toHaveAttribute('data-quick-win-id', 'qw-123');
    });

    it('closes detail modal', () => {
      render(<QuickWins />);
      fireEvent.click(screen.getByTestId('quick-win-item'));
      fireEvent.click(screen.getByTestId('close-modal'));
      expect(screen.queryByTestId('detail-modal')).not.toBeInTheDocument();
    });
  });

  describe('edit flow', () => {
    it('opens form with quickWinId when edit is clicked', () => {
      render(<QuickWins />);
      // Open detail modal
      fireEvent.click(screen.getByTestId('quick-win-item'));
      // Click edit
      fireEvent.click(screen.getByTestId('edit-btn'));
      // Form should be open with the id
      expect(screen.getByTestId('quick-win-form')).toHaveAttribute('data-quick-win-id', 'qw-123');
    });

    it('closes detail modal when edit is clicked', () => {
      render(<QuickWins />);
      fireEvent.click(screen.getByTestId('quick-win-item'));
      fireEvent.click(screen.getByTestId('edit-btn'));
      expect(screen.queryByTestId('detail-modal')).not.toBeInTheDocument();
    });
  });

  describe('permissions', () => {
    it('passes readOnly false to KanbanBoard when user can edit', () => {
      render(<QuickWins />);
      expect(screen.getByTestId('kanban-board')).toHaveAttribute('data-readonly', 'false');
    });
  });
});

// Note: Additional QuickWins tests for viewer permissions and loading states
// would require module re-import to properly test different permission/loading states
