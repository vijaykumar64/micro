import api from './api.client';
import { UserProfile } from '../types';

export async function getProfile(): Promise<UserProfile> {
  const res = await api.get<{ success: boolean; data: UserProfile }>('/users/profile');
  return res.data.data;
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await api.put<{ success: boolean; data: UserProfile }>('/users/profile', data);
  return res.data.data;
}
