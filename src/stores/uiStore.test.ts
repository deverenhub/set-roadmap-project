// src/stores/uiStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useUIStore } from './uiStore';

const defaultFilters = {
  capabilities: {
    priority: null,
    search: '',
  },
  quickWins: {
    status: null,
    category: null,
  },
  timeline: {
    path: 'B' as const,
  },
};

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useUIStore.setState({
        sidebarCollapsed: false,
        filters: defaultFilters,
        activeModal: null,
      });
    });
  });

  describe('initial state', () => {
    it('has sidebarCollapsed set to false by default', () => {
      const state = useUIStore.getState();
      expect(state.sidebarCollapsed).toBe(false);
    });

    it('has default filters', () => {
      const state = useUIStore.getState();
      expect(state.filters).toEqual(defaultFilters);
    });

    it('has activeModal set to null by default', () => {
      const state = useUIStore.getState();
      expect(state.activeModal).toBeNull();
    });
  });

  describe('toggleSidebar', () => {
    it('toggles sidebarCollapsed from false to true', () => {
      act(() => {
        useUIStore.getState().toggleSidebar();
      });

      expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    });

    it('toggles sidebarCollapsed from true to false', () => {
      act(() => {
        useUIStore.setState({ sidebarCollapsed: true });
        useUIStore.getState().toggleSidebar();
      });

      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });

    it('can toggle multiple times', () => {
      const { toggleSidebar } = useUIStore.getState();

      act(() => {
        toggleSidebar();
      });
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);

      act(() => {
        toggleSidebar();
      });
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe('setSidebarCollapsed', () => {
    it('sets sidebarCollapsed to true', () => {
      act(() => {
        useUIStore.getState().setSidebarCollapsed(true);
      });

      expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    });

    it('sets sidebarCollapsed to false', () => {
      act(() => {
        useUIStore.setState({ sidebarCollapsed: true });
        useUIStore.getState().setSidebarCollapsed(false);
      });

      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe('setFilter', () => {
    describe('capabilities filters', () => {
      it('sets priority filter', () => {
        act(() => {
          useUIStore.getState().setFilter('capabilities', 'priority', 'HIGH');
        });

        expect(useUIStore.getState().filters.capabilities.priority).toBe('HIGH');
      });

      it('sets search filter', () => {
        act(() => {
          useUIStore.getState().setFilter('capabilities', 'search', 'test search');
        });

        expect(useUIStore.getState().filters.capabilities.search).toBe('test search');
      });

      it('clears priority filter', () => {
        act(() => {
          useUIStore.setState({
            filters: {
              ...defaultFilters,
              capabilities: { priority: 'HIGH', search: '' },
            },
          });
          useUIStore.getState().setFilter('capabilities', 'priority', null);
        });

        expect(useUIStore.getState().filters.capabilities.priority).toBeNull();
      });
    });

    describe('quickWins filters', () => {
      it('sets status filter', () => {
        act(() => {
          useUIStore.getState().setFilter('quickWins', 'status', 'in_progress');
        });

        expect(useUIStore.getState().filters.quickWins.status).toBe('in_progress');
      });

      it('sets category filter', () => {
        act(() => {
          useUIStore.getState().setFilter('quickWins', 'category', 'infrastructure');
        });

        expect(useUIStore.getState().filters.quickWins.category).toBe('infrastructure');
      });
    });

    describe('timeline filters', () => {
      it('sets path to A', () => {
        act(() => {
          useUIStore.getState().setFilter('timeline', 'path', 'A');
        });

        expect(useUIStore.getState().filters.timeline.path).toBe('A');
      });

      it('sets path to C', () => {
        act(() => {
          useUIStore.getState().setFilter('timeline', 'path', 'C');
        });

        expect(useUIStore.getState().filters.timeline.path).toBe('C');
      });

      it('sets path back to B', () => {
        act(() => {
          useUIStore.setState({
            filters: { ...defaultFilters, timeline: { path: 'A' } },
          });
          useUIStore.getState().setFilter('timeline', 'path', 'B');
        });

        expect(useUIStore.getState().filters.timeline.path).toBe('B');
      });
    });

    it('preserves other filters when setting one filter', () => {
      act(() => {
        useUIStore.setState({
          filters: {
            capabilities: { priority: 'HIGH', search: 'test' },
            quickWins: { status: 'completed', category: 'design' },
            timeline: { path: 'A' },
          },
        });
        useUIStore.getState().setFilter('capabilities', 'priority', 'LOW');
      });

      const { filters } = useUIStore.getState();
      expect(filters.capabilities.priority).toBe('LOW');
      expect(filters.capabilities.search).toBe('test');
      expect(filters.quickWins.status).toBe('completed');
      expect(filters.timeline.path).toBe('A');
    });
  });

  describe('resetFilters', () => {
    it('resets all filters when no section is specified', () => {
      act(() => {
        useUIStore.setState({
          filters: {
            capabilities: { priority: 'HIGH', search: 'test' },
            quickWins: { status: 'completed', category: 'design' },
            timeline: { path: 'A' },
          },
        });
        useUIStore.getState().resetFilters();
      });

      expect(useUIStore.getState().filters).toEqual(defaultFilters);
    });

    it('resets only capabilities filters when section is specified', () => {
      act(() => {
        useUIStore.setState({
          filters: {
            capabilities: { priority: 'HIGH', search: 'test' },
            quickWins: { status: 'completed', category: 'design' },
            timeline: { path: 'A' },
          },
        });
        useUIStore.getState().resetFilters('capabilities');
      });

      const { filters } = useUIStore.getState();
      expect(filters.capabilities).toEqual(defaultFilters.capabilities);
      expect(filters.quickWins).toEqual({ status: 'completed', category: 'design' });
      expect(filters.timeline).toEqual({ path: 'A' });
    });

    it('resets only quickWins filters when section is specified', () => {
      act(() => {
        useUIStore.setState({
          filters: {
            capabilities: { priority: 'HIGH', search: 'test' },
            quickWins: { status: 'completed', category: 'design' },
            timeline: { path: 'A' },
          },
        });
        useUIStore.getState().resetFilters('quickWins');
      });

      const { filters } = useUIStore.getState();
      expect(filters.capabilities).toEqual({ priority: 'HIGH', search: 'test' });
      expect(filters.quickWins).toEqual(defaultFilters.quickWins);
      expect(filters.timeline).toEqual({ path: 'A' });
    });

    it('resets only timeline filters when section is specified', () => {
      act(() => {
        useUIStore.setState({
          filters: {
            capabilities: { priority: 'HIGH', search: 'test' },
            quickWins: { status: 'completed', category: 'design' },
            timeline: { path: 'A' },
          },
        });
        useUIStore.getState().resetFilters('timeline');
      });

      const { filters } = useUIStore.getState();
      expect(filters.capabilities).toEqual({ priority: 'HIGH', search: 'test' });
      expect(filters.quickWins).toEqual({ status: 'completed', category: 'design' });
      expect(filters.timeline).toEqual(defaultFilters.timeline);
    });
  });

  describe('openModal', () => {
    it('sets activeModal to the provided modalId', () => {
      act(() => {
        useUIStore.getState().openModal('create-milestone');
      });

      expect(useUIStore.getState().activeModal).toBe('create-milestone');
    });

    it('replaces existing activeModal', () => {
      act(() => {
        useUIStore.setState({ activeModal: 'edit-capability' });
        useUIStore.getState().openModal('delete-confirmation');
      });

      expect(useUIStore.getState().activeModal).toBe('delete-confirmation');
    });
  });

  describe('closeModal', () => {
    it('sets activeModal to null', () => {
      act(() => {
        useUIStore.setState({ activeModal: 'some-modal' });
        useUIStore.getState().closeModal();
      });

      expect(useUIStore.getState().activeModal).toBeNull();
    });

    it('keeps activeModal null when already null', () => {
      act(() => {
        useUIStore.getState().closeModal();
      });

      expect(useUIStore.getState().activeModal).toBeNull();
    });
  });

  describe('state independence', () => {
    it('does not affect filters when toggling sidebar', () => {
      act(() => {
        useUIStore.setState({
          filters: {
            ...defaultFilters,
            capabilities: { priority: 'HIGH', search: 'test' },
          },
        });
        useUIStore.getState().toggleSidebar();
      });

      expect(useUIStore.getState().filters.capabilities.priority).toBe('HIGH');
    });

    it('does not affect activeModal when setting filters', () => {
      act(() => {
        useUIStore.setState({ activeModal: 'my-modal' });
        useUIStore.getState().setFilter('capabilities', 'priority', 'LOW');
      });

      expect(useUIStore.getState().activeModal).toBe('my-modal');
    });

    it('does not affect sidebarCollapsed when opening modal', () => {
      act(() => {
        useUIStore.setState({ sidebarCollapsed: true });
        useUIStore.getState().openModal('test-modal');
      });

      expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    });
  });

  describe('store exports', () => {
    it('exports useUIStore hook', () => {
      expect(useUIStore).toBeDefined();
      expect(typeof useUIStore).toBe('function');
    });

    it('provides getState method', () => {
      expect(typeof useUIStore.getState).toBe('function');
    });

    it('provides setState method', () => {
      expect(typeof useUIStore.setState).toBe('function');
    });

    it('provides subscribe method', () => {
      expect(typeof useUIStore.subscribe).toBe('function');
    });
  });
});
