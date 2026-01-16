// src/hooks/useGlobalSearch.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock data
const mockCapabilities = [
  {
    id: 'cap-1',
    name: 'Planning & Scheduling',
    description: 'Resource planning capabilities',
    owner: 'John Smith',
    priority: 'CRITICAL',
  },
  {
    id: 'cap-2',
    name: 'Inventory Management',
    description: 'Track and manage inventory',
    owner: 'Jane Doe',
    priority: 'HIGH',
  },
  {
    id: 'cap-3',
    name: 'Reporting',
    description: 'Generate reports and analytics',
    owner: null,
    priority: 'MEDIUM',
  },
];

const mockMilestones = [
  {
    id: 'ms-1',
    name: 'AI Optimization',
    description: 'Implement AI-driven optimization',
    notes: 'Planning phase complete',
    status: 'in_progress',
  },
  {
    id: 'ms-2',
    name: 'Basic Capacity Understanding',
    description: 'Understand current capacity',
    notes: null,
    status: 'completed',
  },
  {
    id: 'ms-3',
    name: 'Predictive Planning',
    description: 'Enable predictive analytics',
    notes: 'Requires data integration',
    status: 'not_started',
  },
];

const mockQuickWins = [
  {
    id: 'qw-1',
    name: 'Dashboard Widgets',
    description: 'Add customizable dashboard widgets',
    owner: 'John Smith',
    status: 'completed',
  },
  {
    id: 'qw-2',
    name: 'Export Feature',
    description: 'Export data to CSV',
    owner: 'Jane Doe',
    status: 'in_progress',
  },
];

// Mock the hooks
vi.mock('@/hooks', () => ({
  useCapabilities: vi.fn(() => ({ data: mockCapabilities })),
  useMilestones: vi.fn(() => ({ data: mockMilestones })),
  useQuickWins: vi.fn(() => ({ data: mockQuickWins })),
}));

