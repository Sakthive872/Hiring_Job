import api from './api';

const readPayload = (response) => response.data?.data || response.data;

const saveTokens = (payload) => {
  const accessToken = payload?.accessToken ?? payload?.access;
  const refreshToken = payload?.refreshToken ?? payload?.refresh;
  if (accessToken) localStorage.setItem('access_token', accessToken);
  if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  return { accessToken, refreshToken };
};

export async function register({ username, email, password, role }) {
  const response = await api.post('/api/v1/auth/register', {
    username,
    email,
    password,
    role,
  });
  const payload = readPayload(response);
  saveTokens(payload);
  return payload;
}

export async function login({ email, password }) {
  const response = await api.post('/api/v1/auth/login', { email, password });
  const payload = readPayload(response);
  saveTokens(payload);
  return payload;
}

export async function refresh() {
  const response = await api.post('/api/v1/auth/refresh', {
    refreshToken: localStorage.getItem('refresh_token'),
  });
  const payload = readPayload(response);
  saveTokens(payload);
  return payload;
}

export async function getCurrentUser() {
  const response = await api.get('/api/v1/auth/me');
  return readPayload(response);
}

export function clearAuthTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
