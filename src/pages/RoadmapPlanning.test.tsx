// src/pages/RoadmapPlanning.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoadmapPlanning from './RoadmapPlanning';

// Mock the RoadmapView component
vi.mock('./RoadmapView', () => ({
  default: ({ type }: { type: string }) => (
    <div data-testid="roadmap-view" data-type={type}>
      Mocked RoadmapView
    </div>
  ),
}));

describe('RoadmapPlanning', () => {
  it('renders RoadmapView component', () => {
    render(<RoadmapPlanning />);
    expect(screen.getByTestId('roadmap-view')).toBeInTheDocument();
  });

  it('passes planning type to RoadmapView', () => {
    render(<RoadmapPlanning />);
    expect(screen.getByTestId('roadmap-view')).toHaveAttribute('data-type', 'planning');
  });
});
