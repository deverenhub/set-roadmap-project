// src/components/chat/MessageList.tsx
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '@/hooks/useAIChat';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
