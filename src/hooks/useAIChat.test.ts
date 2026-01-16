// src/hooks/useAIChat.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIChat, suggestedQueries, formatToolResponse } from './useAIChat';

// Mock utils
vi.mock('@/lib/utils', () => ({
  generateId: vi.fn(() => 'mock-id-' + Math.random().toString(36).substr(2, 9)),
}));

// Mock chat store
const mockSetSessionId = vi.fn();
let mockSessionId: string | null = null;

vi.mock('@/stores/chatStore', () => ({
  useChatStore: () => ({
    sessionId: mockSessionId,
    setSessionId: mockSetSessionId,
  }),
}));

// Mock Supabase
const mockGetSession = vi.fn();
const mockInsert = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
    },
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useAIChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionId = null;
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-123' },
          access_token: 'token-123',
        },
      },
    });
    mockInsert.mockResolvedValue({ error: null });
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns initial state', () => {
      const { result } = renderHook(() => useAIChat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('provides required functions', () => {
      const { result } = renderHook(() => useAIChat());

      expect(typeof result.current.sendMessage).toBe('function');
      expect(typeof result.current.cancelRequest).toBe('function');
      expect(typeof result.current.clearChat).toBe('function');
      expect(typeof result.current.newSession).toBe('function');
    });
  });

  describe('sendMessage', () => {
    it('does not send empty messages', async () => {
      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('');
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.messages).toEqual([]);
    });

    it('does not send whitespace-only messages', async () => {
      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('   ');
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('adds user message to chat', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'AI response' }),
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('Hello AI');
      });

      expect(result.current.messages.length).toBeGreaterThanOrEqual(1);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].content).toBe('Hello AI');
    });

    it('sets isLoading to true while sending', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useAIChat());

      act(() => {
        result.current.sendMessage('Hello');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Clean up
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () => Promise.resolve({ message: 'Response' }),
        });
      });
    });

    it('adds assistant message on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'AI response', toolCalls: [] }),
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      expect(result.current.messages[1].role).toBe('assistant');
      expect(result.current.messages[1].content).toBe('AI response');
    });

    it('handles tool calls in response', async () => {
      const toolCalls = [{ tool: 'get_dashboard_kpis', result: { overallProgress: 50 } }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Here are the KPIs', toolCalls }),
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('Show me the dashboard');
      });

      await waitFor(() => {
        expect(result.current.messages[1].toolCalls).toEqual(toolCalls);
      });
    });

    it('handles authentication error', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Not authenticated');
      });
    });

    it('handles HTTP error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Server error');
      });
    });

    it('handles network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });

    it('creates new session if none exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Response' }),
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(mockSetSessionId).toHaveBeenCalled();
    });

    it('does not send while loading', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useAIChat());

      // Start first request
      act(() => {
        result.current.sendMessage('First');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Try to send second message while loading
      await act(async () => {
        await result.current.sendMessage('Second');
      });

      // Should only have called fetch once
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Clean up
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () => Promise.resolve({ message: 'Response' }),
        });
      });
    });
  });

  describe('cancelRequest', () => {
    it('aborts ongoing request', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useAIChat());

      act(() => {
        result.current.sendMessage('Hello');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        result.current.cancelRequest();
      });

      expect(result.current.isLoading).toBe(false);

      // Resolve to clean up
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ message: 'Response' }),
      });
    });
  });

  describe('clearChat', () => {
    it('clears messages', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Response' }),
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(result.current.messages.length).toBeGreaterThan(0);

      act(() => {
        result.current.clearChat();
      });

      expect(result.current.messages).toEqual([]);
    });

    it('clears error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error'));

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      act(() => {
        result.current.clearChat();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('newSession', () => {
    it('clears chat and creates new session', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Response' }),
      });

      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      act(() => {
        result.current.newSession();
      });

      expect(result.current.messages).toEqual([]);
      expect(mockSetSessionId).toHaveBeenCalled();
    });
  });

  describe('suggestedQueries', () => {
    it('exports suggested queries', () => {
      expect(suggestedQueries).toBeDefined();
      expect(Array.isArray(suggestedQueries)).toBe(true);
      expect(suggestedQueries.length).toBeGreaterThan(0);
    });

    it('includes expected queries', () => {
      expect(suggestedQueries).toContain('What is our overall progress?');
      expect(suggestedQueries).toContain('Which capabilities are critical?');
      expect(suggestedQueries).toContain('Show me blocked milestones');
    });
  });

  describe('formatToolResponse', () => {
    it('formats get_dashboard_kpis response', () => {
      const result = {
        overallProgress: 75,
        activeMilestones: 5,
        completedQuickWins: 10,
        totalQuickWins: 15,
        blockedMilestones: 2,
      };

      const formatted = formatToolResponse('get_dashboard_kpis', result);

      expect(formatted).toContain('Overall Progress: 75%');
      expect(formatted).toContain('Active Milestones: 5');
      expect(formatted).toContain('Quick Wins: 10/15 completed');
      expect(formatted).toContain('Blocked Items: 2');
    });

    it('formats get_capabilities response', () => {
      const result = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const formatted = formatToolResponse('get_capabilities', result);
      expect(formatted).toBe('Found 3 capabilities');
    });

    it('handles empty capabilities', () => {
      const formatted = formatToolResponse('get_capabilities', []);
      expect(formatted).toBe('No capabilities found.');
    });

    it('handles null capabilities', () => {
      const formatted = formatToolResponse('get_capabilities', null);
      expect(formatted).toBe('No capabilities found.');
    });

    it('formats get_milestones response', () => {
      const result = [{ id: '1' }, { id: '2' }];
      const formatted = formatToolResponse('get_milestones', result);
      expect(formatted).toBe('Found 2 milestones');
    });

    it('handles empty milestones', () => {
      const formatted = formatToolResponse('get_milestones', []);
      expect(formatted).toBe('No milestones found.');
    });

    it('formats get_quick_wins response', () => {
      const result = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
      const formatted = formatToolResponse('get_quick_wins', result);
      expect(formatted).toBe('Found 4 quick wins');
    });

    it('handles empty quick wins', () => {
      const formatted = formatToolResponse('get_quick_wins', []);
      expect(formatted).toBe('No quick wins found.');
    });

    it('formats generate_progress_report response', () => {
      const result = { summary: 'Project is on track with 75% completion' };
      const formatted = formatToolResponse('generate_progress_report', result);
      expect(formatted).toBe('Project is on track with 75% completion');
    });

    it('formats analyze_dependencies response', () => {
      const result = { summary: 'Found 3 critical dependencies' };
      const formatted = formatToolResponse('analyze_dependencies', result);
      expect(formatted).toBe('Found 3 critical dependencies');
    });

    it('formats unknown tool response as JSON', () => {
      const result = { custom: 'data', value: 42 };
      const formatted = formatToolResponse('unknown_tool', result);
      expect(formatted).toBe(JSON.stringify(result, null, 2));
    });
  });
});
