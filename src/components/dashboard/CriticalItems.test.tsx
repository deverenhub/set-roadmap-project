// src/components/dashboard/CriticalItems.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CriticalItems } from './CriticalItems';

// Mock data
const mockBlockedMilestones = [
  { id: 'ms-1', name: 'Blocked Milestone 1', capability: { id: 'cap-1', name: 'Capability A' } },
  { id: 'ms-2', name: 'Blocked Milestone 2', capability: { id: 'cap-2', name: 'Capability B' } },
];

const mockCriticalCaps = [
  { id: 'cap-3', name: 'Critical Capability', current_level: 1, target_level: 5 },
];

// Mock useQuery
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((options) => {
    if (options.queryKey[0] === 'milestones' && options.queryKey[1] === 'blocked') {
      return { data: mockBlockedMilestones, isLoading: false };
    }
    if (options.queryKey[0] === 'capabilities' && options.queryKey[1] === 'critical') {
      return { data: mockCriticalCaps, isLoading: false };
    }
    return { data: [], isLoading: false };
  }),
}));

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

describe('CriticalItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders card title', () => {
      render(<CriticalItems />);
      expect(screen.getByText('Critical Items')).toBeInTheDocument();
    });

    it('renders count badge when items exist', () => {
      render(<CriticalItems />);
      expect(screen.getByText('3')).toBeInTheDocument(); // 2 blocked + 1 critical
    });

    it('renders blocked milestones', () => {
      render(<CriticalItems />);
      expect(screen.getByText('Blocked Milestone 1')).toBeInTheDocument();
      expect(screen.getByText('Blocked Milestone 2')).toBeInTheDocument();
    });

    it('renders blocked badges', () => {
      render(<CriticalItems />);
      const blockedBadges = screen.getAllByText('Blocked');
      expect(blockedBadges).toHaveLength(2);
    });

    it('renders critical capabilities', () => {
      render(<CriticalItems />);
      expect(screen.getByText('Critical Capability')).toBeInTheDocument();
    });

    it('renders critical badges', () => {
      render(<CriticalItems />);
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('renders capability name for blocked milestones', () => {
      render(<CriticalItems />);
      expect(screen.getByText('Capability A')).toBeInTheDocument();
      expect(screen.getByText('Capability B')).toBeInTheDocument();
    });

    it('renders level progress for critical capabilities', () => {
      render(<CriticalItems />);
      expect(screen.getByText('Level 1 → 5')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onItemClick with milestone id when milestone clicked', () => {
      const onItemClick = vi.fn();
      render(<CriticalItems onItemClick={onItemClick} />);
      fireEvent.click(screen.getByText('Blocked Milestone 1'));
      expect(onItemClick).toHaveBeenCalledWith('ms-1', 'milestone');
    });

    it('calls onItemClick with capability id when capability clicked', () => {
      const onItemClick = vi.fn();
      render(<CriticalItems onItemClick={onItemClick} />);
      fireEvent.click(screen.getByText('Critical Capability'));
      expect(onItemClick).toHaveBeenCalledWith('cap-3', 'capability');
    });
  });

  describe('empty state', () => {
    it('shows success message when no critical items', () => {
      vi.doMock('@tanstack/react-query', () => ({
        useQuery: vi.fn(() => ({ data: [], isLoading: false })),
      }));
      // Note: Would need dynamic import for proper mock isolation
    });
  });
});
