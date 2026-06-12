import api from './api.client';

export interface VerificationRequest {
  id: string; userId: string; type: string; status: string;
  notes: string | null; reviewedBy: string | null; reviewedAt: string | null;
  createdAt: string; updatedAt: string;
}

export async function submitRequest(type: string) {
  const r = await api.post<{ success: boolean; data: VerificationRequest }>('/verifications', { type });
  return r.data.data;
}
export async function getMyRequests() {
  const r = await api.get<{ success: boolean; data: VerificationRequest[] }>('/verifications');
  return r.data.data;
}
export async function getPendingRequests(page = 1) {
  const r = await api.get<{ success: boolean; data: { requests: VerificationRequest[]; total: number } }>(`/verifications/pending?page=${page}`);
  return r.data.data;
}
export async function reviewRequest(id: string, status: string, notes?: string) {
  const r = await api.put<{ success: boolean; data: VerificationRequest }>(`/verifications/${id}/review`, { status, notes });
  return r.data.data;
}
