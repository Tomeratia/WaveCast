import axios from 'axios';

export const api = axios.create({
  baseURL: '',
  withCredentials: true,
});

// 401 interceptor: attempt token refresh, then retry
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await api.post<{ success: boolean; data: { accessToken: string } }>('/api/auth/refresh');
      const newToken = res.data.data.accessToken;

      pendingRequests.forEach((cb) => cb(newToken));
      pendingRequests = [];

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch {
      pendingRequests = [];
      window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
