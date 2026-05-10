import { api } from './api';
import type { ApiResponse, SpotDTO } from '@shared/types';

export async function getFavorites(token: string): Promise<SpotDTO[]> {
  const res = await api.get<ApiResponse<SpotDTO[]>>('/api/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data ?? [];
}

export async function addFavorite(token: string, spotId: string): Promise<void> {
  await api.post(`/api/favorites/${spotId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function removeFavorite(token: string, spotId: string): Promise<void> {
  await api.delete(`/api/favorites/${spotId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
