// src/components/dashboard/ProgressRing.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<ProgressRing value={50} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders SVG element', () => {
      const { container } = render(<ProgressRing value={50} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('has two circle elements (background and progress)', () => {
      const { container } = render(<ProgressRing value={50} />);
      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(2);
    });

    it('applies custom className', () => {
      const { container } = render(<ProgressRing value={50} className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('value display', () => {
    it('displays 0%', () => {
      render(<ProgressRing value={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('displays 100%', () => {
      render(<ProgressRing value={100} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('displays 50%', () => {
      render(<ProgressRing value={50} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('rounds decimal values', () => {
      render(<ProgressRing value={33.7} />);
      expect(screen.getByText('34%')).toBeInTheDocument();
    });

    it('rounds down decimal values correctly', () => {
      render(<ProgressRing value={33.2} />);
      expect(screen.getByText('33%')).toBeInTheDocument();
    });
  });

  describe('label', () => {
    it('does not show label by default', () => {
      render(<ProgressRing value={50} />);
      const spans = screen.getAllByText(/./);
      // Should only have the percentage
      expect(spans.filter((s) => s.textContent !== '50%')).toHaveLength(0);
    });

    it('shows label when provided', () => {
      render(<ProgressRing value={50} label="Complete" />);
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('label has correct styling', () => {
      render(<ProgressRing value={50} label="Progress" />);
      const label = screen.getByText('Progress');
      expect(label).toHaveClass('text-xs', 'text-muted-foreground');
    });
  });

  describe('size', () => {
    it('uses default size of 120', () => {
      const { container } = render(<ProgressRing value={50} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '120');
      expect(svg).toHaveAttribute('height', '120');
    });

    it('uses custom size', () => {
      const { container } = render(<ProgressRing value={50} size={200} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '200');
      expect(svg).toHaveAttribute('height', '200');
    });

    it('uses small size', () => {
      const { container } = render(<ProgressRing value={50} size={80} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '80');
      expect(svg).toHaveAttribute('height', '80');
    });
  });

  describe('strokeWidth', () => {
    it('uses default strokeWidth of 10', () => {
      const { container } = render(<ProgressRing value={50} />);
      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '10');
      });
    });

    it('uses custom strokeWidth', () => {
      const { container } = render(<ProgressRing value={50} strokeWidth={15} />);
      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '15');
      });
    });
  });

  describe('color', () => {
    it('applies primary color by default', () => {
      const { container } = render(<ProgressRing value={50} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-set-teal-500');
    });

    it('applies success color', () => {
      const { container } = render(<ProgressRing value={50} color="success" />);
      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-set-teal-400');
    });

    it('applies warning color', () => {
      const { container } = render(<ProgressRing value={50} color="warning" />);
      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-yellow-500');
    });

    it('applies danger color', () => {
      const { container } = render(<ProgressRing value={50} color="danger" />);
      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-set-red');
    });
  });

  describe('background circle', () => {
    it('has correct background color class', () => {
      const { container } = render(<ProgressRing value={50} />);
      const bgCircle = container.querySelectorAll('circle')[0];
      expect(bgCircle).toHaveClass('stroke-set-teal-100');
    });

    it('has fill none', () => {
      const { container } = render(<ProgressRing value={50} />);
      const bgCircle = container.querySelectorAll('circle')[0];
      expect(bgCircle).toHaveAttribute('fill', 'none');
    });
  });

  describe('progress circle', () => {
    it('has transition class', () => {
      const { container } = render(<ProgressRing value={50} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('transition-all', 'duration-500');
    });

    it('has rounded line cap', () => {
      const { container } = render(<ProgressRing value={50} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveAttribute('stroke-linecap', 'round');
    });
  });

  describe('SVG rotation', () => {
    it('SVG is rotated -90 degrees', () => {
      const { container } = render(<ProgressRing value={50} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('-rotate-90');
    });
  });

  describe('center text', () => {
    it('percentage text has correct styling', () => {
      render(<ProgressRing value={75} />);
      const percentText = screen.getByText('75%');
      expect(percentText).toHaveClass('text-2xl', 'font-bold');
    });
  });
});
