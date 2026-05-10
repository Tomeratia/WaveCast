import { api } from './api';
import type { ApiResponse, AuthResponse } from '@shared/types';

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', { email, password });
  return res.data.data!;
}

export async function registerApi(email: string, name: string, password: string): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', { email, name, password });
  return res.data.data!;
}

export async function logoutApi(): Promise<void> {
  await api.post('/api/auth/logout');
}
