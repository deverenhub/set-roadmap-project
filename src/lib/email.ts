// src/lib/email.ts
// Utility functions for sending email notifications via Edge Function

import { supabase } from './supabase';

export interface EmailData {
  recipientName?: string;
  actorName?: string;
  entityName?: string;
  entityType?: string;
  entityId?: string;
  message?: string;
  oldStatus?: string;
  newStatus?: string;
}

export type EmailType = 'mention' | 'blocked' | 'status_change' | 'comment' | 'system';

interface SendEmailParams {
  to: string;
  type: EmailType;
  subject?: string;
  data: EmailData;
}

/**
 * Send an email notification via Supabase Edge Function
 */
export async function sendEmailNotification(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error invoking send-email function:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send mention notification emails to mentioned users
 */
export async function sendMentionEmails(
  mentionedUserIds: string[],
  actorName: string,
  entityName: string,
  entityType: 'capability' | 'milestone' | 'quick_win',
  entityId: string,
  commentContent: string
): Promise<void> {
  if (mentionedUserIds.length === 0) return;

  // Get mentioned users' emails
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, full_name, email_notifications, notify_on_mentions')
    .in('id', mentionedUserIds);

  if (error || !users) {
    console.error('Failed to fetch mentioned users:', error);
    return;
  }

  // Send emails to users who have email notifications enabled
  const emailPromises = users
    .filter(user => user.email && user.email_notifications !== false && user.notify_on_mentions !== false)
    .map(user =>
      sendEmailNotification({
        to: user.email,
        type: 'mention',
        data: {
          recipientName: user.full_name || undefined,
          actorName,
          entityName,
          entityType,
          entityId,
          message: commentContent.substring(0, 200) + (commentContent.length > 200 ? '...' : ''),
        },
      })
    );

  // Fire and forget - don't block on email sending
  Promise.all(emailPromises).catch(err => {
    console.error('Error sending mention emails:', err);
  });
}

/**
 * Send blocked milestone notification emails to admins/editors
 */
export async function sendBlockedMilestoneEmails(
  milestoneName: string,
  milestoneId: string,
  oldStatus: string
): Promise<void> {
  // Get admins and editors who have email notifications enabled
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, full_name, email_notifications, notify_on_blocked')
    .in('role', ['admin', 'editor']);

  if (error || !users) {
    console.error('Failed to fetch admin/editor users:', error);
    return;
  }

  // Send emails to users who have blocked notifications enabled
  const emailPromises = users
    .filter(user => user.email && user.email_notifications !== false && user.notify_on_blocked !== false)
    .map(user =>
      sendEmailNotification({
        to: user.email,
        type: 'blocked',
        data: {
          recipientName: user.full_name || undefined,
          entityName: milestoneName,
          entityType: 'milestone',
          entityId: milestoneId,
          oldStatus,
          newStatus: 'blocked',
        },
      })
    );

  // Fire and forget
  Promise.all(emailPromises).catch(err => {
    console.error('Error sending blocked milestone emails:', err);
  });
}
