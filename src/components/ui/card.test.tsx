// src/components/ui/card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'shadow-sm');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Card ref={ref}>Content</Card>);
    expect(ref).toHaveBeenCalled();
  });

  it('passes through additional props', () => {
    render(<Card data-testid="card" role="article">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('role', 'article');
  });
});

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header Content</CardHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<CardHeader data-testid="header">Content</CardHeader>);
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
  });

  it('applies custom className', () => {
    render(<CardHeader className="custom-class" data-testid="header">Content</CardHeader>);
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<CardHeader ref={ref}>Content</CardHeader>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardTitle', () => {
  it('renders children correctly', () => {
    render(<CardTitle>Title Text</CardTitle>);
    expect(screen.getByText('Title Text')).toBeInTheDocument();
  });

  it('renders as h3 element', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);
    const title = screen.getByTestId('title');
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none');
  });

  it('applies custom className', () => {
    render(<CardTitle className="custom-class" data-testid="title">Title</CardTitle>);
    const title = screen.getByTestId('title');
    expect(title).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<CardTitle ref={ref}>Title</CardTitle>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardDescription', () => {
  it('renders children correctly', () => {
    render(<CardDescription>Description Text</CardDescription>);
    expect(screen.getByText('Description Text')).toBeInTheDocument();
  });

  it('renders as p element', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>);
    const desc = screen.getByTestId('desc');
    expect(desc.tagName).toBe('P');
  });

  it('applies default classes', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>);
    const desc = screen.getByTestId('desc');
    expect(desc).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('applies custom className', () => {
    render(<CardDescription className="custom-class" data-testid="desc">Description</CardDescription>);
    const desc = screen.getByTestId('desc');
    expect(desc).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<CardDescription ref={ref}>Description</CardDescription>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardContent', () => {
  it('renders children correctly', () => {
    render(<CardContent>Content Area</CardContent>);
    expect(screen.getByText('Content Area')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    const content = screen.getByTestId('content');
    expect(content).toHaveClass('p-6', 'pt-0');
  });

  it('applies custom className', () => {
    render(<CardContent className="custom-class" data-testid="content">Content</CardContent>);
    const content = screen.getByTestId('content');
    expect(content).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<CardContent ref={ref}>Content</CardContent>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardFooter', () => {
  it('renders children correctly', () => {
    render(<CardFooter>Footer Content</CardFooter>);
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
  });

  it('applies custom className', () => {
    render(<CardFooter className="custom-class" data-testid="footer">Footer</CardFooter>);
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<CardFooter ref={ref}>Footer</CardFooter>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('Card composition', () => {
  it('renders a complete card structure', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description text</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description text')).toBeInTheDocument();
    expect(screen.getByText('Main content goes here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('maintains proper heading hierarchy', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      </Card>
    );

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Test Title');
  });
});