describe('useGlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty results when query is empty', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.hasResults).toBe(false);
    expect(result.current.totalResults).toBe(0);
  });

  it('should return empty results when query is only whitespace', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('   ');
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.hasResults).toBe(false);
  });

  it('should search capabilities by name', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('Planning');
    });

    expect(result.current.hasResults).toBe(true);
    const capabilities = result.current.groupedResults.capabilities;
    expect(capabilities.length).toBeGreaterThan(0);
    expect(capabilities.some((c) => c.name === 'Planning & Scheduling')).toBe(true);
  });

  it('should search capabilities by description', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('inventory');
    });

    const capabilities = result.current.groupedResults.capabilities;
    expect(capabilities.some((c) => c.name === 'Inventory Management')).toBe(true);
  });

  it('should search capabilities by owner', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('John Smith');
    });

    const capabilities = result.current.groupedResults.capabilities;
    expect(capabilities.some((c) => c.name === 'Planning & Scheduling')).toBe(true);
  });

  it('should search milestones by name', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('AI Optimization');
    });

    const milestones = result.current.groupedResults.milestones;
    expect(milestones.length).toBeGreaterThan(0);
    expect(milestones.some((m) => m.name === 'AI Optimization')).toBe(true);
  });

  it('should search milestones by description', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('predictive analytics');
    });

    const milestones = result.current.groupedResults.milestones;
    expect(milestones.some((m) => m.name === 'Predictive Planning')).toBe(true);
  });

  it('should search milestones by notes', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('data integration');
    });

    const milestones = result.current.groupedResults.milestones;
    expect(milestones.some((m) => m.name === 'Predictive Planning')).toBe(true);
  });

  it('should search quick wins by name', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('Dashboard');
    });

    const quickWins = result.current.groupedResults.quickWins;
    expect(quickWins.length).toBeGreaterThan(0);
    expect(quickWins.some((qw) => qw.name === 'Dashboard Widgets')).toBe(true);
  });

  it('should search quick wins by description', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('CSV');
    });

    const quickWins = result.current.groupedResults.quickWins;
    expect(quickWins.some((qw) => qw.name === 'Export Feature')).toBe(true);
  });

  it('should search quick wins by owner', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('Jane Doe');
    });

    const quickWins = result.current.groupedResults.quickWins;
    expect(quickWins.some((qw) => qw.name === 'Export Feature')).toBe(true);
  });

  it('should be case insensitive', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('PLANNING');
    });

    expect(result.current.hasResults).toBe(true);
    expect(result.current.groupedResults.capabilities.some((c) => c.name === 'Planning & Scheduling')).toBe(true);
  });

  it('should trim whitespace from query', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('  Planning  ');
    });

    expect(result.current.hasResults).toBe(true);
    expect(result.current.groupedResults.capabilities.some((c) => c.name === 'Planning & Scheduling')).toBe(true);
  });

  it('should return results across all types', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    // "Planning" appears in capabilities and milestones
    act(() => {
      result.current.setQuery('Planning');
    });

    expect(result.current.groupedResults.capabilities.length).toBeGreaterThan(0);
    expect(result.current.groupedResults.milestones.length).toBeGreaterThan(0);
  });

  it('should sort exact matches first', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('Reporting');
    });

    // Exact match "Reporting" should be first
    const capabilities = result.current.groupedResults.capabilities;
    expect(capabilities.length).toBeGreaterThan(0);
    expect(capabilities[0].name).toBe('Reporting');
  });

  it('should sort starts-with matches before partial matches', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    // "Predict" matches "Predictive Planning" at start
    act(() => {
      result.current.setQuery('Predict');
    });

    const milestones = result.current.groupedResults.milestones;
    expect(milestones.length).toBeGreaterThan(0);
    expect(milestones[0].name).toBe('Predictive Planning');
  });

  it('should generate correct paths for capabilities', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('Planning & Scheduling');
    });

    const capability = result.current.groupedResults.capabilities[0];
    expect(capability.path).toBe('/capabilities?id=cap-1');
  });

  it('should generate correct paths for milestones', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('AI Optimization');
    });

    const milestone = result.current.groupedResults.milestones[0];
    expect(milestone.path).toBe('/timeline?milestone=ms-1');
  });

  it('should generate correct paths for quick wins', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('Dashboard Widgets');
    });

    const quickWin = result.current.groupedResults.quickWins[0];
    expect(quickWin.path).toBe('/quick-wins?id=qw-1');
  });

  it('should include priority for capabilities', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('Planning');
    });

    const capability = result.current.groupedResults.capabilities.find(
      (c) => c.name === 'Planning & Scheduling'
    );
    expect(capability?.priority).toBe('CRITICAL');
  });

  it('should include status for milestones', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('AI Optimization');
    });

    const milestone = result.current.groupedResults.milestones[0];
    expect(milestone.status).toBe('in_progress');
  });

  it('should include status for quick wins', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('Dashboard');
    });

    const quickWin = result.current.groupedResults.quickWins[0];
    expect(quickWin.status).toBe('completed');
  });

  it('should clear search correctly', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('Planning');
    });

    expect(result.current.hasResults).toBe(true);

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.hasResults).toBe(false);
  });

  it('should return correct totalResults count', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('John Smith');
    });

    // John Smith is owner of 1 capability and 1 quick win
    expect(result.current.totalResults).toBe(2);
  });

  it('should handle null/undefined fields gracefully', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    // Search for something that won't match null fields
    act(() => {
      result.current.setQuery('Reporting');
    });

    // Should not throw and should find Reporting capability (which has null owner)
    expect(result.current.groupedResults.capabilities.some((c) => c.name === 'Reporting')).toBe(true);
  });

  it('should set correct type for each result', async () => {
    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('a'); // Will match many items
    });

    result.current.groupedResults.capabilities.forEach((r) => {
      expect(r.type).toBe('capability');
    });

    result.current.groupedResults.milestones.forEach((r) => {
      expect(r.type).toBe('milestone');
    });

    result.current.groupedResults.quickWins.forEach((r) => {
      expect(r.type).toBe('quick_win');
    });
  });
});

describe('useGlobalSearch with empty data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset modules to allow re-mocking
    vi.resetModules();
  });

  it('should handle empty data arrays', async () => {
    vi.doMock('@/hooks', () => ({
      useCapabilities: vi.fn(() => ({ data: [] })),
      useMilestones: vi.fn(() => ({ data: [] })),
      useQuickWins: vi.fn(() => ({ data: [] })),
    }));

    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('test');
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.hasResults).toBe(false);
  });

  it('should handle undefined data', async () => {
    vi.doMock('@/hooks', () => ({
      useCapabilities: vi.fn(() => ({ data: undefined })),
      useMilestones: vi.fn(() => ({ data: undefined })),
      useQuickWins: vi.fn(() => ({ data: undefined })),
    }));

    const { useGlobalSearch } = await import('./useGlobalSearch');
    const { result } = renderHook(() => useGlobalSearch());

    act(() => {
      result.current.setQuery('test');
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.hasResults).toBe(false);
  });
});
