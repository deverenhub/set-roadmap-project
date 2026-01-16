// src/hooks/useTeamsNotifications.ts
// Hook to send notifications to Microsoft Teams via webhook

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { usePreferencesStore } from '@/stores/preferencesStore';

export type TeamsNotificationType = 'mention' | 'blocked' | 'status_change' | 'comment' | 'activity' | 'system';

export interface TeamsNotificationData {
  recipientName?: string;
  actorName?: string;
  entityName?: string;
  entityType?: string;
  entityId?: string;
  message?: string;
  oldStatus?: string;
  newStatus?: string;
  tableName?: string;
  action?: string;
}

interface SendTeamsNotificationParams {
  type: TeamsNotificationType;
  data: TeamsNotificationData;
  webhookUrl?: string;
}

// Send notification to Teams via Edge Function
export async function sendTeamsNotification({
  type,
  data,
  webhookUrl,
}: SendTeamsNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-teams-notification', {
      body: {
        type,
        data,
        webhookUrl,
      },
    });

    if (error) {
      console.error('Teams notification error:', error);
      return { success: false, error: error.message };
    }

    return result || { success: true };
  } catch (err) {
    console.error('Failed to send Teams notification:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Hook for sending Teams notifications
export function useTeamsNotification() {
  const { preferences } = usePreferencesStore();

  return useMutation({
    mutationFn: async ({ type, data }: { type: TeamsNotificationType; data: TeamsNotificationData }) => {
      // Check if Teams notifications are enabled
      if (!preferences.teamsNotifications || !preferences.teamsWebhookUrl) {
        return { success: false, error: 'Teams notifications not configured' };
      }

      // Check specific notification type preferences
      const shouldSend = checkNotificationPreference(type, preferences);
      if (!shouldSend) {
        return { success: false, error: 'Notification type disabled' };
      }

      return sendTeamsNotification({
        type,
        data,
        webhookUrl: preferences.teamsWebhookUrl,
      });
    },
    onError: (error) => {
      console.error('Teams notification mutation error:', error);
    },
  });
}

// Check if a specific notification type should be sent based on preferences
function checkNotificationPreference(
  type: TeamsNotificationType,
  preferences: ReturnType<typeof usePreferencesStore>['preferences']
): boolean {
  switch (type) {
    case 'blocked':
      return preferences.teamsNotifyOnBlockedItems;
    case 'status_change':
      return preferences.teamsNotifyOnMilestoneComplete;
    case 'activity':
      return preferences.teamsNotifyOnActivityChanges;
    case 'mention':
    case 'comment':
      return preferences.teamsNotifications; // Always send if Teams is enabled
    case 'system':
      return preferences.teamsNotifications;
    default:
      return true;
  }
}

// Helper function to send blocked milestone notification
export async function notifyTeamsBlockedMilestone(
  webhookUrl: string,
  milestoneName: string,
  milestoneId: string,
  oldStatus: string
): Promise<{ success: boolean; error?: string }> {
  return sendTeamsNotification({
    type: 'blocked',
    webhookUrl,
    data: {
      entityName: milestoneName,
      entityType: 'milestone',
      entityId: milestoneId,
      oldStatus,
      newStatus: 'blocked',
    },
  });
}

// Helper function to send milestone completion notification
export async function notifyTeamsMilestoneCompleted(
  webhookUrl: string,
  milestoneName: string,
  milestoneId: string,
  oldStatus: string
): Promise<{ success: boolean; error?: string }> {
  return sendTeamsNotification({
    type: 'status_change',
    webhookUrl,
    data: {
      entityName: milestoneName,
      entityType: 'milestone',
      entityId: milestoneId,
      oldStatus,
      newStatus: 'completed',
    },
  });
}

// Helper function to send activity notification
export async function notifyTeamsActivity(
  webhookUrl: string,
  actorName: string,
  entityName: string,
  tableName: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE'
): Promise<{ success: boolean; error?: string }> {
  return sendTeamsNotification({
    type: 'activity',
    webhookUrl,
    data: {
      actorName,
      entityName,
      tableName,
      action,
    },
  });
}
