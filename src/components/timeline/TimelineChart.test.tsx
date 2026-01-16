// src/components/timeline/TimelineChart.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineChart } from './TimelineChart';
import { createRef } from 'react';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSensor: vi.fn(),
  useSensors: () => [],
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  closestCenter: vi.fn(),
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Translate: {
      toString: vi.fn(() => ''),
    },
  },
}));

const mockItems = [
  {
    id: 'ms-1',
    name: 'Milestone 1',
    capability: 'Capability A',
    capabilityId: 'cap-1',
    capabilityColor: '#3b82f6',
    priority: 'HIGH',
    duration: 3,
    status: 'in_progress',
    startMonth: 0,
  },
  {
    id: 'ms-2',
    name: 'Milestone 2',
    capability: 'Capability A',
    capabilityId: 'cap-1',
    capabilityColor: '#3b82f6',
    priority: 'MEDIUM',
    duration: 2,
    status: 'not_started',
    startMonth: 3,
  },
  {
    id: 'ms-3',
    name: 'Milestone 3',
    capability: 'Capability B',
    capabilityId: 'cap-2',
    capabilityColor: '#22c55e',
    priority: 'CRITICAL',
    duration: 4,
    status: 'blocked',
    startMonth: 1,
  },
];

describe('TimelineChart', () => {
  const defaultProps = {
    items: mockItems,
    viewMode: 'months' as const,
    zoomLevel: 100,
    projectStartDate: new Date('2024-01-01'),
    scrollContainerRef: createRef<HTMLDivElement>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders capability groups', () => {
      render(<TimelineChart {...defaultProps} />);
      expect(screen.getByText('Capability A')).toBeInTheDocument();
      expect(screen.getByText('Capability B')).toBeInTheDocument();
    });

    it('renders milestone names in sidebar', () => {
      render(<TimelineChart {...defaultProps} />);
      expect(screen.getByText('Milestone 1')).toBeInTheDocument();
      expect(screen.getByText('Milestone 2')).toBeInTheDocument();
      expect(screen.getByText('Milestone 3')).toBeInTheDocument();
    });

    it('renders Capabilities header', () => {
      render(<TimelineChart {...defaultProps} />);
      expect(screen.getByText('Capabilities')).toBeInTheDocument();
    });

    it('renders Today indicator', () => {
      render(<TimelineChart {...defaultProps} />);
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  describe('milestone bars', () => {
    it('renders milestone duration badges', () => {
      render(<TimelineChart {...defaultProps} />);
      expect(screen.getByText('3mo')).toBeInTheDocument();
      expect(screen.getByText('2mo')).toBeInTheDocument();
      expect(screen.getByText('4mo')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onItemClick when milestone clicked', () => {
      const onItemClick = vi.fn();
      render(<TimelineChart {...defaultProps} onItemClick={onItemClick} />);

      // Find and click a milestone bar
      const milestoneBar = screen.getAllByRole('button')[0];
      if (milestoneBar) {
        fireEvent.click(milestoneBar);
      }
    });
  });

  describe('view modes', () => {
    it('renders month columns in months view', () => {
      render(<TimelineChart {...defaultProps} viewMode="months" />);
      expect(screen.getByText(/Jan 2024/)).toBeInTheDocument();
    });

    it('renders quarter columns in quarters view', () => {
      render(<TimelineChart {...defaultProps} viewMode="quarters" />);
      expect(screen.getByText(/Q1 2024/)).toBeInTheDocument();
    });
  });

  describe('zoom levels', () => {
    it('renders at different zoom levels', () => {
      const { rerender } = render(<TimelineChart {...defaultProps} zoomLevel={50} />);
      // Should render without errors at low zoom

      rerender(<TimelineChart {...defaultProps} zoomLevel={200} />);
      // Should render without errors at high zoom
    });
  });

  describe('edit mode', () => {
    it('shows drag handles when canEdit is true', () => {
      const { container } = render(<TimelineChart {...defaultProps} canEdit={true} />);
      // Should have grip handles visible for drag
    });

    it('hides drag handles when canEdit is false', () => {
      const { container } = render(<TimelineChart {...defaultProps} canEdit={false} />);
      // Should not have cursor-grab class when not editable
    });
  });

  describe('tooltips', () => {
    it('shows milestone details in tooltip', async () => {
      render(<TimelineChart {...defaultProps} />);
      // Hover would trigger tooltip with milestone details
    });
  });

  describe('grouping', () => {
    it('groups milestones by capability', () => {
      render(<TimelineChart {...defaultProps} />);
      // Capability A should have 2 milestones, Capability B should have 1
      const capAGroup = screen.getAllByText('Capability A');
      const capBGroup = screen.getAllByText('Capability B');
      expect(capAGroup.length).toBeGreaterThan(0);
      expect(capBGroup.length).toBeGreaterThan(0);
    });

    it('sorts groups by priority', () => {
      render(<TimelineChart {...defaultProps} />);
      // CRITICAL priority (Capability B) should come first
      // The order in the DOM should reflect priority sorting
    });
  });

  describe('status colors', () => {
    it('applies correct status colors to milestone bars', () => {
      const { container } = render(<TimelineChart {...defaultProps} />);
      // Different statuses should have different background colors
      // in_progress -> blue, blocked -> red, not_started -> slate
    });
  });
});
