// src/components/shared/EmptyState.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertCircle } from 'lucide-react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  describe('rendering', () => {
    it('renders title correctly', () => {
      render(<EmptyState title="No items found" />);
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('renders title as h3 element', () => {
      render(<EmptyState title="Empty State Title" />);
      const title = screen.getByText('Empty State Title');
      expect(title.tagName).toBe('H3');
    });

    it('applies title styling', () => {
      render(<EmptyState title="Test Title" />);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-lg', 'font-medium');
    });
  });

  describe('description', () => {
    it('does not render description when not provided', () => {
      render(<EmptyState title="Title Only" />);
      const paragraphs = document.querySelectorAll('p');
      expect(paragraphs).toHaveLength(0);
    });

    it('renders description when provided', () => {
      render(<EmptyState title="Title" description="This is a description" />);
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('applies description styling', () => {
      render(<EmptyState title="Title" description="Description text" />);
      const description = screen.getByText('Description text');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('icon', () => {
    it('renders default Inbox icon when no icon provided', () => {
      render(<EmptyState title="Default Icon" />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-8', 'w-8');
    });

    it('renders custom icon when provided', () => {
      render(<EmptyState title="Custom Icon" icon={AlertCircle} />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('icon container has correct styling', () => {
      const { container } = render(<EmptyState title="Icon Test" />);
      const iconContainer = container.querySelector('.rounded-full');
      expect(iconContainer).toHaveClass('bg-muted', 'p-4', 'mb-4');
    });
  });

  describe('action', () => {
    it('does not render action button when not provided', () => {
      render(<EmptyState title="No Action" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders action button when provided', () => {
      const action = { label: 'Add Item', onClick: vi.fn() };
      render(<EmptyState title="With Action" action={action} />);
      expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
    });

    it('calls onClick when action button is clicked', () => {
      const onClick = vi.fn();
      const action = { label: 'Click Me', onClick };
      render(<EmptyState title="Clickable Action" action={action} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('action button has correct styling', () => {
      const action = { label: 'Action', onClick: vi.fn() };
      render(<EmptyState title="Styled Action" action={action} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('mt-4');
    });
  });

  describe('className', () => {
    it('applies custom className', () => {
      const { container } = render(<EmptyState title="Custom Class" className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('maintains default classes with custom className', () => {
      const { container } = render(<EmptyState title="Classes" className="custom" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
  });

  describe('layout', () => {
    it('centers content', () => {
      const { container } = render(<EmptyState title="Centered" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('text-center');
    });

    it('has proper padding', () => {
      const { container } = render(<EmptyState title="Padded" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('py-12', 'px-4');
    });
  });

  describe('complete empty state', () => {
    it('renders all elements together', () => {
      const onClick = vi.fn();
      render(
        <EmptyState
          title="No Results"
          description="Try adjusting your search criteria"
          icon={AlertCircle}
          action={{ label: 'Clear Filters', onClick }}
        />
      );

      expect(screen.getByText('No Results')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
    });
  });
});
