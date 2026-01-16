// src/hooks/useQuickWins.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  quickWinKeys,
  useQuickWins,
  useQuickWinsGrouped,
  useQuickWinStats,
  useQuickWin,
  useCreateQuickWin,
  useUpdateQuickWin,
  useMoveQuickWin,
  useDeleteQuickWin,
} from './useQuickWins';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
  },
}));

// Create a wrapper for react-query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useQuickWins', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default chain
    mockSelect.mockReturnValue({
      order: mockOrder,
      eq: mockEq,
      single: mockSingle,
    });
    mockOrder.mockReturnValue({
      eq: mockEq,
      limit: mockLimit,
    });
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockEq.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    });
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: mockSingle,
      }),
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockDelete.mockReturnValue({
      eq: mockEq,
    });
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockLimit.mockResolvedValue({ data: null, error: null });
  });

  describe('quickWinKeys', () => {
    it('creates base key', () => {
      expect(quickWinKeys.all).toEqual(['quickWins']);
    });

    it('creates lists key', () => {
      expect(quickWinKeys.lists()).toEqual(['quickWins', 'list']);
    });

    it('creates list key with filters', () => {
      const filters = { status: 'in_progress' };
      expect(quickWinKeys.list(filters)).toEqual(['quickWins', 'list', filters]);
    });

    it('creates byStatus key', () => {
      expect(quickWinKeys.byStatus('completed')).toEqual(['quickWins', 'status', 'completed']);
    });

    it('creates grouped key', () => {
      expect(quickWinKeys.grouped()).toEqual(['quickWins', 'grouped']);
    });

    it('creates details key', () => {
      expect(quickWinKeys.details()).toEqual(['quickWins', 'detail']);
    });

    it('creates detail key with id', () => {
      expect(quickWinKeys.detail('qw-123')).toEqual(['quickWins', 'detail', 'qw-123']);
    });

    it('creates stats key', () => {
      expect(quickWinKeys.stats()).toEqual(['quickWins', 'stats']);
    });
  });

  describe('useQuickWins hook', () => {
    it('fetches quick wins without filters', async () => {
      const mockData = [
        { id: '1', name: 'Quick Win 1', status: 'in_progress', capability: null },
        { id: '2', name: 'Quick Win 2', status: 'completed', capability: null },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useQuickWins(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('returns empty array when no data', async () => {
      mockOrder.mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useQuickWins(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('handles fetch error', async () => {
      mockOrder.mockResolvedValueOnce({ data: null, error: new Error('Network error') });

      const { result } = renderHook(() => useQuickWins(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useQuickWinsGrouped hook', () => {
    it('returns grouped quick wins by status', async () => {
      const mockData = [
        { id: '1', name: 'QW 1', status: 'not_started', capability: null },
        { id: '2', name: 'QW 2', status: 'in_progress', capability: null },
        { id: '3', name: 'QW 3', status: 'completed', capability: null },
        { id: '4', name: 'QW 4', status: 'blocked', capability: null },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useQuickWinsGrouped(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        not_started: [mockData[0]],
        in_progress: [mockData[1]],
        completed: [mockData[2]],
        blocked: [mockData[3]],
      });
    });

    it('returns empty groups when no data', async () => {
      mockOrder.mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useQuickWinsGrouped(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        not_started: [],
        in_progress: [],
        completed: [],
        blocked: [],
      });
    });
  });

  describe('useQuickWinStats hook', () => {
    it('calculates stats from quick wins', async () => {
      const mockData = [
        { status: 'not_started', roi: 'LOW' },
        { status: 'in_progress', roi: 'HIGH' },
        { status: 'in_progress', roi: 'MEDIUM' },
        { status: 'completed', roi: 'HIGH' },
        { status: 'blocked', roi: 'LOW' },
      ];
      mockSelect.mockReturnValueOnce(Promise.resolve({ data: mockData, error: null }));

      const { result } = renderHook(() => useQuickWinStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        total: 5,
        not_started: 1,
        in_progress: 2,
        completed: 1,
        blocked: 1,
        high_roi: 2,
      });
    });

    it('returns zeros when no data', async () => {
      mockSelect.mockReturnValueOnce(Promise.resolve({ data: [], error: null }));

      const { result } = renderHook(() => useQuickWinStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        total: 0,
        not_started: 0,
        in_progress: 0,
        completed: 0,
        blocked: 0,
        high_roi: 0,
      });
    });
  });

  describe('useQuickWin hook', () => {
    it('is disabled when id is empty', () => {
      const { result } = renderHook(() => useQuickWin(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('is enabled when id is provided', () => {
      mockSingle.mockResolvedValue({ data: null, error: null });
      const { result } = renderHook(() => useQuickWin('qw-123'), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).not.toBe('idle');
    });
  });

  describe('useCreateQuickWin mutation', () => {
    it('provides mutate function', () => {
      const { result } = renderHook(() => useCreateQuickWin(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.mutate).toBe('function');
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('starts in idle state', () => {
      const { result } = renderHook(() => useCreateQuickWin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.isIdle).toBe(true);
    });
  });

  describe('useUpdateQuickWin mutation', () => {
    it('updates quick win', async () => {
      const mockUpdated = { id: 'qw-123', name: 'Updated Quick Win' };
      mockEq.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockUpdated, error: null }),
        }),
      });

      const { result } = renderHook(() => useUpdateQuickWin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ id: 'qw-123', name: 'Updated Quick Win' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUpdated);
    });
  });

  describe('useMoveQuickWin mutation', () => {
    it('moves quick win to new status and order', async () => {
      const mockMoved = { id: 'qw-123', status: 'completed', order: 3 };
      mockEq.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockMoved, error: null }),
        }),
      });

      const { result } = renderHook(() => useMoveQuickWin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ id: 'qw-123', status: 'completed', order: 3 });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useDeleteQuickWin mutation', () => {
    it('deletes quick win', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useDeleteQuickWin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('qw-123');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockDelete).toHaveBeenCalled();
    });

    it('returns deleted id on success', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useDeleteQuickWin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('qw-123');
      });

      await waitFor(() => {
        expect(result.current.data).toBe('qw-123');
      });
    });

    it('handles delete error', async () => {
      mockEq.mockResolvedValueOnce({ error: new Error('Delete failed') });

      const { result } = renderHook(() => useDeleteQuickWin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('qw-123');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
