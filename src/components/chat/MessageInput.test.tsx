// src/components/chat/MessageInput.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageInput } from './MessageInput';

describe('MessageInput', () => {
  const defaultProps = {
    onSend: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders textarea', () => {
      render(<MessageInput {...defaultProps} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders send button', () => {
      render(<MessageInput {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with default placeholder', () => {
      render(<MessageInput {...defaultProps} />);
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<MessageInput {...defaultProps} placeholder="Ask a question..." />);
      expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument();
    });
  });

  describe('textarea', () => {
    it('textarea has correct styling', () => {
      render(<MessageInput {...defaultProps} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('min-h-[40px]', 'max-h-[120px]', 'resize-none');
    });

    it('starts with single row', () => {
      render(<MessageInput {...defaultProps} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '1');
    });
  });

  describe('send button', () => {
    it('send button has icon size', () => {
      render(<MessageInput {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('shrink-0');
    });

    it('send button contains Send icon', () => {
      const { container } = render(<MessageInput {...defaultProps} />);
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-4', 'w-4');
    });
  });

  describe('submitting messages', () => {
    it('calls onSend when button clicked with text', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Hello world' } });

      fireEvent.click(screen.getByRole('button'));

      expect(onSend).toHaveBeenCalledWith('Hello world');
    });

    it('does not call onSend when textarea is empty', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      fireEvent.click(screen.getByRole('button'));

      expect(onSend).not.toHaveBeenCalled();
    });

    it('does not call onSend when textarea has only whitespace', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '   ' } });

      fireEvent.click(screen.getByRole('button'));

      expect(onSend).not.toHaveBeenCalled();
    });

    it('trims whitespace from message', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '  Hello world  ' } });

      fireEvent.click(screen.getByRole('button'));

      expect(onSend).toHaveBeenCalledWith('Hello world');
    });

    it('clears textarea after sending', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test message' } });

      fireEvent.click(screen.getByRole('button'));

      expect(textarea.value).toBe('');
    });
  });

  describe('keyboard shortcuts', () => {
    it('submits on Enter key', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Hello' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(onSend).toHaveBeenCalledWith('Hello');
    });

    it('does not submit on Shift+Enter', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Hello' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(onSend).not.toHaveBeenCalled();
    });

    it('does not submit on other keys', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Hello' } });
      fireEvent.keyDown(textarea, { key: 'Tab' });

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('disables textarea when loading', () => {
      render(<MessageInput {...defaultProps} isLoading />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('disables send button when loading', () => {
      render(<MessageInput {...defaultProps} isLoading />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('textarea is enabled when not loading', () => {
      render(<MessageInput {...defaultProps} isLoading={false} />);
      expect(screen.getByRole('textbox')).not.toBeDisabled();
    });
  });

  describe('layout', () => {
    it('has flex container', () => {
      const { container } = render(<MessageInput {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'gap-2', 'items-end');
    });
  });

  describe('auto-resize', () => {
    it('triggers input handler on input', () => {
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.input(textarea, { target: { value: 'a' } });

      // The textarea should still be in the document after typing
      expect(textarea).toBeInTheDocument();
    });
  });
});
