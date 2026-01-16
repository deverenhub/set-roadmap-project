// src/stores/preferencesStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import {
  usePreferencesStore,
  defaultDashboardWidgets,
  type Theme,
  type DateFormat,
  type TimeFormat,
  type DashboardWidgetId,
} from './preferencesStore';

// Mock window for useApplyPreferences tests
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

const getDefaultPreferences = () => ({
  // Appearance
  theme: 'system' as Theme,
  compactMode: false,

  // Date & Time
  dateFormat: 'MM/DD/YYYY' as DateFormat,
  timeFormat: '12h' as TimeFormat,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

  // Dashboard
  defaultDashboardView: 'overview' as const,
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
  defaultExportFormat: 'pdf' as const,
  includeChartInExport: true,

  // Dashboard Widgets
  dashboardWidgets: defaultDashboardWidgets,
});

describe('preferencesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      usePreferencesStore.setState({
        preferences: getDefaultPreferences(),
      });
    });
    mockMatchMedia.mockReturnValue({ matches: false });
  });

  describe('initial state', () => {
    it('has default theme set to system', () => {
      const { preferences } = usePreferencesStore.getState();
      expect(preferences.theme).toBe('system');
    });

    it('has compactMode set to false', () => {
      const { preferences } = usePreferencesStore.getState();
      expect(preferences.compactMode).toBe(false);
    });

    it('has default date format', () => {
      const { preferences } = usePreferencesStore.getState();
      expect(preferences.dateFormat).toBe('MM/DD/YYYY');
    });

    it('has default time format', () => {
      const { preferences } = usePreferencesStore.getState();
      expect(preferences.timeFormat).toBe('12h');
    });

    it('has default dashboard view', () => {
      const { preferences } = usePreferencesStore.getState();
      expect(preferences.defaultDashboardView).toBe('overview');
    });

    it('has email notifications enabled by default', () => {
      const { preferences } = usePreferencesStore.getState();
      expect(preferences.emailNotifications).toBe(true);
    });

    it('has teams notifications disabled by default', () => {
      const { preferences } = usePreferencesStore.getState();
      expect(preferences.teamsNotifications).toBe(false);
    });

    it('has default export format set to pdf', () => {
      const { preferences } = usePreferencesStore.getState();
      expect(preferences.defaultExportFormat).toBe('pdf');
    });

    it('has default dashboard widgets', () => {
      const { preferences } = usePreferencesStore.getState();
      expect(preferences.dashboardWidgets).toEqual(defaultDashboardWidgets);
    });
  });

  describe('updatePreference', () => {
    it('updates theme preference', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('theme', 'dark');
      });

      expect(usePreferencesStore.getState().preferences.theme).toBe('dark');
    });

    it('updates compactMode preference', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('compactMode', true);
      });

      expect(usePreferencesStore.getState().preferences.compactMode).toBe(true);
    });

    it('updates dateFormat preference', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('dateFormat', 'YYYY-MM-DD');
      });

      expect(usePreferencesStore.getState().preferences.dateFormat).toBe('YYYY-MM-DD');
    });

    it('updates timeFormat preference', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('timeFormat', '24h');
      });

      expect(usePreferencesStore.getState().preferences.timeFormat).toBe('24h');
    });

    it('updates defaultDashboardView preference', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('defaultDashboardView', 'capabilities');
      });

      expect(usePreferencesStore.getState().preferences.defaultDashboardView).toBe('capabilities');
    });

    it('updates emailNotifications preference', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('emailNotifications', false);
      });

      expect(usePreferencesStore.getState().preferences.emailNotifications).toBe(false);
    });

    it('updates teamsNotifications preference', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('teamsNotifications', true);
      });

      expect(usePreferencesStore.getState().preferences.teamsNotifications).toBe(true);
    });

    it('updates teamsWebhookUrl preference', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('teamsWebhookUrl', 'https://webhook.url');
      });

      expect(usePreferencesStore.getState().preferences.teamsWebhookUrl).toBe('https://webhook.url');
    });

    it('updates dashboardRefreshInterval preference', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('dashboardRefreshInterval', 60);
      });

      expect(usePreferencesStore.getState().preferences.dashboardRefreshInterval).toBe(60);
    });

    it('updates defaultExportFormat preference', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('defaultExportFormat', 'csv');
      });

      expect(usePreferencesStore.getState().preferences.defaultExportFormat).toBe('csv');
    });

    it('preserves other preferences when updating one', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('theme', 'dark');
      });

      const { preferences } = usePreferencesStore.getState();
      expect(preferences.theme).toBe('dark');
      expect(preferences.compactMode).toBe(false);
      expect(preferences.dateFormat).toBe('MM/DD/YYYY');
    });
  });

  describe('updatePreferences', () => {
    it('updates multiple preferences at once', () => {
      act(() => {
        usePreferencesStore.getState().updatePreferences({
          theme: 'dark',
          compactMode: true,
          dateFormat: 'DD/MM/YYYY',
        });
      });

      const { preferences } = usePreferencesStore.getState();
      expect(preferences.theme).toBe('dark');
      expect(preferences.compactMode).toBe(true);
      expect(preferences.dateFormat).toBe('DD/MM/YYYY');
    });

    it('preserves non-updated preferences', () => {
      act(() => {
        usePreferencesStore.getState().updatePreferences({
          theme: 'light',
        });
      });

      const { preferences } = usePreferencesStore.getState();
      expect(preferences.theme).toBe('light');
      expect(preferences.timeFormat).toBe('12h');
      expect(preferences.emailNotifications).toBe(true);
    });

    it('can update notification preferences', () => {
      act(() => {
        usePreferencesStore.getState().updatePreferences({
          emailNotifications: false,
          teamsNotifications: true,
          teamsWebhookUrl: 'https://teams.webhook',
        });
      });

      const { preferences } = usePreferencesStore.getState();
      expect(preferences.emailNotifications).toBe(false);
      expect(preferences.teamsNotifications).toBe(true);
      expect(preferences.teamsWebhookUrl).toBe('https://teams.webhook');
    });
  });

  describe('resetPreferences', () => {
    it('resets all preferences to defaults', () => {
      act(() => {
        usePreferencesStore.getState().updatePreferences({
          theme: 'dark',
          compactMode: true,
          dateFormat: 'YYYY-MM-DD',
          emailNotifications: false,
        });
        usePreferencesStore.getState().resetPreferences();
      });

      const { preferences } = usePreferencesStore.getState();
      expect(preferences.theme).toBe('system');
      expect(preferences.compactMode).toBe(false);
      expect(preferences.dateFormat).toBe('MM/DD/YYYY');
      expect(preferences.emailNotifications).toBe(true);
    });

    it('resets dashboard widgets to defaults', () => {
      act(() => {
        usePreferencesStore.getState().updateWidgetVisibility('kpi-progress', false);
        usePreferencesStore.getState().resetPreferences();
      });

      const { preferences } = usePreferencesStore.getState();
      const widget = preferences.dashboardWidgets.find((w) => w.id === 'kpi-progress');
      expect(widget?.visible).toBe(true);
    });
  });

  describe('updateWidgetVisibility', () => {
    it('hides a visible widget', () => {
      act(() => {
        usePreferencesStore.getState().updateWidgetVisibility('kpi-progress', false);
      });

      const { preferences } = usePreferencesStore.getState();
      const widget = preferences.dashboardWidgets.find((w) => w.id === 'kpi-progress');
      expect(widget?.visible).toBe(false);
    });

    it('shows a hidden widget', () => {
      act(() => {
        usePreferencesStore.getState().updateWidgetVisibility('kpi-progress', false);
        usePreferencesStore.getState().updateWidgetVisibility('kpi-progress', true);
      });

      const { preferences } = usePreferencesStore.getState();
      const widget = preferences.dashboardWidgets.find((w) => w.id === 'kpi-progress');
      expect(widget?.visible).toBe(true);
    });

    it('does not affect other widgets', () => {
      act(() => {
        usePreferencesStore.getState().updateWidgetVisibility('kpi-progress', false);
      });

      const { preferences } = usePreferencesStore.getState();
      const milestoneWidget = preferences.dashboardWidgets.find((w) => w.id === 'kpi-milestones');
      expect(milestoneWidget?.visible).toBe(true);
    });

    it('updates different widget types', () => {
      const widgetIds: DashboardWidgetId[] = [
        'kpi-progress',
        'kpi-milestones',
        'capability-progress',
        'recent-activity',
      ];

      widgetIds.forEach((id) => {
        act(() => {
          usePreferencesStore.getState().updateWidgetVisibility(id, false);
        });

        const { preferences } = usePreferencesStore.getState();
        const widget = preferences.dashboardWidgets.find((w) => w.id === id);
        expect(widget?.visible).toBe(false);
      });
    });
  });

  describe('updateWidgetOrder', () => {
    it('updates widget order', () => {
      const reorderedWidgets = [...defaultDashboardWidgets].reverse();

      act(() => {
        usePreferencesStore.getState().updateWidgetOrder(reorderedWidgets);
      });

      const { preferences } = usePreferencesStore.getState();
      expect(preferences.dashboardWidgets).toEqual(reorderedWidgets);
    });

    it('preserves widget properties when reordering', () => {
      const originalWidget = defaultDashboardWidgets[0];
      const reorderedWidgets = [
        defaultDashboardWidgets[1],
        defaultDashboardWidgets[0],
        ...defaultDashboardWidgets.slice(2),
      ];

      act(() => {
        usePreferencesStore.getState().updateWidgetOrder(reorderedWidgets);
      });

      const { preferences } = usePreferencesStore.getState();
      const widget = preferences.dashboardWidgets.find((w) => w.id === originalWidget.id);
      expect(widget?.name).toBe(originalWidget.name);
      expect(widget?.size).toBe(originalWidget.size);
    });
  });

  describe('resetDashboardWidgets', () => {
    it('resets widgets to default configuration', () => {
      act(() => {
        usePreferencesStore.getState().updateWidgetVisibility('kpi-progress', false);
        usePreferencesStore.getState().updateWidgetVisibility('kpi-milestones', false);
        usePreferencesStore.getState().resetDashboardWidgets();
      });

      const { preferences } = usePreferencesStore.getState();
      expect(preferences.dashboardWidgets).toEqual(defaultDashboardWidgets);
    });

    it('preserves other preferences when resetting widgets', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('theme', 'dark');
        usePreferencesStore.getState().updateWidgetVisibility('kpi-progress', false);
        usePreferencesStore.getState().resetDashboardWidgets();
      });

      const { preferences } = usePreferencesStore.getState();
      expect(preferences.theme).toBe('dark');
      expect(preferences.dashboardWidgets).toEqual(defaultDashboardWidgets);
    });
  });

  describe('defaultDashboardWidgets', () => {
    it('exports defaultDashboardWidgets array', () => {
      expect(defaultDashboardWidgets).toBeDefined();
      expect(Array.isArray(defaultDashboardWidgets)).toBe(true);
    });

    it('contains expected widgets', () => {
      const widgetIds = defaultDashboardWidgets.map((w) => w.id);
      expect(widgetIds).toContain('kpi-progress');
      expect(widgetIds).toContain('kpi-milestones');
      expect(widgetIds).toContain('kpi-quickwins');
      expect(widgetIds).toContain('kpi-critical');
      expect(widgetIds).toContain('capability-progress');
      expect(widgetIds).toContain('overall-maturity');
      expect(widgetIds).toContain('recent-activity');
      expect(widgetIds).toContain('critical-items');
      expect(widgetIds).toContain('qol-impact');
    });

    it('all widgets are visible by default', () => {
      defaultDashboardWidgets.forEach((widget) => {
        expect(widget.visible).toBe(true);
      });
    });

    it('widgets have required properties', () => {
      defaultDashboardWidgets.forEach((widget) => {
        expect(widget).toHaveProperty('id');
        expect(widget).toHaveProperty('name');
        expect(widget).toHaveProperty('description');
        expect(widget).toHaveProperty('visible');
        expect(widget).toHaveProperty('order');
        expect(widget).toHaveProperty('size');
      });
    });

    it('widgets have valid sizes', () => {
      const validSizes = ['small', 'medium', 'large', 'full'];
      defaultDashboardWidgets.forEach((widget) => {
        expect(validSizes).toContain(widget.size);
      });
    });
  });

  describe('store exports', () => {
    it('exports usePreferencesStore hook', () => {
      expect(usePreferencesStore).toBeDefined();
      expect(typeof usePreferencesStore).toBe('function');
    });

    it('provides getState method', () => {
      expect(typeof usePreferencesStore.getState).toBe('function');
    });

    it('provides setState method', () => {
      expect(typeof usePreferencesStore.setState).toBe('function');
    });

    it('provides subscribe method', () => {
      expect(typeof usePreferencesStore.subscribe).toBe('function');
    });
  });

  describe('theme values', () => {
    it('accepts light theme', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('theme', 'light');
      });
      expect(usePreferencesStore.getState().preferences.theme).toBe('light');
    });

    it('accepts dark theme', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('theme', 'dark');
      });
      expect(usePreferencesStore.getState().preferences.theme).toBe('dark');
    });

    it('accepts system theme', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('theme', 'system');
      });
      expect(usePreferencesStore.getState().preferences.theme).toBe('system');
    });
  });

  describe('date format values', () => {
    it('accepts MM/DD/YYYY format', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('dateFormat', 'MM/DD/YYYY');
      });
      expect(usePreferencesStore.getState().preferences.dateFormat).toBe('MM/DD/YYYY');
    });

    it('accepts DD/MM/YYYY format', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('dateFormat', 'DD/MM/YYYY');
      });
      expect(usePreferencesStore.getState().preferences.dateFormat).toBe('DD/MM/YYYY');
    });

    it('accepts YYYY-MM-DD format', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('dateFormat', 'YYYY-MM-DD');
      });
      expect(usePreferencesStore.getState().preferences.dateFormat).toBe('YYYY-MM-DD');
    });
  });

  describe('dashboard view values', () => {
    it('accepts overview view', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('defaultDashboardView', 'overview');
      });
      expect(usePreferencesStore.getState().preferences.defaultDashboardView).toBe('overview');
    });

    it('accepts capabilities view', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('defaultDashboardView', 'capabilities');
      });
      expect(usePreferencesStore.getState().preferences.defaultDashboardView).toBe('capabilities');
    });

    it('accepts timeline view', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('defaultDashboardView', 'timeline');
      });
      expect(usePreferencesStore.getState().preferences.defaultDashboardView).toBe('timeline');
    });
  });

  describe('export format values', () => {
    it('accepts pdf format', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('defaultExportFormat', 'pdf');
      });
      expect(usePreferencesStore.getState().preferences.defaultExportFormat).toBe('pdf');
    });

    it('accepts csv format', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('defaultExportFormat', 'csv');
      });
      expect(usePreferencesStore.getState().preferences.defaultExportFormat).toBe('csv');
    });

    it('accepts xlsx format', () => {
      act(() => {
        usePreferencesStore.getState().updatePreference('defaultExportFormat', 'xlsx');
      });
      expect(usePreferencesStore.getState().preferences.defaultExportFormat).toBe('xlsx');
    });
  });
});
