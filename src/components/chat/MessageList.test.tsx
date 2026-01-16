// src/components/chat/MessageList.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageList } from './MessageList';
import type { ChatMessage } from '@/hooks/useAIChat';

// Mock MessageBubble component
vi.mock('./MessageBubble', () => ({
  MessageBubble: ({ message }: { message: ChatMessage }) => (
    <div data-testid={`message-${message.id}`} data-role={message.role}>
      {message.content}
    </div>
  ),
}));

describe('MessageList', () => {
  const createMessage = (
    id: string,
    role: 'user' | 'assistant',
    content: string
  ): ChatMessage => ({
    id,
    role,
    content,
    timestamp: new Date('2024-01-15T10:00:00'),
  });

  describe('rendering', () => {
    it('renders correctly with messages', () => {
      const messages: ChatMessage[] = [
        createMessage('1', 'user', 'Hello'),
        createMessage('2', 'assistant', 'Hi there!'),
      ];

      render(<MessageList messages={messages} />);

      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('renders empty when no messages', () => {
      const { container } = render(<MessageList messages={[]} />);

      const messageElements = container.querySelectorAll('[data-testid^="message-"]');
      expect(messageElements).toHaveLength(0);
    });

    it('renders all messages', () => {
      const messages: ChatMessage[] = [
        createMessage('1', 'user', 'First message'),
        createMessage('2', 'assistant', 'Second message'),
        createMessage('3', 'user', 'Third message'),
        createMessage('4', 'assistant', 'Fourth message'),
      ];

      render(<MessageList messages={messages} />);

      messages.forEach((msg) => {
        expect(screen.getByTestId(`message-${msg.id}`)).toBeInTheDocument();
      });
    });
  });

  describe('message ordering', () => {
    it('renders messages in order', () => {
      const messages: ChatMessage[] = [
        createMessage('1', 'user', 'First'),
        createMessage('2', 'assistant', 'Second'),
        createMessage('3', 'user', 'Third'),
      ];

      const { container } = render(<MessageList messages={messages} />);

      const messageElements = container.querySelectorAll('[data-testid^="message-"]');
      expect(messageElements[0]).toHaveTextContent('First');
      expect(messageElements[1]).toHaveTextContent('Second');
      expect(messageElements[2]).toHaveTextContent('Third');
    });
  });

  describe('message props', () => {
    it('passes message to MessageBubble', () => {
      const messages: ChatMessage[] = [
        createMessage('test-id', 'user', 'Test content'),
      ];

      render(<MessageList messages={messages} />);

      const messageElement = screen.getByTestId('message-test-id');
      expect(messageElement).toHaveAttribute('data-role', 'user');
      expect(messageElement).toHaveTextContent('Test content');
    });

    it('passes user role correctly', () => {
      const messages: ChatMessage[] = [createMessage('1', 'user', 'User message')];

      render(<MessageList messages={messages} />);

      expect(screen.getByTestId('message-1')).toHaveAttribute('data-role', 'user');
    });

    it('passes assistant role correctly', () => {
      const messages: ChatMessage[] = [
        createMessage('1', 'assistant', 'Assistant message'),
      ];

      render(<MessageList messages={messages} />);

      expect(screen.getByTestId('message-1')).toHaveAttribute('data-role', 'assistant');
    });
  });

  describe('layout', () => {
    it('has vertical spacing between messages', () => {
      const messages: ChatMessage[] = [
        createMessage('1', 'user', 'First'),
        createMessage('2', 'assistant', 'Second'),
      ];

      const { container } = render(<MessageList messages={messages} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('space-y-4');
    });
  });

  describe('unique keys', () => {
    it('uses message id as key', () => {
      const messages: ChatMessage[] = [
        createMessage('unique-1', 'user', 'First'),
        createMessage('unique-2', 'assistant', 'Second'),
      ];

      render(<MessageList messages={messages} />);

      expect(screen.getByTestId('message-unique-1')).toBeInTheDocument();
      expect(screen.getByTestId('message-unique-2')).toBeInTheDocument();
    });
  });

  describe('with single message', () => {
    it('renders single user message', () => {
      const messages: ChatMessage[] = [createMessage('1', 'user', 'Solo message')];

      render(<MessageList messages={messages} />);

      expect(screen.getByText('Solo message')).toBeInTheDocument();
    });

    it('renders single assistant message', () => {
      const messages: ChatMessage[] = [
        createMessage('1', 'assistant', 'Assistant solo'),
      ];

      render(<MessageList messages={messages} />);

      expect(screen.getByText('Assistant solo')).toBeInTheDocument();
    });
  });
});
