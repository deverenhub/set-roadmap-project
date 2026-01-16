// src/hooks/useNotifications.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  notificationKeys,
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from './useNotifications';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock Supabase
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockEq = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
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

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });

    // Setup default chain
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    });
    mockOrder.mockReturnValue({
      limit: mockLimit,
    });
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockEq.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockDelete.mockReturnValue({
      eq: mockEq,
    });
  });

  describe('notificationKeys', () => {
    it('creates base key', () => {
      expect(notificationKeys.all).toEqual(['notifications']);
    });

    it('creates lists key', () => {
      expect(notificationKeys.lists()).toEqual(['notifications', 'list']);
    });

    it('creates list key with filters', () => {
      const filters = { limit: 20 };
      expect(notificationKeys.list(filters)).toEqual(['notifications', 'list', filters]);
    });

    it('creates unreadCount key', () => {
      expect(notificationKeys.unreadCount()).toEqual(['notifications', 'unread-count']);
    });
  });

  describe('useNotifications hook', () => {
    it('returns empty array when no user', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('fetches notifications for logged in user', async () => {
      const mockNotifications = [
        { id: '1', title: 'Test Notification', is_read: false, actor: null },
        { id: '2', title: 'Another Notification', is_read: true, actor: null },
      ];
      mockLimit.mockResolvedValueOnce({ data: mockNotifications, error: null });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockNotifications);
    });

    it('uses custom limit', async () => {
      mockLimit.mockResolvedValueOnce({ data: [], error: null });

      renderHook(() => useNotifications(50), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockLimit).toHaveBeenCalledWith(50);
      });
    });

    it('handles error', async () => {
      mockLimit.mockResolvedValueOnce({ data: null, error: new Error('Network error') });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUnreadNotificationCount hook', () => {
    it('returns 0 when no user', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });

      const { result } = renderHook(() => useUnreadNotificationCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(0);
    });

    it('returns count of unread notifications', async () => {
      mockEq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
      });

      const { result } = renderHook(() => useUnreadNotificationCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(5);
    });
  });

  describe('useMarkNotificationRead mutation', () => {
    it('updates notification to read', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('notification-123');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('handles mutation error', async () => {
      mockEq.mockResolvedValueOnce({ error: new Error('Update failed') });

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('notification-123');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useMarkAllNotificationsRead mutation', () => {
    it('throws error when not authenticated', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('marks all notifications as read', async () => {
      mockEq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useDeleteNotification mutation', () => {
    it('deletes notification', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useDeleteNotification(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('notification-123');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockDelete).toHaveBeenCalled();
    });

    it('returns notification id on success', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useDeleteNotification(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('notification-123');
      });

      await waitFor(() => {
        expect(result.current.data).toBe('notification-123');
      });
    });
  });

  describe('useClearAllNotifications mutation', () => {
    it('throws error when not authenticated', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });

      const { result } = renderHook(() => useClearAllNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('clears all notifications', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useClearAllNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
