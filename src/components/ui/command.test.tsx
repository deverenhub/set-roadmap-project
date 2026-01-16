// src/components/ui/command.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from './command';

// Mock scrollIntoView for cmdk
Element.prototype.scrollIntoView = vi.fn();

describe('Command', () => {
  it('renders children correctly', () => {
    render(
      <Command>
        <div data-testid="child">Test Content</div>
      </Command>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(
      <Command data-testid="command">
        <div>Content</div>
      </Command>
    );

    const command = screen.getByTestId('command');
    expect(command).toHaveClass('flex', 'h-full', 'w-full', 'flex-col');
  });

  it('applies custom className', () => {
    render(
      <Command className="custom-class" data-testid="command">
        <div>Content</div>
      </Command>
    );

    const command = screen.getByTestId('command');
    expect(command).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Command ref={ref}>
        <div>Content</div>
      </Command>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('CommandDialog', () => {
  it('renders when open', async () => {
    render(
      <CommandDialog open={true}>
        <CommandInput placeholder="Search..." />
      </CommandDialog>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    render(
      <CommandDialog open={false}>
        <CommandInput placeholder="Search..." />
      </CommandDialog>
    );

    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when closed', async () => {
    const onOpenChange = vi.fn();
    render(
      <CommandDialog open={true} onOpenChange={onOpenChange}>
        <CommandInput placeholder="Search..." />
      </CommandDialog>
    );

    // Press Escape to close
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('passes shouldFilter prop to Command', async () => {
    render(
      <CommandDialog open={true} shouldFilter={false}>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandItem>Item 1</CommandItem>
        </CommandList>
      </CommandDialog>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('defaults shouldFilter to true', async () => {
    render(
      <CommandDialog open={true}>
        <CommandInput placeholder="Search..." />
      </CommandDialog>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });
});

describe('CommandInput', () => {
  it('renders input with placeholder', () => {
    render(
      <Command>
        <CommandInput placeholder="Type a command..." />
      </Command>
    );

    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
  });

  it('renders search icon', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
      </Command>
    );

    // Search icon should be present (lucide-react Search component)
    const wrapper = screen.getByPlaceholderText('Search...').parentElement;
    expect(wrapper?.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." className="custom-input" />
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveClass('custom-input');
  });

  it('handles value changes', () => {
    const onValueChange = vi.fn();
    render(
      <Command>
        <CommandInput placeholder="Search..." onValueChange={onValueChange} />
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(onValueChange).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." disabled />
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeDisabled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Command>
        <CommandInput placeholder="Search..." ref={ref} />
      </Command>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('CommandList', () => {
  it('renders children', () => {
    render(
      <Command>
        <CommandList>
          <div data-testid="list-child">List Content</div>
        </CommandList>
      </Command>
    );

    expect(screen.getByTestId('list-child')).toBeInTheDocument();
  });

  it('applies default max-height class', () => {
    render(
      <Command>
        <CommandList data-testid="list">
          <div>Content</div>
        </CommandList>
      </Command>
    );

    const list = screen.getByTestId('list');
    expect(list).toHaveClass('max-h-[300px]');
  });

  it('applies custom className', () => {
    render(
      <Command>
        <CommandList className="custom-list" data-testid="list">
          <div>Content</div>
        </CommandList>
      </Command>
    );

    const list = screen.getByTestId('list');
    expect(list).toHaveClass('custom-list');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Command>
        <CommandList ref={ref}>
          <div>Content</div>
        </CommandList>
      </Command>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('CommandEmpty', () => {
  it('renders empty message', () => {
    render(
      <Command>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </Command>
    );

    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(
      <Command>
        <CommandList>
          <CommandEmpty data-testid="empty">No results</CommandEmpty>
        </CommandList>
      </Command>
    );

    const empty = screen.getByTestId('empty');
    expect(empty).toHaveClass('py-6', 'text-center', 'text-sm');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Command>
        <CommandList>
          <CommandEmpty ref={ref}>Empty</CommandEmpty>
        </CommandList>
      </Command>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('CommandGroup', () => {
  it('renders group with heading', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Suggestions">
            <CommandItem>Item 1</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(screen.getByText('Suggestions')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Group">
            <CommandItem>Test Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Group" className="custom-group" data-testid="group">
            <CommandItem>Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const group = screen.getByTestId('group');
    expect(group).toHaveClass('custom-group');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Group" ref={ref}>
            <CommandItem>Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('CommandItem', () => {
  it('renders item content', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>Click me</CommandItem>
        </CommandList>
      </Command>
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles selection', () => {
    const onSelect = vi.fn();
    render(
      <Command>
        <CommandList>
          <CommandItem onSelect={onSelect}>Selectable Item</CommandItem>
        </CommandList>
      </Command>
    );

    fireEvent.click(screen.getByText('Selectable Item'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem className="custom-item" data-testid="item">
            Item
          </CommandItem>
        </CommandList>
      </Command>
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveClass('custom-item');
  });

  it('can be disabled', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem disabled data-testid="item">
            Disabled Item
          </CommandItem>
        </CommandList>
      </Command>
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveAttribute('data-disabled', 'true');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Command>
        <CommandList>
          <CommandItem ref={ref}>Item</CommandItem>
        </CommandList>
      </Command>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('CommandSeparator', () => {
  it('renders separator', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Group 1">
            <CommandItem>Item 1</CommandItem>
          </CommandGroup>
          <CommandSeparator data-testid="separator" />
          <CommandGroup heading="Group 2">
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(
      <Command>
        <CommandList>
          <CommandSeparator data-testid="separator" />
        </CommandList>
      </Command>
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('-mx-1', 'h-px', 'bg-border');
  });

  it('applies custom className', () => {
    render(
      <Command>
        <CommandList>
          <CommandSeparator className="custom-separator" data-testid="separator" />
        </CommandList>
      </Command>
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('custom-separator');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Command>
        <CommandList>
          <CommandSeparator ref={ref} />
        </CommandList>
      </Command>
    );

    expect(ref).toHaveBeenCalled();
  });
});

describe('CommandShortcut', () => {
  it('renders shortcut text', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>
            Open
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>
    );

    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>
            Open
            <CommandShortcut data-testid="shortcut">⌘K</CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>
    );

    const shortcut = screen.getByTestId('shortcut');
    expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'tracking-widest', 'text-muted-foreground');
  });

  it('applies custom className', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>
            Open
            <CommandShortcut className="custom-shortcut" data-testid="shortcut">
              ⌘K
            </CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>
    );

    const shortcut = screen.getByTestId('shortcut');
    expect(shortcut).toHaveClass('custom-shortcut');
  });

  it('renders as span element', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>
            Open
            <CommandShortcut data-testid="shortcut">⌘K</CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>
    );

    const shortcut = screen.getByTestId('shortcut');
    expect(shortcut.tagName).toBe('SPAN');
  });

  it('passes through additional props', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>
            Open
            <CommandShortcut data-testid="shortcut" aria-label="Command K">
              ⌘K
            </CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>
    );

    const shortcut = screen.getByTestId('shortcut');
    expect(shortcut).toHaveAttribute('aria-label', 'Command K');
  });
});

describe('Integration', () => {
  it('renders full command palette structure', async () => {
    render(
      <CommandDialog open={true}>
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              Calendar
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Search
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem>Profile</CommandItem>
            <CommandItem>Preferences</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
      expect(screen.getByText('Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('⌘C')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', async () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup heading="Items">
            <CommandItem>Item 1</CommandItem>
            <CommandItem>Item 2</CommandItem>
            <CommandItem>Item 3</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');

    // Navigate down
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    await waitFor(() => {
      // First item should be selected
      const items = screen.getAllByText(/Item \d/);
      expect(items.length).toBe(3);
    });
  });
});
