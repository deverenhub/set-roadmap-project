// src/hooks/useAIChat.ts
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useChatStore } from '@/stores/chatStore';
import { generateId } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{
    tool: string;
    result?: any;
  }>;
  isStreaming?: boolean;
}

interface AIResponse {
  message: string;
  toolCalls?: Array<{
    tool: string;
    result: any;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: string;
}

// Suggested queries for the AI assistant
export const suggestedQueries = [
  'What is our overall progress?',
  'Which capabilities are critical?',
  'Show me blocked milestones',
  'What quick wins are in progress?',
  'Generate a progress report',
  'Analyze dependencies',
];

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { sessionId, setSessionId } = useChatStore();

  // Send message to Claude AI via Edge Function
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Create new session if needed
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = generateId();
      setSessionId(currentSessionId);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Build conversation history for Claude
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add current message
      conversationHistory.push({
        role: 'user',
        content,
      });

      // Call Claude AI Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: conversationHistory,
            sessionId: currentSessionId,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data: AIResponse = await response.json();

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        toolCalls: data.toolCalls,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save to database
      await saveChatHistory(currentSessionId, userMessage, assistantMessage);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }

      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);

      // Add error message to chat
      const errorAssistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorAssistantMessage]);

    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, messages, sessionId, setSessionId]);

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Start new session
  const newSession = useCallback(() => {
    clearChat();
    setSessionId(generateId());
  }, [clearChat, setSessionId]);

  // Save chat to database
  const saveChatHistory = async (
    chatSessionId: string,
    userMsg: ChatMessage,
    assistantMsg: ChatMessage
  ) => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession?.user?.id) return;

    const records = [
      {
        user_id: currentSession.user.id,
        session_id: chatSessionId,
        role: userMsg.role,
        content: userMsg.content,
        created_at: userMsg.timestamp.toISOString(),
      },
      {
        user_id: currentSession.user.id,
        session_id: chatSessionId,
        role: assistantMsg.role,
        content: assistantMsg.content,
        metadata: assistantMsg.toolCalls ? { toolCalls: assistantMsg.toolCalls } : null,
        created_at: assistantMsg.timestamp.toISOString(),
      },
    ];

    await supabase.from('chat_history').insert(records);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    clearChat,
    newSession,
  };
}

// Format tool response for display (exported for other components if needed)
export function formatToolResponse(tool: string, result: any): string {
  switch (tool) {
    case 'get_dashboard_kpis':
      return `Overall Progress: ${result.overallProgress}%\n` +
        `Active Milestones: ${result.activeMilestones}\n` +
        `Quick Wins: ${result.completedQuickWins}/${result.totalQuickWins} completed\n` +
        `Blocked Items: ${result.blockedMilestones}`;

    case 'get_capabilities':
      if (!result?.length) return 'No capabilities found.';
      return `Found ${result.length} capabilities`;

    case 'get_milestones':
      if (!result?.length) return 'No milestones found.';
      return `Found ${result.length} milestones`;

    case 'get_quick_wins':
      if (!result?.length) return 'No quick wins found.';
      return `Found ${result.length} quick wins`;

    case 'generate_progress_report':
      return result.summary;

    case 'analyze_dependencies':
      return result.summary;

    default:
      return JSON.stringify(result, null, 2);
  }
}
