// src/components/chat/ChatPanel.test.tsx
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatPanel } from './ChatPanel';
import type { ChatMessage } from '@/hooks/useAIChat';

// Mock scrollIntoView which is not available in jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// Mock function references
const mockSendMessage = vi.fn();
const mockCancelRequest = vi.fn();
const mockClearChat = vi.fn();
const mockStartListening = vi.fn();
const mockStopListening = vi.fn();
const mockResetTranscript = vi.fn();

// Default mock states
let mockMessages: ChatMessage[] = [];
let mockIsLoading = false;
let mockError: string | null = null;
let mockIsListening = false;
let mockTranscript = '';
let mockInterimTranscript = '';
let mockVoiceError: string | null = null;
let mockIsVoiceSupported = true;

vi.mock('@/hooks', () => ({
  useAIChat: () => ({
    messages: mockMessages,
    isLoading: mockIsLoading,
    error: mockError,
    sendMessage: mockSendMessage,
    cancelRequest: mockCancelRequest,
    clearChat: mockClearChat,
  }),
  useVoiceInput: () => ({
    isListening: mockIsListening,
    transcript: mockTranscript,
    interimTranscript: mockInterimTranscript,
    error: mockVoiceError,
    isSupported: mockIsVoiceSupported,
    startListening: mockStartListening,
    stopListening: mockStopListening,
    resetTranscript: mockResetTranscript,
  }),
  suggestedQueries: [
    'What is our overall progress?',
    'Which capabilities are critical?',
    'Show me blocked milestones',
  ],
}));

