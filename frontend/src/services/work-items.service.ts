import api from './api.client';

export interface WorkItem {
  id: string; title: string; description: string | null;
  assignedTo: string | null; assignedBy: string;
  status: string; priority: string; dueDate: string | null;
  createdAt: string; updatedAt: string;
}

export async function getMyItems() {
  const r = await api.get<{ success: boolean; data: WorkItem[] }>('/work-items');
  return r.data.data;
}
export async function getAllItems(page = 1) {
  const r = await api.get<{ success: boolean; data: { items: WorkItem[]; total: number } }>(`/work-items/all?page=${page}`);
  return r.data.data;
}
export async function createItem(data: Partial<WorkItem>) {
  const r = await api.post<{ success: boolean; data: WorkItem }>('/work-items', data);
  return r.data.data;
}
export async function updateStatus(id: string, status: string) {
  const r = await api.put<{ success: boolean; data: WorkItem }>(`/work-items/${id}/status`, { status });
  return r.data.data;
}
export async function updateItem(id: string, data: Partial<WorkItem>) {
  const r = await api.put<{ success: boolean; data: WorkItem }>(`/work-items/${id}`, data);
  return r.data.data;
}
