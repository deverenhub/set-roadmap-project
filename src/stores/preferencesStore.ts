// src/stores/preferencesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

export interface UserPreferences {
  // Appearance
  theme: Theme;
  compactMode: boolean;

  // Date & Time
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timezone: string;

  // Dashboard
  defaultDashboardView: 'overview' | 'capabilities' | 'timeline';
  showQuickWinsOnDashboard: boolean;
  showRecentActivityOnDashboard: boolean;
  dashboardRefreshInterval: number; // in seconds, 0 = manual only

  // Notifications
  emailNotifications: boolean;
  notifyOnMilestoneComplete: boolean;
  notifyOnBlockedItems: boolean;
  notifyOnCriticalChanges: boolean;

  // Data & Export
  defaultExportFormat: 'pdf' | 'csv' | 'xlsx';
  includeChartInExport: boolean;
}

interface PreferencesState {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  // Appearance
  theme: 'system',
  compactMode: false,

  // Date & Time
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

  // Dashboard
  defaultDashboardView: 'overview',
  showQuickWinsOnDashboard: true,
  showRecentActivityOnDashboard: true,
  dashboardRefreshInterval: 30,

  // Notifications
  emailNotifications: true,
  notifyOnMilestoneComplete: true,
  notifyOnBlockedItems: true,
  notifyOnCriticalChanges: true,

  // Data & Export
  defaultExportFormat: 'pdf',
  includeChartInExport: true,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,

      updatePreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),

      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        })),

      resetPreferences: () =>
        set({ preferences: defaultPreferences }),
    }),
    {
      name: 'set-roadmap-preferences',
    }
  )
);

// Hook to apply theme and compact mode
export function useApplyPreferences() {
  const theme = usePreferencesStore((state) => state.preferences.theme);
  const compactMode = usePreferencesStore((state) => state.preferences.compactMode);

  // Apply theme to document
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement;

    // Apply theme
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Apply compact mode
    if (compactMode) {
      root.classList.add('compact');
    } else {
      root.classList.remove('compact');
    }
  }

  return { theme, compactMode };
}

// Legacy alias for backwards compatibility
export const useApplyTheme = useApplyPreferences;
