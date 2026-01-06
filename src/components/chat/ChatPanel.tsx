// src/components/chat/ChatPanel.tsx
import { useRef, useEffect } from 'react';
import { X, Send, Trash2, Sparkles } from 'lucide-react';
import { useAIChat, suggestedQueries } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageList } from './MessageList';
import { SuggestionChips } from './SuggestionChips';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    clearChat,
  } = useAIChat();

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message') as string;
    
    if (message.trim()) {
      sendMessage(message.trim());
      e.currentTarget.reset();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-96 bg-background border-l shadow-xl z-50 flex flex-col transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="font-medium text-lg">How can I help?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ask me anything about your roadmap, capabilities, or progress.
              </p>
            </div>
            <SuggestionChips
              suggestions={suggestedQueries}
              onSelect={handleSuggestionClick}
            />
          </div>
        ) : (
          <>
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            name="message"
            placeholder="Ask a question..."
            disabled={isLoading}
            autoComplete="off"
          />
          {isLoading ? (
            <Button type="button" variant="outline" onClick={cancelRequest}>
              Cancel
            </Button>
          ) : (
            <Button type="submit">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
