// src/components/chat/MessageInput.tsx
import { useRef, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  isLoading,
  placeholder = 'Type your message...',
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const message = textareaRef.current?.value.trim();
    if (message) {
      onSend(message);
      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        disabled={isLoading}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className="min-h-[40px] max-h-[120px] resize-none"
        rows={1}
      />
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        size="icon"
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
