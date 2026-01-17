// src/components/quickwins/QuickWinForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickWinForm } from './QuickWinForm';

// Mock hooks
const mockCreateQuickWin = vi.fn().mockResolvedValue({});
const mockUpdateQuickWin = vi.fn().mockResolvedValue({});

vi.mock('@/hooks', () => ({
  useCreateQuickWin: () => ({
    mutateAsync: mockCreateQuickWin,
    isPending: false,
  }),
  useUpdateQuickWin: () => ({
    mutateAsync: mockUpdateQuickWin,
    isPending: false,
  }),
  useCapabilities: () => ({
    data: [
      { id: 'cap-1', name: 'Capability 1' },
      { id: 'cap-2', name: 'Capability 2' },
    ],
  }),
}));

vi.mock('@/hooks/useQuickWins', () => ({
  useQuickWin: (id: string) => ({
    data: id ? {
      id,
      name: 'Existing Quick Win',
      description: 'Existing description',
      capability_id: 'cap-1',
      timeline_months: 3,
      investment: 'HIGH',
      roi: 'HIGH',
      category: 'Operations',
    } : null,
    isLoading: false,
  }),
}));

describe('QuickWinForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateQuickWin.mockResolvedValue({});
    mockUpdateQuickWin.mockResolvedValue({});
  });

  describe('rendering', () => {
    it('renders name input', () => {
      render(<QuickWinForm />);
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    });

    it('renders description textarea', () => {
      render(<QuickWinForm />);
      expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    });

    it('renders category select', () => {
      render(<QuickWinForm />);
      expect(screen.getByText('Category')).toBeInTheDocument();
    });

    it('renders capability select', () => {
      render(<QuickWinForm />);
      expect(screen.getByText('Related Capability')).toBeInTheDocument();
    });

    it('renders timeline input', () => {
      render(<QuickWinForm />);
      expect(screen.getByRole('spinbutton', { name: /timeline/i })).toBeInTheDocument();
    });

    it('renders investment select', () => {
      render(<QuickWinForm />);
      expect(screen.getByText('Investment Level')).toBeInTheDocument();
    });

    it('renders ROI select', () => {
      render(<QuickWinForm />);
      expect(screen.getByText('Expected ROI')).toBeInTheDocument();
    });

    it('shows "Create Quick Win" button for new item', () => {
      render(<QuickWinForm />);
      expect(screen.getByRole('button', { name: /Create Quick Win/i })).toBeInTheDocument();
    });
  });

  describe('editing mode', () => {
    it('shows "Update Quick Win" button when editing', () => {
      render(<QuickWinForm quickWinId="qw-1" />);
      expect(screen.getByRole('button', { name: /Update Quick Win/i })).toBeInTheDocument();
    });

    it('populates form with existing data when quickWin is provided', () => {
      const quickWin = {
        id: 'qw-1',
        name: 'Test Quick Win',
        description: 'Test description',
        capability_id: 'cap-1',
        timeline_months: 6,
        investment: 'LOW',
        roi: 'HIGH',
        category: 'Technology',
        status: 'not_started' as const,
        progress_percent: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      render(<QuickWinForm quickWin={quickWin} />);
      expect(screen.getByDisplayValue('Test Quick Win')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls createQuickWin when submitting new item', async () => {
      render(<QuickWinForm onSuccess={vi.fn()} />);

      const nameInput = screen.getByRole('textbox', { name: /name/i });
      fireEvent.change(nameInput, { target: { value: 'New Quick Win' } });

      const form = screen.getByRole('button', { name: /Create Quick Win/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockCreateQuickWin).toHaveBeenCalled();
      });
    });

    it('calls updateQuickWin when submitting existing item', async () => {
      const quickWin = {
        id: 'qw-1',
        name: 'Test',
        status: 'not_started' as const,
        progress_percent: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      render(<QuickWinForm quickWin={quickWin} onSuccess={vi.fn()} />);

      const nameInput = screen.getByRole('textbox', { name: /name/i });
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const form = screen.getByRole('button', { name: /Update Quick Win/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockUpdateQuickWin).toHaveBeenCalled();
      });
    });

    it('calls onSuccess after successful submission', async () => {
      const onSuccess = vi.fn();
      render(<QuickWinForm onSuccess={onSuccess} />);

      const nameInput = screen.getByRole('textbox', { name: /name/i });
      fireEvent.change(nameInput, { target: { value: 'New Quick Win' } });

      const form = screen.getByRole('button', { name: /Create Quick Win/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('cancel button', () => {
    it('renders cancel button when onCancel is provided', () => {
      render(<QuickWinForm onCancel={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('does not render cancel button when onCancel is not provided', () => {
      render(<QuickWinForm />);
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(<QuickWinForm onCancel={onCancel} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('input validation', () => {
    it('name input is required', () => {
      render(<QuickWinForm />);
      expect(screen.getByRole('textbox', { name: /name/i })).toBeRequired();
    });

    it('timeline has min value of 1', () => {
      render(<QuickWinForm />);
      expect(screen.getByRole('spinbutton', { name: /timeline/i })).toHaveAttribute('min', '1');
    });

    it('timeline has max value of 12', () => {
      render(<QuickWinForm />);
      expect(screen.getByRole('spinbutton', { name: /timeline/i })).toHaveAttribute('max', '12');
    });
  });
});
