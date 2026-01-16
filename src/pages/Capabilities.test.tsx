// src/pages/Capabilities.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Capabilities from './Capabilities';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock CapabilityList component
vi.mock('@/components/capabilities', () => ({
  CapabilityList: ({ onCapabilityClick }: { onCapabilityClick: (id: string) => void }) => (
    <div data-testid="capability-list">
      <button
        data-testid="capability-item"
        onClick={() => onCapabilityClick('cap-123')}
      >
        Capability Item
      </button>
    </div>
  ),
  CapabilityDetail: ({
    capabilityId,
    onBack,
    onDeleted,
  }: {
    capabilityId: string;
    onBack: () => void;
    onDeleted: () => void;
  }) => (
    <div data-testid="capability-detail" data-capability-id={capabilityId}>
      <button data-testid="back-button" onClick={onBack}>
        Back
      </button>
      <button data-testid="delete-button" onClick={onDeleted}>
        Delete
      </button>
    </div>
  ),
}));

describe('Capabilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCapabilities = (initialPath = '/capabilities') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/capabilities" element={<Capabilities />} />
          <Route path="/capabilities/:id" element={<Capabilities />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('list view', () => {
    it('renders page title', () => {
      renderCapabilities();
      expect(screen.getByRole('heading', { name: 'Capabilities' })).toBeInTheDocument();
    });

    it('renders page description', () => {
      renderCapabilities();
      expect(screen.getByText('Manage and track your operational capabilities')).toBeInTheDocument();
    });

    it('renders CapabilityList component', () => {
      renderCapabilities();
      expect(screen.getByTestId('capability-list')).toBeInTheDocument();
    });

    it('navigates to capability detail when capability is clicked', () => {
      renderCapabilities();
      fireEvent.click(screen.getByTestId('capability-item'));
      expect(mockNavigate).toHaveBeenCalledWith('/capabilities/cap-123');
    });
  });

  describe('detail view', () => {
    it('renders CapabilityDetail when id is in URL', () => {
      renderCapabilities('/capabilities/cap-456');
      expect(screen.getByTestId('capability-detail')).toBeInTheDocument();
    });

    it('passes correct capabilityId to CapabilityDetail', () => {
      renderCapabilities('/capabilities/cap-456');
      expect(screen.getByTestId('capability-detail')).toHaveAttribute(
        'data-capability-id',
        'cap-456'
      );
    });

    it('navigates to list view when back is clicked', () => {
      renderCapabilities('/capabilities/cap-456');
      fireEvent.click(screen.getByTestId('back-button'));
      expect(mockNavigate).toHaveBeenCalledWith('/capabilities');
    });

    it('navigates to list view when capability is deleted', () => {
      renderCapabilities('/capabilities/cap-456');
      fireEvent.click(screen.getByTestId('delete-button'));
      expect(mockNavigate).toHaveBeenCalledWith('/capabilities');
    });
  });

  describe('layout', () => {
    it('has proper spacing structure in list view', () => {
      const { container } = renderCapabilities();
      expect(container.querySelector('.space-y-6')).toBeInTheDocument();
    });
  });
});
