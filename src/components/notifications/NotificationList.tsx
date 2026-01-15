// src/components/notifications/NotificationList.tsx
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  AtSign,
  AlertTriangle,
  CheckCircle,
  Bell,
  Clock,
  UserPlus,
  Check,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useClearAllNotifications,
} from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import type { NotificationWithActor, NotificationType } from '@/types';

interface NotificationListProps {
  onClose?: () => void;
}

const notificationIcons: Record<NotificationType, React.ElementType> = {
  comment: MessageSquare,
  mention: AtSign,
  status_change: CheckCircle,
  blocked: AlertTriangle,
  milestone_due: Clock,
  assignment: UserPlus,
  system: Bell,
};

const notificationColors: Record<NotificationType, string> = {
  comment: 'text-blue-500 bg-blue-500/10',
  mention: 'text-purple-500 bg-purple-500/10',
  status_change: 'text-green-500 bg-green-500/10',
  blocked: 'text-red-500 bg-red-500/10',
  milestone_due: 'text-orange-500 bg-orange-500/10',
  assignment: 'text-cyan-500 bg-cyan-500/10',
  system: 'text-gray-500 bg-gray-500/10',
};

function NotificationItem({
  notification,
  onClick,
}: {
  notification: NotificationWithActor;
  onClick: () => void;
}) {
  const Icon = notificationIcons[notification.type] || Bell;
  const colorClass = notificationColors[notification.type] || 'text-gray-500 bg-gray-500/10';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex gap-3 p-3 text-left hover:bg-muted/50 transition-colors',
        !notification.is_read && 'bg-muted/30'
      )}
    >
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium truncate', !notification.is_read && 'text-foreground')}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { data: notifications, isLoading } = useNotifications(50);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const clearAll = useClearAllNotifications();

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  const handleNotificationClick = (notification: NotificationWithActor) => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }
    onClose?.();
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => markAllRead.mutate()}
          >
            <Check className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      {notifications && notifications.length > 0 ? (
        <>
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs text-muted-foreground"
              onClick={() => {
                clearAll.mutate();
                onClose?.();
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear all notifications
            </Button>
          </div>
        </>
      ) : (
        <div className="p-8 text-center">
          <Bell className="h-8 w-8 mx-auto text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No notifications</p>
        </div>
      )}
    </div>
  );
}
