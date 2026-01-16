// src/components/ui/badge.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, PriorityBadge, StatusBadge } from './badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('renders as div element', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge.tagName).toBe('DIV');
    });

    it('applies default classes', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full');
    });

    it('applies custom className', () => {
      render(<Badge className="custom-class" data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('variants', () => {
    it('applies default variant', () => {
      render(<Badge data-testid="badge">Default</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('applies secondary variant', () => {
      render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('applies destructive variant', () => {
      render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('applies outline variant', () => {
      render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-foreground');
    });
  });

  describe('priority variants', () => {
    it('applies critical variant', () => {
      render(<Badge variant="critical" data-testid="badge">Critical</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-red-100', 'text-red-700');
    });

    it('applies high variant', () => {
      render(<Badge variant="high" data-testid="badge">High</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-700');
    });

    it('applies medium variant', () => {
      render(<Badge variant="medium" data-testid="badge">Medium</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-700');
    });

    it('applies low variant', () => {
      render(<Badge variant="low" data-testid="badge">Low</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });
  });

  describe('status variants', () => {
    it('applies not_started variant', () => {
      render(<Badge variant="not_started" data-testid="badge">Not Started</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-slate-100', 'text-slate-700');
    });

    it('applies in_progress variant', () => {
      render(<Badge variant="in_progress" data-testid="badge">In Progress</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('applies completed variant', () => {
      render(<Badge variant="completed" data-testid="badge">Completed</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('applies blocked variant', () => {
      render(<Badge variant="blocked" data-testid="badge">Blocked</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-red-100', 'text-red-700');
    });
  });
});

describe('PriorityBadge', () => {
  it('renders with CRITICAL priority', () => {
    render(<PriorityBadge priority="CRITICAL" />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('renders with HIGH priority', () => {
    render(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('renders with MEDIUM priority', () => {
    render(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('renders with LOW priority', () => {
    render(<PriorityBadge priority="LOW" />);
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('applies correct colors for critical', () => {
    render(<PriorityBadge priority="CRITICAL" data-testid="badge" />);
    const badge = screen.getByText('CRITICAL');
    expect(badge).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('applies custom className', () => {
    render(<PriorityBadge priority="HIGH" className="custom-class" />);
    const badge = screen.getByText('HIGH');
    expect(badge).toHaveClass('custom-class');
  });

  it('handles lowercase priority', () => {
    render(<PriorityBadge priority="high" />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });
});

describe('StatusBadge', () => {
  it('renders with not_started status', () => {
    render(<StatusBadge status="not_started" />);
    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('renders with in_progress status', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders with completed status', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders with blocked status', () => {
    render(<StatusBadge status="blocked" />);
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('applies correct colors for in_progress', () => {
    render(<StatusBadge status="in_progress" />);
    const badge = screen.getByText('In Progress');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('applies custom className', () => {
    render(<StatusBadge status="completed" className="custom-class" />);
    const badge = screen.getByText('Completed');
    expect(badge).toHaveClass('custom-class');
  });

  it('formats status label with title case', () => {
    render(<StatusBadge status="not_started" />);
    // Should convert not_started to "Not Started"
    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });
});
