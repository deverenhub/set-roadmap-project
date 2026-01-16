// src/hooks/useActivityLog.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  activityLogKeys,
  formatActivityDescription,
  formatTableName,
  getChangedFields,
  useActivityLog,
  useRecordActivity,
  useUserActivity,
} from './useActivityLog';

// Mock Supabase
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockEq = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockNot = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
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
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useActivityLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default chain
    mockSelect.mockReturnValue({
      order: mockOrder,
      eq: mockEq,
      gte: mockGte,
      lte: mockLte,
      limit: mockLimit,
    });
    mockOrder.mockReturnValue({
      limit: mockLimit,
      eq: mockEq,
      gte: mockGte,
      lte: mockLte,
    });
    mockLimit.mockReturnValue({
      eq: mockEq,
      gte: mockGte,
      lte: mockLte,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
      gte: mockGte,
      lte: mockLte,
      order: mockOrder,
    });
    mockGte.mockReturnValue({
      lte: mockLte,
      eq: mockEq,
    });
    mockLte.mockReturnValue({
      eq: mockEq,
    });
  });

  describe('activityLogKeys', () => {
    it('creates base key', () => {
      expect(activityLogKeys.all).toEqual(['activityLog']);
    });

    it('creates lists key', () => {
      expect(activityLogKeys.lists()).toEqual(['activityLog', 'list']);
    });

    it('creates list key with filters', () => {
      const filters = { tableName: 'milestones', action: 'INSERT' as const };
      expect(activityLogKeys.list(filters)).toEqual(['activityLog', 'list', filters]);
    });

    it('creates infinite key with filters', () => {
      const filters = { userId: 'user-123' };
      expect(activityLogKeys.infinite(filters)).toEqual(['activityLog', 'infinite', filters]);
    });

    it('creates byRecord key', () => {
      expect(activityLogKeys.byRecord('milestones', 'record-123')).toEqual([
        'activityLog',
        'record',
        'milestones',
        'record-123',
      ]);
    });

    it('creates byUser key', () => {
      expect(activityLogKeys.byUser('user-123')).toEqual(['activityLog', 'user', 'user-123']);
    });

    it('creates stats key', () => {
      expect(activityLogKeys.stats()).toEqual(['activityLog', 'stats']);
    });
  });

  describe('formatActivityDescription', () => {
    it('formats INSERT action', () => {
      const result = formatActivityDescription(
        'INSERT',
        'milestones',
        { name: 'Test Milestone' },
        null
      );
      expect(result).toBe('Created milestone "Test Milestone"');
    });

    it('formats UPDATE action', () => {
      const result = formatActivityDescription(
        'UPDATE',
        'capabilities',
        { name: 'Updated Cap' },
        { name: 'Old Cap' }
      );
      expect(result).toBe('Updated capability "Updated Cap"');
    });

    it('formats DELETE action', () => {
      const result = formatActivityDescription(
        'DELETE',
        'quick_wins',
        null,
        { name: 'Deleted Win' }
      );
      expect(result).toBe('Deleted quick win "Deleted Win"');
    });

    it('uses item as fallback name', () => {
      const result = formatActivityDescription('INSERT', 'milestones', {}, null);
      expect(result).toBe('Created milestone "item"');
    });

    it('handles unknown action', () => {
      const result = formatActivityDescription('UNKNOWN', 'comments', { name: 'Test' }, null);
      expect(result).toBe('Modified comment');
    });
  });

  describe('formatTableName', () => {
    it('formats capabilities table', () => {
      expect(formatTableName('capabilities')).toBe('capability');
    });

    it('formats milestones table', () => {
      expect(formatTableName('milestones')).toBe('milestone');
    });

    it('formats quick_wins table', () => {
      expect(formatTableName('quick_wins')).toBe('quick win');
    });

    it('formats technology_options table', () => {
      expect(formatTableName('technology_options')).toBe('technology option');
    });

    it('formats comments table', () => {
      expect(formatTableName('comments')).toBe('comment');
    });

    it('formats users table', () => {
      expect(formatTableName('users')).toBe('user');
    });

    it('formats unknown table by replacing underscores', () => {
      expect(formatTableName('some_other_table')).toBe('some other table');
    });
  });

  describe('getChangedFields', () => {
    it('returns empty array when oldValues is null', () => {
      const result = getChangedFields(null, { name: 'Test' });
      expect(result).toEqual([]);
    });

    it('returns empty array when newValues is null', () => {
      const result = getChangedFields({ name: 'Test' }, null);
      expect(result).toEqual([]);
    });

    it('returns empty array when both are null', () => {
      const result = getChangedFields(null, null);
      expect(result).toEqual([]);
    });

    it('returns changed fields', () => {
      const result = getChangedFields(
        { name: 'Old Name', status: 'pending' },
        { name: 'New Name', status: 'pending' }
      );
      expect(result).toEqual([{ field: 'name', oldValue: 'Old Name', newValue: 'New Name' }]);
    });

    it('returns multiple changed fields', () => {
      const result = getChangedFields(
        { name: 'Old', status: 'pending', priority: 'low' },
        { name: 'New', status: 'completed', priority: 'low' }
      );
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ field: 'name', oldValue: 'Old', newValue: 'New' });
      expect(result).toContainEqual({ field: 'status', oldValue: 'pending', newValue: 'completed' });
    });

    it('ignores updated_at field', () => {
      const result = getChangedFields(
        { name: 'Same', updated_at: '2024-01-01' },
        { name: 'Same', updated_at: '2024-01-02' }
      );
      expect(result).toEqual([]);
    });

    it('ignores created_at field', () => {
      const result = getChangedFields(
        { name: 'Same', created_at: '2024-01-01' },
        { name: 'Same', created_at: '2024-01-02' }
      );
      expect(result).toEqual([]);
    });

    it('compares nested objects', () => {
      const result = getChangedFields(
        { data: { a: 1, b: 2 } },
        { data: { a: 1, b: 3 } }
      );
      expect(result).toEqual([
        { field: 'data', oldValue: { a: 1, b: 2 }, newValue: { a: 1, b: 3 } },
      ]);
    });

    it('returns empty when values are identical', () => {
      const result = getChangedFields(
        { name: 'Same', count: 5 },
        { name: 'Same', count: 5 }
      );
      expect(result).toEqual([]);
    });
  });

  describe('useActivityLog hook', () => {
    it('fetches activity log without filters', async () => {
      const mockData = [
        { id: '1', action: 'INSERT', table_name: 'milestones', user: null },
      ];
      mockLimit.mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useActivityLog(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('handles empty data', async () => {
      mockLimit.mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useActivityLog(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('handles fetch error', async () => {
      mockLimit.mockResolvedValueOnce({ data: null, error: new Error('Network error') });

      const { result } = renderHook(() => useActivityLog(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useRecordActivity hook', () => {
    it('is disabled when tableName is empty', () => {
      const { result } = renderHook(() => useRecordActivity('', 'record-123'), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('is disabled when recordId is empty', () => {
      const { result } = renderHook(() => useRecordActivity('milestones', ''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches activity for specific record', async () => {
      const mockData = [
        { id: '1', action: 'UPDATE', table_name: 'milestones', record_id: 'rec-1' },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });
      mockEq.mockReturnValue({
        eq: mockEq,
        order: mockOrder,
      });

      const { result } = renderHook(() => useRecordActivity('milestones', 'rec-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useUserActivity hook', () => {
    it('is disabled when userId is empty', () => {
      const { result } = renderHook(() => useUserActivity(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches activity for specific user', async () => {
      const mockData = [
        { id: '1', action: 'INSERT', user_id: 'user-123' },
      ];
      mockLimit.mockResolvedValueOnce({ data: mockData, error: null });
      mockEq.mockReturnValue({
        order: mockOrder,
      });
      mockOrder.mockReturnValue({
        limit: mockLimit,
      });

      const { result } = renderHook(() => useUserActivity('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
