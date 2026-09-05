// File: src/services/storage/localStorage.js
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const PREFERENCES_KEY = 'worklinePreferences';
const USERS_KEY = 'worklineUsers';
const CURRENT_USER_KEY = 'worklineCurrentUser';

function getStorage() {
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

function readJson(key, fallback) {
  const storage = getStorage();
  if (!storage) return fallback;
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function getAccessToken() {
  const storage = getStorage();
  return storage?.getItem('access_token') ?? storage?.getItem(ACCESS_TOKEN_KEY) ?? null;
}
export function setAccessToken(token) {
  if (!getStorage()) return;
  if (token) {
    getStorage().setItem(ACCESS_TOKEN_KEY, token);
    getStorage().setItem('access_token', token);
  }
  else removeAccessToken();
}
export function removeAccessToken() {
  getStorage()?.removeItem(ACCESS_TOKEN_KEY);
  getStorage()?.removeItem('access_token');
}
export function getRefreshToken() {
  const storage = getStorage();
  return storage?.getItem('refresh_token') ?? storage?.getItem(REFRESH_TOKEN_KEY) ?? null;
}
export function setRefreshToken(token) {
  if (!getStorage()) return;
  if (token) {
    getStorage().setItem(REFRESH_TOKEN_KEY, token);
    getStorage().setItem('refresh_token', token);
  }
  else removeRefreshToken();
}
export function removeRefreshToken() {
  getStorage()?.removeItem(REFRESH_TOKEN_KEY);
  getStorage()?.removeItem('refresh_token');
}
export function clearTokens() {
  removeAccessToken();
  removeRefreshToken();
}
export function getPreferences() {
  return readJson(PREFERENCES_KEY, {});
}
export function setPreferences(preferences) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(
    PREFERENCES_KEY,
    JSON.stringify({ ...getPreferences(), ...preferences }),
  );
}
export function getPreference(key, fallback = null) {
  return getPreferences()[key] ?? fallback;
}
export function setPreference(key, value) {
  setPreferences({ [key]: value });
}
export function removePreference(key) {
  const storage = getStorage();
  if (!storage) return;
  const preferences = getPreferences();
  delete preferences[key];
  storage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export function getSavedUsers() {
  return readJson(USERS_KEY, []);
}

export function saveUserRecord(user) {
  const storage = getStorage();
  if (!storage || !user?.email) return null;
  const users = getSavedUsers();
  const nextUsers = [
    ...users.filter((item) => item.email !== user.email),
    user,
  ];
  storage.setItem(USERS_KEY, JSON.stringify(nextUsers));
  return user;
}

export function setCurrentUser(user) {
  const storage = getStorage();
  if (!storage) return null;
  if (!user) {
    storage.removeItem(CURRENT_USER_KEY);
    return null;
  }
  storage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  saveUserRecord(user);
  return user;
}

export function getCurrentUser() {
  return readJson(CURRENT_USER_KEY, null);
}

export default {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  clearTokens,
  getPreferences,
  setPreferences,
  getPreference,
  setPreference,
  removePreference,
  getSavedUsers,
  saveUserRecord,
  setCurrentUser,
  getCurrentUser,
};
