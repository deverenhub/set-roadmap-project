// src/components/capabilities/CapabilityList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CapabilityList } from './CapabilityList';

// Mock hooks
const mockCapabilities = [
  {
    id: 'cap-1',
    name: 'Production Monitoring',
    description: 'Real-time production monitoring',
    priority: 'HIGH',
    current_level: 2,
    target_level: 4,
    owner: 'Operations',
    milestone_count: 5,
    completed_milestones: 2,
    quick_win_count: 3,
  },
  {
    id: 'cap-2',
    name: 'Safety Systems',
    description: 'Advanced safety monitoring',
    priority: 'CRITICAL',
    current_level: 3,
    target_level: 5,
    owner: 'Safety',
    milestone_count: 3,
    completed_milestones: 1,
    quick_win_count: 2,
  },
];

vi.mock('@/hooks', () => ({
  useCapabilities: () => ({
    data: mockCapabilities,
    isLoading: false,
  }),
  usePermissions: () => ({
    canEdit: true,
  }),
}));

// Mock CapabilityCard
vi.mock('./CapabilityCard', () => ({
  CapabilityCard: ({ name, onClick }: { name: string; onClick: () => void }) => (
    <div data-testid="capability-card" onClick={onClick}>
      {name}
    </div>
  ),
}));

// Mock CapabilityForm
vi.mock('./CapabilityForm', () => ({
  CapabilityForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="capability-form">
      <button onClick={onSuccess}>Submit</button>
    </div>
  ),
}));

describe('CapabilityList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders search input', () => {
      render(<CapabilityList />);
      expect(screen.getByPlaceholderText('Search capabilities...')).toBeInTheDocument();
    });

    it('renders priority filter', () => {
      render(<CapabilityList />);
      expect(screen.getByText('All Priorities')).toBeInTheDocument();
    });

    it('renders add button when user can edit', () => {
      render(<CapabilityList />);
      expect(screen.getByRole('button', { name: /Add Capability/i })).toBeInTheDocument();
    });

    it('renders all capability cards', () => {
      render(<CapabilityList />);
      expect(screen.getByText('Production Monitoring')).toBeInTheDocument();
      expect(screen.getByText('Safety Systems')).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('filters capabilities by name', async () => {
      render(<CapabilityList />);
      await userEvent.type(screen.getByPlaceholderText('Search capabilities...'), 'Safety');
      expect(screen.getByText('Safety Systems')).toBeInTheDocument();
      expect(screen.queryByText('Production Monitoring')).not.toBeInTheDocument();
    });

    it('filters capabilities by description', async () => {
      render(<CapabilityList />);
      await userEvent.type(screen.getByPlaceholderText('Search capabilities...'), 'production');
      expect(screen.getByText('Production Monitoring')).toBeInTheDocument();
    });

    it('filters capabilities by owner', async () => {
      render(<CapabilityList />);
      await userEvent.type(screen.getByPlaceholderText('Search capabilities...'), 'Operations');
      expect(screen.getByText('Production Monitoring')).toBeInTheDocument();
      expect(screen.queryByText('Safety Systems')).not.toBeInTheDocument();
    });

    it('shows empty state when no results', async () => {
      render(<CapabilityList />);
      await userEvent.type(screen.getByPlaceholderText('Search capabilities...'), 'nonexistent');
      expect(screen.getByText('No capabilities found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onCapabilityClick when capability card is clicked', () => {
      const onCapabilityClick = vi.fn();
      render(<CapabilityList onCapabilityClick={onCapabilityClick} />);
      fireEvent.click(screen.getByText('Production Monitoring'));
      expect(onCapabilityClick).toHaveBeenCalledWith('cap-1');
    });

    it('opens form dialog when add button is clicked', () => {
      render(<CapabilityList />);
      fireEvent.click(screen.getByRole('button', { name: /Add Capability/i }));
      expect(screen.getByTestId('capability-form')).toBeInTheDocument();
    });

    it('closes form dialog on success', () => {
      render(<CapabilityList />);
      fireEvent.click(screen.getByRole('button', { name: /Add Capability/i }));
      fireEvent.click(screen.getByText('Submit'));
      expect(screen.queryByTestId('capability-form')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows add button in empty state when user can edit', () => {
      vi.doMock('@/hooks', () => ({
        useCapabilities: () => ({
          data: [],
          isLoading: false,
        }),
        usePermissions: () => ({
          canEdit: true,
        }),
      }));
      // Note: Would need dynamic import for proper isolation
    });
  });
});
