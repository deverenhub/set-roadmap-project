// src/lib/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIError, fetchDashboardKPIs } from './api';

// Mock Supabase
const mockSelect = vi.fn();

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  },
}));

describe('api', () => {
  describe('APIError', () => {
    it('creates error with message', () => {
      const error = new APIError('Something went wrong');
      expect(error.message).toBe('Something went wrong');
      expect(error.name).toBe('APIError');
    });

    it('creates error with message and status', () => {
      const error = new APIError('Not found', 404);
      expect(error.message).toBe('Not found');
      expect(error.status).toBe(404);
    });

    it('creates error with message, status, and code', () => {
      const error = new APIError('Validation failed', 400, 'VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
      expect(error.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('is an instance of Error', () => {
      const error = new APIError('Test');
      expect(error instanceof Error).toBe(true);
      expect(error instanceof APIError).toBe(true);
    });

    it('has optional status and code', () => {
      const error = new APIError('Test');
      expect(error.status).toBeUndefined();
      expect(error.code).toBeUndefined();
    });

    it('can be thrown and caught', () => {
      expect(() => {
        throw new APIError('Test error', 500);
      }).toThrow(APIError);
    });

    it('preserves stack trace', () => {
      const error = new APIError('Test');
      expect(error.stack).toBeDefined();
    });
  });

  describe('fetchDashboardKPIs', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('fetches and calculates KPIs correctly', async () => {
      mockSelect
        .mockResolvedValueOnce({
          data: [
            { current_level: 2, target_level: 4, priority: 'HIGH' },
            { current_level: 3, target_level: 5, priority: 'CRITICAL' },
          ],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [
            { status: 'in_progress' },
            { status: 'completed' },
            { status: 'blocked' },
          ],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [
            { status: 'completed' },
            { status: 'completed' },
            { status: 'in_progress' },
          ],
          error: null,
        });

      const result = await fetchDashboardKPIs();

      expect(result).toHaveProperty('overallProgress');
      expect(result).toHaveProperty('activeMilestones');
      expect(result).toHaveProperty('completedQuickWins');
      expect(result).toHaveProperty('totalQuickWins');
      expect(result).toHaveProperty('criticalCapabilities');
      expect(result).toHaveProperty('blockedMilestones');
    });

    it('calculates active milestones', async () => {
      mockSelect
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({
          data: [
            { status: 'in_progress' },
            { status: 'in_progress' },
            { status: 'completed' },
          ],
          error: null,
        })
        .mockResolvedValueOnce({ data: [], error: null });

      const result = await fetchDashboardKPIs();

      expect(result.activeMilestones).toBe(2);
    });

    it('calculates completed quick wins', async () => {
      mockSelect
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({
          data: [
            { status: 'completed' },
            { status: 'completed' },
            { status: 'completed' },
            { status: 'in_progress' },
          ],
          error: null,
        });

      const result = await fetchDashboardKPIs();

      expect(result.completedQuickWins).toBe(3);
      expect(result.totalQuickWins).toBe(4);
    });

    it('calculates critical capabilities', async () => {
      mockSelect
        .mockResolvedValueOnce({
          data: [
            { current_level: 1, target_level: 5, priority: 'CRITICAL' },
            { current_level: 2, target_level: 4, priority: 'CRITICAL' },
            { current_level: 3, target_level: 5, priority: 'HIGH' },
          ],
          error: null,
        })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const result = await fetchDashboardKPIs();

      expect(result.criticalCapabilities).toBe(2);
    });

    it('calculates blocked milestones', async () => {
      mockSelect
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({
          data: [
            { status: 'blocked' },
            { status: 'blocked' },
            { status: 'in_progress' },
          ],
          error: null,
        })
        .mockResolvedValueOnce({ data: [], error: null });

      const result = await fetchDashboardKPIs();

      expect(result.blockedMilestones).toBe(2);
    });

    it('calculates overall progress', async () => {
      mockSelect
        .mockResolvedValueOnce({
          data: [
            { current_level: 3, target_level: 5, priority: 'HIGH' }, // (3-1)/(5-1) = 50%
            { current_level: 5, target_level: 5, priority: 'LOW' }, // (5-1)/(5-1) = 100%
          ],
          error: null,
        })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const result = await fetchDashboardKPIs();

      // Average of 50% and 100% = 75%
      expect(result.overallProgress).toBe(75);
    });

    it('handles capability with target_level of 1', async () => {
      mockSelect
        .mockResolvedValueOnce({
          data: [
            { current_level: 1, target_level: 1, priority: 'LOW' }, // Should be 100%
          ],
          error: null,
        })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const result = await fetchDashboardKPIs();

      expect(result.overallProgress).toBe(100);
    });

    it('handles empty data', async () => {
      mockSelect
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const result = await fetchDashboardKPIs();

      expect(result.overallProgress).toBe(0);
      expect(result.activeMilestones).toBe(0);
      expect(result.completedQuickWins).toBe(0);
      expect(result.totalQuickWins).toBe(0);
      expect(result.criticalCapabilities).toBe(0);
      expect(result.blockedMilestones).toBe(0);
    });

    it('handles null data as empty array', async () => {
      mockSelect
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      const result = await fetchDashboardKPIs();

      expect(result.overallProgress).toBe(0);
      expect(result.activeMilestones).toBe(0);
      expect(result.completedQuickWins).toBe(0);
    });

    it('throws APIError on capabilities fetch error', async () => {
      mockSelect
        .mockResolvedValueOnce({ data: null, error: new Error('DB error') })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      await expect(fetchDashboardKPIs()).rejects.toThrow(APIError);
    });

    it('throws APIError with correct message on capabilities error', async () => {
      mockSelect
        .mockResolvedValueOnce({ data: null, error: new Error('DB error') })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      await expect(fetchDashboardKPIs()).rejects.toThrow('Failed to fetch KPIs');
    });

    it('throws APIError on milestones fetch error', async () => {
      mockSelect
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: null, error: new Error('DB error') })
        .mockResolvedValueOnce({ data: [], error: null });

      await expect(fetchDashboardKPIs()).rejects.toThrow(APIError);
    });

    it('throws APIError on quick wins fetch error', async () => {
      mockSelect
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: null, error: new Error('DB error') });

      await expect(fetchDashboardKPIs()).rejects.toThrow(APIError);
    });

    it('rounds overall progress to integer', async () => {
      mockSelect
        .mockResolvedValueOnce({
          data: [
            { current_level: 2, target_level: 5, priority: 'HIGH' }, // (2-1)/(5-1) = 25%
            { current_level: 2, target_level: 4, priority: 'LOW' }, // (2-1)/(4-1) = 33.33%
          ],
          error: null,
        })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const result = await fetchDashboardKPIs();

      // Average = (25 + 33.33) / 2 = 29.16, rounded to 29
      expect(Number.isInteger(result.overallProgress)).toBe(true);
    });
  });
});
