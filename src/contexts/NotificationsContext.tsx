import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePolling } from '@/hooks/usePolling';
import { useToast } from '@/hooks/use-toast';
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ApiNotification,
} from '@/lib/notificationsApi';

type NotificationsContextValue = {
  notifications: ApiNotification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refreshNotifications: (options?: { silent?: boolean }) => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshNotifications = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token || !isAuthenticated) {
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const silent = options?.silent ?? false;
      if (silent) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const unreadRes = await getUnreadNotificationCount(token);
        const listRes = await listNotifications(token, { limit: 50 });

        setNotifications(listRes.data);
        setUnreadCount(unreadRes.data.unreadCount);
      } catch (err: any) {
        if (!silent) {
          toast({
            title: 'Notifications failed',
            description: err.message ?? 'Failed to load notifications',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isAuthenticated, toast, token],
  );

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  usePolling(
    () => refreshNotifications({ silent: true }),
    { enabled: !!token && isAuthenticated, intervalMs: 10 * 60 * 1000 },
  );

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!token) return;

      try {
        const res = await markNotificationRead(token, notificationId);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notificationId ? res.data : item)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err: any) {
        toast({
          title: 'Update failed',
          description: err.message ?? 'Failed to mark notification as read',
          variant: 'destructive',
        });
      }
    },
    [toast, token],
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;

    try {
      await markAllNotificationsRead(token);
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err.message ?? 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  }, [toast, token]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      isRefreshing,
      markRead,
      markAllRead,
      refreshNotifications,
    }),
    [isLoading, isRefreshing, markAllRead, markRead, notifications, refreshNotifications, unreadCount],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}