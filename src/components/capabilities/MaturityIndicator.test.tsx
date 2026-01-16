// src/components/capabilities/MaturityIndicator.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MaturityIndicator } from './MaturityIndicator';

describe('MaturityIndicator', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders 5 level dots', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots).toHaveLength(5);
    });
  });

  describe('level indicators', () => {
    it('shows completed levels with color', () => {
      const { container } = render(<MaturityIndicator currentLevel={3} targetLevel={5} />);
      const dots = container.querySelectorAll('.rounded-full');

      // Level 1, 2, 3 should be completed (have colored backgrounds)
      expect(dots[0]).toHaveClass('bg-red-500'); // Level 1
      expect(dots[1]).toHaveClass('bg-orange-500'); // Level 2
      expect(dots[2]).toHaveClass('bg-yellow-500'); // Level 3
    });

    it('shows target levels with slate color', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} />);
      const dots = container.querySelectorAll('.rounded-full');

      // Levels 3 and 4 should be targets (slate background)
      expect(dots[2]).toHaveClass('bg-slate-300'); // Level 3 (target)
      expect(dots[3]).toHaveClass('bg-slate-300'); // Level 4 (target)
    });

    it('shows future levels with light slate color', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={3} />);
      const dots = container.querySelectorAll('.rounded-full');

      // Levels 4 and 5 should be future (light slate)
      expect(dots[3]).toHaveClass('bg-slate-100'); // Level 4 (future)
      expect(dots[4]).toHaveClass('bg-slate-100'); // Level 5 (future)
    });

    it('marks current level with ring', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} />);
      const dots = container.querySelectorAll('.rounded-full');

      // Level 2 (index 1) should have a ring
      expect(dots[1]).toHaveClass('ring-2', 'ring-primary');
    });

    it('marks target level with ring when not completed', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} />);
      const dots = container.querySelectorAll('.rounded-full');

      // Level 4 (index 3) should have a ring
      expect(dots[3]).toHaveClass('ring-2', 'ring-slate-400');
    });
  });

  describe('size variants', () => {
    it('applies medium size by default', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots[0]).toHaveClass('h-4', 'w-4');
    });

    it('applies small size', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} size="sm" />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots[0]).toHaveClass('h-3', 'w-3');
    });

    it('applies large size', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} size="lg" />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots[0]).toHaveClass('h-6', 'w-6');
    });

    it('applies correct gap for small size', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} size="sm" />);
      const dotsContainer = container.querySelector('.flex.items-center');
      expect(dotsContainer).toHaveClass('gap-1');
    });

    it('applies correct gap for medium size', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} size="md" />);
      const dotsContainer = container.querySelector('.flex.items-center');
      expect(dotsContainer).toHaveClass('gap-2');
    });

    it('applies correct gap for large size', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} size="lg" />);
      const dotsContainer = container.querySelector('.flex.items-center');
      expect(dotsContainer).toHaveClass('gap-3');
    });
  });

  describe('labels', () => {
    it('does not show labels by default', () => {
      render(<MaturityIndicator currentLevel={2} targetLevel={4} />);
      expect(screen.queryByText('Level 2')).not.toBeInTheDocument();
    });

    it('shows labels when showLabels is true', () => {
      render(<MaturityIndicator currentLevel={2} targetLevel={4} showLabels />);
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('Level 4')).toBeInTheDocument();
    });

    it('shows arrow between labels', () => {
      render(<MaturityIndicator currentLevel={2} targetLevel={4} showLabels />);
      expect(screen.getByText('→')).toBeInTheDocument();
    });

    it('labels have correct text size for medium', () => {
      render(<MaturityIndicator currentLevel={2} targetLevel={4} showLabels size="md" />);
      const labelsContainer = screen.getByText('Level 2').parentElement;
      expect(labelsContainer).toHaveClass('text-sm');
    });

    it('labels have correct text size for small', () => {
      render(<MaturityIndicator currentLevel={2} targetLevel={4} showLabels size="sm" />);
      const labelsContainer = screen.getByText('Level 2').parentElement;
      expect(labelsContainer).toHaveClass('text-xs');
    });

    it('labels have correct text size for large', () => {
      render(<MaturityIndicator currentLevel={2} targetLevel={4} showLabels size="lg" />);
      const labelsContainer = screen.getByText('Level 2').parentElement;
      expect(labelsContainer).toHaveClass('text-base');
    });
  });

  describe('tooltip', () => {
    it('dots have cursor-help class', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} />);
      const dots = container.querySelectorAll('.rounded-full');
      dots.forEach((dot) => {
        expect(dot).toHaveClass('cursor-help');
      });
    });

    it('dots have hover scale transform', () => {
      const { container } = render(<MaturityIndicator currentLevel={2} targetLevel={4} />);
      const dots = container.querySelectorAll('.rounded-full');
      dots.forEach((dot) => {
        expect(dot).toHaveClass('transition-transform', 'hover:scale-110');
      });
    });
  });

  describe('edge cases', () => {
    it('handles level 1 current and target', () => {
      const { container } = render(<MaturityIndicator currentLevel={1} targetLevel={1} />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots[0]).toHaveClass('bg-red-500'); // Completed
      expect(dots[1]).toHaveClass('bg-slate-100'); // Future
    });

    it('handles level 5 current and target', () => {
      const { container } = render(<MaturityIndicator currentLevel={5} targetLevel={5} />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots[4]).toHaveClass('bg-emerald-500'); // Completed
    });

    it('handles same current and target level', () => {
      const { container } = render(<MaturityIndicator currentLevel={3} targetLevel={3} />);
      const dots = container.querySelectorAll('.rounded-full');
      // Levels 1-3 completed, 4-5 future
      expect(dots[2]).toHaveClass('bg-yellow-500');
      expect(dots[3]).toHaveClass('bg-slate-100');
    });
  });

  describe('level colors', () => {
    it('level 1 has red color when completed', () => {
      const { container } = render(<MaturityIndicator currentLevel={5} targetLevel={5} />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots[0]).toHaveClass('bg-red-500');
    });

    it('level 2 has orange color when completed', () => {
      const { container } = render(<MaturityIndicator currentLevel={5} targetLevel={5} />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots[1]).toHaveClass('bg-orange-500');
    });

    it('level 3 has yellow color when completed', () => {
      const { container } = render(<MaturityIndicator currentLevel={5} targetLevel={5} />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots[2]).toHaveClass('bg-yellow-500');
    });

    it('level 4 has blue color when completed', () => {
      const { container } = render(<MaturityIndicator currentLevel={5} targetLevel={5} />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots[3]).toHaveClass('bg-blue-500');
    });

    it('level 5 has emerald color when completed', () => {
      const { container } = render(<MaturityIndicator currentLevel={5} targetLevel={5} />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots[4]).toHaveClass('bg-emerald-500');
    });
  });
});
