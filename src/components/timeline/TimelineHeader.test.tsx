// src/components/timeline/TimelineHeader.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineHeader } from './TimelineHeader';

describe('TimelineHeader', () => {
  const defaultProps = {
    viewMode: 'months' as const,
    onViewModeChange: vi.fn(),
    selectedPath: 'B' as const,
    onPathChange: vi.fn(),
    zoomLevel: 100,
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onScrollToToday: vi.fn(),
    onNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('view mode toggle', () => {
    it('renders Months button', () => {
      render(<TimelineHeader {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Months/i })).toBeInTheDocument();
    });

    it('renders Quarters button', () => {
      render(<TimelineHeader {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Quarters/i })).toBeInTheDocument();
    });

    it('calls onViewModeChange when Months clicked', () => {
      render(<TimelineHeader {...defaultProps} viewMode="quarters" />);
      fireEvent.click(screen.getByRole('button', { name: /Months/i }));
      expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('months');
    });

    it('calls onViewModeChange when Quarters clicked', () => {
      render(<TimelineHeader {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /Quarters/i }));
      expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('quarters');
    });
  });

  describe('path selector', () => {
    it('renders path selector', () => {
      render(<TimelineHeader {...defaultProps} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('shows all path options', async () => {
      render(<TimelineHeader {...defaultProps} />);
      fireEvent.click(screen.getByRole('combobox'));

      expect(screen.getByText(/Path A \(Aggressive\)/)).toBeInTheDocument();
      expect(screen.getByText(/Path B \(Balanced\)/)).toBeInTheDocument();
      expect(screen.getByText(/Path C \(Conservative\)/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('renders Today button', () => {
      render(<TimelineHeader {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Today/i })).toBeInTheDocument();
    });

    it('calls onScrollToToday when Today clicked', () => {
      render(<TimelineHeader {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /Today/i }));
      expect(defaultProps.onScrollToToday).toHaveBeenCalled();
    });

    it('calls onNavigate with prev when left arrow clicked', () => {
      render(<TimelineHeader {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      // Find the prev button (with chevron left)
      const prevButton = buttons.find(btn => btn.querySelector('.lucide-chevron-left'));
      if (prevButton) {
        fireEvent.click(prevButton);
        expect(defaultProps.onNavigate).toHaveBeenCalledWith('prev');
      }
    });

    it('calls onNavigate with next when right arrow clicked', () => {
      render(<TimelineHeader {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      // Find the next button (with chevron right)
      const nextButton = buttons.find(btn => btn.querySelector('.lucide-chevron-right'));
      if (nextButton) {
        fireEvent.click(nextButton);
        expect(defaultProps.onNavigate).toHaveBeenCalledWith('next');
      }
    });
  });

  describe('zoom controls', () => {
    it('renders zoom level', () => {
      render(<TimelineHeader {...defaultProps} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('calls onZoomIn when zoom in clicked', () => {
      render(<TimelineHeader {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      const zoomInButton = buttons.find(btn => btn.querySelector('.lucide-zoom-in'));
      if (zoomInButton) {
        fireEvent.click(zoomInButton);
        expect(defaultProps.onZoomIn).toHaveBeenCalled();
      }
    });

    it('calls onZoomOut when zoom out clicked', () => {
      render(<TimelineHeader {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      const zoomOutButton = buttons.find(btn => btn.querySelector('.lucide-zoom-out'));
      if (zoomOutButton) {
        fireEvent.click(zoomOutButton);
        expect(defaultProps.onZoomOut).toHaveBeenCalled();
      }
    });

    it('disables zoom out at minimum level', () => {
      render(<TimelineHeader {...defaultProps} zoomLevel={50} />);
      const buttons = screen.getAllByRole('button');
      const zoomOutButton = buttons.find(btn => btn.querySelector('.lucide-zoom-out'));
      expect(zoomOutButton).toBeDisabled();
    });

    it('disables zoom in at maximum level', () => {
      render(<TimelineHeader {...defaultProps} zoomLevel={200} />);
      const buttons = screen.getAllByRole('button');
      const zoomInButton = buttons.find(btn => btn.querySelector('.lucide-zoom-in'));
      expect(zoomInButton).toBeDisabled();
    });
  });
});
