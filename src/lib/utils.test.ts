// src/lib/utils.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cn,
  formatDate,
  formatRelativeTime,
  getPriorityColor,
  getStatusColor,
  generateId,
  debounce,
} from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      expect(cn('base', isActive && 'active')).toBe('base active');
    });

    it('handles false conditional classes', () => {
      const isActive = false;
      expect(cn('base', isActive && 'active')).toBe('base');
    });

    it('handles undefined values', () => {
      expect(cn('base', undefined, 'end')).toBe('base end');
    });

    it('handles null values', () => {
      expect(cn('base', null, 'end')).toBe('base end');
    });

    it('handles arrays of classes', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('handles objects with boolean values', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });

    it('merges tailwind classes correctly', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('merges conflicting tailwind classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });

    it('handles mixed input types', () => {
      expect(cn('base', ['arr1', 'arr2'], { obj: true })).toBe('base arr1 arr2 obj');
    });
  });

  describe('formatDate', () => {
    it('formats a Date object', () => {
      // Use a date with time to avoid timezone issues
      const date = new Date(2024, 0, 15, 12, 0, 0); // Jan 15, 2024
      const result = formatDate(date);
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('formats a date string', () => {
      // Use ISO format with time to avoid timezone issues
      const result = formatDate('2024-06-20T12:00:00');
      expect(result).toContain('Jun');
      expect(result).toContain('20');
      expect(result).toContain('2024');
    });

    it('formats ISO date string', () => {
      const result = formatDate('2024-12-25T10:30:00');
      expect(result).toContain('Dec');
      expect(result).toContain('2024');
    });

    it('handles different months', () => {
      expect(formatDate('2024-03-15T12:00:00')).toContain('Mar');
      expect(formatDate('2024-09-15T12:00:00')).toContain('Sep');
      expect(formatDate('2024-11-15T12:00:00')).toContain('Nov');
    });

    it('handles single digit days', () => {
      const result = formatDate('2024-01-05T12:00:00');
      expect(result).toMatch(/5/);
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "just now" for times less than a minute ago', () => {
      const thirtySecondsAgo = new Date('2024-06-15T11:59:30Z');
      expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now');
    });

    it('returns minutes ago for times less than an hour ago', () => {
      const fiveMinutesAgo = new Date('2024-06-15T11:55:00Z');
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
    });

    it('returns hours ago for times less than a day ago', () => {
      const threeHoursAgo = new Date('2024-06-15T09:00:00Z');
      expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');
    });

    it('returns days ago for times less than a week ago', () => {
      const twoDaysAgo = new Date('2024-06-13T12:00:00Z');
      expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago');
    });

    it('returns formatted date for times more than a week ago', () => {
      const twoWeeksAgo = new Date('2024-06-01T12:00:00Z');
      const result = formatRelativeTime(twoWeeksAgo);
      expect(result).toContain('Jun');
      expect(result).toContain('2024');
    });

    it('handles string dates', () => {
      expect(formatRelativeTime('2024-06-15T11:30:00Z')).toBe('30m ago');
    });

    it('handles Date objects', () => {
      const date = new Date('2024-06-15T10:00:00Z');
      expect(formatRelativeTime(date)).toBe('2h ago');
    });

    it('returns 59m ago at boundary', () => {
      const fiftyNineMinutesAgo = new Date('2024-06-15T11:01:00Z');
      expect(formatRelativeTime(fiftyNineMinutesAgo)).toBe('59m ago');
    });

    it('returns 23h ago at boundary', () => {
      const twentyThreeHoursAgo = new Date('2024-06-14T13:00:00Z');
      expect(formatRelativeTime(twentyThreeHoursAgo)).toBe('23h ago');
    });

    it('returns 6d ago at boundary', () => {
      const sixDaysAgo = new Date('2024-06-09T12:00:00Z');
      expect(formatRelativeTime(sixDaysAgo)).toBe('6d ago');
    });
  });

  describe('getPriorityColor', () => {
    it('returns red for CRITICAL priority', () => {
      expect(getPriorityColor('CRITICAL')).toBe('text-red-600');
    });

    it('returns orange for HIGH priority', () => {
      expect(getPriorityColor('HIGH')).toBe('text-orange-600');
    });

    it('returns yellow for MEDIUM priority', () => {
      expect(getPriorityColor('MEDIUM')).toBe('text-yellow-600');
    });

    it('returns green for LOW priority', () => {
      expect(getPriorityColor('LOW')).toBe('text-green-600');
    });

    it('returns slate for unknown priority', () => {
      expect(getPriorityColor('UNKNOWN')).toBe('text-slate-600');
    });

    it('returns slate for empty string', () => {
      expect(getPriorityColor('')).toBe('text-slate-600');
    });

    it('is case sensitive', () => {
      expect(getPriorityColor('high')).toBe('text-slate-600');
      expect(getPriorityColor('High')).toBe('text-slate-600');
    });
  });

  describe('getStatusColor', () => {
    it('returns slate for not_started status', () => {
      expect(getStatusColor('not_started')).toBe('text-slate-500');
    });

    it('returns blue for in_progress status', () => {
      expect(getStatusColor('in_progress')).toBe('text-blue-500');
    });

    it('returns green for completed status', () => {
      expect(getStatusColor('completed')).toBe('text-green-500');
    });

    it('returns red for blocked status', () => {
      expect(getStatusColor('blocked')).toBe('text-red-500');
    });

    it('returns slate for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('text-slate-500');
    });

    it('returns slate for empty string', () => {
      expect(getStatusColor('')).toBe('text-slate-500');
    });

    it('is case sensitive', () => {
      expect(getStatusColor('IN_PROGRESS')).toBe('text-slate-500');
      expect(getStatusColor('Completed')).toBe('text-slate-500');
    });
  });

  describe('generateId', () => {
    it('generates a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('generates a non-empty string', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });

    it('generates unique ids', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });

    it('generates ids with consistent format', () => {
      const id = generateId();
      // Test setup mocks crypto.randomUUID to return 'test-uuid-xxx' format
      // In production, it returns standard UUID v4 format
      expect(id).toMatch(/^test-uuid-|^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('delays function execution', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('cancels previous calls when called again', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      vi.advanceTimersByTime(50);
      debouncedFn();
      vi.advanceTimersByTime(50);

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('passes arguments to the original function', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg1', 'arg2');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('uses the latest arguments when called multiple times', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
    });

    it('can be called again after delay completes', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('first');
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('first');

      debouncedFn('second');
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('second');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('works with different delay values', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn();
      vi.advanceTimersByTime(400);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('handles rapid successive calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      for (let i = 0; i < 10; i++) {
        debouncedFn(i);
        vi.advanceTimersByTime(10);
      }

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(9);
    });
  });
});
