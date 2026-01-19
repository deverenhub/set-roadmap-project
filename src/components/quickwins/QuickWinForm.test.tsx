// src/components/quickwins/QuickWinForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickWinForm } from './QuickWinForm';

// Mock hooks
const mockCreateQuickWin = vi.fn();
const mockUpdateQuickWin = vi.fn();

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
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useQuickWins', () => ({
  useQuickWin: () => ({
    data: null,
    isLoading: false,
  }),
}));

describe('QuickWinForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders name input', () => {
      render(<QuickWinForm />);
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    });

    it('renders description textarea', () => {
      render(<QuickWinForm />);
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    });

    it('renders category select', () => {
      render(<QuickWinForm />);
      expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
    });

    it('renders capability select', () => {
      render(<QuickWinForm />);
      expect(screen.getByLabelText(/Related Capability/)).toBeInTheDocument();
    });

    it('renders timeline input', () => {
      render(<QuickWinForm />);
      expect(screen.getByLabelText(/Timeline/)).toBeInTheDocument();
    });

    it('renders investment select', () => {
      render(<QuickWinForm />);
      expect(screen.getByLabelText(/Investment Level/)).toBeInTheDocument();
    });

    it('renders ROI select', () => {
      render(<QuickWinForm />);
      expect(screen.getByLabelText(/Expected ROI/)).toBeInTheDocument();
    });

    it('shows "Create Quick Win" button for new item', () => {
      render(<QuickWinForm />);
      expect(screen.getByRole('button', { name: /Create Quick Win/i })).toBeInTheDocument();
    });
  });

  describe('editing mode', () => {
    const existingQuickWin = {
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
      order: 0,
      facility_id: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('shows "Update Quick Win" button when editing', () => {
      render(<QuickWinForm quickWin={existingQuickWin} />);
      expect(screen.getByRole('button', { name: /Update Quick Win/i })).toBeInTheDocument();
    });

    it('populates name field with existing data', () => {
      render(<QuickWinForm quickWin={existingQuickWin} />);
      expect(screen.getByDisplayValue('Test Quick Win')).toBeInTheDocument();
    });

    it('populates description field with existing data', () => {
      render(<QuickWinForm quickWin={existingQuickWin} />);
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls createQuickWin when submitting new item', async () => {
      render(<QuickWinForm onSuccess={vi.fn()} />);

      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'New Quick Win' } });
      fireEvent.submit(screen.getByRole('button', { name: /Create Quick Win/i }).closest('form')!);

      await waitFor(() => {
        expect(mockCreateQuickWin).toHaveBeenCalled();
      });
    });

    it('calls updateQuickWin when submitting existing item', async () => {
      const quickWin = {
        id: 'qw-1',
        name: 'Test',
        description: null,
        capability_id: null,
        timeline_months: 3,
        investment: null,
        roi: null,
        category: null,
        status: 'not_started' as const,
        progress_percent: 0,
        order: 0,
        facility_id: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      render(<QuickWinForm quickWin={quickWin} onSuccess={vi.fn()} />);

      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Updated Name' } });
      fireEvent.submit(screen.getByRole('button', { name: /Update Quick Win/i }).closest('form')!);

      await waitFor(() => {
        expect(mockUpdateQuickWin).toHaveBeenCalled();
      });
    });

    it('calls onSuccess after successful submission', async () => {
      const onSuccess = vi.fn();
      render(<QuickWinForm onSuccess={onSuccess} />);

      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'New Quick Win' } });
      fireEvent.submit(screen.getByRole('button', { name: /Create Quick Win/i }).closest('form')!);

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
      expect(screen.getByLabelText(/Name/)).toBeRequired();
    });
  });
});
