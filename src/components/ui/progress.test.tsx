// src/components/ui/progress.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './progress';

describe('Progress', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<Progress data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('applies default classes', () => {
      render(<Progress data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('relative', 'h-4', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary');
    });

    it('applies custom className', () => {
      render(<Progress className="custom-class" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Progress ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it('passes through additional props', () => {
      render(<Progress data-testid="progress" aria-label="Loading progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-label', 'Loading progress');
    });
  });

  describe('value calculations', () => {
    it('defaults to 0% when no value provided', () => {
      render(<Progress data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('shows correct transform for 0%', () => {
      render(<Progress value={0} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('shows correct transform for 50%', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });

    it('shows correct transform for 100%', () => {
      render(<Progress value={100} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
    });

    it('shows correct transform for 25%', () => {
      render(<Progress value={25} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-75%)' });
    });

    it('shows correct transform for 75%', () => {
      render(<Progress value={75} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' });
    });
  });

  describe('custom max', () => {
    it('calculates percentage with custom max', () => {
      render(<Progress value={50} max={200} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      // 50/200 = 25%
      expect(indicator).toHaveStyle({ transform: 'translateX(-75%)' });
    });

    it('handles max of 50 correctly', () => {
      render(<Progress value={25} max={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      // 25/50 = 50%
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });
  });

  describe('edge cases', () => {
    it('clamps value above 100%', () => {
      render(<Progress value={150} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
    });

    it('clamps negative values to 0%', () => {
      render(<Progress value={-50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('handles decimal values', () => {
      render(<Progress value={33.33} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-66.67%)' });
    });
  });

  describe('indicator element', () => {
    it('has the indicator element', () => {
      render(<Progress data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress.children).toHaveLength(1);
    });

    it('indicator has correct classes', () => {
      render(<Progress data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveClass('h-full', 'w-full', 'flex-1', 'bg-primary', 'transition-all');
    });
  });
});
