import api from './api.client';
import { AuthResponse, TokenPair } from '../types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', { email, password });
  return res.data.data;
}

export async function register(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<AuthResponse> {
  const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', {
    email,
    password,
    firstName,
    lastName,
  });
  return res.data.data;
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const res = await api.post<{ success: boolean; data: { tokens: TokenPair } }>('/auth/refresh', {
    refreshToken,
  });
  return res.data.data.tokens;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}
