// src/components/capabilities/CapabilityCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CapabilityCard } from './CapabilityCard';

describe('CapabilityCard', () => {
  const defaultProps = {
    id: '1',
    name: 'Test Capability',
    priority: 'HIGH',
    currentLevel: 2,
    targetLevel: 4,
  };

  it('renders capability name', () => {
    render(<CapabilityCard {...defaultProps} />);
    expect(screen.getByText('Test Capability')).toBeInTheDocument();
  });

  it('displays priority badge', () => {
    render(<CapabilityCard {...defaultProps} />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('shows maturity levels', () => {
    render(<CapabilityCard {...defaultProps} />);
    expect(screen.getByText(/Level 2/)).toBeInTheDocument();
    expect(screen.getByText(/4/)).toBeInTheDocument();
  });

  it('calculates progress correctly', () => {
    render(<CapabilityCard {...defaultProps} />);
    // (2-1)/(4-1) = 33%
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<CapabilityCard {...defaultProps} onClick={onClick} />);
    
    fireEvent.click(screen.getByText('Test Capability'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('displays owner when provided', () => {
    render(<CapabilityCard {...defaultProps} owner="Operations" />);
    expect(screen.getByText('Operations')).toBeInTheDocument();
  });

  it('displays milestone count when provided', () => {
    render(
      <CapabilityCard
        {...defaultProps}
        milestoneCount={5}
        completedMilestones={2}
      />
    );
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });
});
