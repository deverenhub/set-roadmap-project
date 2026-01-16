// src/components/shared/ConfirmDialog.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders dialog when open', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<ConfirmDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    });

    it('renders default button texts', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('renders custom button texts', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          confirmText="Delete"
          cancelText="Keep"
        />
      );
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Keep/i })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onConfirm when confirm button clicked', async () => {
      const onConfirm = vi.fn();
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });

    it('calls onOpenChange with false when cancel clicked', () => {
      const onOpenChange = vi.fn();
      render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes dialog after confirm', async () => {
      const onOpenChange = vi.fn();
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(
        <ConfirmDialog
          {...defaultProps}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('handles async onConfirm', async () => {
      const onConfirm = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });
  });

  describe('loading state', () => {
    it('disables buttons when loading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
    });
  });

  describe('variants', () => {
    it('applies destructive variant to confirm button', () => {
      render(<ConfirmDialog {...defaultProps} variant="destructive" />);
      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      expect(confirmButton).toHaveClass('bg-destructive');
    });

    it('applies default variant by default', () => {
      render(<ConfirmDialog {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      expect(confirmButton).not.toHaveClass('bg-destructive');
    });
  });
});
