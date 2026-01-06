// src/components/chat/ChatPanel.tsx
import { useRef, useEffect, useState } from 'react';
import { X, Send, Trash2, Sparkles, Mic, MicOff, Loader2 } from 'lucide-react';
import { useAIChat, useVoiceInput, suggestedQueries } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageList } from './MessageList';
import { SuggestionChips } from './SuggestionChips';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice input hook
  const {
    isListening,
    transcript,
    interimTranscript,
    error: voiceError,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput({
    continuous: false,
    interimResults: true,
    language: 'en-US',
  });

  // Update input value when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Auto-send when voice input completes (transcript is finalized)
  useEffect(() => {
    if (!isListening && transcript && transcript.trim()) {
      // Slight delay to show the transcript before sending
      const timer = setTimeout(() => {
        sendMessage(transcript.trim());
        resetTranscript();
        setInputValue('');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript, sendMessage, resetTranscript]);

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

    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
      resetTranscript();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setInputValue('');
      resetTranscript();
      startListening();
    }
  };

  // Get the display text (either input value or interim transcript)
  const displayValue = isListening && interimTranscript
    ? interimTranscript
    : inputValue;

  return (
    <TooltipProvider>
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
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Claude
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear chat</TooltipContent>
            </Tooltip>
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
                {isVoiceSupported && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <Mic className="h-3 w-3 inline mr-1" />
                    Voice input available
                  </p>
                )}
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
        {(error || voiceError) && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600">{error || voiceError}</p>
          </div>
        )}

        {/* Voice listening indicator */}
        {isListening && (
          <div className="px-4 py-2 bg-primary/10 border-t border-primary/20">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Mic className="h-4 w-4 text-primary animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
              <span className="text-sm text-primary">Listening...</span>
              {interimTranscript && (
                <span className="text-sm text-muted-foreground italic truncate flex-1">
                  {interimTranscript}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={displayValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Ask a question...'}
              disabled={isLoading || isListening}
              autoComplete="off"
              className={cn(
                isListening && 'border-primary bg-primary/5'
              )}
            />

            {/* Voice input button */}
            {isVoiceSupported && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isListening ? 'default' : 'outline'}
                    size="icon"
                    onClick={handleVoiceToggle}
                    disabled={isLoading}
                    className={cn(
                      isListening && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isListening ? 'Stop listening' : 'Voice input'}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Send/Cancel button */}
            {isLoading ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" onClick={cancelRequest}>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Cancel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cancel request</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    disabled={!inputValue.trim() || isListening}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send message</TooltipContent>
              </Tooltip>
            )}
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
}
