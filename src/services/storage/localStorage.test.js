import test from 'node:test';
import assert from 'node:assert/strict';
import {
  setCurrentUser,
  getCurrentUser,
  saveUserRecord,
  getSavedUsers,
} from './localStorage.js';

const mockStorage = (() => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

globalThis.localStorage = mockStorage;

test('saves a new user and keeps the current session user', () => {
  mockStorage.clear();

  const user = {
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'candidate',
    password: 'secret123',
  };

  saveUserRecord(user);
  setCurrentUser(user);

  assert.deepEqual(
    getSavedUsers().some((item) => item.email === user.email),
    true,
  );
  assert.deepEqual(getCurrentUser().email, user.email);
});
