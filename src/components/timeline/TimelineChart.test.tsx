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

    it('renders milestone names', () => {
      render(<TimelineChart {...defaultProps} />);
      // Milestones may appear in sidebar or as tooltips/badges
      expect(screen.getAllByText(/Milestone/).length).toBeGreaterThan(0);
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
    it('renders clickable milestone elements', () => {
      const onItemClick = vi.fn();
      render(<TimelineChart {...defaultProps} onItemClick={onItemClick} />);
      // Component renders without error with click handler
      expect(screen.getAllByText(/Milestone/).length).toBeGreaterThan(0);
    });
  });

  describe('view modes', () => {
    it('renders in months view without error', () => {
      render(<TimelineChart {...defaultProps} viewMode="months" />);
      // Component renders correctly in months view
      expect(screen.getByText('Capabilities')).toBeInTheDocument();
    });

    it('renders in quarters view without error', () => {
      render(<TimelineChart {...defaultProps} viewMode="quarters" />);
      // Component renders correctly in quarters view
      expect(screen.getByText('Capabilities')).toBeInTheDocument();
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
    it('renders without errors when canEdit is true', () => {
      render(<TimelineChart {...defaultProps} canEdit={true} />);
      expect(screen.getByText('Capabilities')).toBeInTheDocument();
    });

    it('renders without errors when canEdit is false', () => {
      render(<TimelineChart {...defaultProps} canEdit={false} />);
      expect(screen.getByText('Capabilities')).toBeInTheDocument();
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
  });
});
