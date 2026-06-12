import api from './api.client';

export interface AuditLog {
  id: string; userId: string | null; action: string; service: string;
  resourceType: string | null; resourceId: string | null;
  changes: Record<string, unknown> | null; ipAddress: string | null;
  createdAt: string;
}

export async function getLogs(page = 1, filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ page: String(page), ...filters }).toString();
  const r = await api.get<{ success: boolean; data: { logs: AuditLog[]; total: number } }>(`/audit?${params}`);
  return r.data.data;
}
export async function getUserLogs(userId: string, page = 1) {
  const r = await api.get<{ success: boolean; data: { logs: AuditLog[]; total: number } }>(`/audit/user/${userId}?page=${page}`);
  return r.data.data;
}