// Mock the child components
vi.mock('./MessageList', () => ({
  MessageList: ({ messages }: { messages: ChatMessage[] }) => (
    <div data-testid="message-list">
      {messages.map((msg) => (
        <div key={msg.id} data-testid={`message-${msg.id}`}>
          {msg.content}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('./SuggestionChips', () => ({
  SuggestionChips: ({
    suggestions,
    onSelect,
  }: {
    suggestions: string[];
    onSelect: (s: string) => void;
  }) => (
    <div data-testid="suggestion-chips">
      {suggestions.map((s, i) => (
        <button key={i} onClick={() => onSelect(s)} data-testid={`suggestion-${i}`}>
          {s}
        </button>
      ))}
    </div>
  ),
}));

describe('ChatPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock states
    mockMessages = [];
    mockIsLoading = false;
    mockError = null;
    mockIsListening = false;
    mockTranscript = '';
    mockInterimTranscript = '';
    mockVoiceError = null;
    mockIsVoiceSupported = true;
  });

  describe('rendering', () => {
    it('renders when open', () => {
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('renders Claude badge', () => {
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText('Claude')).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<ChatPanel {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('renders clear chat button', () => {
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByTitle('Clear chat')).toBeInTheDocument();
    });

    it('renders input field', () => {
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument();
    });
  });

  describe('visibility', () => {
    it('is visible when isOpen is true', () => {
      const { container } = render(<ChatPanel {...defaultProps} isOpen={true} />);
      const panel = container.querySelector('.fixed');
      expect(panel).toHaveClass('translate-x-0');
    });

    it('is hidden when isOpen is false', () => {
      const { container } = render(<ChatPanel {...defaultProps} isOpen={false} />);
      const panel = container.querySelector('.fixed');
      expect(panel).toHaveClass('translate-x-full');
    });
  });

  describe('empty state', () => {
    it('shows welcome message when no messages', () => {
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText('How can I help?')).toBeInTheDocument();
    });

    it('shows description when no messages', () => {
      render(<ChatPanel {...defaultProps} />);
      expect(
        screen.getByText(/Ask me anything about your roadmap/)
      ).toBeInTheDocument();
    });

    it('shows suggestion chips when no messages', () => {
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByTestId('suggestion-chips')).toBeInTheDocument();
    });
  });

  describe('with messages', () => {
    it('shows MessageList when messages exist', () => {
      mockMessages = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Hi there!', timestamp: new Date() },
      ];
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
    });

    it('does not show welcome message when messages exist', () => {
      mockMessages = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
      ];
      render(<ChatPanel {...defaultProps} />);
      expect(screen.queryByText('How can I help?')).not.toBeInTheDocument();
    });

    it('does not show suggestion chips when messages exist', () => {
      mockMessages = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
      ];
      render(<ChatPanel {...defaultProps} />);
      expect(screen.queryByTestId('suggestion-chips')).not.toBeInTheDocument();
    });
  });

  describe('sending messages', () => {
    it('sends message on form submit', () => {
      render(<ChatPanel {...defaultProps} />);

      const input = screen.getByPlaceholderText('Ask a question...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Hello AI' } });
      fireEvent.submit(input.closest('form')!);

      expect(mockSendMessage).toHaveBeenCalledWith('Hello AI');
    });

    it('clears input after sending', async () => {
      render(<ChatPanel {...defaultProps} />);

      const input = screen.getByPlaceholderText('Ask a question...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('does not send empty messages', () => {
      render(<ChatPanel {...defaultProps} />);

      const input = screen.getByPlaceholderText('Ask a question...');
      fireEvent.submit(input.closest('form')!);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('sends message when suggestion is clicked', () => {
      render(<ChatPanel {...defaultProps} />);

      fireEvent.click(screen.getByTestId('suggestion-0'));

      expect(mockSendMessage).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('disables input when loading', () => {
      mockIsLoading = true;
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByPlaceholderText('Ask a question...')).toBeDisabled();
    });

    it('shows cancel button when loading', () => {
      mockIsLoading = true;
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls cancelRequest when cancel button clicked', () => {
      mockIsLoading = true;
      render(<ChatPanel {...defaultProps} />);
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockCancelRequest).toHaveBeenCalled();
    });
  });

  describe('error state', () => {
    it('displays error message', () => {
      mockError = 'Something went wrong';
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('error has red styling', () => {
      mockError = 'Something went wrong';
      render(<ChatPanel {...defaultProps} />);
      const error = screen.getByText('Something went wrong');
      expect(error).toHaveClass('text-red-600');
    });
  });

  describe('clear chat functionality', () => {
    it('calls clearChat when clear button clicked', () => {
      render(<ChatPanel {...defaultProps} />);
      fireEvent.click(screen.getByTitle('Clear chat'));
      expect(mockClearChat).toHaveBeenCalled();
    });
  });

  describe('voice input', () => {
    it('shows voice button when supported', () => {
      render(<ChatPanel {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(2);
    });

    it('shows listening indicator when listening', () => {
      mockIsListening = true;
      mockInterimTranscript = 'Hello';
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText('Listening...')).toBeInTheDocument();
    });

    it('shows interim transcript when listening', () => {
      mockIsListening = true;
      mockInterimTranscript = 'Test interim';
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText('Test interim')).toBeInTheDocument();
    });

    it('updates input placeholder when listening', () => {
      mockIsListening = true;
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByPlaceholderText('Listening...')).toBeInTheDocument();
    });
  });

  describe('voice error', () => {
    it('shows voice error when present', () => {
      mockVoiceError = 'Microphone access denied';
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText('Microphone access denied')).toBeInTheDocument();
    });
  });

  describe('panel styling', () => {
    it('has correct width', () => {
      const { container } = render(<ChatPanel {...defaultProps} />);
      const panel = container.querySelector('.fixed');
      expect(panel).toHaveClass('w-96');
    });

    it('has border and shadow', () => {
      const { container } = render(<ChatPanel {...defaultProps} />);
      const panel = container.querySelector('.fixed');
      expect(panel).toHaveClass('border-l', 'shadow-xl');
    });

    it('has transition animation', () => {
      const { container } = render(<ChatPanel {...defaultProps} />);
      const panel = container.querySelector('.fixed');
      expect(panel).toHaveClass('transition-transform', 'duration-300');
    });
  });

  describe('header', () => {
    it('has border at bottom', () => {
      const { container } = render(<ChatPanel {...defaultProps} />);
      const header = container.querySelector('.border-b');
      expect(header).toBeInTheDocument();
    });

    it('contains AI Assistant title', () => {
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });
  });
});
