// src/components/dashboard/DashboardCustomizer.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardCustomizer } from './DashboardCustomizer';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: () => [],
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: vi.fn((arr, from, to) => arr),
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: {},
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}));

// Mock preferences store
const mockWidgets = [
  { id: 'kpi-progress', name: 'KPI Progress', description: 'Shows progress', size: 'medium', visible: true, order: 0 },
  { id: 'kpi-milestones', name: 'Milestones', description: 'Shows milestones', size: 'small', visible: true, order: 1 },
  { id: 'recent-activity', name: 'Recent Activity', description: 'Shows activity', size: 'large', visible: false, order: 2 },
];

const mockUpdateWidgetOrder = vi.fn();
const mockUpdateWidgetVisibility = vi.fn();
const mockResetDashboardWidgets = vi.fn();

vi.mock('@/stores/preferencesStore', () => ({
  usePreferencesStore: Object.assign(
    (selector: (state: any) => any) => {
      const state = {
        preferences: { dashboardWidgets: mockWidgets },
        updateWidgetOrder: mockUpdateWidgetOrder,
        updateWidgetVisibility: mockUpdateWidgetVisibility,
        resetDashboardWidgets: mockResetDashboardWidgets,
      };
      return selector(state);
    },
    {
      getState: () => ({
        preferences: { dashboardWidgets: mockWidgets },
      }),
    }
  ),
}));

describe('DashboardCustomizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders default trigger button', () => {
      render(<DashboardCustomizer />);
      expect(screen.getByRole('button', { name: /Customize/i })).toBeInTheDocument();
    });

    it('renders custom trigger when provided', () => {
      render(<DashboardCustomizer trigger={<button>Custom Trigger</button>} />);
      expect(screen.getByRole('button', { name: /Custom Trigger/i })).toBeInTheDocument();
    });
  });

  describe('dialog', () => {
    it('opens dialog when trigger clicked', () => {
      render(<DashboardCustomizer />);
      fireEvent.click(screen.getByRole('button', { name: /Customize/i }));
      expect(screen.getByText('Customize Dashboard')).toBeInTheDocument();
    });

    it('shows widget list in dialog', () => {
      render(<DashboardCustomizer />);
      fireEvent.click(screen.getByRole('button', { name: /Customize/i }));
      expect(screen.getByText('KPI Progress')).toBeInTheDocument();
      expect(screen.getByText('Milestones')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('shows visible count', () => {
      render(<DashboardCustomizer />);
      fireEvent.click(screen.getByRole('button', { name: /Customize/i }));
      expect(screen.getByText('2 of 3 widgets visible')).toBeInTheDocument();
    });

    it('shows Save and Cancel buttons', () => {
      render(<DashboardCustomizer />);
      fireEvent.click(screen.getByRole('button', { name: /Customize/i }));
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('shows Reset to Default button', () => {
      render(<DashboardCustomizer />);
      fireEvent.click(screen.getByRole('button', { name: /Customize/i }));
      expect(screen.getByRole('button', { name: /Reset to Default/i })).toBeInTheDocument();
    });
  });

  describe('widget items', () => {
    it('shows widget descriptions', () => {
      render(<DashboardCustomizer />);
      fireEvent.click(screen.getByRole('button', { name: /Customize/i }));
      expect(screen.getByText('Shows progress')).toBeInTheDocument();
      expect(screen.getByText('Shows milestones')).toBeInTheDocument();
    });

    it('shows widget sizes', () => {
      render(<DashboardCustomizer />);
      fireEvent.click(screen.getByRole('button', { name: /Customize/i }));
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('small')).toBeInTheDocument();
      expect(screen.getByText('large')).toBeInTheDocument();
    });

    it('renders visibility switches', () => {
      render(<DashboardCustomizer />);
      fireEvent.click(screen.getByRole('button', { name: /Customize/i }));
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBe(3);
    });
  });

  describe('actions', () => {
    it('calls updateWidgetOrder when Save clicked', () => {
      render(<DashboardCustomizer />);
      fireEvent.click(screen.getByRole('button', { name: /Customize/i }));
      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
      expect(mockUpdateWidgetOrder).toHaveBeenCalled();
    });

    it('closes dialog when Cancel clicked', () => {
      render(<DashboardCustomizer />);
      fireEvent.click(screen.getByRole('button', { name: /Customize/i }));
      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
      expect(screen.queryByText('Customize Dashboard')).not.toBeInTheDocument();
    });

    it('calls resetDashboardWidgets when Reset clicked', () => {
      render(<DashboardCustomizer />);
      fireEvent.click(screen.getByRole('button', { name: /Customize/i }));
      fireEvent.click(screen.getByRole('button', { name: /Reset to Default/i }));
      expect(mockResetDashboardWidgets).toHaveBeenCalled();
    });
  });
});
