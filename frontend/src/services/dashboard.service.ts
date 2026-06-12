import api from './api.client';
import { UserStats, AdminStats, ActivityLog } from '../types';

export async function getStats(): Promise<UserStats> {
  const res = await api.get<{ success: boolean; data: UserStats }>('/dashboard/stats');
  return res.data.data;
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await api.get<{ success: boolean; data: AdminStats }>('/dashboard/admin/stats');
  return res.data.data;
}

export async function getActivity(page = 1, limit = 20): Promise<{ activity: ActivityLog[]; total: number }> {
  const res = await api.get<{ success: boolean; data: { activity: ActivityLog[]; total: number } }>(
    `/dashboard/activity?page=${page}&limit=${limit}`
  );
  return res.data.data;
}
