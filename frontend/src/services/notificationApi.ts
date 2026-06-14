import { notificationClient } from './api';
import type { Notification } from '@/types';

export async function listNotifications(): Promise<Notification[]> {
  const { data } = await notificationClient.get<{ notifications: Notification[] }>('/api/notifications');
  return data.notifications ?? [];
}

export async function announceNotification(payload: {
  type: 'delay' | 'route_change' | 'system';
  title: string;
  message: string;
  route_id?: string;
  vehicle_id?: string;
}): Promise<Notification> {
  const { data } = await notificationClient.post<{ notification: Notification }>(
    '/api/notifications/announce',
    payload
  );
  return data.notification;
}

export async function markNotificationRead(id: number): Promise<void> {
  await notificationClient.patch(`/api/notifications/${id}/read`);
}
