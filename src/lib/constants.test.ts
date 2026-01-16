// src/lib/constants.test.ts
import { describe, it, expect } from 'vitest';
import {
  ROUTES,
  PRIORITIES,
  STATUSES,
  MATURITY_LEVELS,
  QUICK_WIN_CATEGORIES,
} from './constants';

describe('constants', () => {
  describe('ROUTES', () => {
    it('has HOME route', () => {
      expect(ROUTES.HOME).toBe('/');
    });

    it('has DASHBOARD route', () => {
      expect(ROUTES.DASHBOARD).toBe('/');
    });

    it('has CAPABILITIES route', () => {
      expect(ROUTES.CAPABILITIES).toBe('/capabilities');
    });

    it('has CAPABILITY_DETAIL route with parameter', () => {
      expect(ROUTES.CAPABILITY_DETAIL).toBe('/capabilities/:id');
    });

    it('has TIMELINE route', () => {
      expect(ROUTES.TIMELINE).toBe('/timeline');
    });

    it('has DEPENDENCIES route', () => {
      expect(ROUTES.DEPENDENCIES).toBe('/dependencies');
    });

    it('has QUICK_WINS route', () => {
      expect(ROUTES.QUICK_WINS).toBe('/quick-wins');
    });

    it('has SETTINGS route', () => {
      expect(ROUTES.SETTINGS).toBe('/settings');
    });

    it('has LOGIN route', () => {
      expect(ROUTES.LOGIN).toBe('/login');
    });

    it('contains all expected routes', () => {
      const routeKeys = Object.keys(ROUTES);
      expect(routeKeys).toContain('HOME');
      expect(routeKeys).toContain('DASHBOARD');
      expect(routeKeys).toContain('CAPABILITIES');
      expect(routeKeys).toContain('CAPABILITY_DETAIL');
      expect(routeKeys).toContain('TIMELINE');
      expect(routeKeys).toContain('DEPENDENCIES');
      expect(routeKeys).toContain('QUICK_WINS');
      expect(routeKeys).toContain('SETTINGS');
      expect(routeKeys).toContain('LOGIN');
    });
  });

  describe('PRIORITIES', () => {
    it('has CRITICAL priority', () => {
      expect(PRIORITIES.CRITICAL).toEqual({
        label: 'Critical',
        color: '#ef4444',
        bgColor: 'bg-red-500',
      });
    });

    it('has HIGH priority', () => {
      expect(PRIORITIES.HIGH).toEqual({
        label: 'High',
        color: '#f97316',
        bgColor: 'bg-orange-500',
      });
    });

    it('has MEDIUM priority', () => {
      expect(PRIORITIES.MEDIUM).toEqual({
        label: 'Medium',
        color: '#eab308',
        bgColor: 'bg-yellow-500',
      });
    });

    it('has LOW priority', () => {
      expect(PRIORITIES.LOW).toEqual({
        label: 'Low',
        color: '#22c55e',
        bgColor: 'bg-green-500',
      });
    });

    it('all priorities have label, color, and bgColor', () => {
      Object.values(PRIORITIES).forEach((priority) => {
        expect(priority).toHaveProperty('label');
        expect(priority).toHaveProperty('color');
        expect(priority).toHaveProperty('bgColor');
        expect(typeof priority.label).toBe('string');
        expect(priority.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(priority.bgColor).toMatch(/^bg-\w+-\d+$/);
      });
    });

    it('has exactly 4 priority levels', () => {
      expect(Object.keys(PRIORITIES)).toHaveLength(4);
    });
  });

  describe('STATUSES', () => {
    it('has not_started status', () => {
      expect(STATUSES.not_started).toEqual({
        label: 'Not Started',
        color: '#94a3b8',
        bgColor: 'bg-slate-400',
      });
    });

    it('has in_progress status', () => {
      expect(STATUSES.in_progress).toEqual({
        label: 'In Progress',
        color: '#3b82f6',
        bgColor: 'bg-blue-500',
      });
    });

    it('has completed status', () => {
      expect(STATUSES.completed).toEqual({
        label: 'Completed',
        color: '#22c55e',
        bgColor: 'bg-green-500',
      });
    });

    it('has blocked status', () => {
      expect(STATUSES.blocked).toEqual({
        label: 'Blocked',
        color: '#ef4444',
        bgColor: 'bg-red-500',
      });
    });

    it('all statuses have label, color, and bgColor', () => {
      Object.values(STATUSES).forEach((status) => {
        expect(status).toHaveProperty('label');
        expect(status).toHaveProperty('color');
        expect(status).toHaveProperty('bgColor');
        expect(typeof status.label).toBe('string');
        expect(status.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(status.bgColor).toMatch(/^bg-\w+-\d+$/);
      });
    });

    it('has exactly 4 status types', () => {
      expect(Object.keys(STATUSES)).toHaveLength(4);
    });
  });

  describe('MATURITY_LEVELS', () => {
    it('has level 1 - Initial', () => {
      expect(MATURITY_LEVELS[1]).toEqual({
        name: 'Initial',
        description: 'Ad-hoc processes',
        color: '#ef4444',
      });
    });

    it('has level 2 - Managed', () => {
      expect(MATURITY_LEVELS[2]).toEqual({
        name: 'Managed',
        description: 'Defined processes',
        color: '#f97316',
      });
    });

    it('has level 3 - Standardized', () => {
      expect(MATURITY_LEVELS[3]).toEqual({
        name: 'Standardized',
        description: 'Integrated systems',
        color: '#eab308',
      });
    });

    it('has level 4 - Predictive', () => {
      expect(MATURITY_LEVELS[4]).toEqual({
        name: 'Predictive',
        description: 'Analytics-driven',
        color: '#3b82f6',
      });
    });

    it('has level 5 - Autonomous', () => {
      expect(MATURITY_LEVELS[5]).toEqual({
        name: 'Autonomous',
        description: 'AI-powered',
        color: '#10b981',
      });
    });

    it('all levels have name, description, and color', () => {
      Object.values(MATURITY_LEVELS).forEach((level) => {
        expect(level).toHaveProperty('name');
        expect(level).toHaveProperty('description');
        expect(level).toHaveProperty('color');
        expect(typeof level.name).toBe('string');
        expect(typeof level.description).toBe('string');
        expect(level.color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('has exactly 5 maturity levels', () => {
      expect(Object.keys(MATURITY_LEVELS)).toHaveLength(5);
    });

    it('levels are numbered 1-5', () => {
      expect(MATURITY_LEVELS).toHaveProperty('1');
      expect(MATURITY_LEVELS).toHaveProperty('2');
      expect(MATURITY_LEVELS).toHaveProperty('3');
      expect(MATURITY_LEVELS).toHaveProperty('4');
      expect(MATURITY_LEVELS).toHaveProperty('5');
    });
  });

  describe('QUICK_WIN_CATEGORIES', () => {
    it('is an array', () => {
      expect(Array.isArray(QUICK_WIN_CATEGORIES)).toBe(true);
    });

    it('contains Operations', () => {
      expect(QUICK_WIN_CATEGORIES).toContain('Operations');
    });

    it('contains Safety', () => {
      expect(QUICK_WIN_CATEGORIES).toContain('Safety');
    });

    it('contains HR', () => {
      expect(QUICK_WIN_CATEGORIES).toContain('HR');
    });

    it('contains Technology', () => {
      expect(QUICK_WIN_CATEGORIES).toContain('Technology');
    });

    it('contains Process', () => {
      expect(QUICK_WIN_CATEGORIES).toContain('Process');
    });

    it('contains Training', () => {
      expect(QUICK_WIN_CATEGORIES).toContain('Training');
    });

    it('has exactly 6 categories', () => {
      expect(QUICK_WIN_CATEGORIES).toHaveLength(6);
    });

    it('all categories are non-empty strings', () => {
      QUICK_WIN_CATEGORIES.forEach((category) => {
        expect(typeof category).toBe('string');
        expect(category.length).toBeGreaterThan(0);
      });
    });
  });
});
