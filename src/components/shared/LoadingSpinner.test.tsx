// src/components/shared/LoadingSpinner.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, FullPageLoader } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<LoadingSpinner />);
      // Should have a spinner (svg element)
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('applies container classes', () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'gap-2');
    });

    it('applies custom className', () => {
      const { container } = render(<LoadingSpinner className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('sizes', () => {
    it('applies small size', () => {
      render(<LoadingSpinner size="sm" />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4');
    });

    it('applies medium size by default', () => {
      render(<LoadingSpinner />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('h-8', 'w-8');
    });

    it('applies large size', () => {
      render(<LoadingSpinner size="lg" />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('h-12', 'w-12');
    });
  });

  describe('text', () => {
    it('does not show text by default', () => {
      render(<LoadingSpinner />);
      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });

    it('shows text when provided', () => {
      render(<LoadingSpinner text="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('applies text styling', () => {
      render(<LoadingSpinner text="Loading data" />);
      const text = screen.getByText('Loading data');
      expect(text).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('animation', () => {
    it('has spin animation class', () => {
      render(<LoadingSpinner />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('animate-spin');
    });

    it('has primary color', () => {
      render(<LoadingSpinner />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('text-primary');
    });
  });
});

describe('FullPageLoader', () => {
  it('renders correctly', () => {
    render(<FullPageLoader />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('takes full screen height', () => {
    const { container } = render(<FullPageLoader />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('h-screen', 'w-full');
  });

  it('centers content', () => {
    const { container } = render(<FullPageLoader />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('uses large spinner size', () => {
    render(<FullPageLoader />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('shows text when provided', () => {
    render(<FullPageLoader text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('does not show text when not provided', () => {
    render(<FullPageLoader />);
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });
});
