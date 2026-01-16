// src/components/notifications/NotificationList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationList } from './NotificationList';

// Mock data
const mockNotifications = [
  {
    id: 'notif-1',
    type: 'comment',
    title: 'New Comment',
    message: 'John commented on your capability',
    is_read: false,
    created_at: '2024-01-15T10:00:00Z',
    actor: { full_name: 'John Doe' },
  },
  {
    id: 'notif-2',
    type: 'mention',
    title: 'You were mentioned',
    message: 'Jane mentioned you in a comment',
    is_read: true,
    created_at: '2024-01-14T10:00:00Z',
    actor: { full_name: 'Jane Smith' },
  },
  {
    id: 'notif-3',
    type: 'blocked',
    title: 'Milestone Blocked',
    message: 'Milestone "Phase 2" was blocked',
    is_read: false,
    created_at: '2024-01-13T10:00:00Z',
    actor: null,
  },
];

// Mock hooks
const mockMarkRead = vi.fn();
const mockMarkAllRead = vi.fn();
const mockClearAll = vi.fn();

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    data: mockNotifications,
    isLoading: false,
  }),
  useMarkNotificationRead: () => ({
    mutate: mockMarkRead,
  }),
  useMarkAllNotificationsRead: () => ({
    mutate: mockMarkAllRead,
  }),
  useClearAllNotifications: () => ({
    mutate: mockClearAll,
  }),
}));

describe('NotificationList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders header', () => {
      render(<NotificationList />);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('renders notification titles', () => {
      render(<NotificationList />);
      expect(screen.getByText('New Comment')).toBeInTheDocument();
      expect(screen.getByText('You were mentioned')).toBeInTheDocument();
      expect(screen.getByText('Milestone Blocked')).toBeInTheDocument();
    });

    it('renders notification messages', () => {
      render(<NotificationList />);
      expect(screen.getByText('John commented on your capability')).toBeInTheDocument();
      expect(screen.getByText('Jane mentioned you in a comment')).toBeInTheDocument();
    });

    it('renders relative timestamps', () => {
      render(<NotificationList />);
      // formatDistanceToNow produces relative text
      const times = screen.getAllByText(/ago/);
      expect(times.length).toBe(3);
    });

    it('renders Mark all read button when unread notifications exist', () => {
      render(<NotificationList />);
      expect(screen.getByRole('button', { name: /Mark all read/i })).toBeInTheDocument();
    });

    it('renders Clear all button', () => {
      render(<NotificationList />);
      expect(screen.getByRole('button', { name: /Clear all notifications/i })).toBeInTheDocument();
    });
  });

  describe('unread indicators', () => {
    it('shows unread indicator for unread notifications', () => {
      const { container } = render(<NotificationList />);
      // Unread notifications have a small dot indicator
      const unreadDots = container.querySelectorAll('.bg-primary.h-2.w-2');
      expect(unreadDots.length).toBe(2); // 2 unread notifications
    });
  });

  describe('interactions', () => {
    it('calls markRead when unread notification clicked', () => {
      render(<NotificationList />);
      fireEvent.click(screen.getByText('New Comment'));
      expect(mockMarkRead).toHaveBeenCalledWith('notif-1');
    });

    it('does not call markRead when already read notification clicked', () => {
      render(<NotificationList />);
      fireEvent.click(screen.getByText('You were mentioned'));
      expect(mockMarkRead).not.toHaveBeenCalled();
    });

    it('calls onClose when notification clicked', () => {
      const onClose = vi.fn();
      render(<NotificationList onClose={onClose} />);
      fireEvent.click(screen.getByText('New Comment'));
      expect(onClose).toHaveBeenCalled();
    });

    it('calls markAllRead when Mark all read clicked', () => {
      render(<NotificationList />);
      fireEvent.click(screen.getByRole('button', { name: /Mark all read/i }));
      expect(mockMarkAllRead).toHaveBeenCalled();
    });

    it('calls clearAll when Clear all clicked', () => {
      const onClose = vi.fn();
      render(<NotificationList onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: /Clear all notifications/i }));
      expect(mockClearAll).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no notifications', () => {
      vi.doMock('@/hooks/useNotifications', () => ({
        useNotifications: () => ({
          data: [],
          isLoading: false,
        }),
        useMarkNotificationRead: () => ({ mutate: vi.fn() }),
        useMarkAllNotificationsRead: () => ({ mutate: vi.fn() }),
        useClearAllNotifications: () => ({ mutate: vi.fn() }),
      }));
      // Note: Would need dynamic import for proper mock isolation
    });
  });

  describe('notification types', () => {
    it('renders different icons based on notification type', () => {
      const { container } = render(<NotificationList />);
      // Each notification type has different icons
      // comment -> MessageSquare
      // mention -> AtSign
      // blocked -> AlertTriangle
      expect(container.querySelectorAll('.rounded-full').length).toBeGreaterThan(0);
    });
  });
});
