import { apiRequest } from './api';

export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export type ApiNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  targetUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
};

export type ListNotificationsParams = {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
};

function buildQuery(params: ListNotificationsParams = {}): string {
  const query = new URLSearchParams();

  if (params.unreadOnly) query.set('unreadOnly', 'true');
  if (typeof params.limit === 'number') query.set('limit', String(params.limit));
  if (typeof params.offset === 'number') query.set('offset', String(params.offset));

  const value = query.toString();
  return value ? `?${value}` : '';
}

export async function listNotifications(
  token: string,
  params: ListNotificationsParams = {},
): Promise<{ data: ApiNotification[] }> {
  return apiRequest(`/notifications${buildQuery(params)}`, {
    token,
    cache: 'no-store',
  });
}

export async function getUnreadNotificationCount(
  token: string,
): Promise<{ data: { unreadCount: number } }> {
  return apiRequest('/notifications/unread-count', {
    token,
    cache: 'no-store',
  });
}

export async function markNotificationRead(
  token: string,
  notificationId: string,
): Promise<{ data: ApiNotification }> {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
    token,
  });
}

export async function markAllNotificationsRead(
  token: string,
): Promise<{ data: { updatedCount: number } }> {
  return apiRequest('/notifications/read-all', {
    method: 'PATCH',
    token,
  });
}