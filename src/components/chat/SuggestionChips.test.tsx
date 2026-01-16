// src/components/chat/SuggestionChips.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuggestionChips } from './SuggestionChips';

describe('SuggestionChips', () => {
  const mockSuggestions = [
    'What is our progress?',
    'Show blocked items',
    'Generate report',
  ];

  describe('rendering', () => {
    it('renders correctly', () => {
      const onSelect = vi.fn();
      render(<SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />);
      expect(screen.getByText('Try asking:')).toBeInTheDocument();
    });

    it('renders all suggestions as buttons', () => {
      const onSelect = vi.fn();
      render(<SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />);

      mockSuggestions.forEach((suggestion) => {
        expect(screen.getByRole('button', { name: suggestion })).toBeInTheDocument();
      });
    });

    it('renders correct number of buttons', () => {
      const onSelect = vi.fn();
      render(<SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(mockSuggestions.length);
    });

    it('renders empty when no suggestions provided', () => {
      const onSelect = vi.fn();
      render(<SuggestionChips suggestions={[]} onSelect={onSelect} />);

      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('label', () => {
    it('shows "Try asking:" label', () => {
      const onSelect = vi.fn();
      render(<SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />);

      expect(screen.getByText('Try asking:')).toBeInTheDocument();
    });

    it('label has correct styling', () => {
      const onSelect = vi.fn();
      render(<SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />);

      const label = screen.getByText('Try asking:');
      expect(label).toHaveClass('text-xs', 'text-muted-foreground', 'font-medium');
    });
  });

  describe('button styling', () => {
    it('buttons have outline variant', () => {
      const onSelect = vi.fn();
      render(<SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />);

      const button = screen.getByRole('button', { name: mockSuggestions[0] });
      expect(button).toHaveClass('text-xs');
    });

    it('buttons have correct size classes', () => {
      const onSelect = vi.fn();
      render(<SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />);

      const button = screen.getByRole('button', { name: mockSuggestions[0] });
      expect(button).toHaveClass('py-1.5', 'px-3', 'h-auto');
    });
  });

  describe('interaction', () => {
    it('calls onSelect when button is clicked', () => {
      const onSelect = vi.fn();
      render(<SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />);

      fireEvent.click(screen.getByRole('button', { name: mockSuggestions[0] }));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(mockSuggestions[0]);
    });

    it('calls onSelect with correct suggestion for each button', () => {
      const onSelect = vi.fn();
      render(<SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />);

      mockSuggestions.forEach((suggestion, index) => {
        fireEvent.click(screen.getByRole('button', { name: suggestion }));
        expect(onSelect).toHaveBeenNthCalledWith(index + 1, suggestion);
      });
    });

    it('allows multiple clicks', () => {
      const onSelect = vi.fn();
      render(<SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />);

      const button = screen.getByRole('button', { name: mockSuggestions[0] });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(onSelect).toHaveBeenCalledTimes(3);
    });
  });

  describe('layout', () => {
    it('has flex wrap container for buttons', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />
      );

      const flexContainer = container.querySelector('.flex.flex-wrap');
      expect(flexContainer).toBeInTheDocument();
    });

    it('has gap between buttons', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />
      );

      const flexContainer = container.querySelector('.flex.flex-wrap');
      expect(flexContainer).toHaveClass('gap-2');
    });

    it('has vertical spacing', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <SuggestionChips suggestions={mockSuggestions} onSelect={onSelect} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('space-y-2');
    });
  });

  describe('with many suggestions', () => {
    it('renders many suggestions correctly', () => {
      const onSelect = vi.fn();
      const manySuggestions = [
        'Question 1',
        'Question 2',
        'Question 3',
        'Question 4',
        'Question 5',
        'Question 6',
      ];

      render(<SuggestionChips suggestions={manySuggestions} onSelect={onSelect} />);

      manySuggestions.forEach((suggestion) => {
        expect(screen.getByRole('button', { name: suggestion })).toBeInTheDocument();
      });
    });
  });
});
