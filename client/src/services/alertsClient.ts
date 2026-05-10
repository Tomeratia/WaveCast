import { api } from './api';
import type { ApiResponse } from '@shared/types';

export interface AlertDTO {
  id: string;
  spotId: string;
  minScore: number;
  timePref: string;
  active: boolean;
  createdAt: string;
}

export async function getAlerts(token: string): Promise<AlertDTO[]> {
  const res = await api.get<ApiResponse<AlertDTO[]>>('/api/alerts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data ?? [];
}

export async function createAlert(
  token: string,
  data: { spotId: string; minScore: number; timePref: string },
): Promise<AlertDTO> {
  const res = await api.post<ApiResponse<AlertDTO>>('/api/alerts', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data!;
}

export async function deleteAlert(token: string, alertId: string): Promise<void> {
  await api.delete(`/api/alerts/${alertId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
