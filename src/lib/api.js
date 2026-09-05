import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  if (
    config.url?.startsWith('/') &&
    !config.url.startsWith('/api/v1/')
  ) {
    config.url = `/api/v1${config.url}`;
  }
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refresh_token');

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest.retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      !refreshToken
    ) {
      throw error;
    }

    originalRequest.retry = true;
    refreshPromise ||= api
      .post('/api/v1/auth/refresh', { refreshToken })
      .then(({ data }) => {
        const payload = data?.data || data;
        const accessToken = payload?.accessToken ?? payload?.access;
        const nextRefreshToken = payload?.refreshToken ?? payload?.refresh;
        if (!accessToken) {
          throw new Error('Refresh response did not include an access token');
        }
        localStorage.setItem('access_token', accessToken);
        if (nextRefreshToken) {
          localStorage.setItem('refresh_token', nextRefreshToken);
        }
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });

    const accessToken = await refreshPromise;
    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return api.request(originalRequest);
  },
);

export default api;
