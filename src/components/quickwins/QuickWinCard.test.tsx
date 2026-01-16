// src/components/quickwins/QuickWinCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickWinCard } from './QuickWinCard';

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const mockItem = {
  id: 'qw-1',
  name: 'Test Quick Win',
  description: 'A test description',
  timeline_months: 3,
  investment: 'MEDIUM',
  roi: 'HIGH',
  progress_percent: 50,
  category: 'Operations',
  capability: { name: 'Test Capability' },
};

describe('QuickWinCard', () => {
  describe('rendering', () => {
    it('renders name', () => {
      render(<QuickWinCard item={mockItem} />);
      expect(screen.getByText('Test Quick Win')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<QuickWinCard item={mockItem} />);
      expect(screen.getByText('A test description')).toBeInTheDocument();
    });

    it('renders timeline', () => {
      render(<QuickWinCard item={mockItem} />);
      expect(screen.getByText('3mo')).toBeInTheDocument();
    });

    it('renders investment badge', () => {
      render(<QuickWinCard item={mockItem} />);
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });

    it('renders ROI', () => {
      render(<QuickWinCard item={mockItem} />);
      expect(screen.getByText('HIGH ROI')).toBeInTheDocument();
    });

    it('renders category badge', () => {
      render(<QuickWinCard item={mockItem} />);
      expect(screen.getByText('Operations')).toBeInTheDocument();
    });

    it('renders capability name', () => {
      render(<QuickWinCard item={mockItem} />);
      expect(screen.getByText('Test Capability')).toBeInTheDocument();
    });

    it('renders progress bar when progress > 0', () => {
      const { container } = render(<QuickWinCard item={mockItem} />);
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });
  });

  describe('optional fields', () => {
    it('does not render description when not provided', () => {
      const item = { ...mockItem, description: undefined };
      render(<QuickWinCard item={item} />);
      expect(screen.queryByText('A test description')).not.toBeInTheDocument();
    });

    it('does not render timeline when not provided', () => {
      const item = { ...mockItem, timeline_months: undefined };
      render(<QuickWinCard item={item} />);
      expect(screen.queryByText('3mo')).not.toBeInTheDocument();
    });

    it('does not render progress bar when progress is 0', () => {
      const item = { ...mockItem, progress_percent: 0 };
      const { container } = render(<QuickWinCard item={item} />);
      expect(container.querySelector('[role="progressbar"]')).not.toBeInTheDocument();
    });

    it('does not render capability when not provided', () => {
      const item = { ...mockItem, capability: null };
      render(<QuickWinCard item={item} />);
      expect(screen.queryByText('Test Capability')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onClick when card is clicked', () => {
      const onClick = vi.fn();
      render(<QuickWinCard item={mockItem} onClick={onClick} />);
      fireEvent.click(screen.getByText('Test Quick Win'));
      expect(onClick).toHaveBeenCalled();
    });

    it('renders drag handle when not readOnly', () => {
      const { container } = render(<QuickWinCard item={mockItem} />);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('does not render drag handle when readOnly', () => {
      const { container } = render(<QuickWinCard item={mockItem} readOnly />);
      // The only elements should be non-interactive
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });
  });

  describe('investment colors', () => {
    it('applies green style for LOW investment', () => {
      const item = { ...mockItem, investment: 'LOW' };
      render(<QuickWinCard item={item} />);
      const badge = screen.getByText('LOW');
      expect(badge).toHaveClass('bg-green-100');
    });

    it('applies yellow style for MEDIUM investment', () => {
      render(<QuickWinCard item={mockItem} />);
      const badge = screen.getByText('MEDIUM');
      expect(badge).toHaveClass('bg-yellow-100');
    });

    it('applies red style for HIGH investment', () => {
      const item = { ...mockItem, investment: 'HIGH' };
      render(<QuickWinCard item={item} />);
      const badge = screen.getByText('HIGH');
      expect(badge).toHaveClass('bg-red-100');
    });
  });

  describe('ROI colors', () => {
    it('applies green style for HIGH ROI', () => {
      render(<QuickWinCard item={mockItem} />);
      const roiElement = screen.getByText('HIGH ROI').closest('div');
      expect(roiElement).toHaveClass('text-green-500');
    });

    it('applies blue style for MEDIUM ROI', () => {
      const item = { ...mockItem, roi: 'MEDIUM' };
      render(<QuickWinCard item={item} />);
      const roiElement = screen.getByText('MEDIUM ROI').closest('div');
      expect(roiElement).toHaveClass('text-blue-500');
    });

    it('applies slate style for LOW ROI', () => {
      const item = { ...mockItem, roi: 'LOW' };
      render(<QuickWinCard item={item} />);
      const roiElement = screen.getByText('LOW ROI').closest('div');
      expect(roiElement).toHaveClass('text-slate-500');
    });
  });

  describe('dragging state', () => {
    it('applies dragging styles when isDragging', () => {
      const { container } = render(<QuickWinCard item={mockItem} isDragging />);
      const card = container.querySelector('.opacity-50');
      expect(card).toBeInTheDocument();
    });
  });
});
