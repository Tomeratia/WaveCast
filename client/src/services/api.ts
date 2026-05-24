import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Module-level access token getter — set by AuthContext on login.
// We do this here (instead of a React hook) so all axios callers get auth automatically.
let getAccessToken: () => string | null = () => null;
export function setAccessTokenGetter(fn: () => string | null) {
  getAccessToken = fn;
}

// Attach Authorization header automatically when a token is available.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Keep-alive ping every 9 minutes to prevent Render cold starts
setInterval(() => { api.get('/health').catch(() => {}); }, 9 * 60 * 1000);

// 401 interceptor: attempt token refresh, then retry
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute = originalRequest.url?.includes('/api/auth/login') || originalRequest.url?.includes('/api/auth/register');
    if (error.response?.status !== 401 || originalRequest._retry || isAuthRoute) {
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
