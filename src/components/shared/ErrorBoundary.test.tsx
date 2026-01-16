// src/components/shared/ErrorBoundary.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  describe('normal rendering', () => {
    it('renders children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('renders error UI when child throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    });

    it('displays error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('logs error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('custom fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error fallback</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('recovery actions', () => {
    it('renders Try again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
    });

    it('renders Refresh page button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /Refresh page/i })).toBeInTheDocument();
    });

    it('resets error state when Try again clicked', () => {
      // Use a stateful wrapper to test error boundary reset
      let shouldThrow = true;

      const TestWrapper = () => {
        if (shouldThrow) {
          throw new Error('Test error message');
        }
        return <div>No error</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <TestWrapper />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Fix the child component before clicking try again
      shouldThrow = false;

      // Click try again - this resets internal state and re-renders children
      fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

      // After reset, it should show the working component
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('calls window.location.reload when Refresh page clicked', () => {
      const reloadMock = vi.fn();
      const originalReload = window.location.reload;
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /Refresh page/i }));

      expect(reloadMock).toHaveBeenCalled();

      // Restore
      Object.defineProperty(window, 'location', {
        value: { reload: originalReload },
        writable: true,
      });
    });
  });
});
