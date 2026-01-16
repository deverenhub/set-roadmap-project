// src/components/search/GlobalSearch.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalSearch } from './GlobalSearch';

// Mock scrollIntoView for cmdk
Element.prototype.scrollIntoView = vi.fn();

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock search results
const mockSetQuery = vi.fn();
const mockClearSearch = vi.fn();

const emptyResults = {
  capabilities: [],
  milestones: [],
  quickWins: [],
};

const mockCapabilityResults = [
  {
    id: 'cap-1',
    type: 'capability' as const,
    name: 'Planning & Scheduling',
    description: 'Resource planning capabilities',
    priority: 'CRITICAL',
    path: '/capabilities?id=cap-1',
  },
  {
    id: 'cap-2',
    type: 'capability' as const,
    name: 'Inventory Management',
    description: 'Track and manage inventory',
    priority: 'HIGH',
    path: '/capabilities?id=cap-2',
  },
];

const mockMilestoneResults = [
  {
    id: 'ms-1',
    type: 'milestone' as const,
    name: 'AI Optimization',
    description: 'Implement AI-driven optimization',
    status: 'in_progress',
    path: '/timeline?milestone=ms-1',
  },
  {
    id: 'ms-2',
    type: 'milestone' as const,
    name: 'Basic Capacity Understanding',
    description: 'Understand current capacity',
    status: 'completed',
    path: '/timeline?milestone=ms-2',
  },
];

const mockQuickWinResults = [
  {
    id: 'qw-1',
    type: 'quick_win' as const,
    name: 'Dashboard Widgets',
    description: 'Add customizable dashboard widgets',
    status: 'completed',
    path: '/quick-wins?id=qw-1',
  },
];

// Default mock state
let mockSearchState = {
  query: '',
  setQuery: mockSetQuery,
  groupedResults: emptyResults,
  clearSearch: mockClearSearch,
  totalResults: 0,
};

vi.mock('@/hooks/useGlobalSearch', () => ({
  useGlobalSearch: () => mockSearchState,
}));

