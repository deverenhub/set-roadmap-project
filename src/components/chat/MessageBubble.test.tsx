// src/components/chat/MessageBubble.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '@/hooks/useAIChat';

describe('MessageBubble', () => {
  const createMessage = (
    overrides: Partial<ChatMessage> = {}
  ): ChatMessage => ({
    id: 'test-id',
    role: 'user',
    content: 'Test message content',
    timestamp: new Date('2024-01-15T10:30:00'),
    ...overrides,
  });

  describe('rendering', () => {
    it('renders message content', () => {
      render(<MessageBubble message={createMessage()} />);
      expect(screen.getByText('Test message content')).toBeInTheDocument();
    });

    it('renders timestamp', () => {
      render(<MessageBubble message={createMessage()} />);
      // The timestamp should be formatted as HH:MM
      expect(screen.getByText(/10:30/)).toBeInTheDocument();
    });

    it('renders avatar icon', () => {
      const { container } = render(<MessageBubble message={createMessage()} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('user messages', () => {
    it('shows User icon for user messages', () => {
      const { container } = render(
        <MessageBubble message={createMessage({ role: 'user' })} />
      );

      const avatar = container.querySelector('.rounded-full');
      expect(avatar).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('applies user message styling', () => {
      const { container } = render(
        <MessageBubble message={createMessage({ role: 'user' })} />
      );

      const messageContainer = container.querySelector('.flex.gap-3');
      expect(messageContainer).toHaveClass('flex-row-reverse');
    });

    it('user message bubble has primary background', () => {
      render(<MessageBubble message={createMessage({ role: 'user' })} />);

      const content = screen.getByText('Test message content');
      const bubble = content.closest('.rounded-lg');
      expect(bubble).toHaveClass('bg-primary', 'text-primary-foreground');
    });
  });

  describe('assistant messages', () => {
    it('shows Bot icon for assistant messages', () => {
      const { container } = render(
        <MessageBubble message={createMessage({ role: 'assistant' })} />
      );

      const avatar = container.querySelector('.rounded-full');
      expect(avatar).toHaveClass('bg-muted');
    });

    it('applies assistant message styling', () => {
      const { container } = render(
        <MessageBubble message={createMessage({ role: 'assistant' })} />
      );

      const messageContainer = container.querySelector('.flex.gap-3');
      expect(messageContainer).toHaveClass('flex-row');
    });

    it('assistant message bubble has muted background', () => {
      render(<MessageBubble message={createMessage({ role: 'assistant' })} />);

      const content = screen.getByText('Test message content');
      const bubble = content.closest('.rounded-lg');
      expect(bubble).toHaveClass('bg-muted', 'text-foreground');
    });
  });

  describe('avatar', () => {
    it('avatar has correct size', () => {
      const { container } = render(<MessageBubble message={createMessage()} />);

      const avatar = container.querySelector('.rounded-full');
      expect(avatar).toHaveClass('h-8', 'w-8');
    });

    it('avatar is centered', () => {
      const { container } = render(<MessageBubble message={createMessage()} />);

      const avatar = container.querySelector('.rounded-full');
      expect(avatar).toHaveClass('items-center', 'justify-center');
    });

    it('avatar icon has correct size', () => {
      const { container } = render(<MessageBubble message={createMessage()} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4');
    });
  });

  describe('message bubble', () => {
    it('has max width constraint', () => {
      render(<MessageBubble message={createMessage()} />);

      const content = screen.getByText('Test message content');
      const bubble = content.closest('.rounded-lg');
      expect(bubble).toHaveClass('max-w-[80%]');
    });

    it('has padding', () => {
      render(<MessageBubble message={createMessage()} />);

      const content = screen.getByText('Test message content');
      const bubble = content.closest('.rounded-lg');
      expect(bubble).toHaveClass('px-4', 'py-2');
    });

    it('preserves whitespace', () => {
      render(<MessageBubble message={createMessage()} />);

      const content = screen.getByText('Test message content');
      expect(content).toHaveClass('whitespace-pre-wrap');
    });
  });

  describe('tool calls', () => {
    it('does not show tool calls when none present', () => {
      render(<MessageBubble message={createMessage({ toolCalls: undefined })} />);

      expect(screen.queryByText(/Used:/)).not.toBeInTheDocument();
    });

    it('does not show tool calls when empty array', () => {
      render(<MessageBubble message={createMessage({ toolCalls: [] })} />);

      expect(screen.queryByText(/Used:/)).not.toBeInTheDocument();
    });

    it('shows tool calls when present', () => {
      const message = createMessage({
        role: 'assistant',
        toolCalls: [{ tool: 'getCapabilities', result: {} }],
      });

      render(<MessageBubble message={message} />);

      expect(screen.getByText(/Used:/)).toBeInTheDocument();
      expect(screen.getByText(/getCapabilities/)).toBeInTheDocument();
    });

    it('shows multiple tool calls', () => {
      const message = createMessage({
        role: 'assistant',
        toolCalls: [
          { tool: 'getCapabilities', result: {} },
          { tool: 'getMilestones', result: {} },
        ],
      });

      render(<MessageBubble message={message} />);

      expect(screen.getByText(/getCapabilities, getMilestones/)).toBeInTheDocument();
    });

    it('tool calls section has border', () => {
      const message = createMessage({
        role: 'assistant',
        toolCalls: [{ tool: 'testTool', result: {} }],
      });

      render(<MessageBubble message={message} />);

      const toolSection = screen.getByText(/Used:/).closest('div');
      expect(toolSection).toHaveClass('border-t');
    });
  });

  describe('timestamp', () => {
    it('shows correct time format', () => {
      const message = createMessage({
        timestamp: new Date('2024-01-15T14:45:00'),
      });

      render(<MessageBubble message={message} />);

      // Should show time in HH:MM format
      expect(screen.getByText(/2:45|14:45/)).toBeInTheDocument();
    });

    it('timestamp has correct styling for user message', () => {
      render(<MessageBubble message={createMessage({ role: 'user' })} />);

      const timestamp = screen.getByText(/10:30/);
      expect(timestamp).toHaveClass('text-xs', 'mt-1');
    });

    it('timestamp has muted foreground for assistant', () => {
      render(<MessageBubble message={createMessage({ role: 'assistant' })} />);

      const timestamp = screen.getByText(/10:30/);
      expect(timestamp).toHaveClass('text-muted-foreground');
    });
  });

  describe('content variations', () => {
    it('renders long content', () => {
      const longContent = 'This is a very long message '.repeat(20);
      const { container } = render(<MessageBubble message={createMessage({ content: longContent })} />);

      const contentDiv = container.querySelector('.whitespace-pre-wrap');
      expect(contentDiv?.textContent).toContain('This is a very long message');
    });

    it('renders multiline content', () => {
      const multilineContent = 'Line 1\nLine 2\nLine 3';
      const { container } = render(<MessageBubble message={createMessage({ content: multilineContent })} />);

      const contentDiv = container.querySelector('.whitespace-pre-wrap');
      expect(contentDiv?.textContent).toContain('Line 1');
      expect(contentDiv?.textContent).toContain('Line 2');
      expect(contentDiv?.textContent).toContain('Line 3');
    });

    it('renders content with special characters', () => {
      const specialContent = 'Hello! How are you? <test> & "quotes"';
      render(<MessageBubble message={createMessage({ content: specialContent })} />);

      expect(screen.getByText(specialContent)).toBeInTheDocument();
    });
  });
});
