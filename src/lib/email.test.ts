// src/lib/email.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendEmailNotification,
  sendMentionEmails,
  sendBlockedMilestoneEmails,
} from './email';

// Mock Supabase
const mockInvoke = vi.fn();
const mockSelect = vi.fn();
const mockIn = vi.fn();

vi.mock('./supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  },
}));

describe('email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      in: mockIn,
    });
    // Suppress console.error during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('sendEmailNotification', () => {
    it('sends email successfully', async () => {
      mockInvoke.mockResolvedValueOnce({ data: {}, error: null });

      const result = await sendEmailNotification({
        to: 'test@example.com',
        type: 'mention',
        data: {
          recipientName: 'Test User',
          message: 'You were mentioned',
        },
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('calls supabase functions.invoke with correct params', async () => {
      mockInvoke.mockResolvedValueOnce({ data: {}, error: null });

      await sendEmailNotification({
        to: 'test@example.com',
        type: 'blocked',
        subject: 'Test Subject',
        data: {
          entityName: 'Test Entity',
        },
      });

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: {
          to: 'test@example.com',
          type: 'blocked',
          subject: 'Test Subject',
          data: {
            entityName: 'Test Entity',
          },
        },
      });
    });

    it('returns error when invoke fails', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Function error' },
      });

      const result = await sendEmailNotification({
        to: 'test@example.com',
        type: 'mention',
        data: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Function error');
    });

    it('handles exception gracefully', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Network error'));

      const result = await sendEmailNotification({
        to: 'test@example.com',
        type: 'mention',
        data: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('handles non-Error exceptions', async () => {
      mockInvoke.mockRejectedValueOnce('String error');

      const result = await sendEmailNotification({
        to: 'test@example.com',
        type: 'mention',
        data: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('supports all email types', async () => {
      mockInvoke.mockResolvedValue({ data: {}, error: null });

      const types = ['mention', 'blocked', 'status_change', 'comment', 'system'] as const;

      for (const type of types) {
        await sendEmailNotification({
          to: 'test@example.com',
          type,
          data: {},
        });
      }

      expect(mockInvoke).toHaveBeenCalledTimes(5);
    });
  });

  describe('sendMentionEmails', () => {
    it('does nothing when no users are mentioned', async () => {
      await sendMentionEmails(
        [],
        'Actor',
        'Entity',
        'capability',
        'entity-123',
        'Comment text'
      );

      expect(mockSelect).not.toHaveBeenCalled();
    });

    it('fetches mentioned users from database', async () => {
      mockIn.mockResolvedValueOnce({ data: [], error: null });

      await sendMentionEmails(
        ['user-1', 'user-2'],
        'Actor',
        'Entity',
        'milestone',
        'entity-123',
        'Comment text'
      );

      expect(mockSelect).toHaveBeenCalledWith(
        'id, email, full_name, email_notifications, notify_on_mentions'
      );
      expect(mockIn).toHaveBeenCalledWith('id', ['user-1', 'user-2']);
    });

    it('sends emails to users with notifications enabled', async () => {
      mockIn.mockResolvedValueOnce({
        data: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            full_name: 'User One',
            email_notifications: true,
            notify_on_mentions: true,
          },
        ],
        error: null,
      });
      mockInvoke.mockResolvedValue({ data: {}, error: null });

      await sendMentionEmails(
        ['user-1'],
        'Actor Name',
        'Milestone Name',
        'milestone',
        'ms-123',
        'Test comment'
      );

      // Wait for fire-and-forget promises
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: {
          to: 'user1@example.com',
          type: 'mention',
          data: {
            recipientName: 'User One',
            actorName: 'Actor Name',
            entityName: 'Milestone Name',
            entityType: 'milestone',
            entityId: 'ms-123',
            message: 'Test comment',
          },
        },
      });
    });

    it('skips users with email notifications disabled', async () => {
      mockIn.mockResolvedValueOnce({
        data: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            email_notifications: false,
            notify_on_mentions: true,
          },
        ],
        error: null,
      });

      await sendMentionEmails(
        ['user-1'],
        'Actor',
        'Entity',
        'capability',
        'cap-123',
        'Comment'
      );

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('skips users with mention notifications disabled', async () => {
      mockIn.mockResolvedValueOnce({
        data: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            email_notifications: true,
            notify_on_mentions: false,
          },
        ],
        error: null,
      });

      await sendMentionEmails(
        ['user-1'],
        'Actor',
        'Entity',
        'capability',
        'cap-123',
        'Comment'
      );

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('skips users without email', async () => {
      mockIn.mockResolvedValueOnce({
        data: [
          {
            id: 'user-1',
            email: null,
            email_notifications: true,
            notify_on_mentions: true,
          },
        ],
        error: null,
      });

      await sendMentionEmails(
        ['user-1'],
        'Actor',
        'Entity',
        'capability',
        'cap-123',
        'Comment'
      );

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('truncates long messages', async () => {
      mockIn.mockResolvedValueOnce({
        data: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            full_name: 'User One',
            email_notifications: true,
            notify_on_mentions: true,
          },
        ],
        error: null,
      });
      mockInvoke.mockResolvedValue({ data: {}, error: null });

      const longMessage = 'a'.repeat(300);

      await sendMentionEmails(
        ['user-1'],
        'Actor',
        'Entity',
        'quick_win',
        'qw-123',
        longMessage
      );

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: expect.objectContaining({
          data: expect.objectContaining({
            message: 'a'.repeat(200) + '...',
          }),
        }),
      });
    });

    it('does not truncate short messages', async () => {
      mockIn.mockResolvedValueOnce({
        data: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            email_notifications: true,
            notify_on_mentions: true,
          },
        ],
        error: null,
      });
      mockInvoke.mockResolvedValue({ data: {}, error: null });

      await sendMentionEmails(
        ['user-1'],
        'Actor',
        'Entity',
        'capability',
        'cap-123',
        'Short message'
      );

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: expect.objectContaining({
          data: expect.objectContaining({
            message: 'Short message',
          }),
        }),
      });
    });

    it('handles database error gracefully', async () => {
      mockIn.mockResolvedValueOnce({
        data: null,
        error: new Error('DB error'),
      });

      // Should not throw
      await sendMentionEmails(
        ['user-1'],
        'Actor',
        'Entity',
        'capability',
        'cap-123',
        'Comment'
      );

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('handles recipientName undefined when full_name is null', async () => {
      mockIn.mockResolvedValueOnce({
        data: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            full_name: null,
            email_notifications: true,
            notify_on_mentions: true,
          },
        ],
        error: null,
      });
      mockInvoke.mockResolvedValue({ data: {}, error: null });

      await sendMentionEmails(
        ['user-1'],
        'Actor',
        'Entity',
        'capability',
        'cap-123',
        'Comment'
      );

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: expect.objectContaining({
          data: expect.objectContaining({
            recipientName: undefined,
          }),
        }),
      });
    });
  });

  describe('sendBlockedMilestoneEmails', () => {
    it('fetches admin and editor users', async () => {
      mockIn.mockResolvedValueOnce({ data: [], error: null });

      await sendBlockedMilestoneEmails('Milestone Name', 'ms-123', 'in_progress');

      expect(mockSelect).toHaveBeenCalledWith(
        'id, email, full_name, email_notifications, notify_on_blocked'
      );
      expect(mockIn).toHaveBeenCalledWith('role', ['admin', 'editor']);
    });

    it('sends blocked notification to eligible users', async () => {
      mockIn.mockResolvedValueOnce({
        data: [
          {
            id: 'admin-1',
            email: 'admin@example.com',
            full_name: 'Admin User',
            email_notifications: true,
            notify_on_blocked: true,
          },
        ],
        error: null,
      });
      mockInvoke.mockResolvedValue({ data: {}, error: null });

      await sendBlockedMilestoneEmails('Test Milestone', 'ms-123', 'in_progress');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: {
          to: 'admin@example.com',
          type: 'blocked',
          data: {
            recipientName: 'Admin User',
            entityName: 'Test Milestone',
            entityType: 'milestone',
            entityId: 'ms-123',
            oldStatus: 'in_progress',
            newStatus: 'blocked',
          },
        },
      });
    });

    it('skips users with blocked notifications disabled', async () => {
      mockIn.mockResolvedValueOnce({
        data: [
          {
            id: 'admin-1',
            email: 'admin@example.com',
            email_notifications: true,
            notify_on_blocked: false,
          },
        ],
        error: null,
      });

      await sendBlockedMilestoneEmails('Milestone', 'ms-123', 'in_progress');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('skips users with email notifications disabled', async () => {
      mockIn.mockResolvedValueOnce({
        data: [
          {
            id: 'admin-1',
            email: 'admin@example.com',
            email_notifications: false,
            notify_on_blocked: true,
          },
        ],
        error: null,
      });

      await sendBlockedMilestoneEmails('Milestone', 'ms-123', 'in_progress');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('handles database error gracefully', async () => {
      mockIn.mockResolvedValueOnce({
        data: null,
        error: new Error('DB error'),
      });

      // Should not throw
      await sendBlockedMilestoneEmails('Milestone', 'ms-123', 'in_progress');

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('sends to multiple users', async () => {
      mockIn.mockResolvedValueOnce({
        data: [
          {
            id: 'admin-1',
            email: 'admin1@example.com',
            email_notifications: true,
            notify_on_blocked: true,
          },
          {
            id: 'editor-1',
            email: 'editor1@example.com',
            email_notifications: true,
            notify_on_blocked: true,
          },
        ],
        error: null,
      });
      mockInvoke.mockResolvedValue({ data: {}, error: null });

      await sendBlockedMilestoneEmails('Milestone', 'ms-123', 'completed');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockInvoke).toHaveBeenCalledTimes(2);
    });
  });
});
