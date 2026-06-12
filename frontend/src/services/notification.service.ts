import api from './api.client';

export interface Notification {
  id: string; userId: string; type: string; title: string;
  message: string; status: string; createdAt: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean; smsEnabled: boolean;
  pushEnabled: boolean; inAppEnabled: boolean;
}

export async function getNotifications(page = 1) {
  const r = await api.get<{ success: boolean; data: { notifications: Notification[]; total: number } }>(`/notifications?page=${page}`);
  return r.data.data.notifications;
}
export async function getUnreadCount() {
  const r = await api.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count');
  return r.data.data.count;
}
export async function markRead(id: string) {
  const r = await api.put<{ success: boolean; data: Notification }>(`/notifications/${id}/read`);
  return r.data.data;
}
export async function markAllRead() {
  await api.put('/notifications/read-all');
}
export async function getPreferences() {
  const r = await api.get<{ success: boolean; data: NotificationPreferences }>('/notifications/preferences');
  return r.data.data;
}
export async function updatePreferences(prefs: NotificationPreferences) {
  const r = await api.put<{ success: boolean; data: NotificationPreferences }>('/notifications/preferences', prefs);
  return r.data.data;
}
