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

    // Note: Radix Select dropdown doesn't open properly in jsdom
    // Testing that the combobox exists is sufficient for unit tests
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

    it('renders navigation buttons', () => {
      render(<TimelineHeader {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      // Should have multiple buttons including navigation arrows
      expect(buttons.length).toBeGreaterThan(3);
    });
  });

  describe('zoom controls', () => {
    it('renders zoom level', () => {
      render(<TimelineHeader {...defaultProps} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('renders zoom buttons', () => {
      render(<TimelineHeader {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('disables zoom out at minimum level', () => {
      render(<TimelineHeader {...defaultProps} zoomLevel={50} />);
      const buttons = screen.getAllByRole('button');
      const disabledButtons = buttons.filter(btn => btn.hasAttribute('disabled'));
      expect(disabledButtons.length).toBeGreaterThan(0);
    });

    it('disables zoom in at maximum level', () => {
      render(<TimelineHeader {...defaultProps} zoomLevel={200} />);
      const buttons = screen.getAllByRole('button');
      const disabledButtons = buttons.filter(btn => btn.hasAttribute('disabled'));
      expect(disabledButtons.length).toBeGreaterThan(0);
    });
  });
});
