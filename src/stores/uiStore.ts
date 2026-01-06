// src/stores/uiStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIFilters {
  capabilities: {
    priority: string | null;
    search: string;
  };
  quickWins: {
    status: string | null;
    category: string | null;
  };
  timeline: {
    path: 'A' | 'B' | 'C';
  };
}

interface UIStore {
  sidebarCollapsed: boolean;
  filters: UIFilters;
  activeModal: string | null;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setFilter: <K extends keyof UIFilters>(
    section: K,
    key: keyof UIFilters[K],
    value: UIFilters[K][keyof UIFilters[K]]
  ) => void;
  resetFilters: (section?: keyof UIFilters) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

const defaultFilters: UIFilters = {
  capabilities: {
    priority: null,
    search: '',
  },
  quickWins: {
    status: null,
    category: null,
  },
  timeline: {
    path: 'B',
  },
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      filters: defaultFilters,
      activeModal: null,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      setFilter: (section, key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [section]: {
              ...state.filters[section],
              [key]: value,
            },
          },
        })),

      resetFilters: (section) =>
        set((state) => ({
          filters: section
            ? { ...state.filters, [section]: defaultFilters[section] }
            : defaultFilters,
        })),

      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        filters: state.filters,
      }),
    }
  )
);
