// src/pages/RoadmapInventory.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoadmapInventory from './RoadmapInventory';

// Mock the RoadmapView component
vi.mock('./RoadmapView', () => ({
  default: ({ type }: { type: string }) => (
    <div data-testid="roadmap-view" data-type={type}>
      Mocked RoadmapView
    </div>
  ),
}));

describe('RoadmapInventory', () => {
  it('renders RoadmapView component', () => {
    render(<RoadmapInventory />);
    expect(screen.getByTestId('roadmap-view')).toBeInTheDocument();
  });

  it('passes inventory type to RoadmapView', () => {
    render(<RoadmapInventory />);
    expect(screen.getByTestId('roadmap-view')).toHaveAttribute('data-type', 'inventory');
  });
});