describe('GlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchState = {
      query: '',
      setQuery: mockSetQuery,
      groupedResults: emptyResults,
      clearSearch: mockClearSearch,
      totalResults: 0,
    };
  });

  describe('Search Button', () => {
    it('renders the search button', () => {
      render(<GlobalSearch />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('displays "Search..." text on larger screens', () => {
      render(<GlobalSearch />);

      expect(screen.getByText('Search...')).toBeInTheDocument();
    });

    it('shows keyboard shortcut indicator', () => {
      render(<GlobalSearch />);

      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<GlobalSearch className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Dialog Opening', () => {
    it('opens dialog when button is clicked', async () => {
      render(<GlobalSearch />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search capabilities, milestones, quick wins...')).toBeInTheDocument();
      });
    });

    it('opens dialog with Cmd+K keyboard shortcut', async () => {
      render(<GlobalSearch />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search capabilities, milestones, quick wins...')).toBeInTheDocument();
      });
    });

    it('opens dialog with Ctrl+K keyboard shortcut', async () => {
      render(<GlobalSearch />);

      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search capabilities, milestones, quick wins...')).toBeInTheDocument();
      });
    });

    it('toggles dialog with repeated Cmd+K', async () => {
      render(<GlobalSearch />);

      // Open
      fireEvent.keyDown(document, { key: 'k', metaKey: true });
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search capabilities, milestones, quick wins...')).toBeInTheDocument();
      });

      // Close
      fireEvent.keyDown(document, { key: 'k', metaKey: true });
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search capabilities, milestones, quick wins...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('shows "Start typing to search..." when no query', async () => {
      render(<GlobalSearch />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Start typing to search...')).toBeInTheDocument();
      });
    });

    it('shows "No results found." when query has no results', async () => {
      mockSearchState.query = 'nonexistent';

      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('No results found.')).toBeInTheDocument();
      });
    });
  });

  describe('Capability Results', () => {
    beforeEach(() => {
      mockSearchState = {
        query: 'planning',
        setQuery: mockSetQuery,
        groupedResults: {
          capabilities: mockCapabilityResults,
          milestones: [],
          quickWins: [],
        },
        clearSearch: mockClearSearch,
        totalResults: 2,
      };
    });

    it('displays capability group heading', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Capabilities')).toBeInTheDocument();
      });
    });

    it('displays capability names', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Planning & Scheduling')).toBeInTheDocument();
        expect(screen.getByText('Inventory Management')).toBeInTheDocument();
      });
    });

    it('displays capability descriptions', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Resource planning capabilities')).toBeInTheDocument();
      });
    });

    it('displays priority badges for capabilities', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('CRITICAL')).toBeInTheDocument();
        expect(screen.getByText('HIGH')).toBeInTheDocument();
      });
    });

    it('navigates to capability on selection', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Planning & Scheduling')).toBeInTheDocument();
      });

      // Click on the capability item
      fireEvent.click(screen.getByText('Planning & Scheduling'));

      expect(mockNavigate).toHaveBeenCalledWith('/capabilities?id=cap-1');
      expect(mockClearSearch).toHaveBeenCalled();
    });
  });

  describe('Milestone Results', () => {
    beforeEach(() => {
      mockSearchState = {
        query: 'ai',
        setQuery: mockSetQuery,
        groupedResults: {
          capabilities: [],
          milestones: mockMilestoneResults,
          quickWins: [],
        },
        clearSearch: mockClearSearch,
        totalResults: 2,
      };
    });

    it('displays milestone group heading', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Milestones')).toBeInTheDocument();
      });
    });

    it('displays milestone names', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('AI Optimization')).toBeInTheDocument();
        expect(screen.getByText('Basic Capacity Understanding')).toBeInTheDocument();
      });
    });

    it('displays status badges for milestones', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('in progress')).toBeInTheDocument();
        expect(screen.getByText('completed')).toBeInTheDocument();
      });
    });

    it('navigates to milestone on selection', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('AI Optimization')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('AI Optimization'));

      expect(mockNavigate).toHaveBeenCalledWith('/timeline?milestone=ms-1');
      expect(mockClearSearch).toHaveBeenCalled();
    });
  });

  describe('Quick Win Results', () => {
    beforeEach(() => {
      mockSearchState = {
        query: 'dashboard',
        setQuery: mockSetQuery,
        groupedResults: {
          capabilities: [],
          milestones: [],
          quickWins: mockQuickWinResults,
        },
        clearSearch: mockClearSearch,
        totalResults: 1,
      };
    });

    it('displays quick wins group heading', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Quick Wins')).toBeInTheDocument();
      });
    });

    it('displays quick win names', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Dashboard Widgets')).toBeInTheDocument();
      });
    });

    it('navigates to quick win on selection', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Dashboard Widgets')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Dashboard Widgets'));

      expect(mockNavigate).toHaveBeenCalledWith('/quick-wins?id=qw-1');
      expect(mockClearSearch).toHaveBeenCalled();
    });
  });

  describe('Mixed Results', () => {
    beforeEach(() => {
      mockSearchState = {
        query: 'test',
        setQuery: mockSetQuery,
        groupedResults: {
          capabilities: mockCapabilityResults,
          milestones: mockMilestoneResults,
          quickWins: mockQuickWinResults,
        },
        clearSearch: mockClearSearch,
        totalResults: 5,
      };
    });

    it('displays all three groups', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Capabilities')).toBeInTheDocument();
        expect(screen.getByText('Milestones')).toBeInTheDocument();
        expect(screen.getByText('Quick Wins')).toBeInTheDocument();
      });
    });

    it('displays items from all groups', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Planning & Scheduling')).toBeInTheDocument();
        expect(screen.getByText('AI Optimization')).toBeInTheDocument();
        expect(screen.getByText('Dashboard Widgets')).toBeInTheDocument();
      });
    });
  });

  describe('Result Limiting', () => {
    it('limits capabilities to 5 results', async () => {
      const manyCapabilities = Array.from({ length: 10 }, (_, i) => ({
        id: `cap-${i}`,
        type: 'capability' as const,
        name: `Capability ${i}`,
        description: `Description ${i}`,
        priority: 'MEDIUM',
        path: `/capabilities?id=cap-${i}`,
      }));

      mockSearchState = {
        query: 'capability',
        setQuery: mockSetQuery,
        groupedResults: {
          capabilities: manyCapabilities,
          milestones: [],
          quickWins: [],
        },
        clearSearch: mockClearSearch,
        totalResults: 10,
      };

      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        // Should only show first 5
        expect(screen.getByText('Capability 0')).toBeInTheDocument();
        expect(screen.getByText('Capability 4')).toBeInTheDocument();
        expect(screen.queryByText('Capability 5')).not.toBeInTheDocument();
      });
    });
  });

  describe('Total Results Message', () => {
    it('shows total results message when > 15 results', async () => {
      mockSearchState = {
        query: 'test',
        setQuery: mockSetQuery,
        groupedResults: {
          capabilities: mockCapabilityResults,
          milestones: mockMilestoneResults,
          quickWins: mockQuickWinResults,
        },
        clearSearch: mockClearSearch,
        totalResults: 20,
      };

      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/20 total matches found/)).toBeInTheDocument();
      });
    });

    it('does not show total results message when <= 15 results', async () => {
      mockSearchState = {
        query: 'test',
        setQuery: mockSetQuery,
        groupedResults: {
          capabilities: mockCapabilityResults,
          milestones: [],
          quickWins: [],
        },
        clearSearch: mockClearSearch,
        totalResults: 2,
      };

      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.queryByText(/total matches found/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Dialog Closing', () => {
    it('clears search when dialog is closed', async () => {
      render(<GlobalSearch />);

      // Open dialog
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search capabilities, milestones, quick wins...')).toBeInTheDocument();
      });

      // Press Escape to close
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockClearSearch).toHaveBeenCalled();
      });
    });
  });

  describe('Search Input', () => {
    it('calls setQuery when input changes', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search capabilities, milestones, quick wins...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Search capabilities, milestones, quick wins...');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockSetQuery).toHaveBeenCalledWith('test');
    });
  });

  describe('Accessibility', () => {
    it('search button is keyboard accessible', () => {
      render(<GlobalSearch />);

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('disabled');
    });

    it('search input has proper placeholder', async () => {
      render(<GlobalSearch />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Search capabilities, milestones, quick wins...');
        expect(input).toBeInTheDocument();
      });
    });
  });
});
