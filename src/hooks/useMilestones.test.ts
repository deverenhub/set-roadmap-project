// src/hooks/useMilestones.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  milestoneKeys,
  useMilestones,
  useMilestonesByCapability,
  useMilestone,
  useTimelineData,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useUpdateMilestonePosition,
  useUpdateMilestoneDuration,
} from './useMilestones';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendBlockedMilestoneEmails: vi.fn(),
}));

// Mock Teams notifications
vi.mock('./useTeamsNotifications', () => ({
  notifyTeamsBlockedMilestone: vi.fn().mockResolvedValue(undefined),
  notifyTeamsMilestoneCompleted: vi.fn().mockResolvedValue(undefined),
}));

// Mock preferences store
vi.mock('@/stores/preferencesStore', () => ({
  usePreferencesStore: {
    getState: () => ({
      preferences: {
        teamsNotifications: false,
        teamsWebhookUrl: null,
        teamsNotifyOnBlockedItems: false,
        teamsNotifyOnMilestoneComplete: false,
      },
    }),
  },
}));

// Mock Supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockOrder = vi.fn();
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

describe('useMilestones', () => {
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
    });
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockEq.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
      select: mockSelect,
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
  });

  describe('milestoneKeys', () => {
    it('creates base key', () => {
      expect(milestoneKeys.all).toEqual(['milestones']);
    });

    it('creates lists key', () => {
      expect(milestoneKeys.lists()).toEqual(['milestones', 'list']);
    });

    it('creates list key with filters', () => {
      const filters = { status: 'in_progress' };
      expect(milestoneKeys.list(filters)).toEqual(['milestones', 'list', filters]);
    });

    it('creates byCapability key', () => {
      expect(milestoneKeys.byCapability('cap-123')).toEqual([
        'milestones',
        'capability',
        'cap-123',
      ]);
    });

    it('creates details key', () => {
      expect(milestoneKeys.details()).toEqual(['milestones', 'detail']);
    });

    it('creates detail key with id', () => {
      expect(milestoneKeys.detail('ms-123')).toEqual(['milestones', 'detail', 'ms-123']);
    });

    it('creates timeline key with path', () => {
      expect(milestoneKeys.timeline('A')).toEqual(['milestones', 'timeline', 'A']);
      expect(milestoneKeys.timeline('B')).toEqual(['milestones', 'timeline', 'B']);
      expect(milestoneKeys.timeline('C')).toEqual(['milestones', 'timeline', 'C']);
    });
  });

  describe('useMilestones hook', () => {
    it('fetches milestones without filters', async () => {
      const mockData = [
        { id: '1', name: 'Milestone 1', status: 'in_progress', capability: null },
        { id: '2', name: 'Milestone 2', status: 'completed', capability: null },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useMilestones(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('returns empty array when no data', async () => {
      mockOrder.mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useMilestones(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('handles fetch error', async () => {
      mockOrder.mockResolvedValueOnce({ data: null, error: new Error('Network error') });

      const { result } = renderHook(() => useMilestones(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useMilestonesByCapability hook', () => {
    it('is disabled when capabilityId is empty', () => {
      const { result } = renderHook(() => useMilestonesByCapability(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches milestones for specific capability', async () => {
      const mockData = [
        { id: '1', name: 'Milestone 1', capability_id: 'cap-123' },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });
      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const { result } = renderHook(() => useMilestonesByCapability('cap-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useMilestone hook', () => {
    it('is disabled when id is empty', () => {
      const { result } = renderHook(() => useMilestone(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches single milestone by id', async () => {
      const mockMilestone = { id: 'ms-123', name: 'Test Milestone', capability: null };
      mockSingle.mockResolvedValueOnce({ data: mockMilestone, error: null });

      const { result } = renderHook(() => useMilestone('ms-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMilestone);
    });
  });

  describe('useTimelineData hook', () => {
    it('fetches timeline data with path B by default', async () => {
      const mockData = [
        {
          id: '1',
          name: 'MS 1',
          status: 'in_progress',
          from_level: 1,
          to_level: 2,
          path_b_months: 3,
          timeline_offset: 0,
          capability: { id: 'cap-1', name: 'Cap 1', color: '#ff0000', priority: 'HIGH' },
        },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useTimelineData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.[0]).toMatchObject({
        id: '1',
        name: 'MS 1',
        capability: 'Cap 1',
        duration: 3,
      });
    });

    it('uses path A duration when path A is specified', async () => {
      const mockData = [
        {
          id: '1',
          name: 'MS 1',
          path_a_months: 6,
          path_b_months: 3,
          path_c_months: 12,
          timeline_offset: 0,
          capability: { id: 'cap-1', name: 'Cap 1', color: '#ff0000' },
        },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useTimelineData('A'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.[0].duration).toBe(6);
    });

    it('uses path C duration when path C is specified', async () => {
      const mockData = [
        {
          id: '1',
          name: 'MS 1',
          path_a_months: 6,
          path_b_months: 3,
          path_c_months: 12,
          timeline_offset: 0,
          capability: { id: 'cap-1', name: 'Cap 1', color: '#ff0000' },
        },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useTimelineData('C'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.[0].duration).toBe(12);
    });

    it('defaults duration to 3 when path duration is missing', async () => {
      const mockData = [
        {
          id: '1',
          name: 'MS 1',
          timeline_offset: 0,
          capability: { id: 'cap-1', name: 'Cap 1', color: '#ff0000' },
        },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useTimelineData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.[0].duration).toBe(3);
    });
  });

  describe('useCreateMilestone mutation', () => {
    it('creates milestone', async () => {
      const mockCreated = { id: 'new-ms', name: 'New Milestone', capability_id: 'cap-123' };
      mockInsert.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockCreated, error: null }),
        }),
      });

      const { result } = renderHook(() => useCreateMilestone(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({
          name: 'New Milestone',
          capability_id: 'cap-123',
          from_level: 1,
          to_level: 2,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('handles creation error', async () => {
      mockInsert.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: null, error: new Error('Create failed') }),
        }),
      });

      const { result } = renderHook(() => useCreateMilestone(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({
          name: 'New Milestone',
          capability_id: 'cap-123',
          from_level: 1,
          to_level: 2,
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUpdateMilestone mutation', () => {
    it('provides mutate function', () => {
      const { result } = renderHook(() => useUpdateMilestone(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.mutate).toBe('function');
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('starts in idle state', () => {
      const { result } = renderHook(() => useUpdateMilestone(), {
        wrapper: createWrapper(),
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.isIdle).toBe(true);
    });
  });

  describe('useDeleteMilestone mutation', () => {
    it('deletes milestone', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useDeleteMilestone(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('ms-123');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockDelete).toHaveBeenCalled();
    });

    it('returns deleted id on success', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useDeleteMilestone(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate('ms-123');
      });

      await waitFor(() => {
        expect(result.current.data).toBe('ms-123');
      });
    });
  });

  describe('useUpdateMilestonePosition mutation', () => {
    it('updates milestone position', async () => {
      const mockUpdated = { id: 'ms-123', timeline_offset: 5 };
      mockEq.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockUpdated, error: null }),
        }),
      });

      const { result } = renderHook(() => useUpdateMilestonePosition(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ id: 'ms-123', timelineOffset: 5 });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useUpdateMilestoneDuration mutation', () => {
    it('updates milestone duration for path B', async () => {
      const mockUpdated = { id: 'ms-123', path_b_months: 6 };
      mockEq.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockUpdated, error: null }),
        }),
      });

      const { result } = renderHook(() => useUpdateMilestoneDuration(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ id: 'ms-123', path: 'B', duration: 6 });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('updates milestone duration for path A', async () => {
      mockEq.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: { id: 'ms-123', path_a_months: 9 }, error: null }),
        }),
      });

      const { result } = renderHook(() => useUpdateMilestoneDuration(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ id: 'ms-123', path: 'A', duration: 9 });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
