import axios from 'axios';
import { AuthResponse, TokenPair } from '../types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await axios.post<{ success: boolean; data: AuthResponse }>('/api/auth/login', { email, password });
  return res.data.data;
}

export async function register(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<AuthResponse> {
  const res = await axios.post<{ success: boolean; data: AuthResponse }>('/api/auth/register', {
    email,
    password,
    firstName,
    lastName,
  });
  return res.data.data;
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const res = await axios.post<{ success: boolean; data: { tokens: TokenPair } }>('/api/auth/refresh', {
    refreshToken,
  });
  return res.data.data.tokens;
}

export async function logout(refreshToken: string): Promise<void> {
  await axios.post('/api/auth/logout', { refreshToken });
}
