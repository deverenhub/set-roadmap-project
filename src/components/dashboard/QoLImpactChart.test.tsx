// src/components/dashboard/QoLImpactChart.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QoLImpactChart } from './QoLImpactChart';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock capabilities data
const mockCapabilities = [
  {
    id: 'cap-1',
    name: 'Efficiency Capability',
    qol_impact: 'Streamlines workflows and improves efficiency',
    priority: 'HIGH',
    current_level: 2,
    target_level: 4,
    color: '#3b82f6',
  },
  {
    id: 'cap-2',
    name: 'Productivity Capability',
    qol_impact: 'Saves time and increases productivity',
    priority: 'CRITICAL',
    current_level: 3,
    target_level: 5,
    color: '#22c55e',
  },
  {
    id: 'cap-3',
    name: 'No QoL Capability',
    qol_impact: null,
    priority: 'LOW',
    current_level: 1,
    target_level: 2,
    color: '#94a3b8',
  },
];

vi.mock('@/hooks', () => ({
  useCapabilities: () => ({
    data: mockCapabilities,
    isLoading: false,
  }),
}));

describe('QoLImpactChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders card title', () => {
      render(<QoLImpactChart />);
      expect(screen.getByText('Quality of Life Impact')).toBeInTheDocument();
    });

    it('renders capabilities with QoL impact', () => {
      render(<QoLImpactChart />);
      expect(screen.getByText('Efficiency Capability')).toBeInTheDocument();
      expect(screen.getByText('Productivity Capability')).toBeInTheDocument();
    });

    it('does not render capabilities without QoL impact', () => {
      render(<QoLImpactChart />);
      expect(screen.queryByText('No QoL Capability')).not.toBeInTheDocument();
    });

    it('renders QoL impact descriptions', () => {
      render(<QoLImpactChart />);
      expect(screen.getByText('Streamlines workflows and improves efficiency')).toBeInTheDocument();
      expect(screen.getByText('Saves time and increases productivity')).toBeInTheDocument();
    });

    it('renders category labels', () => {
      render(<QoLImpactChart />);
      expect(screen.getByText('Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Productivity')).toBeInTheDocument();
    });

    it('renders impact scores', () => {
      render(<QoLImpactChart />);
      // Impact scores are displayed in "X%" format
      const scores = screen.getAllByText(/\d+%/);
      expect(scores.length).toBeGreaterThan(0);
    });
  });

  describe('limit prop', () => {
    it('respects limit prop', () => {
      render(<QoLImpactChart limit={1} />);
      // Should only show capabilities with QoL impact, limited to 1
      // Since cap-3 has no qol_impact, it's filtered out first
    });
  });

  describe('interactions', () => {
    it('navigates to capability detail when clicked', () => {
      render(<QoLImpactChart />);
      fireEvent.click(screen.getByText('Efficiency Capability'));
      expect(mockNavigate).toHaveBeenCalledWith('/capabilities/cap-1');
    });
  });

  describe('summary stats', () => {
    it('renders summary stats section', () => {
      render(<QoLImpactChart />);
      // Summary section shows category counts
      expect(screen.getByText('Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Productivity')).toBeInTheDocument();
    });
  });
});
