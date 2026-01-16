// src/pages/RoadmapProduction.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoadmapProduction from './RoadmapProduction';

// Mock the RoadmapView component
vi.mock('./RoadmapView', () => ({
  default: ({ type }: { type: string }) => (
    <div data-testid="roadmap-view" data-type={type}>
      Mocked RoadmapView
    </div>
  ),
}));

describe('RoadmapProduction', () => {
  it('renders RoadmapView component', () => {
    render(<RoadmapProduction />);
    expect(screen.getByTestId('roadmap-view')).toBeInTheDocument();
  });

  it('passes production type to RoadmapView', () => {
    render(<RoadmapProduction />);
    expect(screen.getByTestId('roadmap-view')).toHaveAttribute('data-type', 'production');
  });
});
