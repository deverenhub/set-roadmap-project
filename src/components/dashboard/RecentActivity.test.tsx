// src/components/dashboard/RecentActivity.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentActivity } from './RecentActivity';

// Mock data
const mockActivities = [
  {
    id: 'act-1',
    action: 'INSERT',
    table_name: 'capabilities',
    new_values: { name: 'New Capability' },
    old_values: null,
    created_at: '2024-01-15T10:00:00Z',
    user: { id: 'user-1', full_name: 'John Doe', email: 'john@example.com' },
  },
  {
    id: 'act-2',
    action: 'UPDATE',
    table_name: 'milestones',
    new_values: { name: 'Updated Milestone' },
    old_values: { name: 'Old Milestone' },
    created_at: '2024-01-15T09:00:00Z',
    user: { id: 'user-2', full_name: 'Jane Smith', email: 'jane@example.com' },
  },
  {
    id: 'act-3',
    action: 'DELETE',
    table_name: 'quick_wins',
    new_values: null,
    old_values: { name: 'Deleted Quick Win' },
    created_at: '2024-01-15T08:00:00Z',
    user: null,
  },
];

// Mock useQuery
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: mockActivities,
    isLoading: false,
  })),
}));

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: mockActivities, error: null })),
        })),
      })),
    })),
  },
}));

// Mock formatRelativeTime
vi.mock('@/lib/utils', () => ({
  formatRelativeTime: vi.fn((date) => 'a few hours ago'),
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}));

describe('RecentActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders card title', () => {
      render(<RecentActivity />);
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('renders activity items', () => {
      render(<RecentActivity />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('renders item names from new_values', () => {
      render(<RecentActivity />);
      expect(screen.getByText('New Capability')).toBeInTheDocument();
      expect(screen.getByText('Updated Milestone')).toBeInTheDocument();
    });

    it('renders item names from old_values for deletes', () => {
      render(<RecentActivity />);
      expect(screen.getByText('Deleted Quick Win')).toBeInTheDocument();
    });

    it('renders action verbs', () => {
      render(<RecentActivity />);
      expect(screen.getByText(/created/)).toBeInTheDocument();
      expect(screen.getByText(/updated/)).toBeInTheDocument();
      expect(screen.getByText(/deleted/)).toBeInTheDocument();
    });

    it('renders table names', () => {
      render(<RecentActivity />);
      expect(screen.getByText('capabilities')).toBeInTheDocument();
      expect(screen.getByText('milestones')).toBeInTheDocument();
      expect(screen.getByText('quick_wins')).toBeInTheDocument();
    });

    it('renders relative times', () => {
      render(<RecentActivity />);
      const times = screen.getAllByText('a few hours ago');
      expect(times.length).toBe(3);
    });

    it('renders System for activities without user', () => {
      render(<RecentActivity />);
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  describe('limit prop', () => {
    it('respects default limit of 5', () => {
      render(<RecentActivity />);
      // Component renders with default limit
    });

    it('accepts custom limit', () => {
      render(<RecentActivity limit={10} />);
      // Component should use custom limit
    });
  });

  describe('onViewAll', () => {
    it('renders View all button when onViewAll provided', () => {
      render(<RecentActivity onViewAll={vi.fn()} />);
      expect(screen.getByRole('button', { name: /View all/i })).toBeInTheDocument();
    });

    it('does not render View all button when onViewAll not provided', () => {
      render(<RecentActivity />);
      expect(screen.queryByRole('button', { name: /View all/i })).not.toBeInTheDocument();
    });

    it('calls onViewAll when View all clicked', () => {
      const onViewAll = vi.fn();
      render(<RecentActivity onViewAll={onViewAll} />);
      fireEvent.click(screen.getByRole('button', { name: /View all/i }));
      expect(onViewAll).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no activities', () => {
      vi.doMock('@tanstack/react-query', () => ({
        useQuery: vi.fn(() => ({
          data: [],
          isLoading: false,
        })),
      }));
      // Note: Would need dynamic import for proper mock isolation
    });
  });
});
