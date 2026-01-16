// src/pages/Dependencies.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dependencies from './Dependencies';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock DependencyFlow component
vi.mock('@/components/diagrams', () => ({
  DependencyFlow: ({ onNodeClick }: { onNodeClick: (id: string, type: 'capability' | 'milestone') => void }) => (
    <div data-testid="dependency-flow">
      <button
        data-testid="capability-node"
        onClick={() => onNodeClick('cap-123', 'capability')}
      >
        Capability Node
      </button>
      <button
        data-testid="milestone-node"
        onClick={() => onNodeClick('ms-456', 'milestone')}
      >
        Milestone Node
      </button>
    </div>
  ),
}));

describe('Dependencies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDependencies = () => {
    return render(
      <MemoryRouter>
        <Dependencies />
      </MemoryRouter>
    );
  };

  describe('rendering', () => {
    it('renders page title', () => {
      renderDependencies();
      expect(screen.getByRole('heading', { name: 'Dependencies' })).toBeInTheDocument();
    });

    it('renders page description', () => {
      renderDependencies();
      expect(screen.getByText('Visualize capability and milestone dependencies')).toBeInTheDocument();
    });

    it('renders DependencyFlow component', () => {
      renderDependencies();
      expect(screen.getByTestId('dependency-flow')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('navigates to capability detail when capability node is clicked', () => {
      renderDependencies();
      fireEvent.click(screen.getByTestId('capability-node'));
      expect(mockNavigate).toHaveBeenCalledWith('/capabilities/cap-123');
    });

    it('does not navigate when milestone node is clicked', () => {
      renderDependencies();
      fireEvent.click(screen.getByTestId('milestone-node'));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('layout', () => {
    it('has proper spacing structure', () => {
      const { container } = renderDependencies();
      expect(container.querySelector('.space-y-6')).toBeInTheDocument();
    });
  });
});
