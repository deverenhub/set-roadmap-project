// src/stores/preferencesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

// Dashboard Widget Types
export type DashboardWidgetId =
  | 'kpi-progress'
  | 'kpi-milestones'
  | 'kpi-quickwins'
  | 'kpi-critical'
  | 'capability-progress'
  | 'overall-maturity'
  | 'recent-activity'
  | 'critical-items'
  | 'qol-impact';

export interface DashboardWidget {
  id: DashboardWidgetId;
  name: string;
  description: string;
  visible: boolean;
  order: number;
  size: 'small' | 'medium' | 'large' | 'full';
}

// Default widget configuration
export const defaultDashboardWidgets: DashboardWidget[] = [
  { id: 'kpi-progress', name: 'Overall Progress', description: 'Shows overall progress percentage', visible: true, order: 0, size: 'small' },
  { id: 'kpi-milestones', name: 'Active Milestones', description: 'Number of milestones in progress', visible: true, order: 1, size: 'small' },
  { id: 'kpi-quickwins', name: 'Quick Wins', description: 'Quick wins completion status', visible: true, order: 2, size: 'small' },
  { id: 'kpi-critical', name: 'Critical Items', description: 'Items needing attention', visible: true, order: 3, size: 'small' },
  { id: 'capability-progress', name: 'Capability Progress', description: 'Progress bars for each capability', visible: true, order: 4, size: 'large' },
  { id: 'overall-maturity', name: 'Overall Maturity', description: 'Maturity progress ring', visible: true, order: 5, size: 'medium' },
  { id: 'recent-activity', name: 'Recent Activity', description: 'Latest changes and updates', visible: true, order: 6, size: 'medium' },
  { id: 'critical-items', name: 'Critical Items List', description: 'Detailed list of blocked items', visible: true, order: 7, size: 'medium' },
  { id: 'qol-impact', name: 'QoL Impact Chart', description: 'Quality of life impact visualization', visible: true, order: 8, size: 'full' },
];

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

  // Notifications - Email
  emailNotifications: boolean;
  notifyOnMilestoneComplete: boolean;
  notifyOnBlockedItems: boolean;
  notifyOnCriticalChanges: boolean;

  // Notifications - Microsoft Teams
  teamsNotifications: boolean;
  teamsWebhookUrl: string;
  teamsNotifyOnMilestoneComplete: boolean;
  teamsNotifyOnBlockedItems: boolean;
  teamsNotifyOnActivityChanges: boolean;

  // Data & Export
  defaultExportFormat: 'pdf' | 'csv' | 'xlsx';
  includeChartInExport: boolean;

  // Dashboard Widgets
  dashboardWidgets: DashboardWidget[];
}

interface PreferencesState {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  // Widget-specific actions
  updateWidgetVisibility: (widgetId: DashboardWidgetId, visible: boolean) => void;
  updateWidgetOrder: (widgets: DashboardWidget[]) => void;
  resetDashboardWidgets: () => void;
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

  // Notifications - Email
  emailNotifications: true,
  notifyOnMilestoneComplete: true,
  notifyOnBlockedItems: true,
  notifyOnCriticalChanges: true,

  // Notifications - Microsoft Teams
  teamsNotifications: false,
  teamsWebhookUrl: '',
  teamsNotifyOnMilestoneComplete: true,
  teamsNotifyOnBlockedItems: true,
  teamsNotifyOnActivityChanges: false,

  // Data & Export
  defaultExportFormat: 'pdf',
  includeChartInExport: true,

  // Dashboard Widgets
  dashboardWidgets: defaultDashboardWidgets,
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

      // Widget-specific actions
      updateWidgetVisibility: (widgetId, visible) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            dashboardWidgets: state.preferences.dashboardWidgets.map((w) =>
              w.id === widgetId ? { ...w, visible } : w
            ),
          },
        })),

      updateWidgetOrder: (widgets) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            dashboardWidgets: widgets,
          },
        })),

      resetDashboardWidgets: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            dashboardWidgets: defaultDashboardWidgets,
          },
        })),
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
