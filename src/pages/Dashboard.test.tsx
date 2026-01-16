// src/pages/Dashboard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import Dashboard from './Dashboard';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock api
vi.mock('@/lib/api', () => ({
  fetchDashboardKPIs: vi.fn().mockResolvedValue({
    overallProgress: 65,
    activeMilestones: 8,
    completedQuickWins: 12,
    totalQuickWins: 20,
    criticalCapabilities: 3,
    blockedMilestones: 2,
  }),
}));

// Mock hooks
vi.mock('@/hooks', () => ({
  useCapabilities: () => ({
    data: [
      { id: 'cap-1', name: 'Capability 1', priority: 'HIGH', current_level: 2, target_level: 4 },
      { id: 'cap-2', name: 'Capability 2', priority: 'CRITICAL', current_level: 3, target_level: 5 },
    ],
    isLoading: false,
  }),
}));

// Mock preferences store
const defaultWidgets = [
  { id: 'kpi-progress', visible: true, order: 0 },
  { id: 'kpi-milestones', visible: true, order: 1 },
  { id: 'kpi-quickwins', visible: true, order: 2 },
  { id: 'kpi-critical', visible: true, order: 3 },
  { id: 'capability-progress', visible: true, order: 4 },
  { id: 'overall-maturity', visible: true, order: 5 },
  { id: 'recent-activity', visible: true, order: 6 },
  { id: 'critical-items', visible: true, order: 7 },
];

vi.mock('@/stores/preferencesStore', () => ({
  usePreferencesStore: (selector: (state: any) => any) => {
    const state = {
      preferences: {
        dashboardWidgets: defaultWidgets,
        dashboardRefreshInterval: 0,
      },
    };
    return selector(state);
  },
}));

// Mock dashboard components
vi.mock('@/components/dashboard', () => ({
  KPICard: ({
    title,
    value,
    subtitle,
    isLoading,
    onClick,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon?: any;
    isLoading?: boolean;
    onClick?: () => void;
    trend?: any;
  }) => (
    <div data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, '-')}`} onClick={onClick}>
      <span data-testid="kpi-title">{title}</span>
      <span data-testid="kpi-value">{value}</span>
      <span data-testid="kpi-subtitle">{subtitle}</span>
    </div>
  ),
  ProgressRing: ({ value, label }: { value: number; size?: number; color?: string; label?: string }) => (
    <div data-testid="progress-ring" data-value={value}>
      <span>{value}%</span>
      {label && <span>{label}</span>}
    </div>
  ),
  RecentActivity: ({ limit }: { limit?: number }) => (
    <div data-testid="recent-activity" data-limit={limit}>Recent Activity</div>
  ),
  CriticalItems: ({ onItemClick }: { onItemClick: (id: string, type: 'capability' | 'milestone') => void }) => (
    <div data-testid="critical-items">
      <button onClick={() => onItemClick('cap-1', 'capability')}>Cap Item</button>
    </div>
  ),
  QoLImpactChart: ({ limit }: { limit?: number }) => (
    <div data-testid="qol-impact-chart" data-limit={limit}>QoL Impact</div>
  ),
  DashboardCustomizer: ({ trigger }: { trigger?: React.ReactNode }) => (
    trigger || <button data-testid="customize-button">Customize</button>
  ),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(MemoryRouter, null, children)
      );
  };

  describe('rendering', () => {
    it('renders page title', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    });

    it('renders page description', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByText('Overview of your VPC Operations Transformation')).toBeInTheDocument();
    });

    it('renders customize button', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('customize-button')).toBeInTheDocument();
    });
  });

  describe('KPI cards', () => {
    it('renders overall progress KPI', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('kpi-overall-progress')).toBeInTheDocument();
    });

    it('renders active milestones KPI', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('kpi-active-milestones')).toBeInTheDocument();
    });

    it('renders quick wins KPI', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('kpi-quick-wins')).toBeInTheDocument();
    });

    it('renders critical items KPI', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('kpi-critical-items')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('navigates to capabilities when overall progress KPI is clicked', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByTestId('kpi-overall-progress'));
      expect(mockNavigate).toHaveBeenCalledWith('/capabilities');
    });

    it('navigates to timeline when active milestones KPI is clicked', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByTestId('kpi-active-milestones'));
      expect(mockNavigate).toHaveBeenCalledWith('/timeline');
    });

    it('navigates to quick-wins when quick wins KPI is clicked', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByTestId('kpi-quick-wins'));
      expect(mockNavigate).toHaveBeenCalledWith('/quick-wins');
    });

    it('navigates to capability detail when critical item is clicked', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByText('Cap Item'));
      expect(mockNavigate).toHaveBeenCalledWith('/capabilities/cap-1');
    });
  });

  describe('widgets', () => {
    it('renders progress ring', async () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByTestId('progress-ring')).toBeInTheDocument();
      });
    });

    it('renders recent activity widget', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('recent-activity')).toBeInTheDocument();
    });

    it('renders critical items widget', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByTestId('critical-items')).toBeInTheDocument();
    });
  });

  describe('capability progress', () => {
    it('renders capability progress card', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByText('Capability Progress')).toBeInTheDocument();
    });

    it('renders capability names', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByText('Capability 1')).toBeInTheDocument();
      expect(screen.getByText('Capability 2')).toBeInTheDocument();
    });

    it('renders capability priority badges', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    });

    it('navigates to capability detail when capability row is clicked', () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByText('Capability 1').closest('.cursor-pointer')!);
      expect(mockNavigate).toHaveBeenCalledWith('/capabilities/cap-1');
    });
  });

  describe('overall maturity', () => {
    it('renders overall maturity card', async () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByText('Overall Maturity')).toBeInTheDocument();
      });
    });

    it('renders critical capabilities count message', async () => {
      render(<Dashboard />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByText(/critical capabilities/)).toBeInTheDocument();
      });
    });
  });
});

// Note: Additional Dashboard tests with different widget configurations
// would require module re-import to properly test different preference states
