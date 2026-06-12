import api from './api.client';

export interface Property {
  id: string; ownerId: string; title: string; description: string | null;
  address: string | null; city: string | null; state: string | null; country: string | null;
  price: number | null; status: string; propertyType: string;
  bedrooms: number | null; bathrooms: number | null; areaSqft: number | null;
  createdAt: string; updatedAt: string;
}

export async function listProperties(page = 1, filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ page: String(page), ...filters }).toString();
  const r = await api.get<{ success: boolean; data: { properties: Property[]; total: number } }>(`/properties?${params}`);
  return r.data.data;
}
export async function listMyProperties(page = 1) {
  const r = await api.get<{ success: boolean; data: { properties: Property[]; total: number } }>(`/properties/my?page=${page}`);
  return r.data.data;
}
export async function createProperty(data: Partial<Property>) {
  const r = await api.post<{ success: boolean; data: Property }>('/properties', data);
  return r.data.data;
}
export async function updateProperty(id: string, data: Partial<Property>) {
  const r = await api.put<{ success: boolean; data: Property }>(`/properties/${id}`, data);
  return r.data.data;
}
export async function deleteProperty(id: string) {
  await api.delete(`/properties/${id}`);
}
