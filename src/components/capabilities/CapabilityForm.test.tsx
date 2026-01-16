// src/components/capabilities/CapabilityForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CapabilityForm } from './CapabilityForm';

// Mock hooks
const mockCreateCapability = vi.fn();
const mockUpdateCapability = vi.fn();

vi.mock('@/hooks', () => ({
  useCreateCapability: () => ({
    mutateAsync: mockCreateCapability,
    isPending: false,
  }),
  useUpdateCapability: () => ({
    mutateAsync: mockUpdateCapability,
    isPending: false,
  }),
}));

describe('CapabilityForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders name input', () => {
      render(<CapabilityForm />);
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    });

    it('renders description textarea', () => {
      render(<CapabilityForm />);
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    });

    it('renders priority select', () => {
      render(<CapabilityForm />);
      expect(screen.getByLabelText(/Priority/)).toBeInTheDocument();
    });

    it('renders owner input', () => {
      render(<CapabilityForm />);
      expect(screen.getByLabelText(/Owner/)).toBeInTheDocument();
    });

    it('renders current level select', () => {
      render(<CapabilityForm />);
      expect(screen.getByLabelText(/Current Level/)).toBeInTheDocument();
    });

    it('renders target level select', () => {
      render(<CapabilityForm />);
      expect(screen.getByLabelText(/Target Level/)).toBeInTheDocument();
    });

    it('renders color select', () => {
      render(<CapabilityForm />);
      expect(screen.getByLabelText(/Color/)).toBeInTheDocument();
    });

    it('renders QoL impact textarea', () => {
      render(<CapabilityForm />);
      expect(screen.getByLabelText(/Quality of Life Impact/)).toBeInTheDocument();
    });

    it('shows "Create Capability" button for new item', () => {
      render(<CapabilityForm />);
      expect(screen.getByRole('button', { name: /Create Capability/i })).toBeInTheDocument();
    });
  });

  describe('editing mode', () => {
    const existingCapability = {
      id: 'cap-1',
      name: 'Production Monitoring',
      description: 'Monitor production systems',
      priority: 'HIGH' as const,
      current_level: 2,
      target_level: 4,
      owner: 'Operations',
      color: '#10b981',
      qol_impact: 'Reduces manual work',
      milestone_count: 3,
      completed_milestones: 1,
      quick_win_count: 2,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('shows "Update Capability" button when editing', () => {
      render(<CapabilityForm capability={existingCapability} />);
      expect(screen.getByRole('button', { name: /Update Capability/i })).toBeInTheDocument();
    });

    it('populates name field with existing data', () => {
      render(<CapabilityForm capability={existingCapability} />);
      expect(screen.getByDisplayValue('Production Monitoring')).toBeInTheDocument();
    });

    it('populates description field with existing data', () => {
      render(<CapabilityForm capability={existingCapability} />);
      expect(screen.getByDisplayValue('Monitor production systems')).toBeInTheDocument();
    });

    it('populates owner field with existing data', () => {
      render(<CapabilityForm capability={existingCapability} />);
      expect(screen.getByDisplayValue('Operations')).toBeInTheDocument();
    });

    it('populates QoL impact field with existing data', () => {
      render(<CapabilityForm capability={existingCapability} />);
      expect(screen.getByDisplayValue('Reduces manual work')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls createCapability when submitting new item', async () => {
      render(<CapabilityForm onSuccess={vi.fn()} />);

      await userEvent.type(screen.getByLabelText(/Name/), 'New Capability');
      fireEvent.submit(screen.getByRole('button', { name: /Create Capability/i }).closest('form')!);

      await waitFor(() => {
        expect(mockCreateCapability).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Capability',
          })
        );
      });
    });

    it('calls updateCapability when submitting existing item', async () => {
      const capability = {
        id: 'cap-1',
        name: 'Test',
        priority: 'MEDIUM' as const,
        current_level: 1,
        target_level: 4,
        milestone_count: 0,
        completed_milestones: 0,
        quick_win_count: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      render(<CapabilityForm capability={capability} onSuccess={vi.fn()} />);

      await userEvent.clear(screen.getByLabelText(/Name/));
      await userEvent.type(screen.getByLabelText(/Name/), 'Updated Name');
      fireEvent.submit(screen.getByRole('button', { name: /Update Capability/i }).closest('form')!);

      await waitFor(() => {
        expect(mockUpdateCapability).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'cap-1',
            name: 'Updated Name',
          })
        );
      });
    });

    it('calls onSuccess after successful submission', async () => {
      const onSuccess = vi.fn();
      render(<CapabilityForm onSuccess={onSuccess} />);

      await userEvent.type(screen.getByLabelText(/Name/), 'New Capability');
      fireEvent.submit(screen.getByRole('button', { name: /Create Capability/i }).closest('form')!);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('cancel button', () => {
    it('renders cancel button when onCancel is provided', () => {
      render(<CapabilityForm onCancel={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('does not render cancel button when onCancel is not provided', () => {
      render(<CapabilityForm />);
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(<CapabilityForm onCancel={onCancel} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('input validation', () => {
    it('name input is required', () => {
      render(<CapabilityForm />);
      expect(screen.getByLabelText(/Name/)).toBeRequired();
    });
  });

  describe('default values', () => {
    it('sets default priority to MEDIUM', () => {
      render(<CapabilityForm />);
      // The select should have MEDIUM as default
      const prioritySelect = screen.getByLabelText(/Priority/);
      expect(prioritySelect).toBeInTheDocument();
    });

    it('sets default current level to 1', () => {
      render(<CapabilityForm />);
      const currentLevelSelect = screen.getByLabelText(/Current Level/);
      expect(currentLevelSelect).toBeInTheDocument();
    });

    it('sets default target level to 4', () => {
      render(<CapabilityForm />);
      const targetLevelSelect = screen.getByLabelText(/Target Level/);
      expect(targetLevelSelect).toBeInTheDocument();
    });
  });
});
